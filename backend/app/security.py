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

def auth_enabled() -> bool:
    return bool(settings.admin_password.strip())


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
    if not verify_admin_token(x_admin_token):
        raise HTTPException(status_code=401, detail="관리자 인증이 필요합니다.")


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


def ai_usage_snapshot() -> dict[str, int]:
    """관리자 페이지용 — 오늘 AI 호출 수 / 하루 상한."""
    _reset_daily_count_if_new_day()
    return {"today_count": _daily_count["count"], "daily_limit": settings.ai_daily_limit}


# 라우트 데코레이터에 그대로 쓰기 위한 별칭
AdminGuard = Depends(require_admin)
AiRateLimit = Depends(ai_rate_limit)
