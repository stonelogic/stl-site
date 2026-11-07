#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Stone Logic 在线时长导出脚本
============================
数据源：服务器本地 cyutime 插件的 SQLite 数据库（WAL 模式）
  D:/服务端正式/plugins/cyutime/cyutime.db

产出：github-site/playtime.json  （供官网 profile.html / 榜单页读取）
然后 git add / commit / push 到 stl-site 仓库的 master 分支（GitHub Pages）。

纯静态站点拿不到服务器本地数据，因此用“定时脚本本地读库 → 生成 JSON → 推 GitHub”
的折中方案，官网读取到的是数分钟前的数据（可接受）。

运行方式：
  python export_playtime.py
或用 run_export.bat 双击运行。

可配置项（脚本顶部常量）：
  CYUTIME_DB        数据库路径，也可用环境变量 CYUTIME_DB 覆盖
  EXCLUDE_PREFIXES  这些前缀的玩家（机器人 / NPC）不计入榜单
  PUSH / PUSH_BRANCH 是否推送、推到哪个分支
"""

import os
import sys
import json
import time
import shutil
import sqlite3
import tempfile
import subprocess
import datetime

# ------------------------- 配置 -------------------------
HERE = os.path.dirname(os.path.abspath(__file__))
REPO_DIR = os.path.abspath(os.path.join(HERE, ".."))          # github-site 根目录
OUT_PATH = os.path.join(REPO_DIR, "playtime.json")

# 数据库路径：优先环境变量，否则默认
CYUTIME_DB = os.environ.get(
    "CYUTIME_DB",
    r"D:/服务端正式/plugins/cyutime/cyutime.db"
)

# 这些前缀的“玩家”通常是不计入榜单的机器人 / NPC / 假人
EXCLUDE_PREFIXES = ("BOT", "fakeplayer", "AFK", "NPC", "test")

# git 推送设置
PUSH = True
PUSH_BRANCH = "master"
REMOTE = "origin"

# 可选：把 GitHub PAT 单独放在 tools/.ghtoken（一行纯 token，gitignore 已忽略）。
# 仅当普通 git push 因凭据失败时才启用 insteadOf 回退。留空则不使用。
TOKEN_FILE = os.path.join(HERE, ".ghtoken")
GIT_USER = "stonelogic"  # PAT 回退时拼接进 URL 用

# --------------------------------------------------------

def log(msg):
    print("[export_playtime] " + msg, flush=True)


def copy_db_readonly(src):
    """把 WAL 模式的 db（+wal+shm）整体拷到临时目录后再读，避免锁文件冲突。"""
    tmp = tempfile.mkdtemp(prefix="cyutime_")
    ok = False
    for ext in ("", "-wal", "-shm"):
        f = src + ext
        if os.path.exists(f):
            try:
                shutil.copy2(f, os.path.join(tmp, "cyutime.db" + ext))
                ok = True
            except Exception as e:
                log("拷贝 %s 警告：%s" % (f, e))
    if not ok:
        raise RuntimeError("无法读取数据库文件：%s" % src)
    return os.path.join(tmp, "cyutime.db")


def is_excluded(name):
    n = (name or "").upper()
    return any(n.startswith(p.upper()) for p in EXCLUDE_PREFIXES)


def build_payload(db_path):
    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    # 每位玩家的各周期秒数： (type,key) -> seconds
    rows = cur.execute(
        "SELECT uuid, period_type, period_key, seconds FROM cyutime_time"
    ).fetchall()
    data = {}
    for r in rows:
        data.setdefault(r["uuid"], {})[(r["period_type"], r["period_key"])] = int(r["seconds"] or 0)

    names = cur.execute("SELECT uuid, name FROM cyutime_players").fetchall()
    con.close()

    today = datetime.date.today()
    month_key = today.strftime("%Y-%m")
    year_key = str(today.year)
    iso = today.isocalendar()  # (year, week, weekday)
    week_key = "%d-W%02d" % (iso[0], iso[1])

    players = []
    for nm in names:
        uuid = nm["uuid"]
        name = (nm["name"] or "").strip()
        if not name:
            continue
        if is_excluded(name):
            continue
        d = data.get(uuid, {})
        total = d.get(("TOTAL", "total"), 0) or 0
        # 没有本月/本周记录就视作 0
        month = d.get(("MONTH", month_key), 0) or 0
        week = d.get(("WEEK", week_key), 0) or 0
        year = d.get(("YEAR", year_key), 0) or 0
        players.append({
            "name": name,
            "rank": 0,
            "total": total,
            "month": month,
            "week": week,
            "year": year,
        })

    players.sort(key=lambda x: (-x["total"], x["name"].lower()))
    for i, p in enumerate(players, 1):
        p["rank"] = i

    payload = {
        "generatedAt": int(time.time()),
        "source": "cyutime",
        "count": len(players),
        "players": players,
    }
    return payload


def write_json(payload):
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    log("已写出 %s （%d 名玩家）" % (OUT_PATH, payload["count"]))


def git_push():
    if not PUSH:
        log("PUSH=False，跳过推送。")
        return
    try:
        subprocess.run(["git", "-C", REPO_DIR, "add", "playtime.json"], check=True)
        # 仅在有改动时提交
        diff = subprocess.run(
            ["git", "-C", REPO_DIR, "diff", "--cached", "--quiet", "playtime.json"],
            capture_output=True
        )
        if diff.returncode == 0:
            log("playtime.json 无变化，跳过提交。")
            return
        subprocess.run(
            ["git", "-C", REPO_DIR, "-c", "user.name=stl-bot",
             "-c", "user.email=bot@stonelogic.local",
             "commit", "-m", "更新在线时长数据 (cyutime)"],
            check=True
        )
        # 先尝试普通推送（走系统凭据管理器）
        try:
            subprocess.run(
                ["git", "-C", REPO_DIR, "push", REMOTE, PUSH_BRANCH],
                check=True, capture_output=True, text=True
            )
            log("已推送到 %s/%s" % (REMOTE, PUSH_BRANCH))
        except subprocess.CalledProcessError:
            # 回退：若提供了 .ghtoken，则用 token 注入 URL 再推一次
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
    if not os.path.exists(CYUTIME_DB):
        log("错误：找不到数据库 %s" % CYUTIME_DB)
        sys.exit(1)
    log("读取数据库：%s" % CYUTIME_DB)
    tmp_db = copy_db_readonly(CYUTIME_DB)
    try:
        payload = build_payload(tmp_db)
    finally:
        try:
            shutil.rmtree(os.path.dirname(tmp_db), ignore_errors=True)
        except Exception:
            pass
    if not payload["players"]:
        log("警告：未解析到任何玩家数据，仍写出空榜单。")
    write_json(payload)
    git_push()
    log("完成。")


if __name__ == "__main__":
    main()
