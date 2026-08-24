"use client";

import {useCallback, useRef, useState} from "react";
import {useMuscleUp} from "../context";
import {
  Body,
  Cm,
  CodeLine,
  CodePanel,
  Heading,
  Hint,
  Kicker,
  LogLine,
  Page,
  Panel,
  Shot,
  Toggle,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 05 — 혼자 하는 운동이 아니게 만든 것 · 커뮤니티와 권한
//
// 개발 실체: PDF 9쪽 「커뮤니티/콘텐츠」 — 자랑글 CRUD, 댓글·좋아요, 권한 기반 접근 제어
// 연출 장치: **관람객이 직접 좋아요를 누르고, 남의 댓글을 고쳐 보려다 403 을 맞는다**
//            (스펙 PAGE 05 의 「관람객이 직접 조작한다」를 그대로 옮긴 것)
//
// 스펙의 Socket.IO 실시간 라운지는 PDF 에 없는 기능이라 쓰지 않는다.
// 대신 PDF 에 있는 진짜 커뮤니티 기능을 같은 자리·같은 연출 장치에 실었다.
//
// ⚠️ 실제 자랑방 캡처에는 이용자 얼굴이 찍혀 있어 싣지 않는다.
//    아래 목록은 화면 구조만 옮긴 재현이며, 게시물 내용은 예시다.

const STEPS = [0, 150, 550, 900, 1300];
const IDX = {label: 0, heading: 1, body: 2, demo: 3, code: 4};

type Post = {
  id: number;
  author: string;
  mine: boolean;
  title: string;
  movement: string;
  likes: number;
  liked: boolean;
  comments: number;
};

const INITIAL: Post[] = [
  {
    id: 12,
    author: "다른 회원",
    mine: false,
    title: "오늘 처음으로 원판 하나 늘렸습니다",
    movement: "데드리프트",
    likes: 3,
    liked: false,
    comments: 2
  },
  {
    id: 11,
    author: "나",
    mine: true,
    title: "AI가 짜준 4주 루틴 1주차 끝",
    movement: "전신",
    likes: 1,
    liked: false,
    comments: 1
  },
  {
    id: 10,
    author: "다른 회원",
    mine: false,
    title: "같이 하니까 확실히 안 빠지네요",
    movement: "러닝",
    likes: 5,
    liked: true,
    comments: 4
  }
];

type Entry = {id: number; time: string; path: string; status: number; note: string};

export function P05Community() {
  const {reducedMotion, announce} = useMuscleUp();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [posts, setPosts] = useState<Post[]>(INITIAL);
  const [admin, setAdmin] = useState(false);
  const [log, setLog] = useState<Entry[]>([]);
  const [denied, setDenied] = useState<number | null>(null);
  const seq = useRef(0);
  const clock = useRef(0);

  const push = useCallback((path: string, status: number, note: string) => {
    seq.current += 1;
    clock.current += 4;
    setLog(prev =>
      [
        {
          id: seq.current,
          time: `21:${String(30 + clock.current).padStart(2, "0")}`,
          path,
          status,
          note
        },
        ...prev
      ].slice(0, 5)
    );
  }, []);

  // 좋아요는 누구나 토글할 수 있다 — 서버가 exists 여부로 켜고 끈다.
  const toggleLike = useCallback(
    (id: number) => {
      setPosts(prev =>
        prev.map(p =>
          p.id === id
            ? {...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1)}
            : p
        )
      );
      const post = posts.find(p => p.id === id);
      push(
        `POST /api/brags/${id}/like`,
        200,
        post?.liked ? "existsBy… → delete" : "existsBy… → save"
      );
      announce("좋아요를 토글했습니다.");
    },
    [posts, push, announce]
  );

  // 댓글 수정은 작성자이거나 ADMIN 일 때만 통과한다.
  const editComment = useCallback(
    (post: Post) => {
      const allowed = post.mine || admin;
      if (allowed) {
        push(
          `PATCH /api/brags/comments/${post.id}`,
          200,
          admin && !post.mine ? "isAdmin → 통과" : "작성자 본인"
        );
        announce("댓글을 수정했습니다.");
        return;
      }
      setDenied(post.id);
      window.setTimeout(() => setDenied(null), 400);
      push(`PATCH /api/brags/comments/${post.id}`, 403, "FORBIDDEN");
      announce("권한이 없어 403 으로 거절되었습니다.");
    },
    [admin, push, announce]
  );

  return (
    <Page index={5} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        05 · 커뮤니티
      </Kicker>

      <div className="mt-4">
        <Heading
          text="혼자 하면 지속률이 낮습니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          그래서 기록 다음에 <strong>자랑글 · 댓글 · 좋아요</strong>를 붙였습니다.
          문제는 게시판을 붙이는 순간 생깁니다 —{" "}
          <strong style={{color: "var(--mu-bad)"}}>
            남의 글을 누구나 고칠 수 있으면 커뮤니티가 아니라 사고입니다.
          </strong>{" "}
          아래에서 직접 눌러 보세요. 남의 댓글을 고치려 하면 어떻게 되는지.
        </Body>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-[54%_1fr]"
        style={rise(on[IDX.demo], instant)}
      >
        {/* ── 관람객이 조작하는 게시판 ── */}
        <div
          className="flex flex-col gap-3 rounded-md p-5"
          style={{
            border: "1px solid var(--mu-border)",
            background: "var(--mu-panel)"
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--mu-muted)]">
              최신 자랑 모음
            </span>
            <span className="font-mono text-[10px] text-[var(--mu-faint)]">
              화면 구조 재현
            </span>
          </div>

          <Toggle
            on={admin}
            onToggle={() => {
              setAdmin(v => !v);
              announce(
                admin ? "USER 권한으로 돌아갔습니다." : "ADMIN 권한을 켰습니다."
              );
            }}
            title={admin ? "지금 ADMIN 입니다" : "지금 USER 입니다"}
            note={'hasAnyRole("USER", "ADMIN")'}
            onColor="var(--mu-warn)"
          />

          <div className="flex flex-col gap-2.5">
            {posts.map(p => (
              <div
                key={p.id}
                className={`rounded-md p-3.5 transition-colors duration-300 ${
                  denied === p.id && !instant ? "mu-blocked" : ""
                }`}
                style={{
                  border: `1px solid ${
                    denied === p.id
                      ? "var(--mu-bad)"
                      : p.mine
                      ? "rgba(244,114,182,0.32)"
                      : "rgba(255,255,255,0.10)"
                  }`,
                  background: "rgba(255,255,255,0.02)"
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="font-mono text-[10px]"
                    style={{
                      color: p.mine ? "var(--mu-primary)" : "var(--mu-muted)"
                    }}
                  >
                    {p.author}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 font-mono text-[10px]"
                    style={{
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "var(--mu-faint)"
                    }}
                  >
                    {p.movement}
                  </span>
                </div>
                <p className="mt-1.5 text-[14px] font-bold text-[var(--mu-text)]">
                  {p.title}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleLike(p.id)}
                    aria-pressed={p.liked}
                    className="cursor-pointer rounded-full px-3 py-1.5 font-mono text-[11px] transition-colors duration-200"
                    style={{
                      border: `1px solid ${
                        p.liked ? "var(--mu-primary)" : "rgba(255,255,255,0.14)"
                      }`,
                      background: p.liked
                        ? "rgba(244,114,182,0.16)"
                        : "transparent",
                      color: p.liked ? "var(--mu-accent)" : "var(--mu-muted)"
                    }}
                  >
                    👍 {p.likes} 좋아요
                  </button>
                  <button
                    type="button"
                    onClick={() => editComment(p)}
                    className="cursor-pointer rounded-full px-3 py-1.5 font-mono text-[11px] transition-colors duration-200"
                    style={{
                      border: "1px solid rgba(255,255,255,0.14)",
                      color: "var(--mu-muted)"
                    }}
                  >
                    댓글 {p.comments} · 수정하기
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div
            className="min-h-[92px] rounded"
            style={{
              background: "var(--mu-code-bg)",
              border: "1px solid var(--mu-code-border)"
            }}
          >
            {log.length === 0 ? (
              <p className="px-3 py-4 text-center font-mono text-[11px] text-[var(--mu-faint)]">
                서버 응답이 여기에 찍힙니다
              </p>
            ) : (
              <div className="py-1.5">
                {log.map(e => (
                  <LogLine
                    key={e.id}
                    time={e.time}
                    method={e.path.split(" ")[0]}
                    path={e.path.split(" ")[1]}
                    status={e.status}
                    note={e.note}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── 그 판정을 하는 실제 코드 ── */}
        <CodePanel
          filename="BragInteractionServiceImpl.java · SecurityConfig.java"
          badge={{text: "실제 코드", color: "var(--mu-ok)"}}
          borderColor="var(--mu-code-border)"
        >
          <div className="py-2">
            <CodeLine n={1}>
              <Cm>{"// desc: 댓글 수정/삭제 권한 체크 및 좋아요 토글"}</Cm>
            </CodeLine>
            <CodeLine n={2} bad={denied !== null}>
              {"if (!c.getUser().getId().equals(user.getId())"}
            </CodeLine>
            <CodeLine n={3} bad={denied !== null} highlight={admin}>
              {"    && !isAdmin(user)) {"}
            </CodeLine>
            <CodeLine n={4} bad={denied !== null}>
              {"  throw new ResponseStatusException("}
            </CodeLine>
            <CodeLine n={5} bad={denied !== null}>
              {"      HttpStatus.FORBIDDEN, ...);"}
            </CodeLine>
            <CodeLine n={6}>{"}"}</CodeLine>
            <CodeLine n={7}>{""}</CodeLine>
            <CodeLine n={8}>
              {"boolean exists = likeRepository"}
            </CodeLine>
            <CodeLine n={9}>
              {"    .existsByBragPost_IdAndUser_Id(postId, user.getId());"}
            </CodeLine>
            <CodeLine n={10}>
              {"if (exists) { likeRepository.deleteByBragPost_IdAndUser_Id(...); }"}
            </CodeLine>
            <CodeLine n={11}>
              {"else { likeRepository.save(BragLike.builder()...build()); }"}
            </CodeLine>
            <CodeLine n={12}>{""}</CodeLine>
            <CodeLine n={13}>
              <Cm>{"// file: SecurityConfig.java — 권한 기반 접근 제어"}</Cm>
            </CodeLine>
            <CodeLine n={14} highlight={log.length > 0}>
              {".requestMatchers(\"/api/brags/**\").hasAnyRole(\"USER\", \"ADMIN\")"}
            </CodeLine>
            <CodeLine n={15} highlight={admin}>
              {".requestMatchers(\"/api/admin/**\").hasRole(\"ADMIN\")"}
            </CodeLine>
          </div>
        </CodePanel>
      </div>

      <div className="mt-4">
        <Hint>
          좋아요는 <strong>있으면 지우고 없으면 넣는</strong> 토글이라 몇 번을
          눌러도 결과가 같습니다. 반면 댓글 수정은 작성자 본인인지부터 봅니다.
        </Hint>
      </div>

      <div
        className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]"
        style={rise(on[IDX.code], instant)}
      >
        <Shot
          src="/projects/muscleup/code-community.webp"
          alt="자랑글 CRUD · 댓글/좋아요 API · 권한 체크 코드"
          caption="자랑글 CRUD 엔드포인트부터 SecurityConfig 의 경로별 권한까지"
          w={1600}
          h={844}
        />
        <Panel label="싣지 않은 것">
          <p className="text-[13px] leading-6 text-[var(--mu-muted)]">
            실제 자랑방 화면 캡처에는 <strong>이용자들의 얼굴</strong>이 그대로
            찍혀 있습니다. 포트폴리오에 올릴 이유가 없어 싣지 않았고, 위 목록은
            화면 구조만 옮긴 재현입니다. 게시물 제목과 좋아요 수도 예시입니다.
          </p>
        </Panel>
      </div>
    </Page>
  );
}
