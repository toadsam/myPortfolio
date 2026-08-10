"""길 타일의 **잔디 갓길을 판석 색으로 바꾼 변종**을 만든다.

    public/models/props/ground-flat/v2/*.glb
      → public/models/props/ground-flat/paved/*.glb

왜 필요한가
-----------
구역 바닥을 판석으로 덮고 나서 생긴 문제다. 길 타일은 "잔디밭 위의 흙길"로
그려져 있어서 양옆에 **밝은 초록 갓길**이 붙어 있다. 잔디 위에 깔 때는 그게
맞았는데, 베이지색 판석 위에 그대로 얹으니 마을 한복판에 초록 격자가 떠올랐다 —
부감으로 보면 돌마당이 아니라 잔디밭에 길을 낸 꼴이다.

컨셉 아트의 구역 안쪽은 베이지 판석 바닥에 분홍빛 길이 나 있고, 그 사이에
잔디는 없다. 그래서 **포장된 칸에 깔리는 길 타일만** 갓길을 돌색으로 바꾼다.
포장 밖(남쪽 진입로·북쪽 참배로)은 잔디 위를 지나므로 원본을 그대로 쓴다.

지오메트리는 손대지 않는다 — 타일 한 장이 삼각형 2개인 평면이고, 바꾸는 건
baseColor 텍스처 한 장뿐이다. 회전표도 v2 와 똑같으므로 generate-ground-layout
에서는 glb 경로만 갈아 끼우면 된다.

쓰는 법: python scripts/make_paved_road_tiles.py
        (길 타일 세트를 다시 구우면 이것도 다시 돌려야 한다)
"""

import io
import json
import struct
from pathlib import Path

from PIL import Image

SRC = Path("public/models/props/ground-flat/v2")
OUT = Path("public/models/props/ground-flat/paved")

# make-paving-tile.mjs 가 구운 판석의 실측 평균. 갓길을 이 색으로 맞춰야
# 길 옆과 그 바깥 포장이 한 재질로 이어진다.
STONE = (182, 164, 131)
# 그 평균이 나오는 밝기. 잔디 화소의 밝기를 이 값 기준으로 환산한다.
STONE_LUMA = 166.0


def parse_glb(raw: bytes):
    off, gltf, binary = 12, None, None
    while off < len(raw):
        length, kind = struct.unpack_from("<II", raw, off)
        body = raw[off + 8 : off + 8 + length]
        if kind == 0x4E4F534A:
            gltf = json.loads(body)
        elif kind == 0x004E4942:
            binary = body
        off += 8 + length
    return gltf, bytearray(binary)


def build_glb(gltf: dict, binary: bytes) -> bytes:
    js = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    js += b" " * (-len(js) % 4)
    bn = bytes(binary)
    bn += b"\x00" * (-len(bn) % 4)
    header = struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bn))
    return (
        header
        + struct.pack("<II", len(js), 0x4E4F534A)
        + js
        + struct.pack("<II", len(bn), 0x004E4942)
        + bn
    )


def destone(image: Image.Image) -> tuple[Image.Image, float]:
    """초록 갓길을 판석 색으로 바꾼다. 흙길·자갈은 그대로 둔다."""
    image = image.convert("RGB")
    pixels = list(image.getdata())  # noqa: 구버전 Pillow 호환
    out = []
    changed = 0
    for r, g, b in pixels:
        # 잔디 판정: 초록이 확실히 우세한 화소만. 흙길에도 이끼가 조금 있는데
        # 그건 남겨야 길이 밋밋해지지 않으므로 문턱을 넉넉히 잡는다.
        green = g - max(r, b)
        if green <= 10:
            out.append((r, g, b))
            continue
        # 문턱 근처는 반만 바꾼다 — 딱 잘라 바꾸면 갓길 경계에 계단이 생긴다
        amount = min(1.0, (green - 10) / 22.0)
        luma = 0.299 * r + 0.587 * g + 0.114 * b
        # 잔디의 밝기 굴곡(풀결·그림자)을 판석 색에 그대로 옮긴다
        gain = luma / STONE_LUMA
        stone = tuple(min(255, int(c * gain)) for c in STONE)
        out.append(
            tuple(int(src * (1 - amount) + dst * amount) for src, dst in zip((r, g, b), stone))
        )
        changed += 1
    result = Image.new("RGB", image.size)
    result.putdata(out)
    return result, changed / len(pixels)


def convert(path: Path) -> str:
    gltf, binary = parse_glb(path.read_bytes())
    images = gltf.get("images", [])
    if not images:
        raise SystemExit(f"{path.name}: 텍스처가 없습니다")

    # bufferView 를 갈아 끼우는 대신 **뒤에 새로 붙인다**. 길이가 달라지면
    # 뒤따르는 view 들의 byteOffset 을 전부 다시 계산해야 하는데, 그러다
    # 접근자 하나만 놓쳐도 타일이 통째로 깨진다.
    ratios = []
    for image in images:
        view = gltf["bufferViews"][image["bufferView"]]
        start = view.get("byteOffset", 0)
        blob = bytes(binary[start : start + view["byteLength"]])
        recolored, ratio = destone(Image.open(io.BytesIO(blob)))
        ratios.append(ratio)

        buf = io.BytesIO()
        # 원본이 JPEG 든 PNG 든 JPEG 로 통일한다 — 최적화 파이프라인이 이미
        # 그렇게 굽고 있고, 사진 같은 그림이라 PNG 로 두면 파일만 커진다.
        recolored.save(buf, format="JPEG", quality=88)
        data = buf.getvalue()

        binary += b"\x00" * (-len(binary) % 4)
        offset = len(binary)
        binary += data
        gltf["bufferViews"].append({"buffer": 0, "byteOffset": offset, "byteLength": len(data)})
        image["bufferView"] = len(gltf["bufferViews"]) - 1
        image["mimeType"] = "image/jpeg"
        image.pop("uri", None)

    binary += b"\x00" * (-len(binary) % 4)
    gltf["buffers"][0]["byteLength"] = len(binary)

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / path.name).write_bytes(build_glb(gltf, binary))
    return " · ".join(f"{r * 100:.0f}%" for r in ratios)


def main() -> None:
    if not SRC.is_dir():
        raise SystemExit(f"{SRC} 가 없습니다 — 먼저 flatten-ground-tiles.mjs 를 돌리세요")
    names = sorted(p for p in SRC.glob("*.glb"))
    for path in names:
        share = convert(path)
        size = (OUT / path.name).stat().st_size / 1024
        print(f"  {path.name:<22} {size:6.0f}KB   갓길로 바꾼 화소 {share}")
    print(f"{OUT}  {len(names)}장, 잔디 갓길을 판석 rgb{STONE} 로 바꿨습니다")


if __name__ == "__main__":
    main()
