/**
 * 마을 — 이 포트폴리오의 본편.
 *
 * 여기가 무거운 쪽이다(GLB 87개 · 약 25 MB + three.js). **착륙장(`/`)과 주소를
 * 나눈 것이 그 무게를 가두는 유일한 장치다** — 이 파일이 `/` 로 돌아가는 순간
 * 이력서만 보러 온 사람도 마을을 통째로 받게 된다.
 */

import {AIPortfolioVillage} from "@/components/AIPortfolioVillage";

export default function VillagePage() {
  return <AIPortfolioVillage />;
}
