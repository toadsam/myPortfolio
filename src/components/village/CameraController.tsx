"use client";

import {OrbitControls} from "@react-three/drei";
import {useFrame, useThree} from "@react-three/fiber";
import {useMemo, useRef} from "react";
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

  useFrame(() => {
    camera.position.lerp(desiredCamera, 0.045);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(desiredLookAt, 0.06);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={(node) => {
        controlsRef.current = node as unknown as OrbitController | null;
      }}
      enableDamping
      enablePan={false}
      maxDistance={12}
      maxPolarAngle={Math.PI / 2.16}
      minDistance={5.2}
      minPolarAngle={Math.PI / 5.5}
    />
  );
}
