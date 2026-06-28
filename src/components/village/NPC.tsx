"use client";

import {Billboard, Html, useCursor} from "@react-three/drei";
import {useFrame} from "@react-three/fiber";
import {Suspense, useRef, useState} from "react";
import {NpcWarrior, type NpcMoveState} from "./NpcWarrior";
import type {ThreeEvent} from "@react-three/fiber";
import type {Group, Vector3} from "three";
import type {NpcBehaviorProfile} from "@/data/npcBehaviors";
import {moodLabel} from "@/lib/liveState";
import {isWalkablePosition} from "@/lib/worldCollision";
import type {NpcActionState, NpcAnimationKey, NpcState} from "@/types/live";
import type {BuildingData, NPCData, Vector3Tuple} from "@/types/portfolio";

interface NPCProps {
  npc: NPCData;
  npcState?: NpcState;
  currentAction?: NpcActionState;
  behavior?: NpcBehaviorProfile;
  bubbleText?: string;
  buildings: Array<Pick<BuildingData, "id" | "name" | "position" | "size" | "accentColor">>;
  isActive: boolean;
  onPositionChange?: (npcId: string, position: Vector3Tuple) => void;
  onSelect: (npc: NPCData) => void;
  /** 연출용: 지정 지점으로 빠르게 달려간다 (컨시어지 인트로) */
  scriptedTarget?: Vector3Tuple | null;
  /** 연출 시작 시 순간이동할 출발 지점 (멀리서 달려오게) */
  scriptedStart?: Vector3Tuple;
  onScriptedArrive?: () => void;
  /** 대화/컨시어지 동안 제자리 고정 + 카메라 응시 */
  forceHold?: boolean;
  /** NPC끼리 대화 중 마주볼 상대 위치 */
  facePoint?: [number, number, number];
  /** 이 시각까지 멈춰서 마주봄 */
  holdUntil?: number;
}

export function NPC({
  npc,
  npcState,
  currentAction,
  behavior,
  bubbleText,
  buildings,
  isActive,
  onPositionChange,
  onSelect,
  scriptedTarget,
  scriptedStart,
  onScriptedArrive,
  forceHold,
  facePoint,
  holdUntil
}: NPCProps) {
  const groupRef = useRef<Group | null>(null);
  const elapsedRef = useRef(0);
  const targetRef = useRef<Vector3Tuple>(behavior?.home ?? npc.position);
  const retargetAtRef = useRef(0);
  const reportAtRef = useRef(0);
  const arrivedRef = useRef(false);
  const scriptStartedRef = useRef(false);
  const moveStateRef = useRef<NpcMoveState>("idle");
  const [hovered, setHovered] = useState(false);
  const highlighted = hovered || isActive;
  const rawMood = npcState?.mood ?? "calm";
  const mood = moodLabel(rawMood);
  const home = behavior?.home ?? npc.position;
  const roamRadius = behavior?.roamRadius ?? 1.5;
  const actionTarget = currentAction?.targetId
    ? buildings.find((building) => building.id === currentAction.targetId)
    : undefined;

  useCursor(hovered);

  useFrame(({clock}, delta) => {
    elapsedRef.current += delta;

    if (!groupRef.current) {
      return;
    }

    // ── 연출: 환영 지점으로 달려가기 (컨시어지 인트로) ──
    if (scriptedTarget) {
      const g = groupRef.current;
      if (!scriptStartedRef.current) {
        scriptStartedRef.current = true;
        if (scriptedStart) {
          g.position.x = scriptedStart[0];
          g.position.z = scriptedStart[2];
        }
      }
      const sx = scriptedTarget[0] - g.position.x;
      const sz = scriptedTarget[2] - g.position.z;
      const sdist = Math.sqrt(sx * sx + sz * sz);
      if (sdist > 0.25) {
        const step = Math.min(3.6 * delta, sdist); // 달려오기 (적당한 속도)
        g.position.x += (sx / sdist) * step;
        g.position.z += (sz / sdist) * step;
        g.rotation.y = Math.atan2(sx, sz);
        moveStateRef.current = "run";
      } else {
        g.rotation.y = Math.atan2(0.3, 1); // 도착 — 카메라(+z 쪽) 바라보기
        moveStateRef.current = "idle";
        if (!arrivedRef.current) {
          arrivedRef.current = true;
          onScriptedArrive?.();
        }
      }
      g.position.y = Math.sin(elapsedRef.current * 5) * 0.07;
      if (onPositionChange) onPositionChange(npc.id, [g.position.x, 0, g.position.z]);
      return;
    } else {
      if (arrivedRef.current) arrivedRef.current = false;
      if (scriptStartedRef.current) scriptStartedRef.current = false;
    }

    // ── 대화 중: 제자리 고정 + 카메라(+z) 바라보기 (진짜 대화하는 느낌) ──
    if ((isActive || forceHold) && !currentAction) {
      const g = groupRef.current;
      g.rotation.y += (0 - g.rotation.y) * Math.min(1, delta * 6);
      g.position.y = Math.sin(elapsedRef.current * 2.2) * 0.03; // 잔잔한 호흡
      moveStateRef.current = "idle";
      return;
    }

    // ── NPC끼리 대화: 멈춰서 서로 마주보기 ──
    if (facePoint && holdUntil && Date.now() < holdUntil && !currentAction) {
      const g = groupRef.current;
      const fx = facePoint[0] - g.position.x;
      const fz = facePoint[2] - g.position.z;
      if (fx * fx + fz * fz > 0.0009) {
        const targetRot = Math.atan2(fx, fz);
        let d = targetRot - g.rotation.y;
        d = Math.atan2(Math.sin(d), Math.cos(d)); // 최단 회전
        g.rotation.y += d * Math.min(1, delta * 6);
      }
      g.position.y = Math.sin(elapsedRef.current * 2.2) * 0.03;
      moveStateRef.current = "idle";
      return;
    }

    const speed = rawMood === "busy" ? 4.2 : rawMood === "sleepy" ? 1.2 : 2.4;
    const height = rawMood === "busy" ? 0.08 : rawMood === "sleepy" ? 0.025 : 0.05;
    const moveSpeed = rawMood === "busy" || rawMood === "excited" ? 0.95 : rawMood === "sleepy" ? 0.22 : 0.48;
    const now = clock.getElapsedTime();
    const isActing = Boolean(currentAction);

    if (!isActing && (now > retargetAtRef.current || distanceToTarget(groupRef.current.position, targetRef.current) < 0.25)) {
      targetRef.current = pickTarget(home, roamRadius, buildings);
      retargetAtRef.current = now + 4 + Math.random() * 7;
    }

    const target = targetRef.current;
    const dx = target[0] - groupRef.current.position.x;
    const dz = target[2] - groupRef.current.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    let walking = false;
    if (isActing) {
      if (actionTarget) {
        const actionDx = actionTarget.position[0] - groupRef.current.position.x;
        const actionDz = actionTarget.position[2] - groupRef.current.position.z;
        if (Math.sqrt(actionDx * actionDx + actionDz * actionDz) > 0.05) {
          groupRef.current.rotation.y = Math.atan2(actionDx, actionDz);
        }
      }
    } else if (dist > 0.05) {
      const step = Math.min(moveSpeed * delta, dist);
      const nextX = groupRef.current.position.x + (dx / dist) * step;
      const nextZ = groupRef.current.position.z + (dz / dist) * step;

      if (isWalkablePosition({x: nextX, z: nextZ}, buildings, {padding: 0.38})) {
        groupRef.current.position.x = nextX;
        groupRef.current.position.z = nextZ;
        groupRef.current.rotation.y = Math.atan2(dx, dz);
        walking = true;
      } else {
        retargetAtRef.current = 0;
      }
    }
    moveStateRef.current = walking ? (rawMood === "busy" || rawMood === "excited" ? "run" : "walk") : "idle";

    groupRef.current.position.y = Math.sin(elapsedRef.current * speed + home[0]) * height;

    if (onPositionChange && now > reportAtRef.current) {
      onPositionChange(npc.id, [groupRef.current.position.x, 0, groupRef.current.position.z]);
      reportAtRef.current = now + 0.4;
    }
  });

  function handlePointer(event: ThreeEvent<PointerEvent>, nextHovered: boolean) {
    event.stopPropagation();
    setHovered(nextHovered);
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    onSelect(npc);
  }

  return (
    <group ref={groupRef} position={home}>
      <group
        onClick={handleClick}
        onPointerEnter={(event) => handlePointer(event, true)}
        onPointerLeave={(event) => handlePointer(event, false)}
        scale={highlighted ? 1.08 : 1}
      >
        <Suspense fallback={null}>
          <NpcWarrior stateRef={moveStateRef} />
        </Suspense>
        {currentAction ? (
          <NpcActionEffect
            action={currentAction}
            color={actionTarget?.accentColor ?? actionColor(currentAction.animationKey)}
            targetName={actionTarget?.name}
          />
        ) : null}
        {/* 클릭 히트박스 (투명) */}
        <mesh position={[0, 0.7, 0]} visible={false}>
          <capsuleGeometry args={[0.3, 0.9, 4, 8]} />
        </mesh>
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.4, 24]} />
          <meshBasicMaterial color={highlighted ? "#7ed957" : "#a9cf8b"} transparent opacity={highlighted ? 0.95 : 0.5} />
        </mesh>
      </group>
      {/* 이름표는 hover/선택 시에만 렌더 (상시 DOM 라벨이 회전 시 끊김 유발) */}
      {highlighted ? (
        <Billboard position={[0, 1.72, 0]}>
          <Html center distanceFactor={8.2} zIndexRange={[10, 0]}>
            <button
              aria-label={"Talk to " + npc.name}
              className="npc-label npc-label-active"
              onClick={() => onSelect(npc)}
              type="button"
            >
              <span className="block">{npc.name}</span>
              {npcState ? <span className="block text-[9px] uppercase tracking-[0.12em] opacity-65">{mood}</span> : null}
            </button>
          </Html>
        </Billboard>
      ) : null}
      {bubbleText ? (
        <Billboard position={[0, 2.28, 0]}>
          <Html center distanceFactor={7.4} zIndexRange={[11, 0]}>
            <div
              className="rounded-xl border border-[#00d4ff]/35 bg-[#050d1a]/92 px-3 py-2 text-center font-mono text-[11px] font-bold leading-5 text-white shadow-2xl"
              style={{width: 180, whiteSpace: "normal", wordBreak: "keep-all"}}
            >
              {bubbleText}
            </div>
          </Html>
        </Billboard>
      ) : null}
    </group>
  );
}

function NpcActionEffect({
  action,
  color,
  targetName
}: {
  action: NpcActionState;
  color: string;
  targetName?: string;
}) {
  const pulseRef = useRef<Group | null>(null);
  const frontRef = useRef<Group | null>(null);

  useFrame(({clock}) => {
    const t = clock.getElapsedTime();
    if (pulseRef.current) {
      const scale = 1 + Math.sin(t * 5.4) * 0.08;
      pulseRef.current.scale.setScalar(scale);
      pulseRef.current.rotation.y = t * 1.2;
    }
    if (frontRef.current) {
      frontRef.current.position.y = 1.05 + Math.sin(t * 3.8) * 0.04;
    }
  });

  return (
    <group>
      <pointLight color={color} decay={2} distance={3.2} intensity={0.9} position={[0, 1.4, 0.3]} />
      <group ref={pulseRef} position={[0, 1.65, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.34, 0.012, 8, 44]} />
          <meshBasicMaterial color={color} transparent opacity={0.72} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.48, 0.008, 8, 44]} />
          <meshBasicMaterial color={color} transparent opacity={0.36} />
        </mesh>
      </group>

      <group ref={frontRef}>{renderActionCue(action.animationKey, color)}</group>

      <Billboard position={[0, 2.08, 0]}>
        <Html center distanceFactor={7.2} zIndexRange={[12, 0]}>
          <div
            className="rounded-full border px-2.5 py-1 text-center font-mono text-[10px] font-black leading-4 shadow-2xl backdrop-blur-md"
            style={{
              background: "rgba(5, 13, 26, 0.9)",
              borderColor: color,
              boxShadow: `0 0 18px ${color}55`,
              color,
              minWidth: 92,
              pointerEvents: "none",
              whiteSpace: "nowrap"
            }}
          >
            <span className="block">{action.label}</span>
            {targetName ? <span className="block text-[9px] text-white/58">{targetName}</span> : null}
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

function renderActionCue(animationKey: NpcAnimationKey, color: string) {
  if (animationKey === "point") {
    return (
      <group position={[0, 0, 0.72]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.055, 0.92, 14]} />
          <meshBasicMaterial color={color} transparent opacity={0.55} />
        </mesh>
        <mesh position={[0, 0, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.11, 0.28, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} />
        </mesh>
      </group>
    );
  }

  if (animationKey === "think") {
    return (
      <group position={[0, 0.62, 0]}>
        {[
          [-0.18, 0.02, 0],
          [0.04, 0.16, 0.02],
          [0.22, 0.02, -0.01]
        ].map(([x, y, z], index) => (
          <mesh key={`${x}-${y}-${z}`} position={[x, y, z]}>
            <sphereGeometry args={[0.055 + index * 0.012, 12, 12]} />
            <meshBasicMaterial color={color} transparent opacity={0.76 - index * 0.12} />
          </mesh>
        ))}
      </group>
    );
  }

  if (animationKey === "type") {
    return (
      <group position={[0, 0, 0.58]} rotation={[-0.18, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.66, 0.38, 0.018]} />
          <meshBasicMaterial color="#06111f" transparent opacity={0.76} />
        </mesh>
        {[0.1, 0, -0.1].map((y, index) => (
          <mesh key={y} position={[0.02, y, 0.014]}>
            <boxGeometry args={[0.42 - index * 0.08, 0.022, 0.01]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
          </mesh>
        ))}
      </group>
    );
  }

  if (animationKey === "send") {
    return (
      <group position={[0, 0, 0.68]}>
        <mesh rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.4, 0.25, 0.035]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, -0.02, -0.25]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.028, 0.56, 10]} />
          <meshBasicMaterial color={color} transparent opacity={0.32} />
        </mesh>
      </group>
    );
  }

  if (animationKey === "open-hologram") {
    return (
      <group position={[0, 0.04, 0.62]} rotation={[-0.12, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.82, 0.48, 0.012]} />
          <meshBasicMaterial color={color} transparent opacity={0.22} />
        </mesh>
        <mesh position={[0, 0, 0.012]}>
          <ringGeometry args={[0.2, 0.215, 34]} />
          <meshBasicMaterial color={color} transparent opacity={0.82} />
        </mesh>
        {[-0.28, 0.28].map((x) => (
          <mesh key={x} position={[x, 0.16, 0.018]}>
            <boxGeometry args={[0.14, 0.045, 0.012]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
          </mesh>
        ))}
      </group>
    );
  }

  if (animationKey === "walk-to-building") {
    return (
      <group position={[0, -0.96, 0.54]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[0.18, 0.22, 24]} />
          <meshBasicMaterial color={color} transparent opacity={0.65} />
        </mesh>
        <mesh position={[0, 0.24, 0]}>
          <coneGeometry args={[0.11, 0.22, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[0, 0.15, 0]}>
      {[0.28, 0.44, 0.6].map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.01, 8, 36]} />
          <meshBasicMaterial color={color} transparent opacity={0.62 - index * 0.16} />
        </mesh>
      ))}
    </group>
  );
}

function actionColor(animationKey: NpcAnimationKey) {
  const colors: Record<NpcAnimationKey, string> = {
    point: "#00d4ff",
    think: "#aa88ff",
    type: "#00ff88",
    send: "#ff9a6c",
    "open-hologram": "#7eb8ff",
    "walk-to-building": "#fbbf24",
    wave: "#a6ff4d"
  };

  return colors[animationKey];
}

function distanceToTarget(position: Vector3, target: Vector3Tuple) {
  const dx = position.x - target[0];
  const dz = position.z - target[2];
  return Math.sqrt(dx * dx + dz * dz);
}

function pickTarget(
  home: Vector3Tuple,
  radius: number,
  buildings: Array<Pick<BuildingData, "id" | "position" | "size">>,
): Vector3Tuple {
  for (let i = 0; i < 12; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distance = radius * (0.25 + Math.random() * 0.75);
    const candidate: Vector3Tuple = [
      home[0] + Math.cos(angle) * distance,
      0,
      home[2] + Math.sin(angle) * distance,
    ];

    if (isWalkablePosition({x: candidate[0], z: candidate[2]}, buildings, {padding: 0.38})) {
      return candidate;
    }
  }

  return home;
}
