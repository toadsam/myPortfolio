"use client";

import {OrbitControls} from "@react-three/drei";
import {useFrame, useThree} from "@react-three/fiber";
import {useEffect, useRef} from "react";
import {Euler, Vector3} from "three";
import {cameraTargets} from "@/lib/constants";
import type {SectionId, Vector3Tuple} from "@/types/portfolio";

type OrbitController = {
  target: Vector3;
  update: () => void;
  enabled: boolean;
};

interface CameraControllerProps {
  activeSection: SectionId;
  lockRotate?: boolean;
  /** 연출용 카메라 override (컨시어지 등). 있으면 섹션 타깃 대신 이걸로 이동 */
  cinematic?: {
    position: [number, number, number];
    lookAt: [number, number, number];
  } | null;
  /** 바닥 클릭 이동 — 이 지점을 바라보도록, 지금의 거리·각도를 유지한 채 옮긴다.
   *  같은 자리를 다시 눌러도 움직이게 nonce 로 구분한다. */
  groundTarget?: {point: Vector3Tuple; nonce: number} | null;
}

// 바닥 클릭 이동 때 유지할 카메라-타깃 거리 범위. 끝까지 당겨 섬 전체를 보다가
// 바닥을 찍으면 그 먼 거리 그대로 옮겨 봐야 달라진 게 없어 보인다 — 가까이 데려간다.
const GROUND_OFFSET_MIN = 6;
const GROUND_OFFSET_MAX = 24;
const _groundOffset = new Vector3();

/**
 * ── 제자리 회전 ───────────────────────────────────────────────────────────
 *
 * OrbitControls 는 이름 그대로 **타깃 둘레를 도는** 조작이다. 카메라 위치를
 * 타깃 기준 구면좌표에서 다시 계산하므로, 드래그하면 카메라가 궤도를 따라
 * 미끄러진다. 이 마을에서는 그 반지름이 컸다(실측):
 *
 *   intro   yaw 반지름 28.1  →  90° 돌리면 카메라가 44.2 유닛 이동
 *   그 외 6구역        13.0  →                    20.4 유닛 이동
 *
 * 마을 반경이 32.6 이니, 첫 화면에서 한 번 90° 돌리면 카메라가 마을 반경보다
 * 멀리 미끄러진 셈이다. "고개를 돌린다"가 아니라 "마을을 가로질러 날아간다".
 *
 * 고치는 방법은 간단하다 — **회전 중심을 카메라 코앞에 못 박는다.** 타깃이
 * 카메라에서 PIVOT_RADIUS 만큼만 떨어져 있으면, 아무리 돌려도 카메라는 그
 * 반지름만큼(= 사실상 0) 움직인다. 회전 속도와 각도 제한은 OrbitControls 것을
 * 그대로 쓰므로 조작감은 유지된다.
 *
 * 두 가지가 따라온다:
 *  · minDistance 를 PIVOT_RADIUS 아래로 내려야 한다. 안 그러면 update() 가
 *    반지름을 minDistance 로 밀어 올려 카메라가 매 프레임 뒤로 튕긴다.
 *  · 휠 줌(= 타깃으로 다가가기)은 의미를 잃는다. 아래 wheel 핸들러에서
 *    "보는 방향으로 전진/후진"으로 바꿔 단다.
 *
 * 시선 각도 제한(min/maxPolarAngle)은 손대지 않아도 그대로 맞는다. 타깃이
 * 시선 앞에 있으면 offset 은 -시선방향이라, phi 가 곧 "수평에서 얼마나 아래를
 * 보는가"가 된다 — 지금 값(20°~85.7°)이면 카메라는 늘 아래쪽을 향하므로
 * 제자리로 돌려도 하늘만 보이는 일이 없다.
 */
const PIVOT_RADIUS = 0.01;
const _pivotFwd = new Vector3();

/** 휠 한 칸에 시선 방향으로 나아가는 거리(유닛). 건물 표준 높이가 1.9 다. */
const WHEEL_STEP = 1.4;
/** 쌓인 휠 이동량을 한 프레임에 갚는 비율(60fps 기준). 클수록 빠르고 각지다. */
const WHEEL_EASE = 0.18;
/** 휠로 갈 수 있는 범위 — 땅에 처박히거나 마을 밖으로 날아가지 않게. */
const WHEEL_MIN_Y = 2.5;
const WHEEL_MAX_Y = 45;
const WHEEL_MAX_RADIUS = 60;
const _wheelFwd = new Vector3();

// 자유비행(WASD/QE + 우클릭 마우스룩)은 개발할 때 씬을 둘러보는 용도다. 방문자에겐
// 안내도 없는 키를 누르면 카메라가 하늘로 날아오르는 꼴이라 빼 둔다.
const FREE_FLY_ENABLED = process.env.NODE_ENV === "development";

// 방향키 → WASD 별칭
const KEY_ALIAS: Record<string, string> = {
  arrowup: "w",
  arrowdown: "s",
  arrowleft: "a",
  arrowright: "d"
};

// 자유비행 useFrame 루프용 스크래치 인스턴스 (매 프레임 재할당 방지, GC 압박 감소)
const _flyEuler = new Euler();
const _flyMove = new Vector3();
const _flyFwd = new Vector3();
const _flyRight = new Vector3();
const _flyLookAt = new Vector3();
const MOVE_KEYS = new Set(["w", "a", "s", "d", "q", "e"]);

function isTyping() {
  const el = typeof document !== "undefined" ? document.activeElement : null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    (el as HTMLElement).isContentEditable
  );
}

export function CameraController({
  activeSection,
  lockRotate = false,
  cinematic = null,
  groundTarget = null
}: CameraControllerProps) {
  const controlsRef = useRef<OrbitController | null>(null);
  const {camera, gl} = useThree();
  const regress = useThree(s => s.performance.regress);
  const sectionTarget = cameraTargets[activeSection] || cameraTargets.intro;
  const target = cinematic ?? sectionTarget;

  // 목적지는 ref 로 둔다 — 섹션/시네마틱 prop 과 바닥 클릭, 두 출처가 같은 자리를
  // 갱신하고 useFrame 은 그냥 여기로 lerp 한다.
  const desiredCamera = useRef(new Vector3(...target.position));
  const desiredLookAt = useRef(new Vector3(...target.lookAt));

  const isTransitioning = useRef(true);
  const prevSection = useRef(activeSection);

  useEffect(() => {
    desiredCamera.current.set(...target.position);
    desiredLookAt.current.set(...target.lookAt);
    isTransitioning.current = true;
  }, [target.position, target.lookAt]);

  // 바닥 클릭: 지금 카메라가 타깃을 보는 방향·거리를 그대로 들어 클릭 지점에 놓는다.
  useEffect(() => {
    if (!groundTarget) return;
    const look = new Vector3(...groundTarget.point);
    const from = controlsRef.current?.target ?? desiredLookAt.current;
    _groundOffset.copy(camera.position).sub(from);
    const len = _groundOffset.length() || 1;
    const clamped = Math.max(
      GROUND_OFFSET_MIN,
      Math.min(GROUND_OFFSET_MAX, len)
    );
    _groundOffset.multiplyScalar(clamped / len);
    desiredLookAt.current.copy(look);
    desiredCamera.current.copy(look).add(_groundOffset);
    isTransitioning.current = true;
  }, [groundTarget, camera]);

  // ── 자유 카메라 (WASD/QE 이동 + 우클릭 마우스룩 + Shift 가속) ──
  const flying = useRef(false);
  const keys = useRef<Set<string>>(new Set());
  const shift = useRef(false);
  const rmb = useRef(false); // 우클릭 홀드 = 마우스룩
  const yaw = useRef(0);
  const pitch = useRef(0);

  useEffect(() => {
    if (!FREE_FLY_ENABLED) return;
    const dom = gl.domElement;

    function enterFree() {
      if (flying.current) return;
      flying.current = true;
      isTransitioning.current = false;
      if (controlsRef.current) controlsRef.current.enabled = false;
      const euler = new Euler().setFromQuaternion(camera.quaternion, "YXZ");
      yaw.current = euler.y;
      pitch.current = euler.x;
    }

    function exitFree() {
      if (!flying.current) return;
      flying.current = false;
      dom.style.cursor = "";
      const fwd = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      if (controlsRef.current) {
        controlsRef.current.target
          .copy(camera.position)
          .add(fwd.multiplyScalar(8));
        controlsRef.current.enabled = true;
        controlsRef.current.update();
      }
    }

    // 키나 우클릭 상태에 따라 자유모드 진입/이탈을 동기화
    function sync() {
      const hasMove = [...MOVE_KEYS].some(k => keys.current.has(k));
      const shouldFly = rmb.current || hasMove;
      if (shouldFly) enterFree();
      else exitFree();
    }

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 2) return; // 우클릭만 마우스룩
      e.preventDefault();
      rmb.current = true;
      dom.style.cursor = "none";
      dom.setPointerCapture?.(e.pointerId);
      sync();
    }

    function onPointerUp(e: PointerEvent) {
      if (e.button === 2) {
        rmb.current = false;
        dom.style.cursor = "";
        sync();
      }
    }

    function onMouseMove(e: MouseEvent) {
      // 자유모드(키 이동 중이거나 우클릭 홀드)면 마우스로 시선 조절
      if (!flying.current) return;
      const sens = rmb.current ? 0.0016 : 0.0011; // 감도 (낮을수록 둔감)
      yaw.current -= e.movementX * sens;
      pitch.current -= e.movementY * sens;
      pitch.current = Math.max(-1.35, Math.min(1.35, pitch.current));
    }

    function onContextMenu(e: Event) {
      e.preventDefault();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (isTyping()) return;
      if (e.key.toLowerCase() === "shift") {
        shift.current = true;
        return;
      }
      const k = KEY_ALIAS[e.key.toLowerCase()] ?? e.key.toLowerCase();
      if (MOVE_KEYS.has(k)) {
        keys.current.add(k);
        e.preventDefault();
        sync();
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "shift") {
        shift.current = false;
        return;
      }
      const k = KEY_ALIAS[e.key.toLowerCase()] ?? e.key.toLowerCase();
      if (MOVE_KEYS.has(k)) {
        keys.current.delete(k);
        sync();
      }
    }

    dom.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("mousemove", onMouseMove);
    dom.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      dom.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("mousemove", onMouseMove);
      dom.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      dom.style.cursor = "";
    };
  }, [camera, gl]);

  useEffect(() => {
    if (prevSection.current !== activeSection) {
      isTransitioning.current = true;
      prevSection.current = activeSection;
    }
  }, [activeSection]);

  /** 회전 중심을 카메라 코앞에 못 박는다 — 제자리 회전의 전부다. 위 주석 참고. */
  const pinPivot = () => {
    const c = controlsRef.current;
    if (!c) return;
    camera.getWorldDirection(_pivotFwd);
    c.target.copy(camera.position).addScaledVector(_pivotFwd, PIVOT_RADIUS);
  };

  /**
   * 휠 = 보는 방향으로 전진/후진.
   *
   * 예전엔 OrbitControls 의 dolly(타깃으로 다가가기)였는데, 제자리 회전이 되면서
   * 다가갈 중심점이 사라졌다(타깃이 코앞이라 dolly 는 무의미하다).
   *
   * **한 칸에 곧바로 밀지 않고 빚으로 쌓아 둔다.** 휠은 이벤트가 띄엄띄엄
   * 들어오는 입력이라, 받은 자리에서 1.4 유닛을 즉시 옮기면 그 한 프레임만
   * 순간이동한 꼴이 된다 — 이게 "이동할 때 끊긴다"의 정체였다. 여기서는
   * 이동량을 wheelDebtRef 에 더해만 두고, 매 프레임 그중 일부만 갚는다.
   */
  const wheelDebtRef = useRef(0);

  useEffect(() => {
    const dom = gl.domElement;
    function onWheel(e: WheelEvent) {
      if (flying.current) return; // 자유비행은 자기 조작이 따로 있다
      e.preventDefault();
      // 전환 중이었다면 취소 — 사용자가 조작을 잡은 것이다(드래그 onStart 와 같은 규칙)
      isTransitioning.current = false;
      wheelDebtRef.current += e.deltaY < 0 ? WHEEL_STEP : -WHEEL_STEP;
    }
    // passive:false — preventDefault 로 페이지 스크롤을 막아야 한다
    dom.addEventListener("wheel", onWheel, {passive: false});
    return () => dom.removeEventListener("wheel", onWheel);
  }, [gl]);

  /** 쌓인 휠 이동량을 매 프레임 조금씩 갚는다. 남은 게 없으면 false. */
  const spendWheelDebt = (delta: number) => {
    const debt = wheelDebtRef.current;
    if (Math.abs(debt) < 0.001) {
      wheelDebtRef.current = 0;
      return false;
    }
    // 프레임 시간에 비례한 지수 감쇠 — 프레임률이 흔들려도 속도가 같다
    const k = 1 - Math.pow(1 - WHEEL_EASE, Math.min(delta, 0.05) * 60);
    const step = debt * k;
    wheelDebtRef.current = debt - step;

    camera.getWorldDirection(_wheelFwd);
    camera.position.addScaledVector(_wheelFwd, step);

    // 땅속·성층권·마을 밖으로는 못 간다
    camera.position.y = Math.max(
      WHEEL_MIN_Y,
      Math.min(WHEEL_MAX_Y, camera.position.y)
    );
    const r = Math.hypot(camera.position.x, camera.position.z);
    if (r > WHEEL_MAX_RADIUS) {
      const m = WHEEL_MAX_RADIUS / r;
      camera.position.x *= m;
      camera.position.z *= m;
      wheelDebtRef.current = 0; // 벽에 닿았으면 남은 빚은 버린다
    }
    return true;
  };

  useFrame((_, delta) => {
    // ── 자유 카메라 ──
    if (flying.current) {
      regress();
      _flyEuler.set(pitch.current, yaw.current, 0, "YXZ");
      camera.quaternion.setFromEuler(_flyEuler);

      const speed = (shift.current ? 26 : 9) * Math.min(delta, 0.05);
      const move = _flyMove.set(0, 0, 0);
      const fwd = _flyFwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
      const right = _flyRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
      if (keys.current.has("w")) move.add(fwd);
      if (keys.current.has("s")) move.sub(fwd);
      if (keys.current.has("d")) move.add(right);
      if (keys.current.has("a")) move.sub(right);
      if (keys.current.has("e")) move.y += 1;
      if (keys.current.has("q")) move.y -= 1;

      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(speed);
        camera.position.add(move);
        camera.position.x = Math.max(-48, Math.min(48, camera.position.x));
        camera.position.z = Math.max(-48, Math.min(48, camera.position.z));
        camera.position.y = Math.max(2, Math.min(50, camera.position.y));
      }

      // OrbitControls가 카메라를 되돌리지 않도록 타깃을 시선 앞쪽으로 따라오게 고정
      if (controlsRef.current) {
        _flyLookAt.copy(fwd).multiplyScalar(10);
        controlsRef.current.target.copy(camera.position).add(_flyLookAt);
      }
      return;
    }

    // 전환이 끝났으면(= 평소 상태) 쌓인 휠 이동을 갚고, 회전 중심을 코앞에 붙인다.
    // drei 의 OrbitControls 는 priority -1 로 먼저 update() 를 부르므로,
    // 여기서 옮겨 둔 타깃이 다음 프레임 회전에 쓰인다.
    if (!isTransitioning.current) {
      // 휠 이동에도 regress 를 걸지 않는다 — 회전과 같은 이유다(위 onChange 주석).
      spendWheelDebt(delta);
      pinPivot();
      return;
    }
    // 전환 중에는 해상도를 낮춘다. **회전·휠과 달리 여기는 진짜로 무겁다** —
    // 카메라가 마을을 가로지르면서 새 건물이 시야에 들어오고 텍스처가 올라간다.
    // 실측(prod, 구역 전환):
    //   regress 없이 = 17.9fps · 33ms 초과 40/59 프레임  (선명하지만 뚝뚝 끊긴다)
    //   regress 있게 = 36.5fps · 33ms 초과 23/120        (잠깐 흐리지만 흐른다)
    // 1초도 안 되는 연출 동안 흐린 쪽이 낫다.
    //
    // 예전에 "이동하면 화면이 흐려진다"고 느껴진 진짜 원인은 이 호출이 아니라
    // **해상도 조절이 두 겹이었던 것**이다 — dpr={[1,1.25]}(r3f 내장)와
    // <AdaptiveDpr/>(drei)가 같은 신호에 둘 다 반응해 곱해졌고, 그래서 캔버스가
    // 1264 → 804 → 402px 로 반토막씩 나며 **되돌아오지 않았다.**
    // AdaptiveDpr 을 걷어내(VillageScene) 그 누적을 끊었다. 이제 전환마다
    // 한 번 낮아졌다가 제자리로 돌아온다.
    regress();

    const lerpSpeed = 0.062;
    const targetSpeed = 0.076;

    const wantCam = desiredCamera.current;
    const wantLook = desiredLookAt.current;
    camera.position.lerp(wantCam, lerpSpeed);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(wantLook, targetSpeed);
      controlsRef.current.update();
    }

    const settled =
      camera.position.distanceTo(wantCam) < 0.018 &&
      (!controlsRef.current ||
        controlsRef.current.target.distanceTo(wantLook) < 0.018);

    if (settled) {
      camera.position.copy(wantCam);
      if (controlsRef.current) {
        controlsRef.current.target.copy(wantLook);
        controlsRef.current.update();
      }
      isTransitioning.current = false;
    }
  });

  return (
    <OrbitControls
      ref={node => {
        controlsRef.current = node as unknown as OrbitController | null;
      }}
      // **damping 은 켜되 세게 — 지연이 아니라 잔떨림 제거용이다.**
      //
      // 한 번 완전히 껐다가 되살린 값이다. 끄면 포인터 이벤트가 그대로 카메라에
      // 꽂히는데, 브라우저의 포인터 전달 주기와 rAF 프레임이 어긋나면 그 편차가
      // 카메라 각도에 바로 드러나 화면이 자잘하게 튄다. damping 은 그 편차를
      // 몇 프레임에 걸쳐 펴 주는 저역 필터다 — 부드러움의 핵심이 여기다.
      //
      // 관건은 세기다. 잔여 각도가 5% 아래로 가라앉는 데 걸리는 시간:
      //   0.08 → 36프레임 600ms   ← 원래 값. 이게 "굼뜨다"의 정체였다
      //   0.3  →  9프레임 150ms
      //   0.5  →  5프레임  83ms   ← 지금 값. 첫 프레임에 이미 50% 를 따라간다
      //
      // 0.5 면 사람 눈에는 즉각적이면서 프레임 사이가 이어진다.
      // 다시 굼떠지면 이 값을 **올리고**(0.6~0.7), 튀면 내릴 것. 0.08 로는
      // 절대 되돌리지 말 것.
      dampingFactor={0.5}
      enableDamping
      enablePan={false}
      // r3f 기본 컨트롤로 등록 — 배치 편집의 TransformControls(기즈모)가 축을
      // 끄는 동안 이걸 자동으로 멈춰 준다(없으면 기즈모를 끌 때 화면도 같이 돈다).
      makeDefault
      enableRotate={!lockRotate}
      // 휠 dolly 는 껐다 — 타깃이 코앞이라 다가갈 거리가 없다.
      // 대신 위 wheel 핸들러가 시선 방향 전진/후진을 맡는다.
      enableZoom={false}
      // 회전 반지름(= 카메라~타깃)이 PIVOT_RADIUS 0.01 로 고정이므로 이 둘은
      // 실질적으로 안 쓰인다. 다만 **minDistance 는 반드시 그보다 작아야 한다** —
      // update() 가 반지름을 minDistance 까지 밀어 올리기 때문에, 예전 값 3 이면
      // 카메라가 매 프레임 3 유닛씩 뒤로 튕겨 나간다.
      // 카메라가 갈 수 있는 범위는 이제 위 WHEEL_* 상수가 정한다.
      maxDistance={78}
      maxPolarAngle={Math.PI / 2.1}
      minDistance={0.001}
      minPolarAngle={Math.PI / 9}
      // OrbitControls 회전량 = 2π × dx / clientHeight × rotateSpeed (three-stdlib).
      // 뷰포트 높이 900px 기준으로 환산하면:
      //
      //   rotateSpeed   px당      화면 높이만큼 드래그하면
      //     1.0         0.400°          360°  ← 제자리에서 한 바퀴. 너무 빠르다
      //     0.75        0.300°          270°
      //     0.25        0.100°           90°  ← 지금 값
      //
      // 궤도 회전이던 시절엔 1.0 이어도 덜 느껴졌다. 타깃이 화면 중앙에 붙박여
      // 있어서 배경만 도는 것처럼 보였기 때문이다. 제자리 회전이 되면서 시선이
      // 통째로 쓸려 가니 같은 각속도가 그대로 드러났다.
      //
      // 0.25 는 눈대중이 아니라 이 리포지토리 안의 값에서 나왔다 — 자유비행
      // 마우스룩(같은 제자리 회전)이 sens 0.0016 rad/px 로 튜닝돼 있고,
      // 그걸 rotateSpeed 로 환산하면 0.229 다. 반올림해서 0.25.
      rotateSpeed={0.25}
      onStart={() => {
        isTransitioning.current = false;
        // 전환 도중에 드래그를 시작하면 타깃이 아직 저 멀리에 있다.
        // 그대로 두면 첫 프레임만 예전처럼 크게 궤도를 돈다 — 잡고 시작한다.
        pinPivot();
      }}
      // onChange 에서 regress() 를 부르지 않는다 — 여기 있던 게 회전 히칭의 원인이었다.
      //
      // regress() 는 performance.current 를 min(0.5)으로 떨어뜨리고, AdaptiveDpr 이
      // 그걸 보고 setDpr() 을 부른다. setDpr 은 캔버스 리사이즈 → 렌더 타깃 재할당이다.
      // 즉 드래그를 시작하는 순간 한 번(1.25→0.625), 멈추고 200ms 뒤 한 번(→1.25),
      // 드래그마다 프레임이 두 번 튀었다.
      //
      // 그리고 이건 **아무것도 벌어주지 않는다.** 카메라를 돌린다고 그릴 게 늘지
      // 않는다 — 가만히 서 있을 때와 프레임 비용이 같다. 해상도를 깎아야 할 만큼
      // 느리다면 돌리지 않을 때도 이미 느린 것이다.
      //
      // 자동 전환(구역 이동·바닥 클릭)과 CharacterController 의 regress 는 그대로
      // 뒀다 — 그쪽은 짧고 빠른 연출이라 해상도가 깎여도 눈에 안 띈다.
      onChange={undefined}
    />
  );
}
