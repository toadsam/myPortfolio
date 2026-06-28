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
}

// 방향키 → WASD 별칭
const KEY_ALIAS: Record<string, string> = {
  arrowup: "w",
  arrowdown: "s",
  arrowleft: "a",
  arrowright: "d",
};
const MOVE_KEYS = new Set(["w", "a", "s", "d", "q", "e"]);

function isTyping() {
  const el = typeof document !== "undefined" ? document.activeElement : null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || (el as HTMLElement).isContentEditable;
}

export function CameraController({activeSection, isIntro = false, lockRotate = false}: CameraControllerProps) {
  const controlsRef = useRef<OrbitController | null>(null);
  const {camera, gl} = useThree();
  const regress = useThree((s) => s.performance.regress);
  const target = cameraTargets[activeSection] || cameraTargets.intro;

  const desiredCamera = useMemo(() => new Vector3(...target.position), [target.position]);
  const desiredLookAt = useMemo(() => new Vector3(...target.lookAt), [target.lookAt]);

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
        controlsRef.current.target.copy(camera.position).add(fwd.multiplyScalar(8));
        controlsRef.current.enabled = true;
        controlsRef.current.update();
      }
    }

    // 키나 우클릭 상태에 따라 자유모드 진입/이탈을 동기화
    function sync() {
      const hasMove = [...MOVE_KEYS].some((k) => keys.current.has(k));
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

  useFrame((_, delta) => {
    // ── 자유 카메라 ──
    if (flying.current) {
      regress();
      camera.quaternion.setFromEuler(new Euler(pitch.current, yaw.current, 0, "YXZ"));

      const speed = (shift.current ? 26 : 9) * Math.min(delta, 0.05);
      const move = new Vector3();
      const fwd = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
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
        controlsRef.current.target.copy(camera.position).add(fwd.clone().multiplyScalar(10));
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
      (!controlsRef.current || controlsRef.current.target.distanceTo(desiredLookAt) < 0.018);

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
      ref={(node) => {
        controlsRef.current = node as unknown as OrbitController | null;
      }}
      dampingFactor={0.08}
      enableDamping
      enablePan={false}
      enableRotate={!lockRotate}
      enableZoom
      maxDistance={36}
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
