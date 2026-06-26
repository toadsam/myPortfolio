"use client";

import {OrbitControls} from "@react-three/drei";
import {useFrame, useThree} from "@react-three/fiber";
import {useEffect, useMemo, useRef} from "react";
import {Vector3} from "three";
import {cameraTargets} from "@/lib/constants";
import type {SectionId} from "@/types/portfolio";

type OrbitController = {
  target: Vector3;
  update: () => void;
};

interface CameraControllerProps {
  activeSection: SectionId;
  isIntro?: boolean;
}

export function CameraController({activeSection, isIntro = false}: CameraControllerProps) {
  const controlsRef = useRef<OrbitController | null>(null);
  const {camera} = useThree();
  const target = cameraTargets[activeSection] || cameraTargets.intro;

  const desiredCamera = useMemo(() => new Vector3(...target.position), [target.position]);
  const desiredLookAt = useMemo(() => new Vector3(...target.lookAt), [target.lookAt]);

  const isTransitioning = useRef(true);
  const prevSection = useRef(activeSection);
  const introDone = useRef(false);

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

  useFrame(() => {
    if (!isTransitioning.current) return;

    // 인트로 중엔 느리게 하강 (시네마틱), 이후엔 빠르게 전환
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
      enableZoom
      maxDistance={24}
      maxPolarAngle={Math.PI / 2.1}
      minDistance={3}
      minPolarAngle={Math.PI / 9}
      rotateSpeed={0.75}
      zoomSpeed={1.1}
      onStart={() => {
        // 유저가 드래그/줌 시작하면 카메라 전환 즉시 중단
        isTransitioning.current = false;
      }}
    />
  );
}
