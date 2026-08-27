"""GLB 텍스처 최적화 — optimize-glb.mjs가 중간 단계로 호출한다.

gltf-transform이 .gltf로 풀어놓은 텍스처들을 검사해서
  1) 아무 일도 안 하는 맵을 찾아 삭제하고 (factor 값으로 대체)
  2) 남은 맵을 카테고리별 예산 해상도로 줄이고
  3) JPEG로 다시 굽는다.

원래는 `gltf-transform optimize --texture-compress webp`가 이걸 해줬는데
이 환경의 sharp/libvips가 깨져 있다 (`colourspace: parameter space not set`).
Pillow로 같은 일을 한다.

사용법: python optimize_textures.py <gltf경로> <그룹명>
"""

import json
import os
import sys

try:
    from PIL import Image, ImageFile, ImageStat
except ImportError:
    print("  ! Pillow가 없습니다 — pip install Pillow", file=sys.stderr)
    sys.exit(2)


# ─── 카테고리별 텍스처 예산 (한 변의 최대 픽셀) ──────────────────────────────
# 건물은 가까이서 보고 간판 글자를 읽어야 하니 baseColor를 크게 준다.
# 장식물은 수백 개가 깔리므로 인색하게 준다.
BUDGETS = {
    "buildings": {"baseColor": 1024, "normal": 512, "metallicRoughness": 512, "emissive": 512, "occlusion": 512},
    "props": {"baseColor": 512, "normal": 256, "metallicRoughness": 256, "emissive": 256, "occlusion": 256},
    # 공방 실내 가구(props/raw/atelier/) — 카메라가 1~3유닛 거리라 512로 줄이면
    # 뭉개진다. 방에 6종뿐이라 1024를 줘도 VRAM 부담이 작다.
    "atelier": {"baseColor": 1024, "normal": 512, "metallicRoughness": 256, "emissive": 512, "occlusion": 256},
    "characters": {"baseColor": 512, "normal": 512, "metallicRoughness": 256, "emissive": 256, "occlusion": 256},
    "environment": {"baseColor": 1024, "normal": 512, "metallicRoughness": 512, "emissive": 512, "occlusion": 512},
}
DEFAULT_BUDGET = BUDGETS["props"]

# JPEG 품질 — 노멀맵은 압축 얼룩이 굴곡으로 보이므로 높게 준다
QUALITY = {"normal": 92, "baseColor": 88, "metallicRoughness": 85, "emissive": 85, "occlusion": 85}

# 1024×1024 RGBA + 밉맵이 VRAM에서 차지하는 바이트 (계기판과 같은 계산식)
# ─── 디라이팅 ────────────────────────────────────────────────────────────────
# Meshy는 알베도에 **자기가 쓴 조명**을 구워서 내보낸다. 물건마다 그 조명 방향과
# 세기가 다르니, 한 장면에 모아 놓으면 저마다 다른 태양을 달고 있는 꼴이 된다.
# 실측(26채 + 장식물): 저주파 밝기 편차가 4.5~29.2 로 5배 넘게 벌어져 있었다.
# project-sign-language 24.6 · lute-picnic 29.2 · orb-lantern 28.2 가 최악이고
# project-darklab 은 4.5 다. 이 편차가 "따로 노는 에셋" 느낌의 큰 축이다.
#
# ── 왜 0 으로 밀지 않고 한 수준으로만 맞추나 ────────────────────────────────
# 저주파 밝기를 전부 없애면 의도한 명암(어두운 지붕 ↔ 밝은 벽)까지 같이 날아가
# 물건이 판판한 스티커가 된다. 목표는 "그림자를 지우는 것"이 아니라 **모두가
# 같은 양의 그림자를 갖게 하는 것**이다 — 팔레트 잠금이 색을 하나로 만들지 않고
# 같은 계열로 당기기만 하는 것과 같은 생각이다.
#
# 그래서 이미 조용한 텍스처(목표 이하)는 아예 건드리지 않고, 시끄러운 것만
# 목표까지 눌러 준다. 눌리는 건 큰 얼룩(저주파)뿐이고 무늬·모서리 같은 잔주름
# (고주파)은 나눗셈이 그대로 통과시키므로 디테일은 남는다.
DELIGHT_TARGET = 12.0  # 저주파 밝기 표준편차 (0~255). 실측 중앙값 근처.

# 픽셀 하나를 얼마나 밝히거나 어둡게 할 수 있는지의 한계.
#
# 처음엔 3.0 까지 열어 뒀는데, 그러면 **거의 검은 자리가 갈색으로 되살아난다** —
# 실제로 간판 텍스처의 검은 원반이 갈색 고리로 바뀌었다. 구워진 그림자인지
# 원래 검은 재질(또는 뚫린 구멍)인지는 픽셀만 봐서 구분할 수 없으므로,
# 되살리는 쪽을 보수적으로 막는다. 1.5 면 넓은 명암 기울기는 충분히 눕히면서
# 검은 자리는 검게 남는다.
DELIGHT_MAX_LIFT = 1.5
DELIGHT_MAX_DARKEN = 0.6


def delight(im):
    """알베도에 구워진 조명을 줄여, 에셋마다 다른 명암 세기를 한 수준으로 맞춘다."""
    from PIL import ImageFilter

    rgb = im.convert("RGB")
    w, h = rgb.size
    radius = max(2, min(w, h) // 8)
    lo = rgb.convert("L").filter(ImageFilter.GaussianBlur(radius=radius))
    px = list(lo.getdata())
    n = len(px)
    mean = sum(px) / n
    if mean < 1:
        return im, ""
    sigma = (sum((v - mean) ** 2 for v in px) / n) ** 0.5
    if sigma <= DELIGHT_TARGET:
        return im, f"  구운조명 {sigma:.0f} (그대로)"

    # 저주파 편차를 목표까지 줄이는 배율을 픽셀마다 구한다.
    #   원하는 밝기 = mean + (lo - mean) * k    (k = 목표/실측)
    #   보정 배율   = 원하는 밝기 / lo
    k = DELIGHT_TARGET / sigma
    gain = [
        max(DELIGHT_MAX_DARKEN, min(DELIGHT_MAX_LIFT, (mean + (v - mean) * k) / v))
        if v > 4
        else 1.0
        for v in px
    ]

    # 채널마다 같은 배율을 곱한다 — 밝기만 건드리고 색상은 그대로 둔다.
    chans = []
    for ch in rgb.split():
        chans.append(
            Image.frombytes(
                "L",
                (w, h),
                bytes(min(255, max(0, round(v * g))) for v, g in zip(ch.getdata(), gain)),
            )
        )
    return Image.merge("RGB", chans), f"  구운조명 {sigma:.0f}→{DELIGHT_TARGET:.0f}"


def vram_bytes(w, h):
    return w * h * 4 * 1.333


def srgb_to_linear(v):
    c = v / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


class Slot:
    """머티리얼의 텍스처 자리 하나 (예: 3번 머티리얼의 emissiveTexture)"""

    def __init__(self, material, kind, container, key):
        self.material = material
        self.kind = kind
        self.container = container  # 이 텍스처 참조를 담고 있는 dict
        self.key = key              # container[key] == {"index": n}


def collect_slots(gltf):
    """머티리얼들을 훑어 이미지 인덱스 → 그 이미지를 쓰는 Slot 목록을 만든다."""
    textures = gltf.get("textures") or []
    by_image = {}

    def add(material, kind, container, key):
        ref = container.get(key)
        if not isinstance(ref, dict):
            return
        tex_index = ref.get("index")
        if tex_index is None or tex_index >= len(textures):
            return
        source = textures[tex_index].get("source")
        if source is None:
            return
        by_image.setdefault(source, []).append(Slot(material, kind, container, key))

    for material in gltf.get("materials") or []:
        pbr = material.get("pbrMetallicRoughness")
        if isinstance(pbr, dict):
            add(material, "baseColor", pbr, "baseColorTexture")
            add(material, "metallicRoughness", pbr, "metallicRoughnessTexture")
        add(material, "normal", material, "normalTexture")
        add(material, "emissive", material, "emissiveTexture")
        add(material, "occlusion", material, "occlusionTexture")

    return by_image


# 사람 눈에 "빛난다"고 보이기 시작하는 밝기. 이보다 어두우면 검정과 구분이 안 된다.
VISIBLE = 24
# 이 비율 미만으로만 밝으면 인코딩 노이즈로 본다 (1600만 픽셀 중 1600개 미만)
NOISE_RATIO = 0.0001


def analyze(image):
    """채널별 평균/표준편차 + '실제로 밝은 픽셀'의 비율.

    최댓값으로 판정하면 안 된다. 완전 검정인 맵도 PNG 인코딩 노이즈 때문에
    최댓값이 9쯤 나온다 (실측: 1600만 픽셀 중 8 이상이 22개). 반대로 창문 하나만
    빛나는 맵은 평균이 0.5여도 살려야 한다. 그래서 '보이는 밝기 이상인 픽셀이
    몇 퍼센트인가'로 본다.
    """
    rgb = image.convert("RGB")
    stat = ImageStat.Stat(rgb)
    histogram = rgb.convert("L").histogram()
    total = rgb.size[0] * rgb.size[1]
    return {
        "mean": stat.mean,
        "stddev": stat.stddev,
        "max": [e[1] for e in rgb.getextrema()],
        "bright_ratio": sum(histogram[VISIBLE:]) / total if total else 0.0,
    }


def decide_drop(kind, stats, slots):
    """이 맵을 지워도 되는지 판정. 지울 수 있으면 (사유, 적용함수)를 준다."""
    mean, stddev = stats["mean"], stats["stddev"]
    flat = max(stddev) < 3.0

    if kind == "emissive":
        # 발광 부위가 없는데 Meshy가 습관적으로 붙여놓은 검정 맵.
        # 창문 하나만 빛나는 진짜 발광맵은 bright_ratio가 확 튀므로 안 지워진다.
        if stats["bright_ratio"] < NOISE_RATIO:
            def apply():
                for s in slots:
                    s.material["emissiveFactor"] = [0, 0, 0]
            return "발광 없음", apply

    if kind == "metallicRoughness":
        # G=거칠기, B=금속성. 둘 다 균일하면 스칼라 값으로 대체할 수 있다
        if flat:
            def apply():
                for s in slots:
                    pbr = s.material.get("pbrMetallicRoughness") or {}
                    pbr["roughnessFactor"] = round(mean[1] / 255.0, 4)
                    pbr["metallicFactor"] = round(mean[2] / 255.0, 4)
                    s.material["pbrMetallicRoughness"] = pbr
            return f"균일 (거칠기 {mean[1]/255:.2f} / 금속 {mean[2]/255:.2f})", apply

    if kind == "normal":
        # 평평한 노멀(128,128,255)이면 굴곡 정보가 없다
        if flat and abs(mean[0] - 128) < 6 and abs(mean[1] - 128) < 6 and mean[2] > 245:
            return "굴곡 없음", lambda: None

    if kind == "occlusion":
        if flat and mean[0] > 250:
            return "그늘 없음", lambda: None

    if kind == "baseColor":
        # 단색이면 baseColorFactor로 대체 (sRGB → 선형 변환 필요)
        if max(stddev) < 2.0:
            def apply():
                for s in slots:
                    pbr = s.material.get("pbrMetallicRoughness") or {}
                    existing = pbr.get("baseColorFactor") or [1, 1, 1, 1]
                    pbr["baseColorFactor"] = [round(srgb_to_linear(c), 4) for c in mean] + [existing[3]]
                    s.material["pbrMetallicRoughness"] = pbr
            return f"단색 rgb({int(mean[0])},{int(mean[1])},{int(mean[2])})", apply

    return None, None


def slot_keeps_alpha(slots, gltf):
    """baseColor가 투명도를 실제로 쓰는지 — 쓰면 JPEG로 못 굽는다."""
    for s in slots:
        if s.kind != "baseColor":
            continue
        if s.material.get("alphaMode", "OPAQUE") != "OPAQUE":
            return True
    return False


def main():
    if len(sys.argv) < 3:
        print("사용법: optimize_textures.py <gltf경로> <그룹명>", file=sys.stderr)
        return 2

    gltf_path, group = sys.argv[1], sys.argv[2]
    budget = BUDGETS.get(group, DEFAULT_BUDGET)
    base_dir = os.path.dirname(os.path.abspath(gltf_path))

    with open(gltf_path, encoding="utf-8") as f:
        gltf = json.load(f)

    images = gltf.get("images") or []
    if not images:
        return 0

    by_image = collect_slots(gltf)
    saved_vram = 0.0

    for index, image_entry in enumerate(images):
        uri = image_entry.get("uri")
        if not uri:
            continue  # GLB 내장 버퍼 이미지 — copy 단계에서 풀렸어야 한다
        path = os.path.join(base_dir, uri)
        if not os.path.exists(path):
            continue

        slots = by_image.get(index) or []
        if not slots:
            continue  # 어떤 머티리얼도 안 쓰는 이미지 — prune이 알아서 지운다

        kinds = {s.kind for s in slots}
        kind = slots[0].kind
        with Image.open(path) as im:
            width, height = im.size
            stats = analyze(im)

        # ── 1) 지울 수 있는 맵인가 (여러 슬롯이 공유하면 건드리지 않는다)
        if len(kinds) == 1:
            reason, apply = decide_drop(kind, stats, slots)
            if reason:
                if apply:
                    apply()
                for s in slots:
                    s.container.pop(s.key, None)
                freed = vram_bytes(width, height)
                saved_vram += freed
                print(f"    ✂ {kind:17} 삭제 — {reason}  (−{freed/1024/1024:.1f}MB VRAM)")
                continue

        # ── 2) 남은 맵은 예산 해상도로 축소 + JPEG
        limit = max(budget.get(k, 512) for k in kinds)
        target = min(max(width, height), limit)
        keep_alpha = slot_keeps_alpha(slots, gltf)

        with Image.open(path) as im:
            resized = False
            if max(width, height) > target:
                im = im.resize((target, target), Image.LANCZOS)
                resized = True

            delit = ""
            if "baseColor" in kinds:
                im, delit = delight(im)

            before_vram = vram_bytes(width, height)
            after_vram = vram_bytes(im.size[0], im.size[1])
            saved_vram += before_vram - after_vram

            if keep_alpha:
                # 알파를 쓰는 baseColor는 PNG 유지 (JPEG엔 알파가 없다)
                im.convert("RGBA").save(path, "PNG", optimize=True)
                out_uri = uri
            else:
                out_uri = os.path.splitext(uri)[0] + ".jpg"
                quality = min(QUALITY.get(k, 85) for k in kinds)
                # optimize=True 는 JPEG 전체를 한 블록에 담아야 하는데, Pillow의 기본
                # 버퍼는 64KB뿐이라 넘치면 "broken data stream when writing image file"
                # 로 죽는다. 노멀맵은 화질 92 + 4:4:4 라 256×256 만 돼도 64KB를 넘긴다
                # (우물·노점·게시판·입구아치가 여기서 걸렸다). 픽셀당 4바이트면 충분하다.
                ImageFile.MAXBLOCK = max(ImageFile.MAXBLOCK, im.size[0] * im.size[1] * 4)
                # subsampling=0 (4:4:4) — 노멀맵/거칠기맵은 색 뭉개짐이 곧 오차다
                im.convert("RGB").save(
                    os.path.join(base_dir, out_uri), "JPEG",
                    quality=quality, optimize=True, subsampling=0
                )
                image_entry["uri"] = out_uri
                image_entry["mimeType"] = "image/jpeg"

        note = f"{width}→{target}" if resized else f"{width} 유지"
        print(f"    · {kind:17} {note:12} {'PNG(알파)' if keep_alpha else 'JPEG'}{delit}")

    with open(gltf_path, "w", encoding="utf-8") as f:
        json.dump(gltf, f)

    if saved_vram > 0:
        print(f"    ⇒ 텍스처 VRAM {saved_vram/1024/1024:.1f}MB 절감")
    return 0


if __name__ == "__main__":
    sys.exit(main())
