"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useState} from "react";
import type {ReactNode} from "react";
import {experienceItems} from "@/data/experience";
import {portfolioLinks} from "@/data/links";
import {projects} from "@/data/projects";
import {skills} from "@/data/skills";
import {districtTone, sectionMeta} from "@/lib/constants";
import {fetchCodingTests, fetchCsNotes, fetchVillageState} from "@/lib/liveApi";
import type {CrestName} from "@/data/villageCrests";
import type {CodingTestLog, CsNote, VillageState} from "@/types/live";
import type {ProjectData, SectionId} from "@/types/portfolio";
import {Crest} from "./Crest";
import {ProjectCard} from "./ProjectCard";
import {ProjectDetail} from "./ProjectDetail";
import {VillageFrame} from "./VillageFrame";

interface InfoPanelProps {
  activeSection: SectionId;
  activeContentId?: string;
  isOpen: boolean;
  onClose: () => void;
  /** 프로젝트 카드의 "3D 전시실 들어가기". 마을에서만 넘어온다(이력서 모드엔 방이 없다). */
  onEnterProject?: (projectId: string) => void;
}

// 구역 색은 constants.ts 의 DISTRICT_TONE 하나가 정한다 — 예전엔 여기와
// Header, VillageHud 세 곳에 같은 표가 복사돼 있었다.

/** 패널 안 작은 이름표·칩·선의 색. 어두운 판 위에서 읽히는 옅은 인디고. */
const PANEL_ACCENT = "#aeaaf3";

const stagger = {
  hidden: {},
  visible: {transition: {staggerChildren: 0.07}}
};

const fadeUp = {
  hidden: {opacity: 0, y: 22, scale: 0.96},
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {type: "spring" as const, stiffness: 380, damping: 26}
  }
};

export function InfoPanel({
  activeSection,
  activeContentId,
  isOpen,
  onClose,
  onEnterProject
}: InfoPanelProps) {
  const section =
    sectionMeta.find(item => item.id === activeSection) ?? sectionMeta[0]!;
  const tone = districtTone(activeSection);
  // 2026-11-14: 패널 안의 강조는 구역색이 아니라 인디고 한 색이다. 구역마다 색이
  // 달라 패널이 열릴 때마다 다른 앱처럼 보였다. 구역 구분은 문장(crest)과 제목이 맡는다.
  const color = PANEL_ACCENT;

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside
          animate={{opacity: 1, x: 0, scale: 1}}
          // 화면 가장자리에 붙은 사각 판이 아니라, 마을에 걸린 **액자**다.
          // md 이상에서 상하좌우로 여백을 두고 떠 있게 하고, 스크롤은 액자
          // 안쪽(v-frame-body)이 맡는다 — 액자째 스크롤하면 금테가 같이 밀린다.
          // 휴대폰은 바닥에서 올라오는 시트(화면의 78%)다. 예전엔 흐름 안에서
          // 캔버스 **아래**에 붙었는데, 캔버스가 화면 전체가 되면서(2026-10-19)
          // 그 자리는 화면 밖이 됐다 — 건물을 눌러도 아무 일도 없는 것처럼 보인다.
          className="fixed inset-x-0 bottom-0 z-20 h-[78dvh] p-1.5 md:inset-x-auto md:bottom-3 md:right-3 md:top-[71px] md:h-auto md:w-[468px] md:p-0"
          exit={{opacity: 0, x: 60, scale: 0.97}}
          initial={{opacity: 0, x: 80, scale: 0.96}}
          style={{transformOrigin: "100% 50%"}}
          // 오른쪽에서 밀려 들어와 살짝 넘쳤다가 제자리에 앉는다
          transition={{type: "spring", stiffness: 300, damping: 26}}
        >
          <VillageFrame
            // md:h-full 이 없으면 내용이 짧을 때 안쪽 판이 줄어들어 액자
            // 바닥에 금색 띠가 그대로 드러난다(실제로 그랬다).
            bodyClassName="h-full overflow-y-auto p-4 md:p-6"
            className="h-full"
            variant="grand"
          >
            <motion.div
              animate={{opacity: 1, y: 0}}
              initial={{opacity: 0, y: -14}}
              // 구역이 바뀌면 머리글도 다시 내려앉는다(key) — 패널이 열린 채 메뉴로
              // 다른 구역을 누르면 "넘어갔다"가 보여야 한다.
              key={`head-${activeSection}`}
              transition={{type: "spring", stiffness: 360, damping: 28}}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid h-[50px] w-[50px] shrink-0 place-items-center rounded-[18px] bg-[#aeaaf3]/[0.16]">
                    <Crest name={tone.crest as CrestName} size={26} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-extrabold" style={{color}}>
                      {section.label}
                    </p>
                    <h2 className="v-serif mt-0.5 text-[30px] leading-tight text-white">
                      {section.title}
                    </h2>
                  </div>
                </div>
                <motion.button
                  className="flex h-11 shrink-0 items-center rounded-full bg-white/10 px-5 text-[15px] font-extrabold text-white hover:bg-white/[0.16]"
                  onClick={onClose}
                  type="button"
                  whileHover={{scale: 1.04}}
                  whileTap={{scale: 0.96}}
                >
                  닫기
                </motion.button>
              </div>
              <p className="mt-3.5 text-sm leading-6 text-[#b4bac6]">
                {section.description}
              </p>
              <div className="v-rule my-5" role="separator" />
            </motion.div>

            <motion.div
              animate="visible"
              initial="hidden"
              // key 가 바뀌면 카드들이 처음부터 다시 한 장씩 올라온다
              key={`body-${activeSection}`}
              variants={stagger}
            >
              {activeSection === "intro" && <IntroPanel color={color} />}
              {activeSection === "projects" && (
                <ProjectsPanel
                  color={color}
                  initialProjectId={activeContentId}
                  onEnterProject={onEnterProject}
                />
              )}
              {activeSection === "github" && (
                <SkillsPanel color={color} initialGroup={activeContentId} />
              )}
              {activeSection === "study" && (
                <StudyPanel color={color} initialTab={activeContentId} />
              )}
              {activeSection === "experience" && (
                <ExperiencePanel
                  color={color}
                  highlightTitle={activeContentId}
                />
              )}
              {activeSection === "life" && (
                <LifePanel color={color} highlightId={activeContentId} />
              )}
              {activeSection === "contact" && <ContactPanel color={color} />}
            </motion.div>
          </VillageFrame>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

function Card({
  children,
  color,
  className = ""
}: {
  children: ReactNode;
  color: string;
  className?: string;
}) {
  return (
    <motion.div
      // 카드 바탕은 액자 안쪽보다 **더 어둡게** 판다. 액자가 이미 밝은 금테라
      // 카드까지 밝으면 층이 안 생겨 글자가 떠 보인다.
      className={`rounded-[26px] bg-white/[0.06] p-5 ${className}`}
      data-accent={color}
      variants={fadeUp}
      whileHover={{y: -3, backgroundColor: "rgba(255,255,255,0.09)"}}
      transition={{type: "spring", stiffness: 400, damping: 26}}
    >
      {children}
    </motion.div>
  );
}

/** 컨셉의 2×2 특징 카드 — 문장 + 한 줄 설명 */
const INTRO_FEATURES: {crest: CrestName; label: string; hint: string}[] = [
  {crest: "tower", label: "3D Interactive", hint: "걸어 다니는 마을"},
  {crest: "npc", label: "AI NPC", hint: "질문에 답하는 주민"},
  {crest: "horn", label: "Live Data", hint: "오늘의 활동 반영"},
  {crest: "gear", label: "Fullstack", hint: "프론트 + 백엔드"}
];

function IntroPanel({color}: {color: string}) {
  return (
    <div className="grid gap-4">
      <Card color={color}>
        <h3 className="v-serif text-lg text-[#f5f6f8]">
          정재훈의 Developer&apos;s City
        </h3>
        <p className="mt-3 text-sm leading-7 text-[#b4bac6]">
          프로젝트, 기술, 경험, 연락처를 3D 마을 하나에 담았습니다. 건물에
          들어가면 내용이 열리고, NPC에게 물으면 포트폴리오를 설명해 줍니다.
        </p>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        {INTRO_FEATURES.map(item => (
          <motion.span
            className="flex flex-col gap-1.5 rounded-2xl border border-[#c3c0f7]/14 bg-white/[0.06] px-3.5 py-3.5"
            key={item.label}
            variants={fadeUp}
            whileHover={{borderColor: `${color}55`, y: -2}}
            transition={{duration: 0.15}}
          >
            <Crest name={item.crest} size={20} />
            <span className="text-[13px] font-black text-[#f5f6f8]">
              {item.label}
            </span>
            <span className="text-[12px] font-semibold text-[#b4bac6]/65">
              {item.hint}
            </span>
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function ProjectsPanel({
  color,
  initialProjectId,
  onEnterProject
}: {
  color: string;
  initialProjectId?: string;
  onEnterProject?: (projectId: string) => void;
}) {
  const initial = initialProjectId
    ? projects.find(project => project.id === initialProjectId) ?? null
    : null;
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    initial
  );

  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  return (
    <div className="grid gap-4">
      <Card color={color}>
        <h3 className="font-black text-[#f5f6f8]">대표 프로젝트</h3>
        <p className="mt-2 text-sm leading-6 text-[#b4bac6]">
          {onEnterProject
            ? '카드의 "3D 전시실 들어가기"를 누르면 그 프로젝트 건물 안으로 바로 들어갑니다. 글로 먼저 보려면 "자세히 보기".'
            : "목록에서 프로젝트를 열면 설명이, 마을에서 건물에 들어가면 3D 전시가 나옵니다."}
        </p>
      </Card>
      {projects.map(project => (
        <motion.div key={project.id} variants={fadeUp}>
          <ProjectCard
            color={color}
            onEnter3d={onEnterProject ? p => onEnterProject(p.id) : undefined}
            onOpen={setSelectedProject}
            project={project}
          />
        </motion.div>
      ))}
    </div>
  );
}

function SkillsPanel({
  color,
  initialGroup
}: {
  color: string;
  initialGroup?: string;
}) {
  const [openGroup, setOpenGroup] = useState<string | null>(
    initialGroup ?? null
  );
  const groups = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
    acc[skill.group] = acc[skill.group]
      ? acc[skill.group].concat(skill)
      : [skill];
    return acc;
  }, {});

  return (
    <div className="grid gap-4">
      <Card color={color}>
        <h3 className="font-black text-[#f5f6f8]">기술 스택과 구현 경험</h3>
        <p className="mt-2 text-sm leading-6 text-[#b4bac6]">
          프론트엔드, 백엔드, 3D, 게임/XR, 워크플로 경험을 기술 그룹별로
          정리했습니다.
        </p>
        <motion.a
          className="mt-4 inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-black transition"
          href="https://github.com/toadsam"
          rel="noreferrer"
          style={{borderColor: `${color}50`, background: `${color}18`, color}}
          target="_blank"
          whileHover={{
            background: `${color}30`,
            boxShadow: `0 0 14px ${color}30`
          }}
          whileTap={{scale: 0.97}}
        >
          GitHub 열기
        </motion.a>
      </Card>

      {Object.entries(groups).map(([group, groupSkills]) => {
        const isOpen = openGroup === group;
        return (
          <motion.section
            className="overflow-hidden rounded-2xl border bg-white/[0.06]"
            key={group}
            style={{
              borderColor: isOpen ? `${color}40` : "rgba(255,255,255,0.06)"
            }}
            variants={fadeUp}
          >
            <motion.button
              className="flex w-full items-center justify-between px-5 py-4 text-left"
              onClick={() => setOpenGroup(isOpen ? null : group)}
              type="button"
              whileHover={{background: `${color}08`}}
            >
              <span className="font-black text-[#f5f6f8]">{group}</span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-[#b4bac6]/50">
                  {groupSkills.length}개
                </span>
                <motion.span
                  animate={{rotate: isOpen ? 180 : 0}}
                  className="text-xs"
                  style={{color}}
                  transition={{duration: 0.25}}
                >
                  v
                </motion.span>
              </span>
            </motion.button>
            <AnimatePresence>
              {isOpen ? (
                <motion.div
                  animate={{height: "auto", opacity: 1}}
                  className="overflow-hidden px-5 pb-5"
                  exit={{height: 0, opacity: 0}}
                  initial={{height: 0, opacity: 0}}
                  transition={{duration: 0.3, ease: [0.22, 1, 0.36, 1]}}
                >
                  <div className="mb-3 flex flex-wrap gap-2">
                    {groupSkills.map(skill => (
                      <span
                        className="rounded-full border px-3 py-1 text-xs font-black"
                        key={skill.name}
                        style={{
                          borderColor: `${color}40`,
                          color,
                          background: `${color}12`
                        }}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                  <div className="grid gap-2">
                    {groupSkills.map(skill => (
                      <p
                        className="rounded-2xl border border-[#c3c0f7]/6 bg-white/[0.04] p-3 text-sm leading-6 text-[#b4bac6]"
                        key={skill.name + "-desc"}
                      >
                        <strong style={{color}}>{skill.name}</strong>
                        <span className="text-[#b4bac6]/50"> / </span>
                        {skill.description}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.section>
        );
      })}
    </div>
  );
}

function ExperiencePanel({
  color,
  highlightTitle
}: {
  color: string;
  highlightTitle?: string;
}) {
  return (
    <div className="grid gap-3">
      {experienceItems.map((item, index) => {
        const isHighlighted = highlightTitle === item.title;
        return (
          <motion.article
            className="rounded-2xl border bg-white/[0.06] p-5 transition"
            key={item.title}
            style={{
              borderColor: isHighlighted
                ? `${color}50`
                : "rgba(255,255,255,0.06)",
              boxShadow: isHighlighted ? `0 0 18px ${color}15` : "none"
            }}
            variants={fadeUp}
            whileHover={{
              borderColor: `${color}40`,
              boxShadow: `0 0 18px ${color}10`,
              x: 2
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black"
                style={{background: `${color}18`, color}}
              >
                {index + 1}
              </span>
              <p className="text-xs font-black" style={{color}}>
                {item.year}
              </p>
            </div>
            <h3 className="mt-3 font-black text-[#f5f6f8]">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#b4bac6]">
              {item.description}
            </p>
          </motion.article>
        );
      })}
    </div>
  );
}

function LifeCard({
  color,
  highlighted,
  title,
  children
}: {
  color: string;
  highlighted: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.article
      className="rounded-2xl border bg-white/[0.06] p-5 transition"
      style={{
        borderColor: highlighted ? `${color}55` : "rgba(255,255,255,0.06)",
        boxShadow: highlighted ? `0 0 18px ${color}18` : "none"
      }}
      variants={fadeUp}
    >
      <h3 className="font-black text-[#f5f6f8]">{title}</h3>
      <div className="mt-2 text-sm leading-6 text-[#b4bac6]">{children}</div>
    </motion.article>
  );
}

function LifePlaceholder() {
  return <p>아직 내용을 채우지 못한 카드입니다. 곧 채웁니다.</p>;
}

function LifePanel({
  color,
  highlightId
}: {
  color: string;
  highlightId?: string;
}) {
  const [villageState, setVillageState] = useState<VillageState | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetchVillageState()
      .then(state => {
        if (!ignore) setVillageState(state);
      })
      .catch(() => {
        if (!ignore) setError(true);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const activity = villageState?.activity;

  return (
    <div className="grid gap-4">
      <Card color={color}>
        <h3 className="font-black text-[#f5f6f8]">인생·일상</h3>
        <p className="mt-2 text-sm leading-6 text-[#b4bac6]">
          프로젝트 밖의 일상을 모아둔 구역입니다. 운동·학습 카드는 관리자 기록과
          실시간으로 연결되어 있고, 나머지 카드는 아직 내용을 채우는 중입니다.
        </p>
      </Card>

      <LifeCard
        color={color}
        highlighted={highlightId === "gym"}
        title="🏋️ 헬스장 · 오늘의 운동"
      >
        {error ? (
          <p>기록 서버에 연결하지 못했습니다.</p>
        ) : !activity ? (
          <p>불러오는 중...</p>
        ) : activity.workout_done ? (
          <p>
            오늘 {activity.workout_type || "운동"} {activity.workout_minutes}
            분을 기록했어요. 관리자 페이지에 기록한 내용이 그대로 반영됩니다.
          </p>
        ) : (
          <p>
            오늘은 아직 운동 기록이 없어요. 기록하면 이 카드와 마을 조명에 바로
            반영됩니다.
          </p>
        )}
      </LifeCard>

      <LifeCard
        color={color}
        highlighted={highlightId === "library"}
        title="📚 도서관 · 오늘의 학습"
      >
        {error ? (
          <p>기록 서버에 연결하지 못했습니다.</p>
        ) : !activity ? (
          <p>불러오는 중...</p>
        ) : activity.study_minutes > 0 ? (
          <p>
            오늘 공부 {activity.study_minutes}분
            {activity.study_topics?.length
              ? ` · ${activity.study_topics.join(", ")}`
              : ""}
            이 기록됐어요.
          </p>
        ) : (
          <p>오늘은 아직 학습 기록이 없어요.</p>
        )}
      </LifeCard>

      <LifeCard
        color={color}
        highlighted={highlightId === "values"}
        title="🪨 가치관 비석"
      >
        <LifePlaceholder />
      </LifeCard>

      <LifeCard
        color={color}
        highlighted={highlightId === "invest"}
        title="📈 투자 타워"
      >
        <p>
          금액은 비공개로 유지할 예정이고, 투자 원칙만 짧게 정리할 계획이에요.
        </p>
        <LifePlaceholder />
      </LifeCard>

      <LifeCard
        color={color}
        highlighted={highlightId === "music"}
        title="🎵 음악 스튜디오"
      >
        <p>
          플레이리스트와 사운드 작업을 모아두는 공간입니다. 취향 소개는 준비
          중이에요.
        </p>
      </LifeCard>

      <LifeCard
        color={color}
        highlighted={highlightId === "timeline"}
        title="🕰️ 연혁 타임라인"
      >
        <LifePlaceholder />
      </LifeCard>
    </div>
  );
}

function StudyPanel({color, initialTab}: {color: string; initialTab?: string}) {
  const [tab, setTab] = useState<"codingtest" | "cs">(
    initialTab === "cs" ? "cs" : "codingtest"
  );
  const [codingTests, setCodingTests] = useState<CodingTestLog[] | null>(null);
  const [csNotes, setCsNotes] = useState<CsNote[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let ignore = false;
    setError(false);
    Promise.all([fetchCodingTests(), fetchCsNotes()])
      .then(([tests, notes]) => {
        if (ignore) return;
        setCodingTests(tests);
        setCsNotes(notes);
      })
      .catch(() => {
        if (!ignore) setError(true);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const loading = !error && codingTests === null && csNotes === null;

  return (
    <div className="grid gap-4">
      <Card color={color}>
        <h3 className="font-black text-[#f5f6f8]">학습 기록</h3>
        <p className="mt-2 text-sm leading-6 text-[#b4bac6]">
          매일 푼 코딩테스트 풀이와 공부한 CS 전공지식을 기록합니다. 알고리즘
          도장의 알고, 지식 서고의 노바에게 물어보면 이 기록을 바탕으로
          답해줍니다.
        </p>
        <div className="mt-4 flex gap-2">
          {(
            [
              {
                id: "codingtest",
                label: `코딩테스트${
                  codingTests ? ` ${codingTests.length}` : ""
                }`
              },
              {
                id: "cs",
                label: `CS 전공지식${csNotes ? ` ${csNotes.length}` : ""}`
              }
            ] as const
          ).map(item => {
            const active = tab === item.id;
            return (
              <button
                className="rounded-2xl border px-3 py-2 text-xs font-black transition"
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  setOpenId(null);
                }}
                style={{
                  borderColor: active ? `${color}55` : "rgba(255,255,255,0.08)",
                  background: active ? `${color}18` : "transparent",
                  color: active ? color : "rgba(255,255,255,0.45)"
                }}
                type="button"
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </Card>

      {error ? (
        <Card color={color}>
          <p className="text-sm leading-6 text-[#b4bac6]">
            학습 기록 서버(FastAPI)에 연결하지 못했습니다. 백엔드를 실행한 뒤
            다시 시도해 주세요.
          </p>
        </Card>
      ) : loading ? (
        <Card color={color}>
          <p className="text-sm text-[#b4bac6]/65">기록을 불러오는 중...</p>
        </Card>
      ) : tab === "codingtest" ? (
        (codingTests ?? []).length === 0 ? (
          <EmptyStudy
            color={color}
            text="아직 기록된 코딩테스트 풀이가 없습니다. /admin에서 푼 문제를 기록하면 여기에 표시됩니다."
          />
        ) : (
          (codingTests ?? []).map(test => {
            const key = `ct-${test.id}`;
            const isOpen = openId === key;
            return (
              <motion.article
                className="overflow-hidden rounded-2xl border bg-white/[0.06]"
                key={key}
                style={{
                  borderColor: isOpen ? `${color}40` : "rgba(255,255,255,0.06)"
                }}
                variants={fadeUp}
              >
                <button
                  className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left"
                  onClick={() => setOpenId(isOpen ? null : key)}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block font-black text-[#f5f6f8]">
                      {test.title}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[12.5px] text-[#b4bac6]/65">
                      {[
                        test.platform,
                        test.difficulty,
                        test.language,
                        test.solved_date
                      ]
                        .filter(Boolean)
                        .map(meta => (
                          <span
                            className="rounded border border-[#c3c0f7]/10 px-1.5 py-0.5"
                            key={meta}
                          >
                            {meta}
                          </span>
                        ))}
                    </span>
                  </span>
                  <span className="text-xs" style={{color}}>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen ? (
                    <motion.div
                      animate={{height: "auto", opacity: 1}}
                      className="overflow-hidden px-5 pb-5"
                      exit={{height: 0, opacity: 0}}
                      initial={{height: 0, opacity: 0}}
                      transition={{duration: 0.25}}
                    >
                      {test.approach ? (
                        <div className="mb-3">
                          <p className="text-[12px] font-black" style={{color}}>
                            풀이 방법
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#b4bac6]">
                            {test.approach}
                          </p>
                        </div>
                      ) : null}
                      {test.code ? (
                        <pre className="max-h-72 overflow-auto rounded-2xl border border-[#c3c0f7]/8 bg-white/[0.04] p-3 text-xs leading-5 text-[#c9d6e8]">
                          {test.code}
                        </pre>
                      ) : null}
                      {test.url ? (
                        <a
                          className="mt-3 inline-block text-xs font-bold"
                          href={test.url}
                          rel="noreferrer"
                          style={{color}}
                          target="_blank"
                        >
                          문제 링크 열기 →
                        </a>
                      ) : null}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.article>
            );
          })
        )
      ) : (csNotes ?? []).length === 0 ? (
        <EmptyStudy
          color={color}
          text="아직 기록된 CS 전공지식 노트가 없습니다. /admin에서 공부한 내용을 기록하면 여기에 표시됩니다."
        />
      ) : (
        (csNotes ?? []).map(note => {
          const key = `cs-${note.id}`;
          const isOpen = openId === key;
          return (
            <motion.article
              className="overflow-hidden rounded-2xl border bg-white/[0.06]"
              key={key}
              style={{
                borderColor: isOpen ? `${color}40` : "rgba(255,255,255,0.06)"
              }}
              variants={fadeUp}
            >
              <button
                className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left"
                onClick={() => setOpenId(isOpen ? null : key)}
                type="button"
              >
                <span className="min-w-0">
                  <span className="block font-black text-[#f5f6f8]">
                    {note.title}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[12.5px] text-[#b4bac6]/65">
                    {[note.category, note.study_date]
                      .filter(Boolean)
                      .map(meta => (
                        <span
                          className="rounded border border-[#c3c0f7]/10 px-1.5 py-0.5"
                          key={meta}
                        >
                          {meta}
                        </span>
                      ))}
                  </span>
                </span>
                <span className="text-xs" style={{color}}>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              <AnimatePresence>
                {isOpen ? (
                  <motion.div
                    animate={{height: "auto", opacity: 1}}
                    className="overflow-hidden px-5 pb-5"
                    exit={{height: 0, opacity: 0}}
                    initial={{height: 0, opacity: 0}}
                    transition={{duration: 0.25}}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-6 text-[#b4bac6]">
                      {note.content}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.article>
          );
        })
      )}
    </div>
  );
}

function EmptyStudy({color, text}: {color: string; text: string}) {
  return (
    <Card color={color}>
      <p className="text-sm leading-6 text-[#b4bac6]">{text}</p>
    </Card>
  );
}

function ContactPanel({color}: {color: string}) {
  return (
    <div className="grid gap-4">
      <Card color={color}>
        <p className="text-sm leading-7 text-[#b4bac6]">
          협업, 인터뷰, 프로젝트 제안은 아래 링크로 연락 주세요.
        </p>
      </Card>
      <div className="grid gap-2">
        {portfolioLinks.map(link => {
          // 2026-11-14: 링크마다 사이안·초록·주황을 따로 쓰고 왼쪽에 색 띠를 달았었다.
          // 패널 강조가 인디고 한 색이 되면서 여기도 같은 색으로 맞췄다.
          return (
            <motion.a
              className="flex min-h-[56px] items-center justify-between gap-4 rounded-[22px] bg-white/[0.06] px-5 py-3 text-[15px] font-bold text-white"
              href={link.href}
              key={link.label}
              rel="noreferrer"
              target={link.href.startsWith("mailto:") ? undefined : "_blank"}
              variants={fadeUp}
              whileHover={{x: 4, backgroundColor: "rgba(255,255,255,0.1)"}}
              whileTap={{scale: 0.97}}
            >
              <span className="font-black text-white">{link.label}</span>
              <span
                className="truncate text-[13.5px] font-extrabold"
                style={{color}}
              >
                {link.value} →
              </span>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
