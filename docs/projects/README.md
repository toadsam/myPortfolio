# 프로젝트별 자료 제작 목록

주요 프로젝트 13개 각각에 **무엇이 더 필요한지**를 프로젝트마다 한 파일로 적었다.
공통 규격·개인정보 체크리스트는 [`../PORTFOLIO_ASSETS.md`](../PORTFOLIO_ASSETS.md) 참고.

각 문서는 같은 틀이다.

1. **한 줄 정체** — 이 프로젝트가 증명하는 것
2. **저장소에서 확인한 사실** — 추측이 아니라 파일 트리·소스에서 센 값
3. **지금 상태** — 채워진 것 / 빈 것
4. 🤖 **코드로 만들 것** — 요청하면 만든다
5. ✋ **직접 만들 것** — 툴·캡처·판단이 필요한 것
6. ⚠️ **확인·수정 필요** — 사실과 다르거나 죽은 것
7. **면접 예상 질문** — 이 프로젝트로 물어볼 것과 답할 재료

---

## 목록

| #   | 프로젝트                | 성격                                | 우선순위 | 문서                                     |
| --- | ----------------------- | ----------------------------------- | -------- | ---------------------------------------- |
| 1   | 득근득근 (MuscleUp)     | 3-tier 풀스택 · 개인                | ⭐⭐⭐   | [muscleup.md](muscleup.md)               |
| 2   | aClub                   | 운영형 프론트 · 2년차 프로젝트장    | ⭐⭐⭐   | [aclub.md](aclub.md)                     |
| 3   | 아주대학교 총학생회     | 실서비스 프론트 · 배포              | ⭐⭐⭐   | [ajouchong.md](ajouchong.md)             |
| 4   | FestFlow                | 실시간 축제 운영 · 개인 풀스택      | ⭐⭐⭐   | [festflow.md](festflow.md)               |
| 5   | MyStock-Desk / MyWave   | 투자 대시보드 · 개인 풀스택         | ⭐⭐     | [mystock.md](mystock.md)                 |
| 6   | 수어지교                | 접근성 · 백엔드 담당                | ⭐⭐     | [sign-language.md](sign-language.md)     |
| 7   | Ajou Campus Foodmap     | 세션·OAuth 풀스택                   | ⭐⭐     | [foodmap.md](foodmap.md)                 |
| 8   | TSEROF                  | **Steam 상용 출시** · 5인 팀 부팀장 | ⭐⭐⭐   | [tserof.md](tserof.md)                   |
| 9   | 아주대탐험              | Unity 3D 액션 어드벤처 · 1인        | ⭐⭐     | [ajou-indigame.md](ajou-indigame.md)     |
| 10  | 아주분투                | Phaser 2D 러너 · 자동 플레이테스트  | ⭐⭐     | [ajou-adventure.md](ajou-adventure.md)   |
| 11  | DarkLab                 | Unity 공포 · 3인 팀                 | ⭐       | [darklab.md](darklab.md)                 |
| 12  | The Other Side (VR)     | XR 인터랙션 · 팀                    | ⭐       | [otherside-vr.md](otherside-vr.md)       |
| 13  | INTO MONSTER POINT (AR) | AR Foundation · 팀                  | ⭐       | [monsterpoint-ar.md](monsterpoint-ar.md) |

---

## 전체를 관통하는 발견

저장소 14개를 전부 읽고 나서 드러난 것들.

### 1. 스스로 숫자를 낮춰 적고 있다

| 프로젝트 | 사이트 표기         | 실제 (저장소에서 셈)                               |
| -------- | ------------------- | -------------------------------------------------- |
| 득근득근 | 16 백엔드 도메인    | **Controller 28개** ✅ 수정함                      |
| MyStock  | 13 백엔드 도메인    | **Controller 25개**                                |
| FestFlow | 3 SSE 실시간 스트림 | **Controller 26개** (AI 매칭·번역·분실물·예약까지) |
| 득근득근 | 도메인 4개 (PDF)    | **도메인 8개 · 테이블 31개** ✅ 수정함             |

**겸손이 아니라 손해다.** 저장소에서 누구나 셀 수 있는 숫자라 부풀림 위험도 없다.

### 2. 만든 기능의 절반이 안 보인다

FestFlow에 **AI 매칭 · 실시간 번역 · 분실물 · 예약 인증 · SMS 발송**이 있는데
사이트에는 "SSE + 지도 + GPS"만 있다. MyStock에는 **재무 코치 · 기업 분석 ·
공시 · 실적**이 있는데 "수익률·비중"만 있다.

### 3. FestFlow 저장소에 스크린샷 158장이 이미 있다

`docs/` 폴더에 이미지 158장 + 마스터 문서 + 사용설명서 2종. **"이미지 0장"이
아니라 "안 가져온 것"이었다.**

### 4. 팀 프로젝트 5개에 협업 증거가 하나도 없다

aClub · 총학생회 · TSEROF · 수어지교 · DarkLab · The Other Side가 팀인데,
PR·이슈·회의록이 한 장도 없다. 신입 채용에서 "팀에서 어떻게 일하나"는 기술만큼 본다.

### 5. 저장소 위생 문제

| 저장소                     | 문제                                 |
| -------------------------- | ------------------------------------ |
| `toadsam/Ajou_MuscleUp`    | `realtime/node_modules` 369개 커밋됨 |
| `toadsam/pwd-week6-server` | `node_modules` 3,995개 커밋됨        |
| `toadsam/Sign-Language`    | `.idea/` 172개 커밋됨                |

`.gitignore` 정리는 5분이지만, 저장소를 열어보는 심사자에겐 바로 보인다.

### 6. 죽은 링크 1개

`github.com/KimEoJin24/TSEROF` → **404**. 나머지 24개 URL은 전부 정상.
