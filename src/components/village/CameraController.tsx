"use client";

import {OrbitControls} from "@react-three/drei";
import {useFrame, useThree} from "@react-three/fiber";
import {useEffect, useMemo, useRef} from "react";
import {Euler, Vector3} from "three";
import {cameraTargets} from "@/lib/constants";
import type {SectionId} from "@/types/portfolio";

type OrbitController = {
  target: Vector3;
  update: () => void;
  enabled: boolean;
};

interface CameraControllerProps {
  activeSection: SectionId;
  isIntro?: boolean;
  lockRotate?: boolean;
  /** 연출용 카메라 override (컨시어지 등). 있으면 섹션 타깃 대신 이걸로 이동 */
  cinematic?: {
    position: [number, number, number];
    lookAt: [number, number, number];
  } | null;
}

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
  isIntro = false,
  lockRotate = false,
  cinematic = null
}: CameraControllerProps) {
  const controlsRef = useRef<OrbitController | null>(null);
  const {camera, gl} = useThree();
  const regress = useThree(s => s.performance.regress);
  const sectionTarget = cameraTargets[activeSection] || cameraTargets.intro;
  const target = cinematic ?? sectionTarget;

  const desiredCamera = useMemo(
    () => new Vector3(...target.position),
    [target.position]
  );
  const desiredLookAt = useMemo(
    () => new Vector3(...target.lookAt),
    [target.lookAt]
  );

  const isTransitioning = useRef(true);
  const prevSection = useRef(activeSection);
  const introDone = useRef(false);

  // ── 자유 카메라 (WASD/QE 이동 + 우클릭 마우스룩 + Shift 가속) ──
  const flying = useRef(false);
  const keys = useRef<Set<string>>(new Set());
  const shift = useRef(false);
  const rmb = useRef(false); // 우클릭 홀드 = 마우스룩
  const yaw = useRef(0);
  const pitch = useRef(0);

  useEffect(() => {
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

  // 시네마틱 인트로: 첫 마운트 시 카메라를 높은 위치에서 시작
  useEffect(() => {
    if (isIntro && !introDone.current) {
      camera.position.set(1.5, 30, 4);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isIntro) introDone.current = true;
  }, [isIntro]);

  useEffect(() => {
    if (prevSection.current !== activeSection) {
      isTransitioning.current = true;
      prevSection.current = activeSection;
    }
  }, [activeSection]);

  // 시네마틱 카메라가 켜지거나 꺼지면 새 목표로 이동
  useEffect(() => {
    isTransitioning.current = true;
  }, [cinematic]);

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

    const lerpSpeed = isIntro && !introDone.current ? 0.014 : 0.062;
    const targetSpeed = isIntro && !introDone.current ? 0.018 : 0.076;

    camera.position.lerp(desiredCamera, lerpSpeed);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(desiredLookAt, targetSpeed);
      controlsRef.current.update();
    }

    const settled =
      camera.position.distanceTo(desiredCamera) < 0.018 &&
      (!controlsRef.current ||
        controlsRef.current.target.distanceTo(desiredLookAt) < 0.018);

    if (settled) {
      camera.position.copy(desiredCamera);
      if (controlsRef.current) {
        controlsRef.current.target.copy(desiredLookAt);
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
