# FestFlow

> **증명하는 것**: 수십 개 부스가 동시에 움직이는 축제를 실시간으로 관제하는
> 웹앱을 혼자 만들었다는 것.
>
> **⚠️ 이 문서에서 가장 중요한 발견: 저장소 `docs/` 폴더에 스크린샷 158장이 이미
> 있다.** "이미지 0장"이 아니라 "안 가져온 것"이었다.

- 저장소 `toadsam/FestFlow` · 기간 ~ 2026.05 · 개인 풀스택
- 배포 주소 없음 · 시연 영상 없음

---

## 저장소에서 확인한 사실

| 항목            | 값                                                                                                            | 근거               |
| --------------- | ------------------------------------------------------------------------------------------------------------- | ------------------ |
| 구조            | `backend` 313 · `frontend` 77 · **`docs` 172** · `exports` 45 · `scripts` 15 · `tools` 7                      | 파일 트리          |
| Controller      | **26개**                                                                                                      | `*Controller.java` |
| 프론트          | JSX 23개                                                                                                      | 확장자 집계        |
| **docs 이미지** | **158장** (png 137 + PNG 21)                                                                                  | 〃                 |
| docs 문서       | `FestFlow_홈페이지_마스터_문서.md`, `ai-matach_사용설명서.md`, `ai-matach_admin_관리자설명서.md`, `README.md` | 〃                 |
| 기타            | docx 7 · csv 28 · pdf 1                                                                                       | 〃                 |

### 사이트가 말하는 것보다 훨씬 큰 프로젝트다

사이트에는 **"7개 SSE 채널 + 실제 지도 + GPS 지오펜싱"** 만 적혀 있다.
실제 Controller 26개는 이렇다:

```
AiGuideController        AiMatchController        BoothController
ChatController           EventController          GpsController
LostItemController       NoticeController         ReservationAuthController
TranslateController      UploadAssetController    AdminActionController
AdminAiController        AdminAiMatchController   AdminEventController …
```

**AI 가이드 · AI 매칭 · 실시간 번역 · 분실물 · 예약 인증 · 채팅 · 관리자 도구**가
전부 있는데 사이트에 하나도 안 나온다. `AligoSmsSender` 가 있는 걸 보면 **SMS 발송**도
붙어 있다.

`exports` 45개 · `csv` 28개는 **데이터 내보내기 기능**이 있다는 뜻이고,
`scripts` 15 · `tools` 7은 **운영 스크립트**가 있다는 뜻이다.

---

## 지금 상태 (2026-08-26 갱신 — 상세 페이지 작업 완료)

| 슬롯                  | 상태                                                       |
| --------------------- | ---------------------------------------------------------- |
| 대표 화면 (1:1)       | ✅ `festflow-two-faces.webp` — 방문객 지도 ‖ 관제 무대혼잡 |
| 문제 상황             | ✅ 기획 발표 자료 `problem.webp`                           |
| 시스템 구성도         | ✅ **SVG 2장** — SSE 팬아웃 · 혼잡 예측 폴백               |
| 개선 결과 화면 (21:9) | ✅ `festflow-screens.webp` — 실제 화면 4종 띠              |
| 결과 갤러리 (4:5 ×3)  | ✅ 관리자 콘솔 · AI 챗봇 · 분실물 센터                     |
| 지표                  | ✅ 컨트롤러 26 · SSE 7 · feature 24 · 1인 (+ 출처 각주)    |
| 링크                  | GitHub만 (배포 주소 여전히 없음)                           |
| 라이브 데모           | ✅ 코드로 만든 인터랙티브 데모                             |

**빈 상자 6개 → 0개.** 이미지는 전부 저장소 `docs/assets/` 에 이미 커밋돼 있던
캡처를 골라 남색 판에 앉힌 것이다. 새로 찍은 것은 없다.

### 이번에 저장소에서 검증한 사실

| 항목           | 값                                                                                     | 근거                               |
| -------------- | -------------------------------------------------------------------------------------- | ---------------------------------- |
| SSE 엔드포인트 | **정확히 7개** `/congestion /events /notices /booths /staff /lost-items /reservations` | `StreamController.java`            |
| Controller     | **26개**                                                                               | `*Controller.java`                 |
| 부스 지오펜싱  | `BOOTH_RADIUS_METERS = 80.0`                                                           | `BoothService.java`                |
| 무대 혼잡      | 반경 55m · 수용 기준 4,000명                                                           | `StageCrowdPage.jsx`               |
| 지도 타일      | `tile.openstreetmap.org` (OSM 맞음)                                                    | `StageMapPage.jsx`                 |
| 화면 이원화    | `data-route-scope="public" \| "ops"`                                                   | `App.jsx` · `index.css`            |
| 혼잡 예측      | Java → `ProcessBuilder(python3)` → RandomForest `.pkl`, **20초 타임아웃**              | `PythonCongestionModelService`     |
| 폴백           | 꺼짐 · 파일 없음 · 타임아웃 → 규칙 기반 점수(`MODEL_UNAVAILABLE`)                      | `AiCongestionService`              |
| feature 수     | **24개** (수치 22 + 범주 2)                                                            | `congestion_training_profile.json` |
| 모델 성능      | 규칙 0.70 → RF 0.80 (macro-F1 0.68 → 0.79)                                             | `congestion_model_summary.md`      |
| 학습 데이터    | **시뮬레이션 2,520건** — 실측 아님                                                     | 〃 (본인이 문서에 명시해 둠)       |

마지막 커밋이 2026-06-13 이고 전부 AI 관련이다("JAVA로 파이썬 모델 실행 가능하도록",
"인공지능 기술 추가"). **가장 최근에 한 일이 사이트에 하나도 안 나와 있었다** —
그래서 이번에 예측 파이프라인을 그림 한 장으로 세웠다.

---

## ⚠️ 저장소 개인정보 — 이건 직접 처리해야 한다

**`backend/uploads/` 에 실제 사람 얼굴 사진이 약 90장 커밋돼 있고, 저장소는 공개다.**

```
backend/uploads/ai-profile-original-*.jpg|png   (실제 인물 사진)
backend/uploads/ai-profile-webtoon-*.png        (그 사진을 변환한 것)
backend/uploads/lost-item-*.png
```

AI 프로필 매칭 기능에 올라온 **본인 아닌 사람들의 얼굴**이다. `docs/assets/screenshots/admin/`
관리자 캡처에도 같은 얼굴들이 그대로 찍혀 있어서, 그 캡처들은 이번 작업에서 **전부 제외**했다.

- `.gitignore` 에 `backend/uploads/` 추가 + `git rm -r --cached backend/uploads`
- 이미 푸시된 이력에도 남으므로, 심각하게 볼 거면 히스토리 정리(`git filter-repo`)까지
- 얼굴이 찍힌 관리자 캡처(`admin-desktop.png`, `admin-final-*.png`, `admin-rework*.png`,
  `admin-complete-pulse.png`, `ai-match/admin/*`)도 같이 정리 권장

`AiMatchAdminPhonePurgeRequestDto` 를 만들어 둔 걸 보면 연락처는 지울 수 있게 해 뒀는데,
**업로드 이미지가 리포에 남아 있는 건 놓친 것 같다.** 면접관이 저장소를 열어 보는 상황을
가정하면 이건 기술 얘기 이전의 문제다.

---

## 남은 것

- **배포 주소가 없다.** 프론트만 Vercel 에 올려도 링크가 생긴다.
- **실제 축제에서 썼는지** — 썼다면 그게 이 프로젝트의 결론이다. 몇 개 부스, 며칠, 몇 명.
- **부하 테스트** — 회고에 "부족"이라고 적혀 있다. k6 로 SSE 동시 접속 100~500 만 돌려도
  약점이 강점이 된다.
- **모델 재학습** — 지금 성능 수치는 시뮬레이션 기반이다. 실제 운영 로그가 생기면 그걸로.
- 갤러리에서 뺀 자료: `exports/ml/figures/*.png` (matplotlib 도표). 좋은 근거지만
  갤러리 칸이 390px 라 글씨가 죽어서, 숫자는 지표 각주로 글로 옮겼다.

---

## 면접 예상 질문과 재료

| 질문                             | 답할 재료                                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------------------------- |
| 왜 WebSocket이 아니라 SSE인가요? | 부스 상태는 서버→클라 단방향이다. 양방향이 필요 없으면 SSE가 가볍고 재연결이 표준으로 들어 있다 |
| 채널을 왜 7개로 나눴나요?        | 부스·공지·혼잡도를 한 채널로 보내면 관심 없는 데이터까지 받는다. 종류별 구독으로 부하를 나눴다  |
| GPS 지오펜싱은 어떻게?           | 반경 79m 기준 판정 (`GpsController`)                                                            |
| 동시 접속은 얼마나 버티나요?     | ← **부하 테스트를 안 했다.** 회고에도 그렇게 적혀 있다. 지금이라도 돌려두면 답이 생긴다         |
| 실제로 축제에서 썼나요?          | ← 확인 필요                                                                                     |
| AI 매칭이 뭔가요?                | `AiMatchController` · 관리자용 `AdminAiMatchController` ← 사이트에 설명이 없다                  |
