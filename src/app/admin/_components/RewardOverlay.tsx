"use client";

/**
 * 송전 결과 — 저장이 끝나면 화면을 한 번 덮는 보상 장면. 예전 `RewardCard` 를 키웠다.
 *
 * 순서가 곧 연출이다: 마을 지도 → 이번에 들어간 kWh 가 0 부터 차오름 → 등급이 올랐으면
 * 배지 → 밝아진 건물·새 장식·루미의 한마디가 하나씩 올라온다. 숫자와 목록은 전부
 * **서버가 돌려준 마을 상태**에서 온다. 미리보기 값으로 축하하면 저장이 실패한 날에도
 * 축하하게 된다.
 */

import {useEffect, useState} from "react";
import type {ActivityInput, VillageState} from "@/types/live";
import {BUILDING_NAME, UNLOCK_LABEL} from "../_lib/options";
import {sfx} from "../_lib/sfx";
import {LiveVillagePreview} from "./LiveVillagePreview";

export interface RewardInfo {
  state: VillageState;
  date: string;
  form: ActivityInput;
  gained: number;
  levelBefore: number;
  levelAfter: number;
}

export function RewardOverlay({
  reward,
  onClose
}: {
  reward: RewardInfo;
  onClose: () => void;
}) {
  const {state, gained, levelBefore, levelAfter} = reward;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(gained);
      return;
    }
    let n = 0;
    const step = Math.max(1, Math.round(gained / 40));
    const timer = window.setInterval(() => {
      n = Math.min(gained, n + step);
      setCount(n);
      if (n % 5 === 0) sfx.tick();
      if (n >= gained) {
        window.clearInterval(timer);
        sfx.chime();
      }
    }, 30);
    return () => window.clearInterval(timer);
  }, [gained]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const lit = state.buildings
    .filter(b => b.activity_score > 0 && b.building_id !== "central-plaza")
    .sort((a, b) => b.activity_score - a.activity_score)
    .slice(0, 6);
  const unlocked = state.unlocked_items.filter(
    item => !item.startsWith("active-")
  );
  const npcLine =
    state.npcs.find(n => n.npc_id === "guide-npc")?.status_text ??
    state.npcs[0]?.status_text ??
    "";

  const lines = [
    ...lit.map(b => (
      <>
        <b>{BUILDING_NAME[b.building_id] ?? b.building_id}</b> 불빛{" "}
        {b.light_level}
      </>
    )),
    ...unlocked.map(item => (
      <>
        <b>{UNLOCK_LABEL[item] ?? item}</b>이 마을에 섰습니다
      </>
    )),
    ...(npcLine ? [<>루미: “{npcLine}”</>] : [])
  ];

  return (
    <div
      aria-label="송전 결과"
      aria-modal="true"
      className="ab-overlay"
      onClick={onClose}
      role="dialog"
    >
      <div className="ab-reward" onClick={e => e.stopPropagation()}>
        <p className="ab-eyebrow">
          송전 완료 · {reward.date.slice(5).replace("-", ".")}
        </p>
        <h3>마을에 불이 들어옵니다</h3>
        <div className="ab-map-wrap">
          <LiveVillagePreview
            caption="방금 송전한 기록"
            form={reward.form}
            wide
            study={{codingToday: 0, codingTotal: 0, csToday: 0, csTotal: 0}}
          />
        </div>
        <div className="ab-kwh">
          +{count}
          <small> kWh</small>
        </div>
        {levelAfter > levelBefore ? (
          <span className="ab-lvup">등급 상승 · Lv.{levelAfter}</span>
        ) : null}
        <p className="ab-reward-summary">{state.summary}</p>
        <ul>
          {lines.map((line, i) => (
            <li key={i} style={{animationDelay: `${1.2 + i * 0.15}s`}}>
              {line}
            </li>
          ))}
        </ul>
        <div className="ab-reward-actions">
          <button className="ab-go-btn" onClick={onClose} type="button">
            배전반으로
          </button>
          <a className="ab-chip-btn" href="/village">
            마을에서 보기
          </a>
        </div>
      </div>
    </div>
  );
}
