"use client";

/**
 * 살아있는 마을 미리보기 — **타이핑하는 동안 불이 켜진다.**
 *
 * ## 왜 만들었나
 *
 * 이 화면의 논지는 "오늘 기록이 마을을 바꾼다" 인데, 정작 그 장면이 화면에 없었다.
 * 숫자를 넣고 저장한 **뒤에야** 텍스트로 결과를 알려줬다. 여기서는 값을 만지는
 * 동안 해당 구역 건물에 불이 들어온다 — 인과를 말이 아니라 눈으로 보여준다.
 *
 * ## 그림은 데이터가 그린다
 *
 * 건물 자리는 `villageBuildings` 의 실제 x/z 를 투영한 것이다. 손으로 찍은 점이
 * 아니라서 **건물이 늘면 지도도 자란다.** 경계는 매번 좌표에서 다시 계산하므로
 * 마을이 넓어져도 알아서 맞춘다.
 *
 * ## three.js 를 쓰지 않는다
 *
 * 관리자 화면은 매일 여는 도구다. 여기에 씬을 올리면 20MB 를 매번 받는다.
 * 캔버스 2D 로 충분하다 — 필요한 건 "어디에 불이 들어왔나" 지 3D 가 아니다.
 *
 * ## 점수는 여기서 계산하지 않는다
 *
 * `villageLightPreview.ts` 가 한다. 그쪽 머리 주석에 적었듯 **권위는 백엔드**이고,
 * 이 파일은 받은 점수를 그리기만 한다.
 */

import {useEffect, useMemo, useRef} from "react";
import {villageBuildings} from "@/lib/constants";
import {
  lightForScore,
  previewBuildingScores,
  type LightPreviewInput,
  type StudyCounts
} from "@/lib/villageLightPreview";

interface Props {
  form: LightPreviewInput;
  study: StudyCounts;
  /**
   * 이 폼이 못 움직이는 건물의 현재 값. 코딩테스트·CS 기록은 **다른 패널**이
   * 따로 저장하므로 여기 숫자를 아무리 만져도 안 변한다. 0 으로 두면 실제로는
   * 켜져 있는 도장·서고가 미리보기에서만 꺼져 보여서, 화면이 거짓말을 한다.
   * 그래서 서버가 아는 현재 점수를 그대로 덮어쓴다.
   */
  overrides?: Record<string, number>;
  /** 마우스를 올린 건물 이름을 위로 알려준다(선택) */
  onHoverBuilding?: (name: string | null) => void;
  /**
   * 회로 쪽에서 짚어 준 건물들. 그 회로에 마우스를 올리면 여기 불이 굵어진다 —
   * "이 줄이 저 건물을 켠다"를 화살표나 설명 없이 보여주는 유일한 방법이다.
   */
  highlightIds?: string[];
  /** 건물을 누르면 그 건물을 켜는 회로로 데려간다 */
  onPickBuilding?: (buildingId: string) => void;
}

/** 등급별 색. 마을 팔레트와 같은 값이라 화면끼리 어긋나지 않는다. */
const LIGHT_RGB: Record<string, [number, number, number]> = {
  dark: [40, 48, 62],
  dim: [122, 90, 56], // --v-wood
  normal: [226, 192, 120], // --v-gold
  bright: [255, 157, 56] // --v-lantern
};

export function LiveVillagePreview({
  form,
  study,
  overrides,
  onHoverBuilding,
  highlightIds,
  onPickBuilding
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const scores = useMemo(() => {
    const map = previewBuildingScores(form, study);
    for (const [id, score] of Object.entries(overrides ?? {})) {
      map.set(id, score);
    }
    return map;
  }, [form, study, overrides]);

  // 화면에 그릴 건물만 추린다 — 점수 표에 없는 건물(장식용)은 어두운 점으로 남는다
  const plots = useMemo(() => {
    const xs = villageBuildings.map(b => b.position[0]);
    const zs = villageBuildings.map(b => b.position[2]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    // 정사각형 비율을 지키려고 더 긴 축에 맞춘다. 안 그러면 마을이 눌려 보인다.
    const span = Math.max(maxX - minX, maxZ - minZ) || 1;
    const cx = (minX + maxX) / 2;
    const cz = (minZ + maxZ) / 2;
    return villageBuildings.map(b => ({
      id: b.id,
      name: b.name,
      // -0.5..0.5 로 정규화. 실제 픽셀은 그릴 때 캔버스 크기를 곱한다.
      nx: (b.position[0] - cx) / span,
      nz: (b.position[2] - cz) / span,
      plaza: b.id === "central-plaza"
    }));
  }, []);

  // 부드럽게 밝아지도록 현재 표시값을 따로 들고 목표값으로 다가간다.
  // 숫자를 한 번에 바꾸면 불이 툭 켜져서 "반응했다"는 느낌이 안 난다.
  // 렌더 루프 안에서 최신 하이라이트를 읽어야 하는데, 이걸 effect 의존성에
  // 넣으면 마우스를 움직일 때마다 캔버스가 재설정된다. ref 로만 흘려보낸다.
  const highlightRef = useRef<string[]>([]);
  highlightRef.current = highlightIds ?? [];

  /* 모션을 줄인 사용자에게는 값이 다 도착하면 루프를 멈춘다(배터리). 그런데
     멈춘 뒤에 하이라이트가 바뀌면 다시 그릴 사람이 없어서 조준 고리가 영영
     안 나온다 — 실제로 이 상태로 한 번 새 나갔다. 그래서 루프를 깨우는
     손잡이를 하나 두고, 하이라이트가 바뀔 때마다 두드린다. */
  const kickRef = useRef<() => void>(() => {});
  useEffect(() => {
    kickRef.current();
  }, [highlightIds]);

  const shownRef = useRef<Map<string, number>>(new Map());
  const targetRef = useRef<Map<string, number>>(scores);
  targetRef.current = scores;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let sleeping = false;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (document.hidden || w === 0) return;
      const now = performance.now();

      const shown = shownRef.current;
      const target = targetRef.current;
      // 목표로 다가간다(지수 감쇠). 모션을 줄인 사용자에겐 즉시 반영.
      let moving = false;
      target.forEach((val, id) => {
        const cur = shown.get(id) ?? 0;
        const next = still ? val : cur + (val - cur) * 0.14;
        if (Math.abs(val - next) > 0.4) moving = true;
        shown.set(id, next);
      });

      ctx.clearRect(0, 0, w, h);

      const pad = 18;
      const size = Math.min(w, h) - pad * 2;
      const ox = (w - size) / 2;
      const oy = (h - size) / 2;

      // 바닥 — 섬 느낌만 옅게
      ctx.fillStyle = "rgba(226, 192, 120, 0.04)";
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, size * 0.56, 0, Math.PI * 2);
      ctx.fill();

      for (const p of plots) {
        const x = ox + (p.nx + 0.5) * size;
        const y = oy + (p.nz + 0.5) * size;
        const score = shown.get(p.id) ?? 0;
        const level = lightForScore(Math.round(score));
        const [r, g, b] = LIGHT_RGB[level];
        const t = Math.max(0, Math.min(score / 100, 1));

        // 빛무리 — 점수가 높을수록 넓고 진하다
        if (score > 2) {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, 6 + t * 26);
          glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.05 + t * 0.4})`);
          glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, 6 + t * 26, 0, Math.PI * 2);
          ctx.fill();
        }

        // 건물 점. 불이 들어온 건물은 아주 옅게 흔들린다 — 등불은 가만히
        // 있지 않는다. 진폭을 작게 둬서 훑어볼 때 거슬리지 않게 했다.
        const flicker =
          score > 2 && !still
            ? 0.9 + Math.sin(now / 320 + p.nx * 40 + p.nz * 25) * 0.1
            : 1;
        const dot = (p.plaza ? 5.5 : 3.4) * flicker;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${
          (0.32 + t * 0.68) * flicker
        })`;
        ctx.beginPath();
        ctx.arc(x, y, dot, 0, Math.PI * 2);
        ctx.fill();

        // 짚어 준 건물은 조준 고리를 두른다
        if (highlightRef.current.includes(p.id)) {
          ctx.strokeStyle = "rgba(255, 157, 56, 0.95)";
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(x, y, dot + 7, 0, Math.PI * 2);
          ctx.stroke();
        }

        if (p.plaza) {
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.55)`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(x, y, dot + 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // 다 도착했고 움직임이 없으면 다음 프레임을 쉰다 — 매일 여는 화면이라
      // 가만히 있을 때까지 캔버스가 도는 건 낭비다.
      // 모션을 줄인 사용자에겐 도착하는 즉시 루프를 멈춘다. 그 외에는 등불이
      // 흔들려야 하므로 계속 돈다(탭이 숨겨지면 위에서 이미 건너뛴다).
      if (!moving && still) {
        cancelAnimationFrame(raf);
        sleeping = true;
      }
    };
    raf = requestAnimationFrame(draw);
    kickRef.current = () => {
      if (!sleeping) return;
      sleeping = false;
      raf = requestAnimationFrame(draw);
    };

    return () => {
      kickRef.current = () => {};
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [plots]);

  /** 화면 좌표에서 가장 가까운 건물을 찾는다. 히트 반경 밖이면 null. */
  const buildingAt = (clientX: number, clientY: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return null;
    const rect = wrap.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    const pad = 18;
    const size = Math.min(rect.width, rect.height) - pad * 2;
    const ox = (rect.width - size) / 2;
    const oy = (rect.height - size) / 2;
    let best: {id: string; name: string; d: number} | null = null;
    for (const p of plots) {
      const x = ox + (p.nx + 0.5) * size;
      const y = oy + (p.nz + 0.5) * size;
      const d = Math.hypot(mx - x, my - y);
      if (!best || d < best.d) best = {id: p.id, name: p.name, d};
    }
    return best && best.d < 16 ? best : null;
  };

  // 마우스로 건물 짚기 — 가장 가까운 점을 찾는다
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!onHoverBuilding) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const pad = 18;
    const size = Math.min(rect.width, rect.height) - pad * 2;
    const ox = (rect.width - size) / 2;
    const oy = (rect.height - size) / 2;
    let best: {name: string; d: number} | null = null;
    for (const p of plots) {
      const x = ox + (p.nx + 0.5) * size;
      const y = oy + (p.nz + 0.5) * size;
      const d = Math.hypot(mx - x, my - y);
      if (!best || d < best.d) best = {name: p.name, d};
    }
    onHoverBuilding(best && best.d < 16 ? best.name : null);
  };

  const lit = useMemo(() => {
    let n = 0;
    scores.forEach(v => {
      if (v > 0) n += 1;
    });
    return n;
  }, [scores]);

  return (
    <div className="grid gap-2">
      <div
        className="relative aspect-square w-full overflow-hidden rounded-lg"
        ref={wrapRef}
        style={{background: "rgb(13 17 22)"}}
      >
        <canvas
          className="absolute inset-0 sw-map"
          onClick={e => {
            const hit = buildingAt(e.clientX, e.clientY);
            if (hit) onPickBuilding?.(hit.id);
          }}
          onPointerLeave={() => onHoverBuilding?.(null)}
          onPointerMove={onMove}
          ref={canvasRef}
        />
      </div>
      <p className="text-center text-xs text-[#8b94a0]">
        불이 들어온 건물 <b className="text-[#ff9d38]">{lit}</b> / {scores.size}
        <span className="ml-2 opacity-70">· 저장하기 전 미리보기입니다</span>
      </p>
    </div>
  );
}
