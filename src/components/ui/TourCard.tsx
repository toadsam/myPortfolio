"use client";

import {motion} from "framer-motion";
import {Crest} from "@/components/ui/Crest";
import type {CrestName} from "@/data/villageCrests";
import {districtTone, sectionMeta} from "@/lib/constants";
import type {SectionId} from "@/types/portfolio";

/**
 * 채용 담당자 3분 코스의 정류장 카드.
 *
 * "채용 담당자예요" 칩은 예전엔 이력서 화면으로 곧장 보냈다 — 3D 마을을 만든
 * 이유가 사라지는 선택지였다. 이제 프로젝트 → 기술 → 경험 → 연락 네 정류장을
 * 카메라가 차례로 돌고, 정류장마다 구역 설명 한 줄과 세 갈래(자세히 / 다음 /
 * 이력서)를 준다. 투어 자체가 "이 마을에서 뭘 볼 수 있는지"의 답이 된다.
 *
 * 카메라 이동과 자동 진행 타이머는 부모(AIPortfolioVillage)가 쥔다. 이 카드는
 * 그림과 버튼만 — 진행 막대는 `key={index}` 로 정류장마다 처음부터 다시 찬다.
 */
export function TourCard({
  index,
  total,
  sectionId,
  stopMs,
  resumeHref,
  onNext,
  onDetail,
  onResume,
  onEnd
}: {
  index: number;
  total: number;
  sectionId: SectionId;
  /** 자동 진행 간격 — 진행 막대 길이와 맞춘다 */
  stopMs: number;
  /** 이력서 PDF 경로 */
  resumeHref: string;
  onNext: () => void;
  onDetail: () => void;
  onResume: () => void;
  onEnd: () => void;
}) {
  const meta = sectionMeta.find(s => s.id === sectionId);
  const tone = districtTone(sectionId);
  const isLast = index >= total - 1;

  return (
    <motion.div
      className="v-panel fixed bottom-6 left-1/2 z-[55] w-[min(94vw,560px)] -translate-x-1/2 overflow-hidden p-4"
      initial={{opacity: 0, y: 24}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: 24}}
      transition={{type: "spring", stiffness: 260, damping: 24}}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="v-panel-title text-[12px]">
          채용 담당자 3분 코스 · {index + 1}/{total}
        </p>
        <button
          type="button"
          onClick={onEnd}
          className="shrink-0 rounded-lg border border-[#e2c078]/20 px-2.5 py-1 text-[11px] font-black text-[#a9bdd6]/70 transition hover:text-[#f3e6c8] active:scale-95"
        >
          코스 끝내기
        </button>
      </div>

      <div className="mt-2 flex items-start gap-3">
        <span
          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border bg-[#131f33]"
          style={{borderColor: `${tone.accent}66`}}
        >
          <Crest name={tone.crest as CrestName} size={20} />
        </span>
        <div className="min-w-0">
          <h3 className="v-serif text-lg leading-tight text-[#f3e6c8]">
            {meta?.title ?? sectionId}
          </h3>
          <p className="mt-1 text-[13px] leading-6 text-[#c9d6e8]">
            {meta?.description}
          </p>
        </div>
      </div>

      {/* 정류장 점 */}
      <div className="mt-3 flex items-center gap-1.5">
        {Array.from({length: total}, (_, i) => (
          <span
            key={i}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === index ? 18 : 6,
              background: i <= index ? tone.accent : "rgba(169,189,214,0.25)"
            }}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onDetail}
          className="rounded-lg border border-[#e2c078]/35 bg-white/[0.04] px-3 py-2 text-[12px] font-black text-[#eef2f8] transition hover:border-[#e2c078]/70 hover:bg-[#e2c078]/10 active:scale-95"
        >
          여기 자세히 보기
        </button>
        <button
          type="button"
          onClick={isLast ? onResume : onNext}
          className="rounded-lg border border-[#ff9d38]/60 bg-[#ff9d38]/15 px-3 py-2 text-[12px] font-black text-[#ffd9ae] transition hover:bg-[#ff9d38]/25 active:scale-95"
        >
          {isLast ? "이력서 보기 ▸" : "다음 정류장 ▸"}
        </button>
        <a
          href={resumeHref}
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-[11px] font-bold text-[#a9bdd6]/80 underline-offset-2 transition hover:text-[#f3e6c8] hover:underline"
        >
          이력서 PDF 내려받기
        </a>
      </div>

      {/* 자동 진행 막대 — 마지막 정류장은 자동으로 넘어가지 않으니 그리지 않는다 */}
      {!isLast ? (
        <motion.div
          key={index}
          className="absolute inset-x-0 bottom-0 h-[3px] origin-left"
          style={{background: tone.accent, opacity: 0.7}}
          initial={{scaleX: 0}}
          animate={{scaleX: 1}}
          transition={{duration: stopMs / 1000, ease: "linear"}}
        />
      ) : null}
    </motion.div>
  );
}
