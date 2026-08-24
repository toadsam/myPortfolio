"use client";

/**
 * 의뢰 공방 — 마을 지하에 숨겨진 제작소.
 *
 * 기존 실내(Lab/Workshop/Archive/Post)와 같은 규칙으로 만든다: **GLB를 쓰지 않고**
 * 상자·원기둥·평면으로 공간을 짜고, 라벨은 <Html>, 시점은 OrbitControls.
 * 나중에 실제 에셋이 생기면 이 파일의 지오메트리만 갈아끼우면 된다.
 *
 * 다만 실내에 NPC가 서는 건 여기가 처음이다. 마을의 `NpcCharacter`는 GLB 로더라
 * 여기서는 쓰지 않고, 같은 절차적 문법으로 만든 `AtelierFigure`를 쓴다.
 *
 * 팔레트는 마을 UI 간판 언어를 따른다 — 랜턴 #ff9d38, 간판금 #e2c078, 밤하늘 #0b1626.
 */

import {ContactShadows, Html, OrbitControls} from "@react-three/drei";
import {Canvas, useFrame} from "@react-three/fiber";
import {motion} from "framer-motion";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef
} from "react";
import {AdditiveBlending, Group, MathUtils, PointLight, Vector3} from "three";
import {atelierNpcs} from "@/data/atelierRoster";
import {requestNpcEncounter} from "@/lib/liveApi";
import type {NPCData} from "@/types/portfolio";

const LANTERN = "#ff9d38";
const GOLD = "#e2c078";
const NIGHT = "#0b1626";
const WOOD = "#4a3220";
const WOOD_DARK = "#2e1e12";

/* ────────────────────────────── NPC 인형 ────────────────────────────── */

function AtelierFigure({
  npc,
  onSelect,
  isIntake,
  speaking = false,
  bubbleText,
  emote
}: {
  npc: NPCData;
  onSelect: (npc: NPCData) => void;
  isIntake: boolean;
  /** 릴레이 설문에서 지금 말하는 식구 — 호버와 같은 들림·발광을 유지한다 */
  speaking?: boolean;
  /** 식구끼리 투닥거릴 때의 말풍선 (E-4 공방 사건) */
  bubbleText?: string;
  /** 마주침 결과 이모지 — 💢/💕 */
  emote?: string;
}) {
  const [hoveredRaw, setHovered] = useState(false);
  const hovered = hoveredRaw || speaking;
  const groupRef = useRef<Group>(null);
  const bobRef = useRef(Math.random() * Math.PI * 2);
  const liftRef = useRef(0);

  useFrame((_, delta) => {
    bobRef.current += delta * 1.4;
    // 보간 계수는 반드시 1 이하로 묶는다. 접수 패널이 캔버스를 덮는 동안
    // 프레임루프가 쉬었다 재개되면 delta 가 몇 초 단위로 커지는데, 그때
    // delta*7 이 1 을 넘으면 lerp 가 목표를 지나쳐 인형이 바닥 아래로 꺼진다
    // (실제로 도안이 통째로 사라졌다 — 라벨과 발밑 고리만 남았다).
    liftRef.current = MathUtils.lerp(
      liftRef.current,
      hovered ? 1 : 0,
      Math.min(1, delta * 7)
    );
    if (groupRef.current) {
      // 살짝 숨 쉬는 정도의 상하 움직임 — 정지한 인형처럼 보이지 않게
      groupRef.current.position.y =
        Math.sin(bobRef.current) * 0.025 + liftRef.current * 0.08;
    }
  });

  // 광원을 걷어낸 만큼 자체발광을 올려 호버 반응이 여전히 읽히게 한다
  const glow = hovered ? 1.05 : 0.3;

  return (
    <group
      position={npc.position}
      onClick={event => {
        event.stopPropagation();
        onSelect(npc);
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <group ref={groupRef}>
        {/* 몸통 */}
        <mesh castShadow position={[0, 0.62, 0]}>
          <capsuleGeometry args={[0.26, 0.62, 6, 14]} />
          <meshStandardMaterial
            color={npc.color}
            emissive={npc.color}
            emissiveIntensity={glow * 0.4}
            roughness={0.55}
          />
        </mesh>
        {/* 앞치마 — 공방 식구라는 표식 */}
        <mesh position={[0, 0.5, 0.24]}>
          <boxGeometry args={[0.34, 0.42, 0.04]} />
          <meshStandardMaterial color={npc.accessoryColor} roughness={0.75} />
        </mesh>
        {/* 머리 */}
        <mesh castShadow position={[0, 1.22, 0]}>
          <sphereGeometry args={[0.23, 20, 16]} />
          <meshStandardMaterial
            color="#f3e6c8"
            emissive={npc.color}
            emissiveIntensity={glow * 0.25}
            roughness={0.6}
          />
        </mesh>
        {/* 눈 */}
        {[-0.085, 0.085].map(x => (
          <mesh key={x} position={[x, 1.25, 0.2]}>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshBasicMaterial color={NIGHT} />
          </mesh>
        ))}
        {/* 팔 */}
        {[-0.32, 0.32].map(x => (
          <mesh key={x} castShadow position={[x, 0.66, 0]}>
            <capsuleGeometry args={[0.075, 0.34, 4, 8]} />
            <meshStandardMaterial color={npc.color} roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* 발밑 고리 — 클릭할 수 있다는 신호 */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.54, 32]} />
        <meshBasicMaterial
          color={npc.color}
          transparent
          opacity={hovered ? 0.75 : 0.18}
        />
      </mesh>

      {/* NPC마다 실광원을 달았더니 이 방에만 pointLight 가 12개가 됐다.
          표준 재질은 광원 수만큼 프래그먼트 비용이 붙는다 — 존재감은
          emissive 와 발밑 고리로 충분하므로 광원은 걷어냈다. */}

      {bubbleText ? (
        <Html
          center
          distanceFactor={10}
          position={[0, 2.45, 0]}
          zIndexRange={[8, 0]}
        >
          <div
            style={{
              pointerEvents: "none",
              userSelect: "none",
              width: 170,
              borderRadius: 11,
              border: "1.5px solid rgba(226,192,120,0.5)",
              background: "rgba(11,22,38,0.94)",
              padding: "6px 10px",
              fontFamily: "system-ui, sans-serif",
              fontSize: 11,
              lineHeight: 1.45,
              color: "#e8eef7",
              textAlign: "center"
            }}
          >
            {bubbleText}
          </div>
        </Html>
      ) : emote ? (
        <Html
          center
          distanceFactor={10}
          position={[0, 2.45, 0]}
          zIndexRange={[8, 0]}
        >
          <div
            style={{pointerEvents: "none", userSelect: "none", fontSize: 26}}
          >
            {emote}
          </div>
        </Html>
      ) : null}
      <Html
        center
        distanceFactor={11}
        position={[0, 1.95, 0]}
        zIndexRange={[6, 0]}
      >
        <div
          style={{
            pointerEvents: "none",
            userSelect: "none",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
            whiteSpace: "nowrap"
          }}
        >
          <div
            style={{
              display: "inline-block",
              borderRadius: 9,
              border: `1.5px solid ${
                hovered ? npc.color : "rgba(226,192,120,0.35)"
              }`,
              background: "rgba(11,22,38,0.9)",
              padding: "4px 11px",
              boxShadow: hovered ? `0 0 16px ${npc.color}66` : "none"
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 900,
                color: hovered ? npc.color : GOLD,
                letterSpacing: "0.06em"
              }}
            >
              {npc.name}
            </span>
            <span style={{fontSize: 9, color: "#a9bdd6", marginLeft: 6}}>
              {npc.role}
            </span>
          </div>
          {hoveredRaw ? (
            <div
              style={{
                marginTop: 4,
                fontSize: 9,
                fontWeight: 900,
                color: npc.color,
                letterSpacing: "0.1em"
              }}
            >
              {isIntake ? "의뢰 접수하기 →" : "말 걸기 →"}
            </div>
          ) : null}
        </div>
      </Html>
    </group>
  );
}

/* ────────────────────────────── 작업대 ────────────────────────────── */

/** 직군을 한눈에 알아볼 소품을 얹은 작업대. kind로 위에 놓이는 물건이 갈린다. */
function Workbench({
  position,
  color,
  kind
}: {
  position: [number, number, number];
  color: string;
  kind: "planner" | "designer" | "frontend" | "backend";
}) {
  return (
    <group position={position}>
      {/* 상판 + 다리 */}
      <mesh castShadow receiveShadow position={[0, 0.72, 0]}>
        <boxGeometry args={[2.6, 0.1, 1.1]} />
        <meshStandardMaterial color={WOOD} roughness={0.65} />
      </mesh>
      {[-1.15, 1.15].map(x =>
        [-0.42, 0.42].map(z => (
          <mesh key={`${x}-${z}`} castShadow position={[x, 0.35, z]}>
            <boxGeometry args={[0.11, 0.72, 0.11]} />
            <meshStandardMaterial color={WOOD_DARK} roughness={0.8} />
          </mesh>
        ))
      )}

      {kind === "planner" ? (
        <group position={[0, 1.15, -0.2]}>
          {/* 화이트보드 + 포스트잇 */}
          <mesh castShadow>
            <boxGeometry args={[1.7, 0.95, 0.05]} />
            <meshStandardMaterial color="#f3e6c8" roughness={0.7} />
          </mesh>
          {[
            [-0.5, 0.22],
            [-0.1, 0.26],
            [0.32, 0.18],
            [-0.34, -0.12],
            [0.14, -0.16]
          ].map(([x, y], i) => (
            <mesh key={i} position={[x!, y!, 0.032]}>
              <planeGeometry args={[0.28, 0.24]} />
              <meshBasicMaterial color={i % 2 ? "#f5d26b" : color} />
            </mesh>
          ))}
        </group>
      ) : null}

      {kind === "designer" ? (
        <group position={[0, 0.8, 0]}>
          {/* 색 견본 스와치 */}
          {["#c69af0", "#ff9d38", "#7ecf68", "#f3e6c8", "#5f7be8"].map(
            (c, i) => (
              <mesh
                key={c}
                castShadow
                position={[-0.9 + i * 0.45, 0.03, 0]}
                rotation={[-Math.PI / 2, 0, (i - 2) * 0.08]}
              >
                <planeGeometry args={[0.36, 0.62]} />
                <meshBasicMaterial color={c} />
              </mesh>
            )
          )}
          {/* 세워둔 시안 보드 */}
          <mesh castShadow position={[0, 0.62, -0.42]} rotation={[-0.22, 0, 0]}>
            <boxGeometry args={[1.3, 0.9, 0.04]} />
            <meshStandardMaterial color="#f8f0dc" roughness={0.6} />
          </mesh>
        </group>
      ) : null}

      {kind === "frontend" ? (
        <group position={[0, 0.8, -0.15]}>
          {/* 모니터 두 대 */}
          {[-0.62, 0.62].map((x, i) => (
            <group key={x} position={[x, 0.42, 0]} rotation={[0, -x * 0.25, 0]}>
              <mesh castShadow>
                <boxGeometry args={[1.05, 0.66, 0.05]} />
                <meshStandardMaterial color="#1b2a3d" roughness={0.4} />
              </mesh>
              <mesh position={[0, 0, 0.031]}>
                <planeGeometry args={[0.95, 0.56]} />
                <meshBasicMaterial color={i ? "#1e3a4f" : color} />
              </mesh>
              {/* 화면 속 코드 줄 흉내 */}
              {[0.16, 0.06, -0.04, -0.14].map((y, j) => (
                <mesh key={y} position={[-0.2 + j * 0.05, y, 0.033]}>
                  <planeGeometry args={[0.4 - j * 0.06, 0.03]} />
                  <meshBasicMaterial
                    color="#f3e6c8"
                    transparent
                    opacity={0.5}
                  />
                </mesh>
              ))}
              <mesh castShadow position={[0, -0.42, 0]}>
                <cylinderGeometry args={[0.14, 0.18, 0.04, 10]} />
                <meshStandardMaterial color="#2e3f52" roughness={0.5} />
              </mesh>
            </group>
          ))}
        </group>
      ) : null}

      {kind === "backend" ? (
        <group position={[0, 0, -0.25]}>
          {/* 서버랙 */}
          <mesh castShadow receiveShadow position={[0, 0.95, 0]}>
            <boxGeometry args={[1.05, 1.9, 0.7]} />
            <meshStandardMaterial color="#1b2536" roughness={0.55} />
          </mesh>
          {[0.35, 0.72, 1.09, 1.46].map((y, i) => (
            <group key={y}>
              <mesh position={[0, y, 0.36]}>
                <planeGeometry args={[0.9, 0.24]} />
                <meshStandardMaterial color="#121a28" roughness={0.6} />
              </mesh>
              {/* 상태 LED — 층마다 색이 다르게 */}
              <mesh position={[0.32, y, 0.375]}>
                <circleGeometry args={[0.028, 10]} />
                <meshBasicMaterial color={i % 3 === 0 ? "#7ecf68" : color} />
              </mesh>
              <mesh position={[0.22, y, 0.375]}>
                <circleGeometry args={[0.028, 10]} />
                <meshBasicMaterial color="#2e4258" />
              </mesh>
            </group>
          ))}
          {/* 랙 앞에 고이는 파란 빛 — 실광원 대신 가산 원반(마을 LampPools 수법) */}
          <mesh position={[0, 0.014, 0.75]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.1, 20]} />
            <meshBasicMaterial
              blending={AdditiveBlending}
              color={color}
              depthWrite={false}
              opacity={0.16}
              transparent
            />
          </mesh>
        </group>
      ) : null}
    </group>
  );
}

/* ────────────────────────────── 방 ────────────────────────────── */

/** 벽에 매달린 랜턴 — 마을 LampPools와 같은 리듬으로 흔들린다. */
function Lantern({position}: {position: [number, number, number]}) {
  const lightRef = useRef<PointLight>(null);
  const tRef = useRef(Math.random() * 10);

  useFrame((_, delta) => {
    tRef.current += delta;
    if (lightRef.current) {
      lightRef.current.intensity =
        3.6 +
        Math.sin(tRef.current * 2.6) * 0.3 +
        Math.sin(tRef.current * 7.1) * 0.14;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.84, 5]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
      </mesh>
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.36, 0.3]} />
        <meshStandardMaterial
          color={LANTERN}
          emissive={LANTERN}
          emissiveIntensity={1.1}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 0.21, 0]}>
        <coneGeometry args={[0.26, 0.16, 4]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.8} />
      </mesh>
      {/* 랜턴 주변에 퍼지는 빛무리 — 광원만으로는 랜턴이 '켜져 있다'는 게 안 읽힌다 */}
      <mesh>
        <sphereGeometry args={[0.62, 12, 10]} />
        <meshBasicMaterial
          color="#ffbe74"
          depthWrite={false}
          opacity={0.13}
          transparent
        />
      </mesh>
      <pointLight
        ref={lightRef}
        castShadow={false}
        color="#ffbe74"
        decay={1.5}
        distance={22}
        intensity={3.6}
      />
    </group>
  );
}

function AtelierRoom() {
  // 바닥 돌판 — 규칙적이되 살짝 색이 갈리게
  const tiles = useMemo(() => {
    const out: {key: string; x: number; z: number; tone: string}[] = [];
    for (let ix = -4; ix <= 4; ix += 1) {
      for (let iz = -3; iz <= 3; iz += 1) {
        const mixed = (ix + iz) % 2 === 0;
        out.push({
          key: `${ix}-${iz}`,
          x: ix * 1.8,
          z: iz * 1.8,
          tone: mixed ? "#2a374d" : "#222e42"
        });
      }
    }
    return out;
  }, []);

  return (
    <group>
      {/* 바닥 */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#202c3f" roughness={0.9} />
      </mesh>
      {tiles.map(tile => (
        <mesh
          key={tile.key}
          position={[tile.x, 0.006, tile.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[1.7, 1.7]} />
          <meshStandardMaterial color={tile.tone} roughness={0.95} />
        </mesh>
      ))}

      {/* 벽 — 지하라 천장이 낮다 */}
      {(
        [
          {pos: [0, 1.75, -7], rot: [0, 0, 0], size: [18, 3.5]},
          {pos: [0, 1.75, 7], rot: [0, Math.PI, 0], size: [18, 3.5]},
          {pos: [-9, 1.75, 0], rot: [0, Math.PI / 2, 0], size: [14, 3.5]},
          {pos: [9, 1.75, 0], rot: [0, -Math.PI / 2, 0], size: [14, 3.5]}
        ] as const
      ).map((wall, i) => (
        <mesh
          key={i}
          receiveShadow
          position={wall.pos as unknown as [number, number, number]}
          rotation={wall.rot as unknown as [number, number, number]}
        >
          <planeGeometry args={wall.size as unknown as [number, number]} />
          <meshStandardMaterial color="#2f3d55" roughness={0.95} />
        </mesh>
      ))}

      {/* 천장 + 들보 */}
      <mesh position={[0, 3.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#1b2536" roughness={1} />
      </mesh>
      {[-4.5, -1.5, 1.5, 4.5].map(z => (
        <mesh key={z} castShadow position={[0, 3.36, z]}>
          <boxGeometry args={[18, 0.24, 0.3]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.85} />
        </mesh>
      ))}

      {/* 벽 아래 굽도리 — 지하 석벽 느낌 */}
      {[-6.9, 6.9].map(z => (
        <mesh key={z} position={[0, 0.28, z]}>
          <boxGeometry args={[18, 0.56, 0.2]} />
          <meshStandardMaterial color="#38465e" roughness={0.9} />
        </mesh>
      ))}

      {/* 들어온 계단 — 뒤쪽 벽에서 위로 뚫린 통로 */}
      <group position={[0, 0, 6.1]}>
        {[0, 1, 2, 3].map(i => (
          <mesh
            key={i}
            castShadow
            receiveShadow
            position={[0, 0.16 + i * 0.32, i * 0.42]}
          >
            <boxGeometry args={[2.6, 0.32, 0.42]} />
            <meshStandardMaterial color="#26334a" roughness={0.9} />
          </mesh>
        ))}
        {/* 계단 위에서 새어 들어오는 바깥 빛 */}
        <pointLight
          color="#7fa8d8"
          decay={2}
          distance={7}
          intensity={0.9}
          position={[0, 2.4, 1.4]}
        />
      </group>

      {/* 랜턴 — 방을 밝히는 **유일한** 실광원이라 개수를 셋으로 묶는다.
          다섯 개까지 늘렸더니 NPC·서버랙 광원까지 합쳐 pointLight 가 12개가 됐고
          그만큼 프래그먼트 비용이 곱해졌다. 광량은 개수 대신 세기로 채운다. */}
      {(
        [
          // 셋째는 x=0 에 두면 안 된다 — 카메라와 뒷벽 현판이 같은 축이라
          // 랜턴 상자가 "의 뢰 공 방" 글자를 정면으로 가린다.
          [-5.6, 2.9, -3.6],
          [5.6, 2.9, -3.6],
          [-3.2, 2.9, 2.6]
        ] as [number, number, number][]
      ).map((pos, i) => (
        <Lantern key={i} position={pos} />
      ))}

      {/* 접수대 — 방 한가운데 */}
      <group position={[0, 0, -0.35]}>
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[3.4, 1, 1.05]} />
          <meshStandardMaterial color={WOOD} roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.03, 0]}>
          <boxGeometry args={[3.6, 0.08, 1.2]} />
          <meshStandardMaterial
            color={GOLD}
            metalness={0.25}
            roughness={0.45}
          />
        </mesh>
        {/* 접수대 위 도면과 잉크병 */}
        <mesh position={[-0.75, 1.09, 0.05]} rotation={[-Math.PI / 2, 0, 0.14]}>
          <planeGeometry args={[0.9, 0.62]} />
          <meshBasicMaterial color="#f3e6c8" />
        </mesh>
        <mesh castShadow position={[0.95, 1.16, 0.1]}>
          <cylinderGeometry args={[0.09, 0.11, 0.18, 10]} />
          <meshStandardMaterial color="#1b2536" roughness={0.4} />
        </mesh>
      </group>

      {/* 공방 현판 */}
      <group position={[0, 2.5, -6.85]}>
        <mesh castShadow>
          <boxGeometry args={[4.4, 1, 0.14]} />
          <meshStandardMaterial color={WOOD} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[4, 0.68, 0.02]} />
          <meshStandardMaterial
            color={GOLD}
            emissive={GOLD}
            emissiveIntensity={0.22}
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>
        <Html
          center
          distanceFactor={13}
          position={[0, 0, 0.11]}
          zIndexRange={[4, 0]}
        >
          <div
            style={{
              pointerEvents: "none",
              userSelect: "none",
              whiteSpace: "nowrap",
              fontFamily: "'Gowun Batang', serif",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.22em",
              color: "#3a2812"
            }}
          >
            의 뢰 공 방
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ────────────────────────────── 씬 ────────────────────────────── */

const BENCHES: {
  position: [number, number, number];
  color: string;
  kind: "planner" | "designer" | "frontend" | "backend";
}[] = [
  {position: [-4.75, 0, -2.7], color: "#7ecf68", kind: "planner"},
  {position: [-4.75, 0, 1.9], color: "#c69af0", kind: "designer"},
  {position: [4.75, 0, -2.7], color: "#68c7cf", kind: "frontend"},
  {position: [4.75, 0, 1.9], color: "#5f7be8", kind: "backend"}
];

/**
 * 릴레이 설문의 카메라 — 말하는 식구 앞으로 부드럽게 옮겨 간다.
 *
 * 설문 중에는 **손님이 돌리던 시점을 덮어쓴다.** 대신 목표에 닿으면 손을 떼서
 * 그 자리에서 다시 돌려볼 수 있게 한다(닿기 전까지만 lerp). 카메라 위치는 식구 자리에서
 * 방 앞쪽(z=6, 계단 쪽)을 향해 3.2 떨어진 곳 — 벽(z=7, x=±6) 안쪽이라 뚫리지 않는다.
 */
function CameraRig({
  focus,
  controls
}: {
  focus: [number, number, number] | null;
  controls: React.RefObject<ComponentRef<typeof OrbitControls> | null>;
}) {
  const goalTarget = useRef(new Vector3());
  const goalCamera = useRef(new Vector3());
  const settled = useRef(true);

  useEffect(() => {
    if (!focus) {
      settled.current = true;
      return;
    }
    const [x, , z] = focus;
    // 설문 HUD 가 화면 아래 절반을 덮는다. 식구가 **위쪽 1/3** 에 오도록 발밑보다
    // 낮은 점을 겨누고, 카메라는 조금 높고 멀리 둔다.
    goalTarget.current.set(x, -0.05, z);
    const dx = 0 - x;
    const dz = 6 - z;
    const len = Math.hypot(dx, dz) || 1;
    goalCamera.current.set(x + (dx / len) * 3.6, 2.3, z + (dz / len) * 3.6);
    settled.current = false;
  }, [focus]);

  useFrame(({camera}, delta) => {
    const orbit = controls.current;
    if (!orbit || settled.current) return;
    const k = Math.min(1, delta * 3.2);
    orbit.target.lerp(goalTarget.current, k);
    camera.position.lerp(goalCamera.current, k);
    orbit.update();
    if (
      camera.position.distanceTo(goalCamera.current) < 0.04 &&
      orbit.target.distanceTo(goalTarget.current) < 0.04
    ) {
      settled.current = true;
    }
  });

  return null;
}

interface Props {
  onBack: () => void;
  onSelectNpc: (npc: NPCData) => void;
  /** 릴레이 설문에서 지금 말하는 식구의 id. 카메라가 따라가고 인형이 들린다. */
  focusNpcId?: string | null;
  /** 설문 HUD 가 바닥을 차지할 때 조작 안내를 숨긴다 */
  hideHints?: boolean;
}

/** 공방 식구끼리의 마주침 루프 (5단계 E-4).
 *
 * 마을의 checkEncounter 는 거리 기반이지만 여기는 넷이 늘 한 방이라 타이머로 간다.
 * 대사는 백엔드 /npc/encounter — 직군별 사건 템플릿(체리의 "범위를 또 늘림" 류)이
 * 이 방에서 처음으로 실제로 일어난다. 관계·기억·마을 소식도 똑같이 쌓인다.
 */
function useAtelierSocialLoop(paused: boolean) {
  const [bubbles, setBubbles] = useState<Record<string, string>>({});
  const [emotes, setEmotes] = useState<Record<string, string>>({});
  const busyRef = useRef(false);
  const nextAtRef = useRef(Date.now() + 90000); // 입장 90초 뒤 첫 마주침
  const timersRef = useRef<number[]>([]);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const team = atelierNpcs.filter(npc => npc.id !== "atelier-intake-npc");
    const tick = async () => {
      if (pausedRef.current || busyRef.current) return;
      if (typeof document !== "undefined" && document.hidden) return;
      if (Date.now() < nextAtRef.current) return;
      busyRef.current = true;
      try {
        const pick = [...team].sort(() => Math.random() - 0.5).slice(0, 2);
        const [a, b] = [pick[0]!, pick[1]!];
        const res = await requestNpcEncounter(
          {npc_id: a.id, mood: "calm", energy: 55, recent_memory: []},
          {npc_id: b.id, mood: "calm", energy: 55, recent_memory: []},
          []
        );
        const stepMs = 2600;
        res.dialogue.forEach((line, i) => {
          timersRef.current.push(
            window.setTimeout(() => {
              setBubbles({[line.npc_id]: line.text});
            }, i * stepMs)
          );
        });
        const endMs = res.dialogue.length * stepMs;
        timersRef.current.push(
          window.setTimeout(() => {
            setBubbles({});
            const delta = res.relationship?.delta ?? 0;
            if (Math.abs(delta) >= 2) {
              const emote = delta < 0 ? "💢" : "💕";
              setEmotes({[a.id]: emote, [b.id]: emote});
              timersRef.current.push(
                window.setTimeout(() => setEmotes({}), 1600)
              );
            }
          }, endMs)
        );
        nextAtRef.current =
          Date.now() + Math.max(res.cooldown_seconds * 1000, 120000);
      } catch {
        nextAtRef.current = Date.now() + 180000; // 백엔드 오프라인 — 조용히 쉼
      } finally {
        busyRef.current = false;
      }
    };
    const id = window.setInterval(tick, 5000);
    return () => {
      window.clearInterval(id);
      timersRef.current.forEach(t => window.clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  return {bubbles, emotes};
}

export function AtelierInterior({
  onBack,
  onSelectNpc,
  focusNpcId = null,
  hideHints = false
}: Props) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  // 설문(릴레이)이 진행 중이면 focusNpcId 가 잡혀 있다 — 그동안 식구끼리 잡담은 쉰다
  const social = useAtelierSocialLoop(!!focusNpcId || hideHints);
  const focus = useMemo<[number, number, number] | null>(() => {
    const npc = focusNpcId
      ? atelierNpcs.find(item => item.id === focusNpcId)
      : null;
    return npc ? npc.position : null;
  }, [focusNpcId]);

  const uiIn = (delay: number) => ({
    initial: {opacity: 0, y: 10},
    animate: {opacity: 1, y: 0},
    transition: {duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const}
  });

  return (
    <div className="fixed inset-0 z-40 bg-[#0b1626]">
      <Canvas
        // 카메라는 반드시 방 **안**에 있어야 한다. z=10.5(벽은 z=7)에 뒀더니
        // 앞 벽의 뒷면이 컬링돼 그대로 통과해 보였고, 벽 위로 배경이 드러나
        // 방이 아니라 무대처럼 보였다. OrbitControls 의 maxDistance 도 같은 이유로 묶는다.
        // 화각이 좁으면 양끝 작업대(x=±4.6)가 잘린다. 카메라를 더 빼면 벽을
        // 뚫으므로, 거리 대신 fov 로 넓힌다.
        camera={{fov: 68, position: [0, 3.3, 6.5]}}
        dpr={[1, 1.75]}
        gl={{antialias: true}}
        shadows
      >
        <color args={[NIGHT]} attach="background" />
        {/* 안개는 방보다 멀리서 시작해야 한다. 14부터 걸었더니 뒷벽(≈17 거리)이
            통째로 배경색에 먹혀 '허공에 뜬 가구'처럼 보였다. */}
        <fog args={[NIGHT, 26, 52]} attach="fog" />
        <ambientLight intensity={0.72} />
        <hemisphereLight args={["#5b7ea8", "#241a10", 1.0]} />
        <directionalLight
          castShadow
          color="#ffcf9a"
          intensity={0.55}
          position={[3, 7, 5]}
          shadow-mapSize={[1024, 1024]}
        />
        {/* 계단 쪽에서 들어오는 찬 빛 — 지하라는 인상을 만드는 반대편 광원 */}
        <directionalLight
          color="#8fb4dd"
          intensity={0.3}
          position={[0, 5, 9]}
        />

        <Suspense fallback={null}>
          <AtelierRoom />

          {BENCHES.map(bench => (
            <Workbench
              key={bench.kind}
              color={bench.color}
              kind={bench.kind}
              position={bench.position}
            />
          ))}

          {atelierNpcs.map(npc => (
            <AtelierFigure
              key={npc.id}
              bubbleText={social.bubbles[npc.id]}
              emote={social.emotes[npc.id]}
              isIntake={npc.id === "atelier-intake-npc"}
              npc={npc}
              onSelect={onSelectNpc}
              speaking={npc.id === focusNpcId}
            />
          ))}

          <CameraRig controls={controlsRef} focus={focus} />

          <ContactShadows
            blur={2.6}
            far={5}
            opacity={0.4}
            position={[0, 0.012, 0]}
            scale={22}
          />
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            maxDistance={7.3}
            maxPolarAngle={Math.PI / 2.05}
            minDistance={2.6}
            minPolarAngle={Math.PI / 5}
            target={[0, 1.15, -0.4]}
          />
        </Suspense>
      </Canvas>

      <motion.button
        {...uiIn(0.3)}
        className="v-panel fixed left-4 top-4 z-50 flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[#f3e6c8] transition hover:brightness-125"
        onClick={onBack}
        type="button"
        whileHover={{x: -2}}
        whileTap={{scale: 0.96}}
      >
        ← 마을로 돌아가기
      </motion.button>

      <motion.div
        {...uiIn(0.4)}
        className="v-panel pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 px-5 py-2"
      >
        <span className="v-serif text-[13px] text-[#e2c078]">
          지하 의뢰 공방
        </span>
      </motion.div>

      {hideHints ? null : (
        <motion.div
          {...uiIn(0.55)}
          className="v-panel pointer-events-none fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2.5 text-[9px]"
        >
          <span className="text-[#a9bdd6]/70">🖱 드래그</span>
          <span className="font-bold text-[#f3e6c8]">시점 회전</span>
          <span className="mx-1.5 h-3 w-px bg-[#e2c078]/25" />
          <span className="text-[#a9bdd6]/70">🖱 스크롤</span>
          <span className="font-bold text-[#f3e6c8]">줌</span>
          <span className="mx-1.5 h-3 w-px bg-[#e2c078]/25" />
          <span className="text-[#a9bdd6]/70">도안에게 말 걸면</span>
          <span className="font-bold text-[#ff9d38]">의뢰 접수</span>
        </motion.div>
      )}
    </div>
  );
}
