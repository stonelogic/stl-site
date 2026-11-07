#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 STONE_LOGIC 白底 JPG 抠成透明 PNG + 无损 WebP，覆盖官网 hero logo。纯 PIL，无 numpy 依赖。"""
import os
from PIL import Image

SRC = r"C:\Users\SJWJ\.workbuddy\clipboard-images\clipboard-2026-11-07T09-14-05-189Z-71ed408f.jpg"
OUT_DIR = r"c:\Users\SJWJ\WorkBuddy\2026-10-10-18-34-04\github-site\assets"
PNG = os.path.join(OUT_DIR, "title-logo.png")
WEBP = os.path.join(OUT_DIR, "title-logo.webp")

# 到纯白(255,255,255)的平方距离阈值：低于 LO2 完全透明，高于 HI2 完全不透明
LO2, HI2 = 42.0 ** 2, 120.0 ** 2
# 极淡像素（alpha 低于此值）直接清零，清除字母孔洞内的白点与外轮廓白边残留
CLEAN = 80

def main():
    im = Image.open(SRC).convert("RGB")
    w, h = im.size
    px = im.load()
    rgba = Image.new("RGBA", (w, h))
    out = rgba.load()
    x0, y0, x1, y1 = w, h, 0, 0
    span = HI2 - LO2
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            d2 = (255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2
            if d2 <= LO2:
                a = 0
            elif d2 >= HI2:
                a = 255
            else:
                a = int((d2 - LO2) / span * 255)
            if a < CLEAN:
                a = 0
            out[x, y] = (r, g, b, a)
            if a > 12:
                if x < x0: x0 = x
                if y < y0: y0 = y
                if x > x1: x1 = x
                if y > y1: y1 = y
    if x1 < x0:
        raise SystemExit("没找到非白内容，请检查源图")
    pad = int(max(x1 - x0, y1 - y0) * 0.02) + 2
    x0 = max(0, x0 - pad); y0 = max(0, y0 - pad)
    x1 = min(w - 1, x1 + pad); y1 = min(h - 1, y1 + pad)
    cropped = rgba.crop((x0, y0, x1 + 1, y1 + 1))
    cw, ch = cropped.size
    print("源尺寸:", (w, h), " 内容包围盒:", (cw, ch), " 宽高比:", round(cw / ch, 3))
    cropped.save(PNG, "PNG", optimize=True)
    cropped.save(WEBP, "WEBP", lossless=True, quality=100)
    print("已写出:", PNG, os.path.getsize(PNG), "bytes")
    print("已写出:", WEBP, os.path.getsize(WEBP), "bytes")

if __name__ == "__main__":
    main()
