#!/usr/bin/env python3
"""Generate the iOS AppIcon set from the Android launcher foreground.

Source: app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png (432x432).
Output: ios/UnmatchedCounter/Resources/Assets.xcassets/AppIcon.appiconset/

Apple requires every slot listed in Contents.json to have a matching PNG, no
transparency in the alpha channel, and a final 1024x1024 marketing icon. We
flatten the source onto solid black to satisfy the no-alpha requirement and
upscale to 1024 with Pillow's Lanczos filter.

Run from the repo root:
    python3 ios/_gen_appicon.py

Requires Pillow:
    python3 -m venv .venv && .venv/bin/pip install pillow
    .venv/bin/python ios/_gen_appicon.py
"""
import json
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required. Install with: pip install pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png")
DEST = os.path.join(ROOT, "ios/UnmatchedCounter/Resources/Assets.xcassets/AppIcon.appiconset")

# (idiom, size_pt, scale) → physical pixel size = size_pt * scale.
SLOTS = [
    ("iphone", "20x20",     "2x"),
    ("iphone", "20x20",     "3x"),
    ("iphone", "29x29",     "2x"),
    ("iphone", "29x29",     "3x"),
    ("iphone", "40x40",     "2x"),
    ("iphone", "40x40",     "3x"),
    ("iphone", "60x60",     "2x"),
    ("iphone", "60x60",     "3x"),
    ("ipad",   "20x20",     "1x"),
    ("ipad",   "20x20",     "2x"),
    ("ipad",   "29x29",     "1x"),
    ("ipad",   "29x29",     "2x"),
    ("ipad",   "40x40",     "1x"),
    ("ipad",   "40x40",     "2x"),
    ("ipad",   "76x76",     "1x"),
    ("ipad",   "76x76",     "2x"),
    ("ipad",   "83.5x83.5", "2x"),
    ("ios-marketing", "1024x1024", "1x"),
]

def physical_size(size_pt: str, scale: str) -> int:
    base = float(size_pt.split("x")[0])
    factor = int(scale.rstrip("x"))
    return int(round(base * factor))

def filename_for(idiom: str, size_pt: str, scale: str) -> str:
    safe_size = size_pt.replace(".", "_")
    return f"AppIcon-{idiom}-{safe_size}@{scale}.png"

def main():
    if not os.path.isfile(SOURCE):
        sys.exit(f"Source not found: {SOURCE}")
    os.makedirs(DEST, exist_ok=True)

    src = Image.open(SOURCE).convert("RGBA")

    # Composite onto solid black to drop the alpha channel; Apple rejects
    # transparent app icons.
    bg = Image.new("RGB", src.size, (0, 0, 0))
    bg.paste(src, mask=src.split()[3])

    # Android adaptive icons reserve ~25% safe-zone padding around the
    # foreground, so the visible squircle only fills the centre ~75%. Crop
    # to that area so the iOS icon fills the canvas (otherwise iOS shows a
    # "double squircle" — its own corner mask plus the squircle baked into
    # the source artwork, with a wide black border in between).
    CONTENT_RATIO = 0.78
    w, h = bg.size
    inset_w = int(w * (1 - CONTENT_RATIO) / 2)
    inset_h = int(h * (1 - CONTENT_RATIO) / 2)
    bg = bg.crop((inset_w, inset_h, w - inset_w, h - inset_h))

    # Largest target is 1024. Resize once into a high-quality master, then
    # downscale from that for every slot.
    master = bg.resize((1024, 1024), Image.LANCZOS)

    images_meta = []
    for idiom, size_pt, scale in SLOTS:
        px = physical_size(size_pt, scale)
        out_path = os.path.join(DEST, filename_for(idiom, size_pt, scale))
        img = master.resize((px, px), Image.LANCZOS)
        img.save(out_path, format="PNG")
        images_meta.append({
            "idiom": idiom,
            "size": size_pt,
            "scale": scale,
            "filename": os.path.basename(out_path),
        })

    contents = {
        "images": images_meta,
        "info": {"author": "xcode", "version": 1},
    }
    with open(os.path.join(DEST, "Contents.json"), "w") as f:
        json.dump(contents, f, indent=2)
        f.write("\n")

    print(f"Wrote {len(SLOTS)} icons + Contents.json to {DEST}")

if __name__ == "__main__":
    main()
