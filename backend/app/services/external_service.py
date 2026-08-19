"""갓생 섬 — 바깥 세상에서 긁어오는 것들 (solved.ac · 링크 제목).

## 이 파일의 단 하나의 규칙: **절대 예외를 밖으로 던지지 않는다**

여기 있는 건 전부 남의 서버다. solved.ac 는 비공식 API 라 언제든 막히고,
프로그래머스와 노션은 로그인 뒤에 있어서 제목이 안 읽히는 게 정상이다.

그런데 이 기능들은 **오늘 기록을 남기는 길 위에 있다.** 남의 사이트가 점검 중이라고
내 운동 기록이 안 찍히면 그날 하루를 통째로 놓친다. 그래서 모든 함수는 실패를
"값이 없음"으로 바꿔서 돌려준다 — 호출하는 쪽은 실패를 신경 쓸 필요가 없다.
(`github_service` 가 토큰 없을 때 0 을 돌려주는 것과 같은 태도다.)

**링크 저장은 항상 성공하고, 제목 자동 채우기는 덤이다.**
"""

import re
from html import unescape

import httpx

from app.config import settings


_TIMEOUT = 6.0
# 기본 UA 로 가면 막는 사이트가 있다(acmicpc 가 대표적).
_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "Accept-Language": "ko,en;q=0.8",
}


# ─────────────────────────── solved.ac (백준) ───────────────────────────


async def fetch_boj_solved_total() -> int | None:
    """지금까지 푼 문제 **총합**. 핸들이 없거나 조회 실패면 None.

    ## 2026-08-18 현재 이 함수는 사실상 잠들어 있다 — 지우지 않은 이유

    실측 결과(그때그때 다시 파헤치지 않도록 남긴다):

    - **백준(acmicpc.net) 은 2026-04-28 서비스를 종료했다.** 모든 문제 URL 이
      404 이고 첫 화면이 "BOJ 채점 서비스 준비 중 … 곧 다시 돌아오겠습니다" 다.
    - **solved.ac 는 전 엔드포인트가 Cloudflare 403** (`Just a moment...`).
      서버에서 부르는 길이 막혀 있고, 봇 차단을 우회할 생각은 하지 않는다.

    그래도 코드를 남기는 건 BOJ 가 "곧 돌아오겠다"고 예고했기 때문이다.
    `BOJ_HANDLE` 이 비어 있으면 **아무 일도 안 하고 조용히 건너뛰므로** 지금
    상태에서 해를 끼치지 않는다. 돌아오면 `.env` 에 한 줄 넣으면 살아난다.

    주의 — 이 숫자는 **처음 푼 문제만** 늘어난다. 이미 푼 문제를 다시 풀면
    그대로다. 그래서 이걸로 '오늘 풀었나'를 판정하면 복습한 날이 0 으로 잡힌다.
    그런 날은 링크를 붙여넣어 수동으로 남기면 된다.
    """
    handle = settings.boj_handle.strip()
    if not handle:
        return None

    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT, headers=_HEADERS) as client:
            response = await client.get(
                "https://solved.ac/api/v3/user/show", params={"handle": handle}
            )
            response.raise_for_status()
            return int(response.json()["solvedCount"])
    except Exception:
        return None


# ─────────────────────────── 링크 제목 긁기 ───────────────────────────

_TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)
_OG_TITLE_RE = re.compile(
    r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']',
    re.IGNORECASE,
)


async def fetch_link_title(url: str) -> str:
    """링크의 제목. 못 읽으면 빈 문자열 — **에러를 내지 않는다.**

    2026-08-18 실측:
    - **프로그래머스: 잘 된다.** `.../lessons/12940` → "코딩테스트 연습 - 최대공약수와 최소공배수"
    - **노션: 공개 페이지는 된다.** 비공개는 로그인 벽이라 빈 문자열(정상 동작).
    - 백준: 사이트가 내려가서 불가(위 `fetch_boj_solved_total` 주석 참고).
    """
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        return ""

    try:
        async with httpx.AsyncClient(
            timeout=_TIMEOUT, headers=_HEADERS, follow_redirects=True
        ) as client:
            response = await client.get(url)
            if response.status_code >= 400:
                return ""
            html = response.text
    except Exception:
        return ""

    # og:title 을 먼저 본다 — <title> 보다 사람이 읽을 제목에 가깝다.
    for pattern in (_OG_TITLE_RE, _TITLE_RE):
        match = pattern.search(html)
        if match:
            title = unescape(re.sub(r"\s+", " ", match.group(1))).strip()
            if title:
                return _clean_title(title)[:190]
    return ""


def _clean_title(title: str) -> str:
    """사이트 이름 꼬리표를 떼어낸다 — 목록에서 같은 글자가 반복되면 읽기 나쁘다."""
    for tail in (
        " | 프로그래머스",
        " - 프로그래머스",
        " | Programmers",
        " | Notion",
        " - Notion",
    ):
        if title.endswith(tail):
            title = title[: -len(tail)]
    return title.strip()


# ─────────────────────────── URL 해석 ───────────────────────────

_BOJ_PROBLEM_RE = re.compile(r"acmicpc\.net/problem/(\d+)")
_PROGRAMMERS_LESSON_RE = re.compile(r"programmers\.co\.kr/learn/courses/\d+/lessons/(\d+)")


def platform_of(url: str) -> str:
    """링크만 보고 플랫폼을 알아낸다. 모르면 빈 문자열(사용자가 고른 값을 쓴다)."""
    lowered = url.lower()
    if "acmicpc.net" in lowered:
        return "백준"
    if "programmers.co.kr" in lowered:
        return "프로그래머스"
    if "leetcode.com" in lowered:
        return "리트코드"
    return ""


def problem_no_of(url: str) -> str:
    for pattern in (_BOJ_PROBLEM_RE, _PROGRAMMERS_LESSON_RE):
        match = pattern.search(url)
        if match:
            return match.group(1)
    return ""
