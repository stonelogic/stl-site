#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Stone Logic · 起床战争战绩导出脚本
=================================
数据源：小游戏服 BedWars 插件的 YAML 统计文件
  D:/小游戏服/plugins/BedWars/database/bw_stats_players.yml

产出：github-site/bedwars.json  （供官网 #/bw 战绩榜读取）
然后 git add / commit / push 到 stl-site 仓库的 master 分支（GitHub Pages）。

字段（BedWars 插件 stats）：
  kills / wins / score / loses / name / destroyedBeds / deaths

纯静态站点拿不到服务器本地数据，故用“本地脚本读库 → 生成 JSON → 推 GitHub”方案，
官网读到的是数分钟前的数据（可接受）。

运行：python export_bedwars.py   （或用 run_export_bat 同类包装）
可用环境变量 BW_STATS 覆盖数据文件路径。
"""

import os
import sys
import json
import time
import shutil
import subprocess
import datetime

try:
    import yaml
except ImportError:
    sys.stderr.write("需要 PyYAML：pip install pyyaml\n")
    sys.exit(3)

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_DIR = os.path.abspath(os.path.join(HERE, ".."))          # github-site 根目录
OUT_PATH = os.path.join(REPO_DIR, "bedwars.json")

# 数据文件路径：优先环境变量，否则默认
BW_STATS = os.environ.get(
    "BW_STATS",
    r"D:/小游戏服/plugins/BedWars/database/bw_stats_players.yml"
)

# 这些前缀的“玩家”通常不计入公开榜单（机器人 / NPC / 假人）
EXCLUDE_PREFIXES = ("BOT", "fakeplayer", "AFK", "NPC", "test")

# git 推送设置
PUSH = True
PUSH_BRANCH = "master"
REMOTE = "origin"

# 可选：把 GitHub PAT 单独放在 tools/.ghtoken（一行纯 token，gitignore 已忽略）。
# 仅当普通 git push 因凭据失败时才启用 insteadOf 回退。
TOKEN_FILE = os.path.join(HERE, ".ghtoken")
GIT_USER = "stonelogic"


def log(msg):
    print("[export_bedwars] " + msg, flush=True)


def is_excluded(name):
    n = (name or "").upper()
    return any(n.startswith(p.upper()) for p in EXCLUDE_PREFIXES)


def build_payload():
    if not os.path.exists(BW_STATS):
        raise RuntimeError("找不到数据文件：%s" % BW_STATS)
    with open(BW_STATS, "r", encoding="utf-8") as f:
        doc = yaml.safe_load(f) or {}
    data = (doc.get("data") or {}) if isinstance(doc, dict) else {}

    players = []
    for uuid, rec in data.items():
        if not isinstance(rec, dict):
            continue
        name = (rec.get("name") or "").strip()
        if not name:
            continue
        if is_excluded(name):
            continue
        wins = int(rec.get("wins") or 0)
        loses = int(rec.get("loses") or 0)
        kills = int(rec.get("kills") or 0)
        deaths = int(rec.get("deaths") or 0)
        score = int(rec.get("score") or 0)
        beds = int(rec.get("destroyedBeds") or 0)
        games = wins + loses
        win_rate = round(wins / games * 100) if games > 0 else 0
        kd = round(kills / deaths, 2) if deaths > 0 else float(kills)
        players.append({
            "name": name,
            "rank": 0,
            "score": score,
            "wins": wins,
            "loses": loses,
            "kills": kills,
            "deaths": deaths,
            "destroyedBeds": beds,
            "winRate": win_rate,
            "kd": kd,
        })

    # 主排序：积分（score）降序；积分相同按胜场，再按胜率
    players.sort(key=lambda x: (-x["score"], -x["wins"], -x["winRate"], x["name"].lower()))
    for i, p in enumerate(players, 1):
        p["rank"] = i

    return {
        "generatedAt": int(time.time()),
        "source": "bedwars",
        "count": len(players),
        "players": players,
    }


def write_json(payload):
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    log("已写出 %s （%d 名玩家）" % (OUT_PATH, payload["count"]))


def git_push():
    if not PUSH:
        log("PUSH=False，跳过推送。")
        return
    try:
        subprocess.run(["git", "-C", REPO_DIR, "add", "bedwars.json"], check=True)
        diff = subprocess.run(
            ["git", "-C", REPO_DIR, "diff", "--cached", "--quiet", "bedwars.json"],
            capture_output=True
        )
        if diff.returncode == 0:
            log("bedwars.json 无变化，跳过提交。")
            return
        subprocess.run(
            ["git", "-C", REPO_DIR, "-c", "user.name=stl-bot",
             "-c", "user.email=bot@stonelogic.local",
             "commit", "-m", "更新起床战争战绩 (bedwars)"],
            check=True
        )
        try:
            subprocess.run(
                ["git", "-C", REPO_DIR, "push", REMOTE, PUSH_BRANCH],
                check=True, capture_output=True, text=True
            )
            log("已推送到 %s/%s" % (REMOTE, PUSH_BRANCH))
        except subprocess.CalledProcessError:
            token = ""
            if os.path.exists(TOKEN_FILE):
                with open(TOKEN_FILE, "r", encoding="utf-8") as f:
                    token = f.read().strip()
            if not token:
                raise
            log("普通推送失败，尝试使用 .ghtoken 回退…")
            url = "https://%s:%s@github.com/stonelogic/stl-site.git" % (GIT_USER, token)
            subprocess.run(
                ["git", "-C", REPO_DIR, "push", url, PUSH_BRANCH],
                check=True, capture_output=True, text=True
            )
            log("已用 token 回退推送到 %s" % PUSH_BRANCH)
    except subprocess.CalledProcessError as e:
        log("git 推送失败：%s" % e)
        sys.exit(2)


def main():
    log("读取数据：%s" % BW_STATS)
    payload = build_payload()
    if not payload["players"]:
        log("警告：未解析到任何玩家战绩，仍写出空榜单。")
    write_json(payload)
    git_push()
    log("完成。")


if __name__ == "__main__":
    main()
