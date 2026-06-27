"use client";

import {Environment, OrbitControls} from "@react-three/drei";
import {Canvas} from "@react-three/fiber";
import {Suspense} from "react";
import {useGLTF} from "@react-three/drei";

function Model() {
  const {scene} = useGLTF("/models/dev/test-model.glb");
  return <primitive object={scene} scale={1} />;
}

export function ModelTest() {
  return (
    <div className="fixed inset-0 bg-[#1a1a2e]">
      <Canvas camera={{fov: 50, position: [0, 2, 5]}} shadows>
        <ambientLight intensity={0.8} />
        <directionalLight intensity={1.5} position={[5, 8, 5]} castShadow />
        <pointLight color="#fff8e0" intensity={1.2} position={[-3, 4, 2]} />
        <Suspense fallback={null}>
          <Model />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={1.5} />
      </Canvas>
      <div className="pointer-events-none fixed bottom-5 left-1/2 -translate-x-1/2 rounded-xl bg-black/60 px-5 py-2.5 text-xs font-bold text-white backdrop-blur-md">
        🖱 드래그로 회전 · 스크롤로 줌
      </div>
    </div>
  );
}
