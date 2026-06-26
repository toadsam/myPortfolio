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
}

export function CameraController({activeSection}: CameraControllerProps) {
  const controlsRef = useRef<OrbitController | null>(null);
  const {camera} = useThree();
  const target = cameraTargets[activeSection] || cameraTargets.intro;

  const desiredCamera = useMemo(() => new Vector3(...target.position), [target.position]);
  const desiredLookAt = useMemo(() => new Vector3(...target.lookAt), [target.lookAt]);

  // 섹션이 바뀔 때만 true — 정착 후엔 OrbitControls에 완전히 위임
  const isTransitioning = useRef(true);
  const prevSection = useRef(activeSection);

  useEffect(() => {
    if (prevSection.current !== activeSection) {
      isTransitioning.current = true;
      prevSection.current = activeSection;
    }
  }, [activeSection]);

  useFrame(() => {
    if (!isTransitioning.current) return;

    camera.position.lerp(desiredCamera, 0.062);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(desiredLookAt, 0.076);
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
      maxDistance={14}
      maxPolarAngle={Math.PI / 2.05}
      minDistance={4}
      minPolarAngle={Math.PI / 7}
      rotateSpeed={0.75}
      zoomSpeed={1.1}
    />
  );
}
