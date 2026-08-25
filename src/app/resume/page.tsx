/**
 * 이력서 — 한 페이지 요약.
 *
 * ## 왜 별도 주소인가
 *
 * 두 가지다. 하나는 **무게** — `ResumeMode` 의 배경 장식(떠 있는 섬 · 기술
 * 별자리)이 `import * as THREE` 를 한다. 착륙장(`/`)에 인라인으로 붙이면 그
 * 순간 첫 화면이 three 를 받게 되고, 주소를 가른 이유가 사라진다.
 *
 * 다른 하나는 **링크** — 면접관에게 "이거 보세요" 하고 보낼 주소가 하나 생긴다.
 * 마을을 거치지 않고 바로 읽히는 게 이 화면의 목적이라, 주소가 있는 편이 맞다.
 *
 * 마을 안에서도 같은 화면을 볼 수 있다(`AIPortfolioVillage` 의 `viewMode`).
 * 컴포넌트는 하나이고 입구만 둘이다 — 갈라 복사하지 말 것.
 *
 * ## 왜 서버 컴포넌트인가
 *
 * 예전엔 이 파일이 `"use client"` 였고 `ResumeMode` 를 통째로
 * `dynamic(ssr:false)` 로 불렀다. 그 대가가 두 개였다:
 *
 * 1. **서버 HTML 에 이력서 내용이 한 글자도 없었다.** `curl /resume` 로 받아
 *    보면 이름·프로젝트·이메일이 전부 0건. 검색 노출, 카톡/메일 링크 미리보기,
 *    ATS·스크래퍼, HTML→PDF 변환기, JS 를 막는 사내망에서 전부 백지였다.
 * 2. **`export const metadata` 를 낼 수 없었다.** 그래서 이력서 주소가 마을용
 *    제목과 설명을 그대로 쓰고 있었다.
 *
 * three 를 끌고 오는 건 장식 두 개(`FloatingIsle`·`TechConstellation`)뿐이라,
 * 그 둘만 `ResumeMode` 안에서 `ssr:false` 로 가두고 나머지는 서버에서 렌더한다.
 * 번들 무게는 그대로고, 첫 HTML 에 본문이 담긴다.
 */

import type {Metadata} from "next";
import {ResumeClient} from "./ResumeClient";

const title = "정재훈 | Full-Stack (Web) · Unity XR Developer — 이력서";
const description =
  "React · Spring Boot 기반 웹 풀스택 개발자 정재훈의 이력서. 인증/보안(Refresh Token Rotation)과 배포 운영 이슈(HTTPS · Mixed Content · CORS) 해결 경험, 운영 중인 서비스 3개를 포함한 주요 프로젝트 12건.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "profile",
    locale: "ko_KR"
  },
  twitter: {card: "summary_large_image", title, description}
};

export default function ResumePage() {
  return <ResumeClient />;
}
