# 사실 대조표 — 저장소 원본 vs 3D 마을(data.ts) vs 프롬프트 팩(specs)

> 작성 2026-07-31. 근거: 실제 GitHub 저장소 코드 + `src/portfolio.js`(배포 사이트 원본).
> 판정 기호: ✅ 검증됨(코드 증거 있음) · ⚠️ 부분 불일치 · ❌ 사실과 다름 · ❓ 근거 못 찾음

---

## 0. 저장소 확정 매핑

| 마을 id | 실제 저장소 | 상태 | 비고 |
|---|---|---|---|
| mywave | `toadsam/MyStock-Desk` | public | **독립 저장소 없음.** `frontend/src/mywave/` + `backend/.../dashboard/MyWaveDashboard*` |
| mystock | `toadsam/MyStock-Desk` | public | mywave와 **동일 저장소**. 현재 `App.tsx`는 `<MyWaveApp />`만 렌더 |
| festflow | `toadsam/FestFlow` | public | Java Spring + React |
| muscleup | `toadsam/Ajou_MuscleUp` | public | 배포 `musclehub.co.kr` |
| aclub | `aClub2026/FE` | public | 배포 `aclub.co.kr` |
| ajouchong | `toadsam/ajouchong-web` | public | 배포 `ajouchong.com`, Docker+Nginx |
| sign-language | `toadsam/Sign-Language` | public | Spring + Expo(React Native) |
| ajou-adventure | `toadsam/Ajou_Mini_Game` | public | **「아주분투」 Phaser 3 웹게임.** Unity 아님 |
| darklab | `toadsam/DarkLab` | public | Unity 2022.3.2f1, 3.2GB |
| tserof | `KimEoJin24/TSEROF` | **private** | 접근 가능(협업자). Steam 출시 |

### 🔴 구조적 문제 1 — MyWave/MyStock이 저장소 1개
두 방 모두 GitHub 링크가 `MyStock-Desk` 하나로 갑니다. 별개 프로젝트 2개처럼 전시하면
링크를 눌러본 면접관에게 바로 드러납니다. **한 서비스의 두 화면으로 묶거나, 방 하나를 접어야 합니다.**

### 🔴 구조적 문제 2 — 「유일한 실배포 서비스」는 거짓
`00-OVERVIEW.md`/`_STATUS.md`가 06 ajouchong을 "유일한 실배포"로 규정하지만,
실제 운영 중인 서비스는 **musclehub.co.kr · aclub.co.kr · ajouchong.com 3개**이고
TSEROF는 **Steam 출시**까지 됐습니다. 06의 방 컨셉 전제를 고쳐야 합니다.

---

## 1. data.ts 트러블슈팅 20건 판정

| # | 프로젝트 | data.ts 주장 | 판정 | 근거 |
|---|---|---|---|---|
| 1 | mystock | 외부 시세/뉴스 실패 시 화면이 빔 | ✅ | `YahooFinanceMarketDataProvider` `GoogleNewsRssProvider` `OpenDartClient` `SecDisclosureProvider` 실존 |
| 2 | mystock | AI가 '사세요/파세요'로 답함 | ✅ | `PortfolioReportService:56` "매수·매도 추천이나 투자 자문이 아닙니다" + `PortfolioReportDto.disclaimer` + 체크리스트 문구 |
| 3 | festflow | EventSource가 끊긴 채 복구 안 됨 | ✅ | `StreamController.java` `StreamService.java` + `frontend/src/api.js` EventSource |
| 4 | festflow | 모든 상태를 한 채널로 밀면 부하 | ✅ | 위와 동일 계층 |
| 5 | muscleup | 라운지 상태를 REST로 처리 어려움 | ✅ | `realtime/src/server.ts` **socket.io** + `socket.io-client ^4.8.1` |
| 6 | muscleup | 브라우저·배포 환경에서 인증이 다름 | ✅ | portfolio.js "HTTPS/CORS 반복 발생" + JWT 이중 쿠키/Refresh Rotation |
| 7 | aclub | 여러 화면이 같은 데이터를 제각각 호출 | ❓ | 코드 미확인 |
| 8 | aclub | 권한 체크가 화면마다 흩어져 누락 | ❓ | 코드 미확인 |
| 9 | ajouchong | 새로고침하면 404 | ✅ | `nginx.conf`: `try_files $uri /index.html;` + `error_page 404 /index.html;` |
| 10 | ajouchong | 로컬은 되는데 서버에선 다름 | ✅ | `Dockerfile` 멀티스테이지 + `ARG REACT_APP_GOOGLE_CLIENT_ID` 빌드타임 주입 |
| 11 | sign-language | '감사합니다'와 '감사 합니다'가 다른 답 | ❌ | **퀴즈가 4지선다.** `QuizService:90` `correctChoiceId.equals(selectedChoiceId)`, 프론트 `CHOICE_IDS=['A','B','C','D']`. 텍스트 입력 자체가 없음 |
| 12 | sign-language | 단어 데이터와 동작이 어긋남 | ✅ | `StorageVideoCache.findUrlOrFallback(word, fallbackUrl)` — Storage 조회 실패 시 Firestore URL 폴백. **단, 아바타가 아니라 영상** |
| 13 | darklab | 카메라 전환이 뚝뚝 끊김 | ✅ | README: Cinemachine, 카메라 전환/유지/시야방해 처리 |
| 14 | darklab | 조사 가능한 오브젝트 인지 못함 | ✅ | README: 레이캐스트 기반 오브젝트 상호작용 |
| 15 | ajou-adventure | 큰 스프라이트가 실제보다 크게 부딪힘 | ✅ | README: 원본 PNG가 큰 캔버스라 `sourceRect`로 크롭, `platformConfig`의 `bodyWidth/bodyHeight/bodyOffsetX/bodyOffsetY` |
| 16 | ajou-adventure | 손으로 반복 테스트하기 어려움 | ✅ | `playtest-output-*` **29개 폴더** + `playtest-log.json`/`gap-log.json`/`spacing-log.json`/`wire-debug.json` 실측 로그 |
| 17 | tserof | 같은 씬을 여럿이 건드려 머지 충돌 | ❓ | 팀 5명·씬 6개는 확인. 충돌 자체의 증거는 저장소에 없음 |
| 18 | tserof | 발판 끝에서 점프하면 무시됨 | ⚠️ | 문제는 개연성 있으나 **해결책이 코요테 타임이 아님.** `ForceReceiver.CheckIsGrounded()`가 `Ray[4]`(앞/뒤/좌/우 `±0.25f` 오프셋) + `LayerMask.GetMask("Ground")` |

> data.ts 20건 중 **명확히 거짓 1건(#11)**, 해결책이 틀린 것 1건(#18), 미확인 3건.

---

## 2. specs 문서가 data.ts보다 더 나간 부분 (지어낸 정황)

| 위치 | 지어낸 내용 | 실제 |
|---|---|---|
| `03-festflow.md` P06 | "리허설 날, 운영진 화면 하나가 **20분 넘게** 옛날 데이터를 띄우고 있었다" | data.ts엔 "네트워크 불안정 시 복구 안 됨"만 있음. 날짜·시간·상황 전부 창작 |
| `07-sign-language.md` P04 | "**테스트해준 친구가** 계속 틀렸다고 했다" / "「고맙습니다」라고 썼더니" | 4지선다라 성립 불가. data.ts의 공백 이슈를 동의어 이슈로 확대까지 함 |
| `02-mystock.md` P04 | "수익률 **−99.9%**가 화면에 떴다" | 코드상 전량매도 시 `holdingRepository.delete(holding)` → 재매수 시 신규 생성. 시나리오는 성립하나 그 수치가 떴다는 증거 없음 |
| `08-ajou-adventure.md` P04 | "제거 끄기 → **12 → 340** → 직접 렉을 느낀다" | data.ts의 실제 트러블은 스프라이트 충돌박스와 플레이테스트 자동화. 오브젝트 누적 렉은 근거 없음 |
| `10-tserof.md` P02·P04 | 코요테 타임 유무 토글이 **방 전체 논증의 축** | 코요테 타임 코드 없음. 실제는 접지 레이 4방향 확장 |
| `04-muscleup.md` P05 | SSE / `EventSource` / `SseEmitter` | socket.io (문서 자체가 `[FIX-01]`로 인지) |

---

## 3. 저장소에는 있는데 specs가 안 쓰고 있는 진짜 재료

| 프로젝트 | 안 쓰이고 있는 실제 근거 |
|---|---|
| tserof | **XOR 저장 암호화** `FileDataHandler.EncryptDecrypt`: `data[i] ^ codeWord[i % len]` (단 `_useEncryption=false` 기본값, codeWord가 `"word"` → 정직한 한계로 쓰기 좋음) · `ObjectPoolJump.cs` 풀링 · `LayerMask` 레이캐스트 · 스테이지 3개 + StageSelect · **Steam 출시** · 팀 5명(김어진/정재훈/김형중/박지원/이홍준) · 기간 2023.11–2024.02 |
| ajou-adventure | `playtest-output-strict-wire-1~8` — **와이어 액션을 8회 반복 튜닝**하고 결국 `data.ts` 기준 "**와이어 액션 비활성(미완)**" · `platform-spacing-1~4`·`gap-check`·`overlap-high`·`pop-arc-1~2` 실측 JSON · 낮/석양/밤 배경 3종(spec의 낮→밤 진행지표는 **실제 근거 있음**) |
| muscleup | JWT 이중 쿠키 + **Refresh Token Rotation**(재발급 시 기존 폐기) · SMTP 이메일 인증 · Google OAuth · AWS S3/CloudFront/Route53/ACM/RDS · 배포 도메인 `musclehub.co.kr` · 시연영상 존재 |
| ajouchong | Docker 멀티스테이지 + Nginx `try_files` · 빌드타임 `ARG` 주입 · 배포 `ajouchong.com` |
| mystock | 외부 연동 4종(Yahoo/Google News RSS/OpenDART/SEC) · AI 리포트 면책 문구 실코드 · `Holding.buy()` 가중평균 단가 계산 |
| aclub | portfolio.js 기준: **GA4/GSC 기반 개선 루프** · 401 → HttpOnly Refresh 자동 재발급 후 원요청 재시도 · Everytime/카톡 유입 동선 |
| sign-language | 4지선다 + 오답노트/최다오답 단어 집계(`TopWrongWordResponse`, `WrongNote*`) · Firebase Storage 영상 폴백 · 북마크 |

---

## 4. 추가로 어긋나는 원칙

- `02-mystock.md`의 "**실존 종목명 0개**" 원칙 — 실제 서비스는 Yahoo Finance·OpenDART·SEC로 **실존 종목을 다룹니다.**
  스크린샷을 가상 종목으로 바꾸라는 지시는 오히려 서비스를 왜곡합니다. 면책 고지는 유지하되 원칙 문구를 수정해야 합니다.
- `08` 방 이름이 문서마다 「아주대모험」/「아주대탐험」으로 흔들립니다. 실제 저장소명은 **아주분투**(`Ajou_Mini_Game`)이고,
  「아주대탐험」은 **다른 프로젝트**(`Ajou_IndiGame`, Unity 액션 어드벤처)입니다. 섞이면 안 됩니다.
