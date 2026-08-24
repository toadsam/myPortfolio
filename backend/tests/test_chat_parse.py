"""chat_service._parse_chat_json — 모델 JSON 응답 파싱 (5단계 D-5)."""

from app.services.chat_service import ChatMention, _parse_chat_json
from app.services.npc_brain_service import _FALLBACK_LINES


def test_parse_reply_and_mention():
    reply, mention = _parse_chat_json('{"reply": "안녕!", "mention": {"name": "픽셀", "sentiment": "negative"}}')
    assert reply == "안녕!" and mention == ChatMention(name="픽셀", sentiment="negative")


def test_parse_null_mention_and_garbage():
    assert _parse_chat_json('{"reply": "응", "mention": null}') == ("응", None)
    # JSON 이 아니면 원문 그대로 — 예전 동작 유지
    assert _parse_chat_json("그냥 평문 답변") == ("그냥 평문 답변", None)
    assert _parse_chat_json('{"mention": {"name": "픽셀"}}') == ('{"mention": {"name": "픽셀"}}', None)
    assert _parse_chat_json('{"reply": "응", "mention": {"name": "픽셀", "sentiment": "이상함"}}') == ("응", None)


def test_fallback_line_pools_are_expanded():
    for kind, pool in _FALLBACK_LINES.items():
        assert len(pool) >= 4, kind
        assert all(len(script) == 4 for script in pool)
