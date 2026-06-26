from datetime import datetime, time, timezone
from zoneinfo import ZoneInfo

import httpx

from app.config import settings
from app.time_utils import today_local


async def fetch_today_commit_count() -> int:
    if not settings.github_token:
        return 0

    today = today_local()
    local_midnight = datetime.combine(today, time.min, tzinfo=ZoneInfo(settings.local_timezone))
    since = local_midnight.astimezone(timezone.utc).isoformat()

    query = """
    query($username: String!, $since: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $since) {
          totalCommitContributions
        }
      }
    }
    """

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            "https://api.github.com/graphql",
            headers={"Authorization": f"Bearer {settings.github_token}"},
            json={"query": query, "variables": {"username": settings.github_username, "since": since}},
        )
        response.raise_for_status()
        data = response.json()
        return int(data["data"]["user"]["contributionsCollection"]["totalCommitContributions"])
