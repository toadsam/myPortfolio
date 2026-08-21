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
    const clamped = Math.max(GROUND_OFFSET_MIN, Math.min(GROUND_OFFSET_MAX, len));
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

    if (!isTransitioning.current) return;
    regress(); // 전환 중 해상도 저하

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
      dampingFactor={0.08}
      enableDamping
      enablePan={false}
      enableRotate={!lockRotate}
      enableZoom
      // 36이던 시절엔 카메라가 마을 안에 갇혀 있었다. 그때는 그 밖에 볼 게 없었기
      // 때문이다 — 잔디 평면이 지평선까지 이어질 뿐이었으니까. 지금은 마을이 호수
      // 위의 섬이고 물 건너에 산이 있어서, 끝까지 당기면 컨셉 아트처럼 섬 전체가
      // 한 장에 들어온다. 섬 반지름이 40이라 그보다 넉넉하게.
      maxDistance={78}
      maxPolarAngle={Math.PI / 2.1}
      minDistance={3}
      minPolarAngle={Math.PI / 9}
      rotateSpeed={0.75}
      zoomSpeed={1.1}
      onStart={() => {
        isTransitioning.current = false;
      }}
      onChange={() => regress()}
    />
  );
}
