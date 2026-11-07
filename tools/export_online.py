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
    print("[i] 在线 %d / %d：%s" % (now, mx, "、".join(players) if players else "（无）"))
    if args.dry:
        print(json.dumps(data, ensure_ascii=False))
        return 0

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print("[✓] 已写入 %s" % OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
