from datetime import date, datetime
from zoneinfo import ZoneInfo

from app.config import settings


def today_local() -> date:
    return datetime.now(ZoneInfo(settings.local_timezone)).date()
