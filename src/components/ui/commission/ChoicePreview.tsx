"use client";

/**
 * 선택지 예시 카드 — "이런 거 말씀이세요?"
 *
 * 전부 CSS 로 그린 미니 목업이다. 이미지도 GLB 도 없다. 손님은 이걸 보고
 * "아, 이 정도구나" 를 느끼면 되므로 정확할 필요는 없고 **서로 달라 보이면** 된다.
 * Q6(움직임)은 카드 자체가 그 정도로 움직인다 — 말로 설명하는 것보다 낫다.
 */

import type {PreviewKind} from "@/data/atelierIntakeScript";

const INK = "#1f2a3a";

function Frame({
  children,
  bg = "#f7f3ea",
  className = ""
}: {
  children: React.ReactNode;
  bg?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative h-[74px] w-full overflow-hidden rounded-md border border-black/15 ${className}`}
      style={{background: bg}}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

function Bar({
  w,
  h = 4,
  color = INK,
  opacity = 0.55,
  className = "",
  style
}: {
  w: number | string;
  h?: number;
  color?: string;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-sm ${className}`}
      style={{width: w, height: h, background: color, opacity, ...style}}
    />
  );
}

function Header({accent = INK}: {accent?: string}) {
  return (
    <div className="flex items-center justify-between px-2 pt-1.5">
      <Bar w={18} h={4} color={accent} opacity={0.9} />
      <div className="flex gap-1">
        <Bar w={8} opacity={0.35} />
        <Bar w={8} opacity={0.35} />
        <Bar w={8} opacity={0.35} />
      </div>
    </div>
  );
}

function Hero({
  accent = "#c9a45c",
  lines = 2
}: {
  accent?: string;
  lines?: number;
}) {
  return (
    <div className="mt-1.5 px-2">
      <Bar w="58%" h={6} color={INK} opacity={0.8} />
      {Array.from({length: lines - 1}).map((_, i) => (
        <Bar key={i} w="42%" h={3} opacity={0.4} className="mt-1" />
      ))}
      <Bar w={26} h={7} color={accent} opacity={1} className="mt-1.5" />
    </div>
  );
}

function Grid({
  n = 3,
  color = INK,
  tall = false
}: {
  n?: number;
  color?: string;
  tall?: boolean;
}) {
  return (
    <div className="mt-1.5 flex gap-1 px-2">
      {Array.from({length: n}).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: tall ? 26 : 16,
            background: color,
            opacity: 0.22 + i * 0.08
          }}
        />
      ))}
    </div>
  );
}

function Phone({children}: {children: React.ReactNode}) {
  return (
    <div className="mx-auto mt-1 h-[64px] w-[34px] rounded-[6px] border-2 border-black/50 bg-white p-[3px]">
      {children}
    </div>
  );
}

function Monitor({children}: {children: React.ReactNode}) {
  return (
    <div className="mx-auto mt-2 w-[72px]">
      <div className="h-[44px] rounded-[4px] border-2 border-black/50 bg-white p-[3px]">
        {children}
      </div>
      <div className="mx-auto h-[5px] w-[14px] bg-black/40" />
      <div className="mx-auto h-[2px] w-[28px] rounded-full bg-black/40" />
    </div>
  );
}

function Calendar({accent = "#5f7be8"}: {accent?: string}) {
  return (
    <div className="mt-1.5 grid grid-cols-7 gap-[2px] px-3">
      {Array.from({length: 14}).map((_, i) => (
        <div
          key={i}
          className="h-[7px] rounded-[2px]"
          style={{
            background: i === 9 ? accent : INK,
            opacity: i === 9 ? 1 : 0.18
          }}
        />
      ))}
    </div>
  );
}

export function ChoicePreview({kind}: {kind: PreviewKind}) {
  switch (kind) {
    /* ── 사이트 종류 ── */
    case "site-corp":
      return (
        <Frame>
          <Header accent="#2c4a7a" />
          <Hero accent="#2c4a7a" />
          <Grid />
        </Frame>
      );
    case "site-landing":
      return (
        <Frame bg="#fff4e3">
          <Header accent="#ff9d38" />
          <div className="mt-2 px-2 text-center">
            <Bar w="70%" h={8} color={INK} opacity={0.85} className="mx-auto" />
            <Bar w="50%" h={3} opacity={0.4} className="mx-auto mt-1" />
            <Bar
              w={34}
              h={9}
              color="#ff9d38"
              opacity={1}
              className="mx-auto mt-2"
            />
          </div>
        </Frame>
      );
    case "site-booking":
      return (
        <Frame bg="#eef3fb">
          <Header accent="#5f7be8" />
          <Bar w="40%" h={5} opacity={0.7} className="ml-2 mt-1.5" />
          <Calendar />
        </Frame>
      );
    case "site-shop":
      return (
        <Frame>
          <Header accent="#c0392b" />
          <Grid n={4} color="#c0392b" tall />
          <div className="mt-1 flex justify-end px-2">
            <Bar w={22} h={6} color="#c0392b" opacity={1} />
          </div>
        </Frame>
      );
    case "site-portfolio":
      return (
        <Frame bg="#151515">
          <Header accent="#f5d26b" />
          <div className="mt-1.5 grid grid-cols-3 gap-1 px-2">
            {[
              "#c69af0",
              "#68c7cf",
              "#7ecf68",
              "#ff9d38",
              "#f5d26b",
              "#5f7be8"
            ].map(c => (
              <div
                key={c}
                className="h-[16px] rounded-sm"
                style={{background: c, opacity: 0.85}}
              />
            ))}
          </div>
        </Frame>
      );
    case "site-app":
      return (
        <Frame bg="#f2f4f8">
          <div className="flex h-full">
            <div className="w-[18px] border-r border-black/10 bg-black/5 pt-2">
              {[0, 1, 2, 3].map(i => (
                <Bar
                  key={i}
                  w={10}
                  h={3}
                  opacity={i === 0 ? 0.9 : 0.3}
                  className="mx-auto mb-1.5"
                />
              ))}
            </div>
            <div className="flex-1 p-1.5">
              <div className="flex items-center justify-between">
                <Bar w={26} h={4} opacity={0.7} />
                <div className="h-[8px] w-[8px] rounded-full bg-[#5f7be8]" />
              </div>
              <Grid n={3} color="#5f7be8" />
              <Bar w="90%" h={10} opacity={0.12} className="mt-1.5" />
            </div>
          </div>
        </Frame>
      );

    /* ── 페이지 규모 ── */
    case "pages-1":
      return (
        <Frame>
          <div className="mx-auto mt-2 h-[60px] w-[44px] rounded-sm border border-black/30 bg-white p-1">
            <Bar w="80%" h={4} opacity={0.8} />
            <Bar w="60%" h={2} opacity={0.4} className="mt-1" />
            <Bar w="90%" h={10} opacity={0.12} className="mt-1.5" />
            <Bar w="90%" h={10} opacity={0.12} className="mt-1" />
          </div>
        </Frame>
      );
    case "pages-5":
    case "pages-10":
    case "pages-many": {
      const n = kind === "pages-5" ? 5 : kind === "pages-10" ? 10 : 16;
      return (
        <Frame>
          <div className="flex flex-col items-center pt-2">
            <div className="h-[12px] w-[20px] rounded-sm bg-[#2c4a7a]" />
            <div className="my-[3px] h-[5px] w-px bg-black/40" />
            <div className="flex max-w-[150px] flex-wrap justify-center gap-[3px]">
              {Array.from({length: n}).map((_, i) => (
                <div
                  key={i}
                  className="h-[9px] w-[12px] rounded-[2px] border border-black/30 bg-white"
                />
              ))}
            </div>
          </div>
        </Frame>
      );
    }

    /* ── 목적 ── */
    case "goal-contact":
      return (
        <Frame>
          <Header />
          <Hero accent="#ff9d38" lines={1} />
          <div className="absolute bottom-1.5 right-2 rounded-full bg-[#ff9d38] px-2 py-[2px] text-[7px] font-black text-white">
            ☎ 문의
          </div>
        </Frame>
      );
    case "goal-search":
      return (
        <Frame bg="#ffffff">
          <div className="mx-2 mt-2 flex items-center gap-1 rounded-full border border-black/25 px-2 py-[3px]">
            <div className="h-[6px] w-[6px] rounded-full border border-black/50" />
            <Bar w={40} h={3} opacity={0.5} />
          </div>
          <div className="mt-2 px-3">
            <Bar w="70%" h={4} color="#1a0dab" opacity={0.9} />
            <Bar w="85%" h={2} opacity={0.35} className="mt-1" />
            <Bar w="60%" h={2} opacity={0.35} className="mt-[3px]" />
          </div>
        </Frame>
      );
    case "goal-trust":
      return (
        <Frame bg="#fbfaf6">
          <Header accent="#1f2a3a" />
          <div className="mt-2 flex items-center gap-2 px-3">
            <div className="h-[22px] w-[22px] rounded-full bg-black/15" />
            <div>
              <Bar w={44} h={5} opacity={0.85} />
              <Bar w={30} h={2} opacity={0.4} className="mt-1" />
            </div>
          </div>
          <Bar w="80%" h={2} opacity={0.3} className="ml-3 mt-2" />
        </Frame>
      );
    case "goal-action":
      return (
        <Frame bg="#fff8ef">
          <Header accent="#ff9d38" />
          <div className="mt-2 px-2 text-center">
            <Bar w="55%" h={5} opacity={0.7} className="mx-auto" />
            <div className="mx-auto mt-2 w-[52px] rounded-md bg-[#ff9d38] py-[4px] text-[7px] font-black text-white shadow">
              지금 예약하기
            </div>
          </div>
        </Frame>
      );

    /* ── 기능 ── */
    case "feat-form":
      return (
        <Frame>
          <div className="px-3 pt-2">
            {[0, 1].map(i => (
              <div
                key={i}
                className="mb-1 h-[9px] w-full rounded-sm border border-black/25 bg-white"
              />
            ))}
            <div className="h-[14px] w-full rounded-sm border border-black/25 bg-white" />
            <Bar
              w={22}
              h={6}
              color="#2c4a7a"
              opacity={1}
              className="mt-1 ml-auto"
            />
          </div>
        </Frame>
      );
    case "feat-map":
      return (
        <Frame bg="#e8efe3">
          <div className="absolute left-0 top-[28px] h-[6px] w-full bg-white/80" />
          <div className="absolute left-[40%] top-0 h-full w-[6px] bg-white/80" />
          <div className="absolute left-[52%] top-[14px] text-[16px] leading-none">
            📍
          </div>
        </Frame>
      );
    case "feat-booking":
      return (
        <Frame bg="#eef3fb">
          <Bar w="40%" h={4} opacity={0.7} className="ml-2 mt-2" />
          <Calendar />
          <div className="mt-1.5 flex gap-1 px-3">
            {["10:00", "11:00", "14:00"].map((t, i) => (
              <div
                key={t}
                className="rounded-sm px-1 text-[6px]"
                style={{
                  background: i === 1 ? "#5f7be8" : "#fff",
                  color: i === 1 ? "#fff" : INK,
                  border: "1px solid rgba(0,0,0,.2)"
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </Frame>
      );
    case "feat-board":
      return (
        <Frame>
          <div className="px-2 pt-2">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="mb-[3px] flex items-center gap-1.5">
                <Bar w={6} h={3} opacity={0.3} />
                <Bar w={`${70 - i * 10}%`} h={3} opacity={0.7} />
              </div>
            ))}
          </div>
        </Frame>
      );
    case "feat-login":
      return (
        <Frame bg="#f2f4f8">
          <div className="mx-auto mt-2 w-[64px] rounded-md bg-white p-1.5 shadow-sm">
            <Bar w="60%" h={4} opacity={0.8} />
            <div className="mt-1 h-[7px] w-full rounded-sm border border-black/25" />
            <div className="mt-1 h-[7px] w-full rounded-sm border border-black/25" />
            <Bar w="100%" h={7} color="#2c4a7a" opacity={1} className="mt-1" />
          </div>
        </Frame>
      );
    case "feat-pay":
      return (
        <Frame bg="#fff">
          <div className="mx-auto mt-2 w-[80px]">
            <div className="flex justify-between">
              <Bar w={30} h={3} opacity={0.6} />
              <Bar w={20} h={3} opacity={0.9} />
            </div>
            <div className="mt-1 flex justify-between">
              <Bar w={24} h={3} opacity={0.4} />
              <Bar w={16} h={3} opacity={0.6} />
            </div>
            <div className="mt-2 rounded-md bg-[#1f2a3a] py-[4px] text-center text-[7px] font-black text-[#f5d26b]">
              💳 결제하기
            </div>
          </div>
        </Frame>
      );
    case "feat-admin":
      return (
        <Frame bg="#f2f4f8">
          <div className="px-2 pt-2">
            <div className="flex gap-1">
              <Bar w={20} h={5} color="#7ecf68" opacity={1} />
              <Bar w={20} h={5} opacity={0.3} />
            </div>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="mt-1 flex gap-1 rounded-sm bg-white p-[3px]"
              >
                <Bar w={40} h={3} opacity={0.7} />
                <Bar
                  w={14}
                  h={3}
                  color="#7ecf68"
                  opacity={0.9}
                  className="ml-auto"
                />
                <Bar w={14} h={3} color="#c0392b" opacity={0.8} />
              </div>
            ))}
          </div>
        </Frame>
      );
    case "feat-i18n":
      return (
        <Frame>
          <div className="flex h-full items-center justify-center gap-2 text-[11px] font-black">
            <span className="rounded bg-[#1f2a3a] px-1.5 py-[2px] text-white">
              KR
            </span>
            <span className="text-black/40">⇄</span>
            <span className="rounded border border-black/30 px-1.5 py-[2px] text-black/70">
              EN
            </span>
            <span className="rounded border border-black/30 px-1.5 py-[2px] text-black/70">
              JP
            </span>
          </div>
        </Frame>
      );
    case "feat-chat":
      return (
        <Frame>
          <div className="px-2 pt-2">
            <div className="w-[60%] rounded-lg rounded-bl-sm bg-white px-1.5 py-1 shadow-sm">
              <Bar w="90%" h={3} opacity={0.6} />
            </div>
            <div className="ml-auto mt-1 w-[50%] rounded-lg rounded-br-sm bg-[#ff9d38] px-1.5 py-1">
              <Bar w="80%" h={3} color="#fff" opacity={0.9} />
            </div>
            <div className="mt-1 w-[40%] rounded-lg rounded-bl-sm bg-white px-1.5 py-1 shadow-sm">
              <Bar w="70%" h={3} opacity={0.6} />
            </div>
          </div>
        </Frame>
      );
    case "feat-ai":
      return (
        <Frame bg="#f4f0fb">
          <div className="flex h-full items-center gap-2 px-3">
            <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#c69af0] text-[13px]">
              ✦
            </div>
            <div className="flex-1">
              <Bar w="90%" h={3} opacity={0.6} />
              <Bar w="70%" h={3} opacity={0.4} className="mt-1" />
              <div className="mt-1.5 flex gap-1">
                <Bar w={18} h={5} color="#c69af0" opacity={0.9} />
                <Bar w={18} h={5} color="#c69af0" opacity={0.6} />
              </div>
            </div>
          </div>
        </Frame>
      );

    /* ── 분위기 ── */
    case "tone-minimal":
      return (
        <Frame bg="#ffffff">
          <Header accent="#1b2f55" />
          <div className="mt-3 px-3">
            <Bar w="50%" h={6} color="#1b2f55" opacity={0.95} />
            <Bar
              w="35%"
              h={2}
              color="#1b2f55"
              opacity={0.35}
              className="mt-1.5"
            />
          </div>
        </Frame>
      );
    case "tone-warm":
      return (
        <Frame bg="#fbf1df">
          <Header accent="#e07a2f" />
          <div className="mt-2 flex items-center gap-2 px-3">
            <div className="h-[22px] w-[22px] rounded-full bg-[#f2b77d]" />
            <div>
              <Bar
                w={40}
                h={5}
                color="#6b3d1e"
                opacity={0.85}
                className="rounded-full"
              />
              <Bar
                w={28}
                h={7}
                color="#e07a2f"
                opacity={1}
                className="mt-1 rounded-full"
              />
            </div>
          </div>
        </Frame>
      );
    case "tone-luxury":
      return (
        <Frame bg="#0f0f12">
          <Header accent="#c9a45c" />
          <div className="mt-3 text-center">
            <div
              className="mx-auto h-[5px] w-[40%] bg-[#e8dcc0]"
              style={{opacity: 0.9}}
            />
            <div className="mx-auto mt-2 h-px w-[18%] bg-[#c9a45c]" />
          </div>
        </Frame>
      );
    case "tone-pop":
      return (
        <Frame bg="#fff04a">
          <div className="absolute -right-3 -top-3 h-[34px] w-[34px] rounded-full bg-[#ff3d7f]" />
          <div className="absolute -bottom-2 left-3 h-[20px] w-[20px] rotate-12 bg-[#3d8bff]" />
          <div className="px-2 pt-3">
            <Bar w="60%" h={9} color="#111" opacity={1} className="-rotate-2" />
            <Bar w="30%" h={4} color="#111" opacity={0.7} className="mt-1.5" />
          </div>
        </Frame>
      );

    /* ── 움직임 ── */
    case "motion-none":
      return (
        <Frame>
          <Header />
          <Hero lines={1} />
        </Frame>
      );
    case "motion-hover":
      return (
        <Frame>
          <Header />
          <div className="mt-2 px-2">
            <Bar w="50%" h={5} opacity={0.7} />
            <div
              className="intake-hover mt-2 w-[30px] rounded-sm bg-[#ff9d38]"
              style={{height: 8}}
            />
          </div>
        </Frame>
      );
    case "motion-scroll":
      return (
        <Frame>
          <Header />
          <div className="mt-2 px-2">
            <div className="intake-fade-up" style={{animationDelay: "0s"}}>
              <Bar w="55%" h={5} opacity={0.8} />
            </div>
            <div
              className="intake-fade-up mt-1"
              style={{animationDelay: "0.35s"}}
            >
              <Bar w="80%" h={3} opacity={0.4} />
            </div>
            <div
              className="intake-fade-up mt-1.5 flex gap-1"
              style={{animationDelay: "0.7s"}}
            >
              <Bar w={22} h={10} opacity={0.2} />
              <Bar w={22} h={10} opacity={0.2} />
              <Bar w={22} h={10} opacity={0.2} />
            </div>
          </div>
        </Frame>
      );
    case "motion-rich":
      return (
        <Frame bg="#0b1626">
          <div className="flex h-full items-center justify-between px-3">
            <div>
              <Bar w={40} h={5} color="#f3e6c8" opacity={0.9} />
              <Bar
                w={28}
                h={3}
                color="#a9bdd6"
                opacity={0.5}
                className="mt-1"
              />
            </div>
            <div style={{perspective: 120}}>
              <div className="intake-spin h-[30px] w-[30px]">
                <div
                  className="h-full w-full rounded-md"
                  style={{
                    background: "linear-gradient(135deg,#68c7cf,#c69af0)",
                    boxShadow: "0 0 16px rgba(104,199,207,.6)"
                  }}
                />
              </div>
            </div>
          </div>
        </Frame>
      );

    /* ── 기기 ── */
    case "device-phone":
      return (
        <Frame>
          <Phone>
            <Bar w="80%" h={3} opacity={0.8} />
            <Bar w="100%" h={12} opacity={0.12} className="mt-1" />
            <Bar w="100%" h={12} opacity={0.12} className="mt-1" />
            <Bar w="100%" h={6} color="#ff9d38" opacity={1} className="mt-1" />
          </Phone>
        </Frame>
      );
    case "device-both":
      return (
        <Frame>
          <div className="flex items-end justify-center gap-3">
            <Monitor>
              <Bar w="40%" h={3} opacity={0.8} />
              <Grid n={3} />
            </Monitor>
            <Phone>
              <Bar w="80%" h={3} opacity={0.8} />
              <Bar w="100%" h={12} opacity={0.12} className="mt-1" />
            </Phone>
          </div>
        </Frame>
      );
    case "device-desktop":
      return (
        <Frame>
          <Monitor>
            <Bar w="40%" h={3} opacity={0.8} />
            <div className="mt-1 flex gap-[3px]">
              {[0, 1, 2, 3].map(i => (
                <Bar key={i} w="25%" h={14} opacity={0.15 + i * 0.05} />
              ))}
            </div>
          </Monitor>
        </Frame>
      );
    default:
      return null;
  }
}
