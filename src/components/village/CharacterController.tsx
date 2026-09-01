"use client";

import {useFrame, useThree} from "@react-three/fiber";
import {Suspense, useEffect, useRef} from "react";
import {Group, Vector3} from "three";
import type {Vector3Tuple} from "@/types/portfolio";
import {
  slideTo,
  SPAWN,
  viewClearFraction,
  walkHeightAt
} from "@/lib/villageWalk";
import {WADE_MAX} from "@/lib/villageTerrain";
import {resetGreetings} from "@/lib/villageGreeting";
import {
  getPlayerEmote,
  resetPlayerEmote,
  setPlayerEmote,
  togglePlayerEmote
} from "@/lib/playerEmote";
import {emoteByHotkey} from "@/data/playerEmotes";
import {WarriorCharacter, type MoveState} from "./WarriorCharacter";

// ─── 조작 (2026-08-29 전면 교체) ──────────────────────────────────────────────
//
// 예전에는 **탱크 조작**이었다: A/D 가 제자리 회전, W/S 가 전후진, 마우스는 아무
// 일도 안 함. 1996년 바이오하자드 방식이라 옆으로 못 가고, 목표를 지나치면 멈춰
// 서서 돌린 다음 다시 가야 했다. 이 마을은 섬 사이 다리가 좁고 물가 턱이 많아
// 그 미세 조준이 계속 필요했다. HUD 도 A=왼쪽/D=오른쪽이라고 **거짓말**을 했다.
//
// 지금은 표준이다:
//   · WASD  = 카메라 기준 8방향. 캐릭터는 가는 쪽으로 알아서 돈다
//   · 드래그 = 시점 회전 (커서를 뺏지 않는다 — 아래 「왜 포인터 락이 아닌가」)
//   · 휠     = 줌
//   · 클릭/탭 = 그 지점까지 걸어감 (모바일이 이걸로 덮인다)
//   · Shift  = 달리기 (예전엔 **애니메이션만** 바뀌고 속도는 그대로였다)
//
// ─── 왜 포인터 락이 아닌가 ───────────────────────────────────────────────────
// 이 마을의 상호작용은 전부 커서에 달려 있다 — NPC 는 hover 0.45초면 대화가
// 열리고, 건물도 클릭이다. 커서를 잠그면 그걸 전부 화면 중앙 조준점으로 다시
// 만들어야 하고, UI 가 열릴 때마다 락을 풀었다 걸어야 한다. 드래그는 그 전부를
// 건드리지 않는다. GroundClickCatcher 가 이미 `event.delta` 로 드래그 끝과
// 클릭을 가르고 있어서, 시점을 돌리다 손을 떼도 이동 명령으로 오인되지 않는다.

const WALK_SPEED = 4.5;
const RUN_MULT = 1.7;
/** 캐릭터가 진행 방향으로 도는 속도(1초에 이만큼 좁힌다). 낮으면 미끄러진다 */
const TURN_LERP = 12;

const MOUSE_SENS = 0.0032;
const PITCH_MIN = 0.08;
// ─── 기본 시점 (2026-08-31) ─────────────────────────────────────────────────
// 어깨너머(거리 5.5 · 부감 24°)에서 **전략 시점 쪽으로** 밀었다. 이 마을은
// 클릭 이동(walkTargetRef)이 이미 있고 FOV 가 40 이라 멀리서 내려다보는 조작에
// 맞는데, 시점만 등 뒤에 붙어 있었다. 멀어지면 스프링 암(viewClearFraction)이
// 발동할 일도 줄어 골목에서 카메라가 떠는 것도 같이 준다.
//
// 45°에서 멈춘 이유: LoL 은 ~60°지만 그 맵은 위에서 보라고 만든 지형이다. 이
// 마을 건물 GLB 는 정면 간판·파사드 기준이라 그 이상 올리면 화면 절반이 지붕이
// 된다. 상한(1.30 / 20)은 더 올려 뒀으니 원하면 드래그·휠로 더 갈 수 있다.
const PITCH_MAX = 1.3;
const DIST_MIN = 2.5;
const DIST_MAX = 20;
const DIST_DEFAULT = 8;
const PITCH_DEFAULT = 0.78;

/**
 * 손을 뗀 뒤 이만큼 지나면 카메라가 진행 방향으로 슬슬 따라붙는다.
 * 0 이면 사용자가 돌린 시점을 카메라가 곧바로 뺏어가고, 없으면 앞으로 달릴 때
 * 캐릭터가 화면 밖으로 빠진다. 그 사이 값이다.
 */
const AUTO_ALIGN_DELAY = 1.4;
const AUTO_ALIGN_SPEED = 1.1;

/** 클릭 이동을 이 거리 안까지 오면 도착으로 친다 */
const ARRIVE_DIST = 0.45;

/** 카메라가 지면 아래로 파고들지 않게 확보하는 여유 */
const CAM_CLEARANCE = 0.7;

// ─── 스프링 암 ───────────────────────────────────────────────────────────────
// 건물 뒤로 넘어간 카메라는 캐릭터를 벽으로 가린다. 막히면 앞으로 당기고, 트이면
// 되돌아간다. 실제로 불쾌해지는 지점 넷을 다 막아 뒀다:
//
//  ① **당길 땐 즉시, 물러날 땐 천천히.** 같은 속도면 건물 모서리에서 판정이
//     깜빡일 때 카메라가 앞뒤로 떤다. 사람 눈에는 그게 가림보다 더 거슬린다.
//  ② **부감을 먼저 올리고, 거리는 나중에 줄인다.** 순서가 중요하다 — 예전엔
//     반대였고(당기기 먼저, 부감은 당겨진 정도에 비례해 덤), 그랬더니 뒤통수가
//     화면을 덮기 직전에야 부감이 붙었다. 실측으로도 부감 쪽이 싸게 먹는다:
//     집 높이는 대부분 3.5m(2.51 × BUILDING_SCALE 1.4), 캐릭터 시선은 0.9m —
//     부감 45°면 그 집을 넘기려고 2.6m 떨어져야 하고, 67°면 1.5m면 된다.
//  ③ **선을 셋 본다.** 가운데만 보면 화면 가장자리로 벽이 파고든다.
//  ④ 막는 건 건물·민가뿐 (villageWalk 의 viewClearFraction 참고).
//  ⑤ **끝내 안 뚫리면 가려진 채로 둔다.** 최소 거리가 절대값 1.6 이던 시절엔
//     5.5 → 1.6(3.4배)이라 버털만했지만, 기본 거리가 멀어지면 같은 상수가
//     난폭해진다. 그래서 바닥을 **비율**로 잡는다.
/** 가림 때도 이 비율 아래로는 안 당긴다 (원하는 거리 대비) */
const CAM_MIN_RATIO = 0.6;
/** 비율 바닥의 절대 하한 — 가까이 줌했을 땐 이게 오히려 거리보다 클 수 있어
 *  아래에서 wantDist·0.75 로 한 번 더 조인다 */
const CAM_MIN_DIST = 3.5;
/** 당기는 속도(1초에 이 비율만큼 좁힌다) — 크다 = 즉시 */
const CAM_PULL_IN = 18;
/** 되돌아가는 속도 — 작다 = 천천히 */
const CAM_PUSH_OUT = 2.2;
/** 좌우로 벌려 보는 각 */
const CAM_SIDE_ANGLE = 0.26;
/** 가렸을 때 부감을 이만큼까지 더 올린다 */
const CAM_PITCH_LIFT = 0.4;
/** 부감을 올리는 속도 — 즉시 올리면 0.4rad 가 훅 튀어 멀미하다 */
const CAM_LIFT_UP = 6;
/** 내리는 속도 — 느려야 모서리에서 까박이지 않는다 (①과 같은 이유) */
const CAM_LIFT_DOWN = 1.5;

function shortestAngle(from: number, to: number) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/** 키 입력을 먹으면 안 되는 곳 — NPC 대화창에 "wasd" 를 치면 걸어가 버린다 */
function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el || !el.tagName) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || el.isContentEditable;
}

export function CharacterController({
  playerPosRef,
  walkTargetRef
}: {
  /** 주민들이 "옆을 지나가는지" 보려고 읽는 살아 있는 위치 */
  playerPosRef?: React.MutableRefObject<Vector3Tuple | null>;
  /** 바닥을 클릭하면 여기에 좌표가 들어온다 (GroundClickCatcher → VillageScene) */
  walkTargetRef?: React.MutableRefObject<Vector3Tuple | null>;
}) {
  const {camera, gl} = useThree();
  const groupRef = useRef<Group>(null);
  const posRef = useRef(new Vector3(SPAWN[0], 0, SPAWN[1]));
  /** 캐릭터가 보는 방향. 전방 벡터는 (-sin, -cos) 규약이다 */
  const rotRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());
  const camPosRef = useRef(new Vector3());
  const moveStateRef = useRef<MoveState>("idle");
  /** 구역 단차에서 지금 밟고 있는 단 높이 (감쇠 중인 값) */
  const groundYRef = useRef(0);
  /** 지금 부리는 동작. 모듈 전역(playerEmote)을 매 프레임 여기로 받아 적는다 */
  const emoteRef = useRef<string | null>(null);

  // 카메라 궤도 — 사용자가 드래그로 직접 돌린다
  const camYawRef = useRef(0);
  const camPitchRef = useRef(PITCH_DEFAULT);
  const camDistRef = useRef(DIST_DEFAULT);
  const draggingRef = useRef(false);
  const lastDragRef = useRef(0);
  const dragIdRef = useRef<number | null>(null);
  // 델타를 **직접** 잰다. `movementX/Y` 는 마우스에선 되지만 터치에서는 0 이거나
  // 아예 없는 브라우저가 있다 — 그러면 모바일에서 시점이 안 돈다.
  const dragPrevRef = useRef({x: 0, y: 0});
  /** 스프링 암이 실제로 허용한 거리 (감쇠 중인 값) */
  const camHeldRef = useRef(DIST_DEFAULT);
  /** 가림을 피하려고 부감을 올린 정도 0~1 (감쇠 중인 값) */
  const camLiftRef = useRef(0);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey)
        return;
      // 숫자키로 동작 — 화면 버튼(WalkEmoteBar)과 같은 스위치다
      const emote = emoteByHotkey(e.code);
      if (emote) {
        // 클릭 이동 중이었다면 멈춘다 — 안 그러면 걷는 상태라 동작이 켜지자마자
        // 다시 꺼져서 버튼이 먹통으로 보인다
        if (walkTargetRef) walkTargetRef.current = null;
        togglePlayerEmote(emote.id);
        return;
      }
      keysRef.current.add(e.code);
      // 방향키·스페이스로 페이지가 스크롤되면 캔버스가 통째로 밀린다
      if (e.code.startsWith("Arrow") || e.code === "Space") e.preventDefault();
      // 손으로 조작하기 시작하면 클릭 이동은 취소한다 — 둘이 서로 잡아당기면
      // 캐릭터가 목적지 근처에서 떨린다
      if (walkTargetRef) walkTargetRef.current = null;
    }
    function onKeyUp(e: KeyboardEvent) {
      keysRef.current.delete(e.code);
    }
    function onBlur() {
      // 탭을 옮겼다 돌아오면 keyup 을 못 받아 그 키가 눌린 채로 남는다
      keysRef.current.clear();
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [walkTargetRef]);

  // 드래그 시점 — 캔버스 위에서만 듣는다(UI 패널 위 드래그는 무시)
  useEffect(() => {
    const el = gl.domElement;

    function onPointerDown(e: PointerEvent) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      draggingRef.current = true;
      dragIdRef.current = e.pointerId;
      dragPrevRef.current = {x: e.clientX, y: e.clientY};
    }
    function onPointerMove(e: PointerEvent) {
      if (!draggingRef.current || dragIdRef.current !== e.pointerId) return;
      const dx = e.clientX - dragPrevRef.current.x;
      const dy = e.clientY - dragPrevRef.current.y;
      dragPrevRef.current = {x: e.clientX, y: e.clientY};
      camYawRef.current -= dx * MOUSE_SENS;
      camPitchRef.current = Math.min(
        PITCH_MAX,
        Math.max(PITCH_MIN, camPitchRef.current + dy * MOUSE_SENS)
      );
      lastDragRef.current = performance.now();
    }
    function endDrag(e: PointerEvent) {
      if (dragIdRef.current !== e.pointerId) return;
      draggingRef.current = false;
      dragIdRef.current = null;
      lastDragRef.current = performance.now();
    }
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      camDistRef.current = Math.min(
        DIST_MAX,
        Math.max(DIST_MIN, camDistRef.current + e.deltaY * 0.0035)
      );
    }

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    el.addEventListener("wheel", onWheel, {passive: false});
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("wheel", onWheel);
    };
  }, [gl]);

  // 걷기 모드에 막 들어왔을 때 카메라를 캐릭터 뒤에 세운다
  useEffect(() => {
    camYawRef.current = rotRef.current;
    resetGreetings();
    resetPlayerEmote();
    return () => {
      resetPlayerEmote();
      // 나갈 때 위치를 지운다 — 남겨 두면 주민들이 마을 모드에서도 유령을 보고
      // 인사한다(playerPosRef 가 있으면 인사 판정이 돈다).
      if (playerPosRef) playerPosRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, rawDelta) => {
    // 탭이 백그라운드였다 돌아오면 delta 가 몇 초씩 튄다 — 그 한 프레임에
    // 캐릭터가 지형을 뚫고 날아간다
    const delta = Math.min(rawDelta, 0.05);
    const keys = keysRef.current;

    // ─── 입력을 카메라 기준 방향으로 ─────────────────────────────────────
    const fx = -Math.sin(camYawRef.current);
    const fz = -Math.cos(camYawRef.current);
    const rx = -fz;
    const rz = fx;

    let ix = 0;
    let iz = 0;
    if (keys.has("KeyW") || keys.has("ArrowUp")) iz += 1;
    if (keys.has("KeyS") || keys.has("ArrowDown")) iz -= 1;
    if (keys.has("KeyD") || keys.has("ArrowRight")) ix += 1;
    if (keys.has("KeyA") || keys.has("ArrowLeft")) ix -= 1;

    let dirX = fx * iz + rx * ix;
    let dirZ = fz * iz + rz * ix;
    let hasInput = ix !== 0 || iz !== 0;

    // ─── 클릭/탭 이동 ─────────────────────────────────────────────────────
    const target = walkTargetRef?.current ?? null;
    if (!hasInput && target) {
      const tx = target[0] - posRef.current.x;
      const tz = target[2] - posRef.current.z;
      const dist = Math.hypot(tx, tz);
      if (dist <= ARRIVE_DIST) {
        walkTargetRef!.current = null;
      } else {
        dirX = tx / dist;
        dirZ = tz / dist;
        hasInput = true;
      }
    }

    const len = Math.hypot(dirX, dirZ);
    if (len > 0) {
      dirX /= len;
      dirZ /= len;
    }

    // ─── 이동 ─────────────────────────────────────────────────────────────
    // 물속에서는 느려진다 — 허리 깊이에서 절반. 감쇠 중인 groundY(음수 = 잠긴
    // 깊이)를 그대로 쓰므로 들어갈수록 서서히 무거워지고, 나오면 서서히 풀린다.
    const wade = Math.max(0, -groundYRef.current) / WADE_MAX;
    const running = keys.has("ShiftLeft") || keys.has("ShiftRight");
    // 예전엔 달리기가 애니메이션만 바꾸고 속도는 그대로였다 — 뛰는 시늉만 했다.
    const speed =
      WALK_SPEED *
      (running ? RUN_MULT : 1) *
      (1 - 0.5 * Math.min(1, wade)) *
      delta;

    // 범위 제한도 막힘 판정도 villageWalk 이 한다 — 광장 중심의 원반이라
    // 사각형으로 자르면 모서리에서 갈 수 있는 데와 없는 데가 어긋난다.
    const at = slideTo(
      posRef.current.x,
      posRef.current.z,
      posRef.current.x + dirX * speed,
      posRef.current.z + dirZ * speed
    );
    const moved =
      Math.abs(at.x - posRef.current.x) > 1e-5 ||
      Math.abs(at.z - posRef.current.z) > 1e-5;
    posRef.current.x = at.x;
    posRef.current.z = at.z;

    // 벽에 붙어 한 발도 못 나가면 클릭 이동을 놔 준다 — 안 그러면 도달할 수
    // 없는 목적지(물 건너편·막힌 안뜰)를 향해 영원히 벽을 민다.
    if (target && !moved && walkTargetRef) walkTargetRef.current = null;

    // ─── 캐릭터가 가는 쪽을 본다 ──────────────────────────────────────────
    if (hasInput && len > 0) {
      const want = Math.atan2(-dirX, -dirZ);
      rotRef.current +=
        shortestAngle(rotRef.current, want) * Math.min(1, TURN_LERP * delta);
    }

    moveStateRef.current =
      hasInput && moved ? (running ? "run" : "walk") : "idle";

    // ─── 동작 ───────────────────────────────────────────────────────────
    // 한 발이라도 떼면 즉시 끊는다. `hasInput` 이 아니라 **실제로 움직였는지**
    // 를 보는 이유: 벽에 대고 W 를 누르고 있는 동안은 캐릭터가 제자리라
    // 스쿼트가 그대로 이어지는 게 자연스럽다.
    emoteRef.current = getPlayerEmote();
    if (emoteRef.current && moveStateRef.current !== "idle") {
      // 모듈 쪽도 같이 꺼야 화면 버튼 불이 꺼진다
      setPlayerEmote(null);
      emoteRef.current = null;
    }

    // ─── 카메라가 진행 방향으로 슬슬 따라붙는다 ───────────────────────────
    const sinceDrag = (performance.now() - lastDragRef.current) / 1000;
    if (
      !draggingRef.current &&
      sinceDrag > AUTO_ALIGN_DELAY &&
      moveStateRef.current !== "idle"
    ) {
      camYawRef.current +=
        shortestAngle(camYawRef.current, rotRef.current) *
        Math.min(1, AUTO_ALIGN_SPEED * delta);
    }

    // 구역 단차와 **물 깊이** — walkHeightAt 은 단 위에서 +1.1, 물속에서 음수다.
    // 그냥 대입하면 경계에서 툭 튀므로 목표 높이로 감쇠시킨다. 물에 들어갈 때도
    // 같은 감쇠가 발목 → 무릎 → 허리로 잠기는 템포를 만든다.
    const groundTarget = walkHeightAt(posRef.current.x, posRef.current.z);
    groundYRef.current +=
      (groundTarget - groundYRef.current) * Math.min(1, delta * 7);
    const groundY = groundYRef.current;

    if (groupRef.current) {
      groupRef.current.position.set(
        posRef.current.x,
        groundY,
        posRef.current.z
      );
      groupRef.current.rotation.y = rotRef.current;
    }

    // 주민들이 읽어 간다. 배열을 매 프레임 새로 만들지 않고 자리만 갈아 끼운다.
    if (playerPosRef) {
      const slot = playerPosRef.current;
      if (slot) {
        slot[0] = posRef.current.x;
        slot[1] = groundY;
        slot[2] = posRef.current.z;
      } else {
        playerPosRef.current = [posRef.current.x, groundY, posRef.current.z];
      }
    }

    // ─── 캐릭터를 도는 3인칭 카메라 ───────────────────────────────────────
    const wantDist = camDistRef.current;
    const pitch = camPitchRef.current;
    // 시선이 나가는 곳은 발밑이 아니라 어깨 위다
    const headX = posRef.current.x;
    const headY = groundY + 0.9;
    const headZ = posRef.current.z;

    // 주어진 부감에서 시야가 얼마나 뚫렸나 — 가운데 + 좌우, 셋 중 제일 막힌 쪽
    const clearAt = (p: number) => {
      let f = 1;
      for (const off of [0, -CAM_SIDE_ANGLE, CAM_SIDE_ANGLE]) {
        const yaw = camYawRef.current + off;
        const flat = Math.cos(p) * wantDist;
        f = Math.min(
          f,
          viewClearFraction(
            headX,
            headY,
            headZ,
            posRef.current.x + Math.sin(yaw) * flat,
            headY + Math.sin(p) * wantDist,
            posRef.current.z + Math.cos(yaw) * flat
          )
        );
        if (f === 0) break;
      }
      return f;
    };

    // ① 먼저 **부감으로** 넘겨 본다. 올려도 나아지지 않거나(liftedFrac 가
    //   더 크지 않다) 이미 상한이면 올리지 않는다 — 공짜로 화면만 뒤집힌다.
    const baseFrac = clearAt(pitch);
    const liftPitch = Math.min(PITCH_MAX, pitch + CAM_PITCH_LIFT);
    const liftedFrac =
      baseFrac < 1 && liftPitch > pitch + 1e-3 ? clearAt(liftPitch) : baseFrac;
    const wantLift = liftedFrac > baseFrac ? 1 : 0;
    const liftRate =
      wantLift > camLiftRef.current ? CAM_LIFT_UP : CAM_LIFT_DOWN;
    camLiftRef.current +=
      (wantLift - camLiftRef.current) * Math.min(1, liftRate * delta);
    const usePitch = pitch + (liftPitch - pitch) * camLiftRef.current;

    // ② 부감을 올리고도 남는 잔량만 거리로 갚는다. 감쇠 중인 부감에서 다시
    //   레이를 쪼기보다 둘 사이를 섞는다 — 어차피 카메라 휴리스틱이고,
    //   건물 검사를 프레임당 세 번 돌리는 것보다 싸다.
    const frac = baseFrac + (liftedFrac - baseFrac) * camLiftRef.current;

    // 바닥은 절대값이 아니라 비율이다(⑤). 다만 휠로 바짝 줌했을 땐 3.5 가
    // 원하는 거리보다 커져 오히려 카메라를 밀어낸다 — 그래서 한 번 더 조인다.
    const minDist = Math.min(
      wantDist * 0.75,
      Math.max(CAM_MIN_DIST, wantDist * CAM_MIN_RATIO)
    );
    // 살짝 앞(0.25)에서 멈춰야 벽에 코를 박지 않는다
    const allowed = Math.max(minDist, wantDist * frac - 0.25);
    const rate = allowed < camHeldRef.current ? CAM_PULL_IN : CAM_PUSH_OUT;
    camHeldRef.current +=
      (allowed - camHeldRef.current) * Math.min(1, rate * delta);
    const dist = camHeldRef.current;

    const flat = Math.cos(usePitch) * dist;
    const camX = posRef.current.x + Math.sin(camYawRef.current) * flat;
    const camZ = posRef.current.z + Math.cos(camYawRef.current) * flat;
    let camY = groundY + 0.9 + Math.sin(usePitch) * dist;

    // 싸구려 충돌 — 지형 함수만 본다(메시 레이캐스트는 매 프레임 하기엔 비싸다).
    // 언덕·구역 단 뒤로 카메라가 파고드는 걸 막는 게 목적이고, 그게 실제로
    // 일어나는 경우의 대부분이다.
    const camGround = walkHeightAt(camX, camZ);
    camY = Math.max(camY, camGround + CAM_CLEARANCE);

    camPosRef.current.set(camX, camY, camZ);
    // 당겨져 있을 때는 따라붙는 속도도 올린다 — 느리면 감쇠하는 동안 카메라가
    // 벽 속에 남는다.
    camera.position.lerp(
      camPosRef.current,
      Math.min(1, delta * (frac < 1 ? 18 : 9))
    );
    camera.lookAt(posRef.current.x, groundY + 0.85, posRef.current.z);
  });

  return (
    <group ref={groupRef} position={[SPAWN[0], 0, SPAWN[1]]}>
      {/* 애니메이션 캐릭터 */}
      <Suspense fallback={null}>
        <WarriorCharacter stateRef={moveStateRef} emoteRef={emoteRef} />
      </Suspense>
      {/* 방향 링 */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.38, 24]} />
        <meshBasicMaterial color="#7ed957" transparent opacity={0.9} />
      </mesh>
      {/* 전방 방향 표시 */}
      <mesh position={[0, 0.04, -0.48]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.07, 12]} />
        <meshBasicMaterial color="#7ed957" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}
