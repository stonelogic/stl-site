#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""通过 RCON 导出在线玩家名单到 online.json（网站「服务器状态」页读取）。

为什么要这个脚本：
    纯静态站点的浏览器拿不到 MC 的玩家名单——第三方状态接口（mclists 只给人数，
    mcsrvstat / mcstatus.io 走国外节点连不进 frp 隧道）。原来靠 ntfy 主题中转，
    但 ntfy 免费版消息只留 12 小时，同步脚本一停页面就永远停在「名单同步中」。
    改成跟 playtime.json 一样的模式：本地读服务端，生成 JSON 推到仓库。

用法：
    python tools/export_online.py            # 写 online.json
    python tools/export_online.py --print    # 只打印，不写文件
"""
import argparse
import json
import os
import re
import socket
import struct
import sys
import time

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HOST = "127.0.0.1"
PORT = 25575
PASSWORD = "MCServer2026RCON"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "online.json")
# 完整实时状态只写本地（.gitignore 已排除），供本机服务读取；仓库里只放轻量快照
LIVE_OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "live-status.json")

# 名单没变时不重写文件（否则每 2 分钟一个无意义提交），但时间戳必须定期刷新：
# 否则网页算出的「同步多久没跑」会一直涨，玩家挂机不动的名单会被误判成「同步已停止」。
# 每 HEARTBEAT 秒强制刷一次时间戳（顺带提交），网页的 30 分钟告警就只会真出问题时出现。
HEARTBEAT = 1200

AUTH = 3
EXEC = 2
RESP_VALUE = 0

# Paper 中文： "§6当前有§c1§6位玩家在线，可容纳最大在线人数为§c300§6位玩家。" + "\n§6default§r：§4a, §4b"
COLOR = re.compile(r"§.")
CN_NOW = re.compile(r"当前有\s*(\d+)\s*位玩家")
CN_MAX = re.compile(r"最大在线人数为\s*(\d+)\s*位")
EN_NOW = re.compile(r"There are (\d+) of a max of (\d+) players")


def send_packet(sock, req_id, ptype, body):
    payload = body.encode("utf-8") + b"\x00"
    sock.sendall(struct.pack("<iii", 4 + 4 + len(payload), req_id, ptype) + payload)


def recv_exact(sock, n):
    buf = b""
    while len(buf) < n:
        chunk = sock.recv(n - len(buf))
        if not chunk:
            raise ConnectionError("连接被服务器关闭")
        buf += chunk
    return buf


def recv_packet(sock):
    (length,) = struct.unpack("<i", recv_exact(sock, 4))
    if length < 10 or length > 1 << 20:
        raise ValueError("非法包长度 %d" % length)
    body = recv_exact(sock, length)
    req_id, ptype = struct.unpack("<ii", body[:8])
    text = body[8:].rstrip(b"\x00").decode("utf-8", errors="replace")
    return req_id, ptype, text


def rcon(command, timeout=6):
    sock = socket.create_connection((HOST, PORT), timeout)
    sock.settimeout(timeout)
    try:
        send_packet(sock, 1, AUTH, PASSWORD)
        req_id, _t, _b = recv_packet(sock)
        if req_id == -1:
            raise RuntimeError("RCON 认证失败（密码不对）")
        send_packet(sock, 2, EXEC, command)
        lines = []
        while True:
            _id, ptype, text = recv_packet(sock)
            if text:
                lines.append(text)
            if ptype == RESP_VALUE:
                break
        return "\n".join(lines)
    finally:
        try:
            sock.close()
        except Exception:
            pass


def parse_list(raw):
    """解析 list 命令输出 -> (players, now, max)。"""
    text = COLOR.sub("", raw).replace("\r", "")
    players = []
    now = mx = 0

    m = EN_NOW.search(text)
    if m:
        now, mx = int(m.group(1)), int(m.group(2))
    else:
        a = CN_NOW.search(text)
        b = CN_MAX.search(text)
        if a:
            now = int(a.group(1))
        if b:
            mx = int(b.group(1))

    # 名单按世界分组，形如 "default：a, b"，逐行取冒号后的部分
    for line in text.split("\n"):
        seg = re.split(r"[：:]", line, maxsplit=1)
        if len(seg) != 2:
            continue
        for name in re.split(r"[,、，]+", seg[1]):
            name = name.strip().strip(".")
            if not name or "位玩家" in name or EN_NOW.search(name):
                continue
            players.append(name)

    # 去重保序；解析不出名字时以 now 为准
    seen, out = set(), []
    for p in players:
        if p.lower() in seen:
            continue
        seen.add(p.lower())
        out.append(p)

    if not mx:
        mx = max(now, len(out))
    return out, (now or len(out)), mx


def rcon_try(command, timeout=8):
    """执行一条可选命令：失败就返回空串，不影响主流程。"""
    try:
        return rcon(command, timeout)
    except Exception:
        return ""


# 实测服务器输出（§ 为颜色码）：
#   tps    -> "TPS from last 5s, 1m, 5m, 15m: 20.0, 20.0, 19.9, 19.8"
#   memory -> "最大内存：9,216MB。 / 已分配内存：4,096MB。 / 空闲内存：1,228MB。"
RE_TPS = re.compile(r"TPS from last ([^:：]*)[:：]\s*([0-9.,\s]+)", re.I)
RE_TPS_CN = re.compile(r"当前服务器TPS\s*=\s*([0-9.]+)", re.I)
RE_MEM = {
    "max": re.compile(r"(?:最大内存|Maximum memory|Max memory)[^0-9]*([\d,]+)\s*MB", re.I),
    "alloc": re.compile(r"(?:已分配内存|Allocated memory)[^0-9]*([\d,]+)\s*MB", re.I),
    "free": re.compile(r"(?:空闲内存|Free memory)[^0-9]*([\d,]+)\s*MB", re.I),
}
RE_UPTIME = re.compile(r"已运行时间[：:]\s*([^\n]+)")
RE_WORLD = re.compile(r"World[“\"]([^”\"]+)[”\"][：:]\s*([\d,]+)\s*区块[，,]\s*([\d,]+)\s*实体[，,]\s*([\d,]+)\s*方块")


def _num(s):
    return int(str(s).replace(",", "").replace("，", "").strip())


def parse_tps(raw):
    """-> {"now":20.0,"m1":20.0,"m5":19.9,"m15":19.8} 或 {}"""
    text = COLOR.sub("", raw or "")
    m = RE_TPS.search(text)
    if m:
        vals = [float(x) for x in re.findall(r"\d+(?:\.\d+)?", m.group(2))][:4]
        if len(vals) >= 3:
            # 窗口名决定取值：5s/1m/5m/15m 或 1m/5m/15m
            labels = [x.strip().lower() for x in m.group(1).split(",")]
            out = {}
            for label, v in zip(labels, vals):
                if label.startswith("5s"):
                    out["now"] = round(v, 1)
                elif label.startswith("1m"):
                    out["m1"] = round(v, 1)
                elif label.startswith("5m"):
                    out["m5"] = round(v, 1)
                elif label.startswith("15m"):
                    out["m15"] = round(v, 1)
            if out:
                return out
            return {"m1": round(vals[0], 1), "m5": round(vals[1], 1), "m15": round(vals[2], 1)}
    m2 = RE_TPS_CN.search(text)
    if m2:
        v = round(float(m2.group(1)), 1)
        return {"now": v, "m1": v, "m5": v, "m15": v}
    return {}


def parse_memory(raw):
    """-> {"max":9216,"used":2868,"free":1228,"pct":31} 或 {}"""
    text = COLOR.sub("", raw or "")
    got = {}
    for k, pat in RE_MEM.items():
        m = pat.search(text)
        if m:
            got[k] = _num(m.group(1))
    if "max" not in got or "alloc" not in got:
        return {}
    used = got["alloc"] - got.get("free", 0)
    if used < 0:
        used = 0
    return {
        "max": got["max"],
        "alloc": got["alloc"],
        "used": used,
        "free": got.get("free", 0),
        "pct": round(used * 100.0 / got["max"], 1) if got["max"] else 0,
    }


def parse_worlds(raw, limit=8):
    text = COLOR.sub("", raw or "")
    out = []
    for name, chunks, entities, tiles in RE_WORLD.findall(text)[:limit]:
        out.append({
            "name": name.strip(),
            "chunks": _num(chunks),
            "entities": _num(entities),
            "tiles": _num(tiles),
        })
    return out


def load_restart_plan():
    """读 tools/restart-plan.json（可选）：{"times":["04:00","16:00"],"enabled":true}
    网页据此算「下次重启倒计时」；文件不存在就不显示这块。"""
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "restart-plan.json")
    try:
        with open(p, encoding="utf-8") as f:
            d = json.load(f)
        times = [t for t in d.get("times", []) if re.match(r"^\d{1,2}:\d{2}$", str(t))]
        if not times or not d.get("enabled", True):
            return None
        return {"times": times}
    except Exception:
        return None


def collect_extras():
    """采集 TPS / 内存 / 世界规模 / 重启计划；任何一项失败都不影响其它字段。"""
    out = {}
    tps = parse_tps(rcon_try("tps"))
    if tps:
        out["tps"] = tps
    mem_raw = rcon_try("memory")
    mem = parse_memory(mem_raw)
    if mem:
        out["mem"] = mem
    worlds = parse_worlds(mem_raw)
    if worlds:
        out["worlds"] = worlds
    m = RE_UPTIME.search(COLOR.sub("", mem_raw or ""))
    if m:
        out["uptime"] = m.group(1).strip()
    plan = load_restart_plan()
    if plan:
        out["restart"] = plan
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--print", dest="dry", action="store_true", help="只打印不写文件")
    args = ap.parse_args()

    try:
        raw = rcon("list")
    except Exception as e:
        print("[x] 读不到在线名单：%s" % e)
        print("    确认服务端已启动，且 server.properties 里 enable-rcon=true")
        return 1

    players, now, mx = parse_list(raw)
    data = {
        "online": True,
        "now": now,
        "max": mx,
        "players": players,
        "updated": int(time.time()),
        "ts": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    # 附加状态：TPS / 内存 / 世界规模 / 重启计划。取不到就不写字段，网页显示「—」
    extra = collect_extras()

    print("[i] 在线 %d / %d：%s" % (now, mx, "、".join(players) if players else "（无）"))
    if extra.get("tps"):
        t = extra["tps"]
        print("[i] TPS 1m/5m/15m：%s / %s / %s" % (t.get("m1"), t.get("m5"), t.get("m15")))
    if extra.get("mem"):
        m = extra["mem"]
        print("[i] 内存 %d/%d MB（%.0f%%）" % (m["used"], m["max"], m["pct"]))

    # ---- 1) 完整状态写本地文件（不进仓库），供本机服务/管理后台读实时值 ----
    live = dict(extra)
    live.update({
        "now": now, "max": mx, "players": players,
        "updated": int(time.time()), "ts": data["ts"],
    })
    if not args.dry:
        try:
            with open(LIVE_OUT, "w", encoding="utf-8") as f:
                json.dump(live, f, ensure_ascii=False, separators=(",", ":"))
        except Exception as e:
            print("[!] 写实时状态失败：%s" % e)

    if args.dry:
        print(json.dumps(data, ensure_ascii=False))
        return 0

    # ---- 2) 仓库里的 online.json 只带一份「轻量快照」，跟心跳一起刷 ----
    #         实时 TPS/内存每几秒就变，全写进仓库会变成提交噪音。
    tps = extra.get("tps") or {}
    mem = extra.get("mem") or {}
    if tps:
        data["tps15"] = tps.get("m15")
        data["tps1"] = tps.get("m1")
    if mem:
        data["mem"] = {"used": mem["used"], "max": mem["max"], "pct": mem["pct"]}
    if extra.get("uptime"):
        data["uptime"] = extra["uptime"]
    if extra.get("restart"):
        data["restart"] = extra["restart"]

    # 名单没变就不重写，否则定时同步会每分钟产生一个无意义的提交
    # 例外：距上次写入超过 HEARTBEAT 秒就刷新一次时间戳（顺带更新 TPS/内存快照）
    try:
        old = json.load(open(OUT, encoding="utf-8"))
        # 老文件还没有 TPS/内存字段时强制写一次，之后跟着心跳更新
        has_extra = ("tps15" in old or "tps1" in old) and ("mem" in old)
        same = (old.get("players") == players and old.get("now") == now
                and old.get("max") == mx and old.get("online") == True and has_extra)
        last = int(old.get("updated") or 0)
        if same and (time.time() - last) < HEARTBEAT:
            print("[=] 名单没有变化，跳过写入")
            return 0
        if same:
            print("[~] 名单没有变化，仅刷新时间戳与状态快照（心跳）")
    except Exception:
        pass

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print("[✓] 已写入 %s" % OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
