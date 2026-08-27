"use client";

/**
 * 의뢰 공방 — 데스크톱으로 들어온 사람이 보는 3D 방.
 *
 * ## 왜 마을이 아니라 여기에 따로 있나
 *
 * 3D 공방은 원래 `/village` 안의 `viewMode="atelier"` 로만 존재했다. 그런데
 * 착륙장의 「작업 의뢰하기」를 거기로 보내면 **의뢰하러 온 사람이 GLB 87개(20.7 MB)를
 * 내려받는다.** 라우트를 가른 이유(`src/app/page.tsx` 참고)가 통째로 무너지는 것이다.
 *
 * 다행히 `AtelierInterior` 는 GLB 를 하나도 안 쓴다 — 상자·원기둥·평면으로 짠
 * 절차적 씬이라 마을 없이 혼자 설 수 있다. 그래서 방만 따로 세웠다.
 * 마을의 지하 해치는 **지금 그대로** 같은 방을 연다(발견의 재미는 그쪽 몫이다).
 *
 * ## 기기로 갈린다
 *
 * 데스크톱만 여기로 온다. 모바일·태블릿은 착륙장에서 2D 접수 데스크가 바로 열린다.
 * 3D 방에서 막히는 건 성능이 아니라 조작이다 — 손가락으로는 둘러보기와 스크롤이
 * 부딪히고 NPC 라벨이 겹친다. 판단은 `useImmersiveCapable()` 한 곳에서만 한다.
 *
 * 주소로 직접 들어온 사람(링크 공유·북마크)이 모바일이면 여기서 2D 로 돌려보낸다.
 * **막다른 길을 만들지 않는 게 접수 창구의 첫 번째 규칙이다.**
 */

import dynamic from "next/dynamic";
import {useRouter} from "next/navigation";
import {useCallback, useEffect, useState} from "react";

import {CommissionDesk, type DeskPrefill} from "@/components/ui/CommissionDesk";
import {IntakeHud} from "@/components/ui/commission/IntakeHud";
import {DialogueBox} from "@/components/ui/DialogueBox";
import {useImmersiveCapable} from "@/hooks/useImmersiveCapable";
import {trackVisitorEvent} from "@/lib/liveApi";
import type {NPCData} from "@/types/portfolio";

/** three.js 는 브라우저에서만 돈다. 마을 씬과 같은 규칙(ssr: false). */
const AtelierInterior = dynamic(
  () =>
    import("@/components/interior/AtelierInterior").then(
      m => m.AtelierInterior
    ),
  {
    ssr: false,
    loading: () => <RoomVeil />
  }
);

export default function AtelierPage() {
  const router = useRouter();
  const capable = useImmersiveCapable();

  const [deskOpen, setDeskOpen] = useState(false);
  const [selectedNpc, setSelectedNpc] = useState<NPCData | null>(null);
  // 3D 에서는 접수가 두 단계다: 릴레이 설문 HUD(방이 보인다) → 설문 결과를 든 데스크(폼).
  const [hudOpen, setHudOpen] = useState(false);
  const [prefill, setPrefill] = useState<DeskPrefill | null>(null);
  const [focusNpcId, setFocusNpcId] = useState<string | null>(null);

  // 모바일로 이 주소에 직접 닿은 사람은 2D 데스크를 바로 연다.
  const forcedDesk = capable === false;
  useEffect(() => {
    if (forcedDesk) setDeskOpen(true);
  }, [forcedDesk]);

  const goHome = useCallback(() => router.push("/"), [router]);

  /** 도안은 접수대로, 나머지 넷은 대화창으로. 마을의 분기와 같은 규칙이다. */
  const selectNpc = useCallback((npc: NPCData) => {
    if (npc.id === "atelier-intake-npc") {
      setSelectedNpc(null);
      setHudOpen(true);
      return;
    }
    trackVisitorEvent({
      event_type: "npc_open",
      target_id: npc.id,
      label: npc.name,
      metadata: {place: "atelier-route", type: npc.type}
    });
    setSelectedNpc(npc);
  }, []);

  useEffect(() => {
    trackVisitorEvent({
      event_type: "atelier_enter",
      target_id: "atelier",
      label: "의뢰 공방",
      metadata: {via: "direct-route"}
    });
  }, []);

  if (capable === null) return <RoomVeil />;

  // 모바일: 3D 를 아예 올리지 않는다. 데스크만 띄우고, 닫으면 착륙장으로.
  if (forcedDesk) {
    return (
      <main className="min-h-dvh bg-[#0b1626]">
        {deskOpen ? <CommissionDesk onClose={goHome} /> : null}
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#0b1626]">
      <AtelierInterior
        onBack={goHome}
        onSelectNpc={selectNpc}
        focusNpcId={hudOpen ? focusNpcId : null}
        hideHints={hudOpen}
        activeNpcId={selectedNpc?.id ?? null}
      />

      {hudOpen ? (
        <IntakeHud
          onSpeakerNpc={setFocusNpcId}
          onClose={() => setHudOpen(false)}
          onFinish={result => {
            setHudOpen(false);
            setPrefill(result);
            setDeskOpen(true);
          }}
        />
      ) : null}

      {/* 팀원과의 대화. 공방 화면이 z-40 이라 그냥 두면 캔버스 밑에 깔린다
          (마을 쪽에서 이미 밟은 함정이라 같은 처방을 쓴다). */}
      <div className="relative z-50">
        <DialogueBox
          npc={selectedNpc}
          onClose={() => setSelectedNpc(null)}
          onOpenCommission={() => {
            setSelectedNpc(null);
            setDeskOpen(true);
          }}
          // 구역은 마을에만 있다. 팀원이 "가서 보세요"라고 안내하면 마을로 보낸다 —
          // 여기서 삼키면 눌러도 아무 일이 없는 버튼이 된다.
          onOpenSection={() => router.push("/village")}
          // 마을 NPC의 행동(기록 남기기 등)은 이 방에 없다. 공방 팀원의 대사는
          // 의뢰 진행에 관한 것이라 실행할 행동 자체가 붙지 않는다.
          onRunAction={() => undefined}
          onSuggestedAction={() => undefined}
        />
      </div>

      {deskOpen ? (
        <CommissionDesk
          onClose={() => {
            setDeskOpen(false);
            setPrefill(null);
          }}
          prefill={prefill ?? undefined}
        />
      ) : null}
    </main>
  );
}

/** 씬이 올라오기 전의 어둠. 흰 화면이 번쩍이지 않게 방과 같은 색을 깔아 둔다. */
function RoomVeil() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[#0b1626]">
      <span className="v-lantern-glow text-3xl">🕯️</span>
      <p className="text-[12px] text-[#a9bdd6]/70">
        지하 공방으로 내려가는 중…
      </p>
    </div>
  );
}
