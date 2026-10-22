"""从 Noto Sans SC 中保留动画所用字形；衍生字体重命名为 MotionSans。"""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
text = (root / "src/OneDot.tsx").read_text(encoding="utf-8")
options = subset.Options()
options.name_IDs = ["*"]
options.name_legacy = True
options.name_languages = ["*"]
font = TTFont(root / "public/NotoSansSC.ttf")
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
for record in font["name"].names:
    if record.nameID in (1, 3, 4, 6, 16):
        record.string = "MotionSans".encode(record.getEncoding())
font.save(root / "public/MotionSans.ttf")
print(f"Subset font: {(root / 'public/MotionSans.ttf').stat().st_size} bytes")
