"use client";

import {AnimatePresence, motion} from "framer-motion";
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
      className="v-panel fixed bottom-6 left-1/2 z-[55] w-[min(94vw,600px)] -translate-x-1/2 overflow-hidden rounded-[30px]! p-5"
      initial={{opacity: 0, y: 40, scale: 0.94}}
      animate={{opacity: 1, y: 0, scale: 1}}
      exit={{opacity: 0, y: 30, scale: 0.96}}
      transition={{type: "spring", stiffness: 300, damping: 22}}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="pt-2 text-[13.5px] font-extrabold tabular-nums text-[#c3c0f7]">
          채용 담당자 3분 코스 · {index + 1}/{total}
        </p>
        <button
          type="button"
          onClick={onEnd}
          className="flex h-10 shrink-0 items-center rounded-full bg-white/10 px-4 text-[13.5px] font-extrabold text-white hover:bg-white/[0.16]"
        >
          코스 끝내기
        </button>
      </div>

      {/* 정류장이 바뀌면 글이 옆으로 밀려 나가고 다음 글이 밀려 들어온다. 카메라가
          다음 구역으로 날아가는 것과 같은 방향이라 "넘어갔다"가 글에서도 읽힌다. */}
      <div className="relative mt-1 min-h-[86px]">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={sectionId}
            className="flex items-start gap-3"
            initial={{opacity: 0, x: 46}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: -46}}
            transition={{type: "spring", stiffness: 340, damping: 30}}
          >
            <span className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#aeaaf3]/[0.16]">
              <Crest name={tone.crest as CrestName} size={22} />
            </span>
            <div className="min-w-0">
              <h3 className="v-serif text-[24px] leading-tight text-white">
                {meta?.title ?? sectionId}
              </h3>
              <p className="mt-1 text-[15px] leading-6 text-[#d3d7df]">
                {meta?.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 정류장 점 — 지금 정류장의 긴 알약이 다음 칸으로 미끄러진다 */}
      <div className="mt-3 flex items-center gap-1.5">
        {Array.from({length: total}, (_, i) => (
          <motion.span
            key={i}
            layout
            className="h-1.5 rounded-full"
            style={{
              width: i === index ? 28 : 6,
              background: i <= index ? "#aeaaf3" : "rgba(255,255,255,0.25)"
            }}
            transition={{type: "spring", stiffness: 420, damping: 30}}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onDetail}
          className="flex h-11 items-center rounded-full bg-white/10 px-5 text-[14.5px] font-extrabold text-white hover:bg-white/[0.16]"
        >
          여기 자세히 보기
        </button>
        <button
          type="button"
          onClick={isLast ? onResume : onNext}
          className="flex h-11 items-center rounded-full bg-[#4f46e5] px-5 text-[14.5px] font-extrabold text-white shadow-[0_10px_26px_rgba(79,70,229,0.35)] hover:bg-[#4338ca]"
        >
          {isLast ? "이력서 보기 ▸" : "다음 정류장 ▸"}
        </button>
        <a
          href={resumeHref}
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-[13.5px] font-extrabold text-[#c3c0f7] underline-offset-2 hover:text-white hover:underline"
        >
          이력서 PDF 내려받기
        </a>
      </div>

      {/* 자동 진행 막대 — 마지막 정류장은 자동으로 넘어가지 않으니 그리지 않는다 */}
      {!isLast ? (
        <motion.div
          key={index}
          className="absolute inset-x-0 bottom-0 h-[3px] origin-left"
          style={{background: "#4f46e5"}}
          initial={{scaleX: 0}}
          animate={{scaleX: 1}}
          transition={{duration: stopMs / 1000, ease: "linear"}}
        />
      ) : null}
    </motion.div>
  );
}
