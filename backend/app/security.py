"""관리자 인증(패스코드→서명 토큰) + AI 호출 레이트리밋.

- admin_password 가 비어 있으면 인증을 강제하지 않는다(로컬 개발 편의). 배포 전 반드시 설정할 것.
- 토큰은 외부 의존성 없이 HMAC-SHA256 으로 서명한다: "<만료epoch>.<hexsig>".
- 레이트리밋은 인메모리 슬라이딩 윈도우(단일 인스턴스 기준).
"""

import hashlib
import hmac
import time
from collections import deque

from fastapi import Depends, Header, HTTPException, Request

from app.config import settings


# ─────────────────────────── 관리자 토큰 ───────────────────────────

# .env.example 과 config.py 기본값에 적혀 있는 값들 — 즉 **리포를 읽은 사람은 누구나 아는 값**이다.
# 토큰이 "<만료epoch>.HMAC(secret, 만료epoch)" 뿐이라, 이 비밀키를 아는 사람은
# 비밀번호 없이 관리자 토큰을 직접 만들 수 있다. 비밀번호를 걸어 둔 의미가 사라진다.
_KNOWN_DEFAULT_SECRETS = frozenset(
    {
        "change-me-in-prod",
        "change-me-to-a-long-random-string",
        "",
    }
)


def secret_is_default() -> bool:
    return settings.admin_secret.strip() in _KNOWN_DEFAULT_SECRETS


def auth_enabled() -> bool:
    return bool(settings.admin_password.strip())


def assert_secret_usable() -> None:
    """비밀번호를 걸어 뒀는데 서명키가 공개 기본값이면 **인증을 통과시키지 않는다.**

    비밀번호만 바꾸고 서명키를 두는 실수가 제일 흔하고, 그때 겉보기에는
    로그인이 정상 동작해서 뚫린 줄을 모른다. 그래서 조용히 넘어가지 않고 막는다.
    공방이 생긴 뒤로 여기가 새면 나가는 건 내 기록이 아니라 **방문자의 이름·이메일·
    전화번호와 의뢰 산출물**이다. (require_island 와 같은 철학 — 편의보다 실패 모드를 없앤다.)
    """
    if auth_enabled() and secret_is_default():
        raise HTTPException(
            status_code=500,
            detail=(
                "ADMIN_SECRET 이 예시 기본값 그대로입니다. 이 상태로는 관리자 토큰을 "
                "누구나 위조할 수 있어 인증을 막았습니다. backend/.env 의 ADMIN_SECRET 을 "
                "길고 무작위한 값으로 교체해 주세요."
            ),
        )


def _sign(payload: str) -> str:
    return hmac.new(settings.admin_secret.encode(), payload.encode(), hashlib.sha256).hexdigest()


def create_admin_token() -> str:
    expiry = int(time.time()) + settings.admin_token_ttl_hours * 3600
    payload = str(expiry)
    return f"{payload}.{_sign(payload)}"


def verify_admin_token(token: str | None) -> bool:
    if not token or "." not in token:
        return False
    payload, sig = token.rsplit(".", 1)
    if not hmac.compare_digest(sig, _sign(payload)):
        return False
    try:
        return int(payload) > int(time.time())
    except ValueError:
        return False


def verify_password(password: str) -> bool:
    if not auth_enabled():
        return True
    return hmac.compare_digest(password.strip(), settings.admin_password.strip())


def require_admin(x_admin_token: str | None = Header(default=None)) -> None:
    """보호된 관리자 엔드포인트용 의존성. 인증 비활성 시 통과."""
    if not auth_enabled():
        return
    assert_secret_usable()
    if not verify_admin_token(x_admin_token):
        raise HTTPException(status_code=401, detail="관리자 인증이 필요합니다.")


def require_island(x_admin_token: str | None = Header(default=None)) -> None:
    """갓생 섬(/island) 전용 가드 — 관리자보다 **한 단계 더 엄격하다.**

    `require_admin` 은 admin_password 가 비어 있으면 그냥 통과시킨다(로컬 편의).
    그 관례를 섬에 그대로 적용하면, 비밀번호 설정을 깜빡한 채 배포했을 때 내
    운동 기록·연속 기록·노션 링크가 전부 공개된다. 섬은 애초에 남에게 보여주려고
    만든 곳이 아니므로, **비밀번호가 없으면 로컬에서도 안 열리게 한다.**
    편의보다 "까먹고 배포" 라는 실패 모드를 없애는 쪽이 중요하다.
    """
    if not auth_enabled():
        raise HTTPException(
            status_code=403,
            detail="backend/.env 에 ADMIN_PASSWORD 를 설정해야 섬을 쓸 수 있어요.",
        )
    assert_secret_usable()
    if not verify_admin_token(x_admin_token):
        raise HTTPException(status_code=401, detail="섬은 나만 들어갈 수 있어요.")


# ─────────────────────────── AI 레이트리밋 ───────────────────────────

_ip_hits: dict[str, deque[float]] = {}
_daily_count = {"day": time.strftime("%Y-%m-%d"), "count": 0}


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _reset_daily_count_if_new_day() -> None:
    today = time.strftime("%Y-%m-%d")
    if _daily_count["day"] != today:
        _daily_count["day"] = today
        _daily_count["count"] = 0


def ai_rate_limit(request: Request) -> None:
    """AI 호출 엔드포인트용 의존성 — IP당 분당 상한 + 전체 하루 상한."""
    now = time.time()

    # 전체 하루 상한
    _reset_daily_count_if_new_day()
    if _daily_count["count"] >= settings.ai_daily_limit:
        raise HTTPException(status_code=429, detail="오늘 AI 사용량 상한에 도달했어요. 잠시 후 다시 시도해 주세요.")

    # IP당 분당 상한 (슬라이딩 윈도우)
    ip = _client_ip(request)
    hits = _ip_hits.setdefault(ip, deque())
    while hits and now - hits[0] > 60:
        hits.popleft()
    if len(hits) >= settings.ai_rate_per_min:
        raise HTTPException(status_code=429, detail="요청이 너무 잦아요. 잠깐 쉬었다 다시 물어봐 주세요.")

    hits.append(now)
    _daily_count["count"] += 1


# ─────────────────────────── 의뢰 접수 레이트리밋 ───────────────────────────
#
# AI 리밋과 별도로 둔다. 접수는 AI 호출보다 훨씬 드물어야 정상이고,
# 여기가 뚫리면 비용이 아니라 내 받은편지함이 망가지기 때문이다.
#
# **시도**와 **성공**을 따로 센다. 둘을 하나로 묶었더니 이메일 오타 두어 번에
# 멀쩡한 손님이 한 시간 잠기는 일이 실제로 났다. 검증에 걸려 되돌아간 요청은
# 받은편지함에 아무것도 남기지 않으므로, 성공 할당량을 깎아선 안 된다.
#   - 시도 한도(넉넉): 봇의 무한 POST 를 막는 홍수 방지선
#   - 성공 한도(빡빡): 실제로 내게 도착하는 접수 건수

_commission_attempts: dict[str, deque[float]] = {}
_commission_success: dict[str, deque[float]] = {}
_commission_daily = {"day": time.strftime("%Y-%m-%d"), "count": 0}


def _prune(window: deque[float], now: float, seconds: float = 3600) -> deque[float]:
    while window and now - window[0] > seconds:
        window.popleft()
    return window


def commission_rate_limit(request: Request) -> None:
    """접수 시도 전 검사. 성공 카운트는 라우트가 record_commission_success 로 따로 올린다."""
    now = time.time()

    today = time.strftime("%Y-%m-%d")
    if _commission_daily["day"] != today:
        _commission_daily["day"] = today
        _commission_daily["count"] = 0
    if _commission_daily["count"] >= settings.commission_daily_limit:
        raise HTTPException(status_code=429, detail="오늘 접수 가능한 건수를 넘었어요. 내일 다시 시도해 주세요.")

    ip = _client_ip(request)

    attempts = _prune(_commission_attempts.setdefault(ip, deque()), now)
    if len(attempts) >= settings.commission_attempts_per_hour:
        raise HTTPException(status_code=429, detail="요청이 너무 잦아요. 잠시 후 다시 시도해 주세요.")

    success = _prune(_commission_success.setdefault(ip, deque()), now)
    if len(success) >= settings.commission_rate_per_hour:
        raise HTTPException(
            status_code=429,
            detail="접수가 접수되었어요. 추가 문의는 회신 메일로 이어서 보내주세요.",
        )

    attempts.append(now)


def record_commission_success(request: Request) -> None:
    """접수가 실제로 저장된 뒤에만 호출한다 — 검증 실패는 할당량을 깎지 않는다."""
    now = time.time()
    ip = _client_ip(request)
    _prune(_commission_success.setdefault(ip, deque()), now).append(now)
    _commission_daily["count"] += 1


def ai_usage_snapshot() -> dict[str, int]:
    """관리자 페이지용 — 오늘 AI 호출 수 / 하루 상한."""
    _reset_daily_count_if_new_day()
    return {"today_count": _daily_count["count"], "daily_limit": settings.ai_daily_limit}


# 라우트 데코레이터에 그대로 쓰기 위한 별칭
AdminGuard = Depends(require_admin)
IslandGuard = Depends(require_island)
AiRateLimit = Depends(ai_rate_limit)
CommissionRateLimit = Depends(commission_rate_limit)
