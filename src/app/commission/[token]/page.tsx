"use client";

/**
 * 심화 문답 — 접수한 손님이 **다시 돌아오는 유일한 문**.
 *
 * ## 왜 접수와 따로 있나
 *
 * 접수 창구(1차)는 문턱이 낮아야 한다. 유형과 기능만 잡히면 접수 폼이 열리고,
 * 그건 의도된 설계다 — 여덟 가지를 캐물으면 접수까지 오지 못하고 떠나기 때문이다.
 *
 * 문제는 그렇게 받은 정보로는 **잘 만들 수가 없다는 것**이다. 사진을 누가 준비하는지,
 * 만든 뒤 누가 고치는지, 뭐가 달라져야 성공인지 — 이런 게 실제 제작 난이도와 결과를
 * 좌우하는데 1차에는 담을 자리가 없다.
 *
 * 그래서 **뽑는 시점을 접수 뒤로 옮겼다.** 이미 접수한 사람은 이탈 비용이 낮고
 * (이미 투자했고, 답을 받고 싶어 한다) 여기서는 캐물어도 안전하다.
 *
 * ## 이 주소가 곧 열쇠다
 *
 * 접수번호(`WO-XXXXXXXX`)가 아니라 `access_token` 을 쓴다. 접수번호는 8 hex 라
 * 사람이 받아적을 수 있는 대신 **열거를 시도할 수 있어서** 조회 키로 쓰지 않는다.
 * 그리고 이 화면은 연락처를 절대 받아오지 않는다 — 링크가 어디로 전달될지
 * 통제할 수 없으므로, 토큰을 쥔 사람이 볼 수 있는 건 자기가 말한 내용까지다.
 *
 * three.js 를 쓰지 않는다(착륙장과 같은 이유 — `src/app/page.tsx` 참고).
 */

import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import {useCallback, useEffect, useState} from "react";

import {CommissionDesk} from "@/components/ui/CommissionDesk";
import {fetchCommissionTrack} from "@/lib/liveApi";
import type {CommissionTrack} from "@/types/live";

type LoadState =
  | {phase: "loading"}
  | {phase: "ready"; track: CommissionTrack}
  | {phase: "missing"};

export default function CommissionTrackPage() {
  const params = useParams<{token: string}>();
  const router = useRouter();
  const token = typeof params?.token === "string" ? params.token : "";

  const [state, setState] = useState<LoadState>({phase: "loading"});

  useEffect(() => {
    let alive = true;
    if (!token) {
      setState({phase: "missing"});
      return;
    }

    fetchCommissionTrack(token)
      .then(track => {
        if (alive) setState({phase: "ready", track});
      })
      .catch(() => {
        // 없는 토큰과 틀린 토큰을 구분해 주지 않는다(서버도 마찬가지).
        if (alive) setState({phase: "missing"});
      });

    return () => {
      alive = false;
    };
  }, [token]);

  const goHome = useCallback(() => router.push("/"), [router]);

  return (
    <main className="min-h-dvh bg-[#0b1220]">
      {state.phase === "loading" ? (
        <Centered>
          <p className="text-[13px] text-[#a9bdd6]/70">
            공방 문을 여는 중이에요…
          </p>
        </Centered>
      ) : null}

      {state.phase === "missing" ? (
        <Centered>
          <span className="v-lantern-glow text-4xl">🕯️</span>
          <p className="v-panel-title text-[17px]">
            이 링크로는 접수 내역을 찾을 수 없어요
          </p>
          <p className="max-w-[420px] text-center text-[12px] leading-relaxed text-[#a9bdd6]/70">
            주소가 잘리진 않았는지 확인해 주세요. 접수하신 뒤 받은 링크를 그대로
            열어야 열립니다.
          </p>
          <Link
            href="/"
            className="mt-1 rounded-lg border border-[#ff9d38]/50 bg-[#ff9d38]/15 px-5 py-2.5 text-[12px] font-black text-[#f3e6c8] transition hover:bg-[#ff9d38]/25"
          >
            처음으로
          </Link>
        </Centered>
      ) : null}

      {state.phase === "ready" ? (
        <CommissionDesk
          mode="depth"
          track={state.track}
          token={token}
          onClose={goHome}
        />
      ) : null}
    </main>
  );
}

function Centered({children}: {children: React.ReactNode}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6">
      {children}
    </div>
  );
}
