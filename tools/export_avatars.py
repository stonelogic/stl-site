#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从服务端 SkinsRestorer 皮肤库导出玩家正脸头像到 assets/avatars/<名字>.png。
离线服玩家没有正版皮肤，minotar 只会返回史蒂夫；这里直接读本地皮肤贴图裁剪，
站内即可显示每个人的真实皮肤脸。皮肤更新后重跑本脚本即可。
"""
import os, io, json, glob, time, base64, urllib.request
from PIL import Image

SERVERS = [
    r"D:\服务端正式\plugins\SkinsRestorer",
    r"D:\小游戏服\plugins\SkinsRestorer",
]
OUT_DIR = r"c:\Users\SJWJ\WorkBuddy\2026-10-10-18-34-04\github-site\assets\avatars"
SIZE = 128
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"


def collect():
    """返回 {name: skin_url}，同一名字取最后一次。"""
    out = {}
    for base in SERVERS:
        for f in glob.glob(os.path.join(base, "skins", "*.playerskin")):
            try:
                d = json.load(open(f, encoding="utf-8", errors="replace"))
                name = (d.get("lastKnownName") or "").strip()
                val = d.get("value") or ""
                if not name or not val:
                    continue
                j = json.loads(base64.b64decode(val))
                url = (j.get("textures", {}).get("SKIN", {}) or {}).get("url", "")
                if url:
                    out[name] = url.replace("http://", "https://")
            except Exception:
                continue
    return out


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as r:
        return Image.open(io.BytesIO(r.read())).convert("RGBA")


def face(skin):
    """裁出正脸 8x8，叠加帽子层（若有），放大到 SIZE。"""
    face = skin.crop((8, 8, 16, 16))
    if skin.width >= 64 and skin.height >= 64:
        hat = skin.crop((40, 8, 48, 16))
        face = Image.alpha_composite(face, hat)
    return face.resize((SIZE, SIZE), Image.NEAREST)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    skins = collect()
    print("皮肤库玩家数:", len(skins))
    done = []
    for name, url in sorted(skins.items()):
        safe = name
        try:
            im = face(fetch(url))
            im.save(os.path.join(OUT_DIR, safe + ".png"), "PNG", optimize=True)
            done.append(name)
            print("  ✓", name)
        except Exception as e:
            print("  ✗", name, "->", e)
    # 写索引：前端据此判断某人有没有本地头像，避免无谓的 404 请求。
    # 同时把目录里已有的手工头像（比如自己放进去的 sjwj12517.png）一起收进来，
    # 免得重跑本脚本把它们的索引记录抹掉。
    names = set(done)
    for f in glob.glob(os.path.join(OUT_DIR, "*.png")):
        names.add(os.path.splitext(os.path.basename(f))[0])
    idx = {"generated": time.strftime("%Y-%m-%d %H:%M:%S"), "names": sorted(names)}
    with open(os.path.join(OUT_DIR, "index.json"), "w", encoding="utf-8") as f:
        json.dump(idx, f, ensure_ascii=False, separators=(",", ":"))
    print("完成：本次导出 %d 个，索引共 %d 个 -> %s" % (len(done), len(names), OUT_DIR))


if __name__ == "__main__":
    main()
