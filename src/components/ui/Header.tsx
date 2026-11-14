"use client";

/**
 * 상단 — 화면 폭을 채운 바가 아니라 **좌우로 떨어진 명패 둘**이다.
 *
 * 예전엔 `fixed left-0 right-0` 짜리 납작한 띠에 1px 밑줄이었다. 마을이 밤
 * 랜턴 톤으로 바뀐 뒤로 그 띠만 웹사이트 헤더로 남아, 3D 화면 위에 붙은
 * 브라우저 크롬처럼 보였다. 명패 둘로 나누면 마을에 걸린 물건이 된다.
 *
 * **세로 65px 예산은 그대로 지킨다.** AIPortfolioVillage 의 `pt-[65px]`,
 * InfoPanel 의 `top-[65px]`, IntroOverlay 의 `pt-[65px]` 가 이 높이에 묶여
 * 있어서, 명패가 그 띠를 넘으면 세 곳이 같이 어긋난다. 그래서 바깥 컨테이너는
 * 예전과 같은 높이를 차지하고(pointer-events 는 통과시켜 3D 를 가리지 않게),
 * 명패만 그 안에 얹는다.
 */

import {motion} from "framer-motion";
import {Crest} from "@/components/ui/Crest";
import {VillageFrame} from "@/components/ui/VillageFrame";
import {districtTone, sectionMeta} from "@/lib/constants";
import type {CrestName} from "@/data/villageCrests";
import type {SectionId} from "@/types/portfolio";

interface HeaderProps {
  activeSection: SectionId;
  onSelectSection: (sectionId: SectionId) => void;
}

const visibleNav: SectionId[] = [
  "projects",
  "github",
  "study",
  "experience",
  "life",
  "contact"
];

export function Header({activeSection, onSelectSection}: HeaderProps) {
  return (
    <motion.header
      animate={{opacity: 1, y: 0}}
      // 띠 자체는 클릭을 통과시킨다 — 명패 사이 빈 자리에서 3D 마을을 돌릴 수
      // 있어야 한다. 예전 배경 있는 바에서는 그 폭만큼 카메라가 안 잡혔다.
      className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[65px]"
      initial={{opacity: 0, y: -12}}
      transition={{duration: 0.5, ease: [0.22, 1, 0.36, 1]}}
    >
      <div className="mx-auto flex h-full max-w-[1540px] items-center justify-between gap-4 px-3 md:px-5">
        {/* ── 왼쪽: 브랜드 명패 ── */}
        <VillageFrame
          className="pointer-events-auto min-w-0 shrink"
          variant="grand"
        >
          <motion.button
            className="flex min-w-0 items-center gap-2.5 py-1.5 pl-2 pr-4 text-left md:gap-3 md:pr-5"
            onClick={() => onSelectSection("intro")}
            type="button"
            whileHover={{x: 1}}
            whileTap={{scale: 0.97}}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#4f46e5]">
              <Crest name="compass" size={19} tone="#ffffff" />
            </span>
            <span className="min-w-0">
              <strong className="v-serif block truncate text-[16px] leading-tight text-white">
                Developer&apos;s City
              </strong>
              <small className="hidden text-[12px] font-bold text-[#b4bac6] sm:block">
                정재훈의 3D 포트폴리오
              </small>
            </span>
          </motion.button>
        </VillageFrame>

        {/* ── 오른쪽: 내비 명패 ── */}
        <VillageFrame
          className="pointer-events-auto hidden md:block"
          variant="bar"
        >
          <nav
            aria-label="Portfolio sections"
            className="flex items-center gap-0.5 p-[5px]"
          >
            {visibleNav.map(sectionId => {
              const section = sectionMeta.find(item => item.id === sectionId);
              if (!section) return null;
              const isActive = activeSection === section.id;
              const tone = districtTone(sectionId);

              return (
                <motion.button
                  className="relative flex h-10 items-center gap-1.5 rounded-full px-3 text-[14px] font-extrabold transition-colors duration-200 lg:px-4"
                  key={section.id}
                  onClick={() => onSelectSection(section.id)}
                  style={{
                    // 활성 표시는 글자 뒤에서 미끄러지는 알약 하나다(/resume 의 알약
                    // 메뉴와 같은 동작). 구역색을 칸마다 깔면 여섯 칸이 색동이 된다.
                    color: isActive ? "#ffffff" : "#b4bac6"
                  }}
                  type="button"
                  // lg 미만에서는 글자를 접고 문장만 남으므로 이름을 툴팁으로
                  // 남긴다 — 문장만 있는 칸은 처음 보는 사람이 못 읽는다.
                  title={section.navLabel}
                  whileHover={{color: "#ffffff"}}
                  whileTap={{scale: 0.96}}
                >
                  {isActive ? (
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-white/[0.14]"
                      layoutId="nav-pill"
                      transition={{type: "spring", stiffness: 420, damping: 30}}
                    />
                  ) : null}
                  <span className="relative lg:hidden">
                    <Crest
                      name={tone.crest as CrestName}
                      size={16}
                      tone={isActive ? "#ffffff" : "#b4bac6"}
                    />
                  </span>
                  <span className="relative hidden lg:inline">
                    {section.navLabel}
                  </span>
                </motion.button>
              );
            })}
          </nav>
        </VillageFrame>
      </div>
    </motion.header>
  );
}
