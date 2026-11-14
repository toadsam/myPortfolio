"""경력 안내(쪽지) — 검색·근거 판정·숫자 검사. 네트워크와 DB 없이 돈다.

여기서 잠그는 것:
  - 근거가 없으면 모델을 부르지 않고 "없음"으로 끝난다.
  - 답에 근거에 없는 숫자가 있으면 그 답은 화면에 나가지 않는다.
  - 모델이 answerable=false 라고 하면 출처도 붙이지 않는다.
"""

import asyncio

from app.services import career_guard, career_service
from app.services.career_service import CareerIndex, Hit

CHUNKS = [
    {
        "id": "festflow-0", "project": "festflow", "title": "AjouFesta", "section": "운영 당일",
        "href": "/resume/festflow", "hash": "a",
        "text": "문자 435통 중 244통이 실패했습니다. 15:57 에 잔액이 0원이 됐습니다.",
    },
    {
        "id": "muscleup-1", "project": "muscleup", "title": "득근득근", "section": "성능",
        "href": "/resume/muscleup", "hash": "b",
        "text": "20만 행에서 인덱스를 추가해 조회가 2.0배 빨라졌습니다. 리프레시 토큰은 회전시킵니다.",
    },
    {
        "id": "profile-2", "project": "profile", "title": "정재훈", "section": "학력",
        "href": "/resume", "hash": "c",
        "text": "아주대학교 2021.03 입학. 전공 평점 4.05.",
    },
]
PROJECTS = [
    {"id": "festflow", "title": "AjouFesta", "aliases": ["AjouFesta", "FestFlow", "축제"]},
    {"id": "muscleup", "title": "득근득근", "aliases": ["득근득근", "MuscleUp"]},
]


def index() -> CareerIndex:
    return CareerIndex(CHUNKS, PROJECTS)


def hits() -> list[Hit]:
    return [Hit(chunk=c, score=1.0) for c in CHUNKS]


# ── 검색 ──


def test_tokenize_korean_bigrams_and_latin_words():
    assert career_service.tokenize("Spring Boot 인덱스") == ["spring", "boot", "인덱", "덱스"]


def test_search_finds_the_chunk_that_holds_the_words():
    found = index().search("문자가 몇 통 실패했나요")
    assert found.hits[0].chunk["id"] == "festflow-0"
    assert found.enough


def test_project_alias_puts_that_project_first():
    found = index().search("FestFlow 에서 실패한 것")
    assert found.projects == ["festflow"]
    assert found.hits[0].chunk["project"] == "festflow"


def test_unrelated_question_has_no_evidence():
    found = index().search("오늘 서울 날씨 알려줘")
    assert not found.enough


def test_empty_index_never_has_evidence():
    assert not CareerIndex([]).search("득근득근 성능").enough


# ── 숫자 검사 ──


def test_numbers_in_evidence_pass():
    assert career_guard.unsupported_numbers("435통 중 244통이 실패했습니다.", CHUNKS[0]["text"]) == []


def test_invented_number_is_caught():
    assert career_guard.unsupported_numbers("문자 500통을 보냈습니다.", CHUNKS[0]["text"]) == ["500"]


def test_comma_and_leading_zero_do_not_matter():
    assert career_guard.unsupported_numbers("7,078명, 2026년 10월 7일", "방문 7078명 · 2026.10.07") == []


def test_decimal_must_match_as_a_whole():
    assert career_guard.unsupported_numbers("2.5배 빨라졌습니다", CHUNKS[1]["text"]) == ["2.5"]
    assert career_guard.unsupported_numbers("2.0배 빨라졌습니다", CHUNKS[1]["text"]) == []


def test_small_counting_integers_are_exempt():
    # 모델이 항목을 세며 쓰는 숫자와 구분할 수 없어 10 이하는 보지 않는다(알려진 한계).
    assert career_guard.unsupported_numbers("크게 3가지입니다.", "근거에는 숫자가 없습니다.") == []


def test_number_from_the_question_is_allowed():
    assert career_guard.unsupported_numbers("2021년에 입학했습니다.", "입학 기록", "2021년에 뭐 했나요") == []


def test_commit_hashes_are_removed():
    assert career_guard.strip_commit_hashes("프론트 e5a5657 에서 고쳤습니다") == "프론트 에서 고쳤습니다"
    assert career_guard.strip_commit_hashes("2026년 20만 행") == "2026년 20만 행"
    # 해시 바로 뒤에 조사가 붙어도 뺀다.
    assert career_guard.strip_commit_hashes("후속 89bd39c에는 코드가 추가됐습니다") == "후속 에는 코드가 추가됐습니다"


# ── 모델 응답 판정 ──


def test_grounded_answer_passes_with_cited_sources():
    out = career_service.judge(
        "문자 실패", hits(), {"answerable": True, "answer": "435통 중 244통이 실패했습니다.", "used": [1]}
    )
    assert out["mode"] == "answer"
    assert [s["href"] for s in out["sources"]] == ["/resume/festflow"]


def test_answer_with_invented_number_is_dropped_to_snippets():
    out = career_service.judge(
        "문자 실패", hits(), {"answerable": True, "answer": "약 300통이 실패했습니다.", "used": [1]}
    )
    assert out["mode"] == "snippets"
    assert out["answer"] == ""
    assert "300" not in str(out)


def test_unanswerable_returns_none_without_sources():
    out = career_service.judge("연봉", hits(), {"answerable": False, "answer": "", "used": []})
    assert out["mode"] == "none"
    assert out["sources"] == []


def test_out_of_range_citations_are_ignored():
    out = career_service.judge(
        "학력", hits(), {"answerable": True, "answer": "전공 평점은 4.05 입니다.", "used": [9, "x", 3]}
    )
    assert out["mode"] == "answer"
    assert out["sources"][0]["section"] == "학력"


# ── 전체 흐름 ──


def test_no_evidence_never_calls_the_model(monkeypatch):
    called = False

    async def boom(*_a, **_k):
        nonlocal called
        called = True
        return {}

    monkeypatch.setattr(career_service, "get_index", index)
    monkeypatch.setattr(career_service, "_ask_model", boom)
    out = asyncio.run(career_service.ask("오늘 서울 날씨 알려줘"))
    assert out["mode"] == "none"
    assert called is False


def test_without_api_key_returns_snippets(monkeypatch):
    monkeypatch.setattr(career_service, "get_index", index)
    monkeypatch.setattr(career_service.settings, "openai_api_key", None)
    out = asyncio.run(career_service.ask("문자가 몇 통 실패했나요"))
    assert out["mode"] == "snippets"
    assert out["sources"][0]["href"] == "/resume/festflow"


def test_model_failure_falls_back_to_snippets(monkeypatch):
    async def fail(*_a, **_k):
        raise RuntimeError("upstream down")

    monkeypatch.setattr(career_service, "get_index", index)
    monkeypatch.setattr(career_service.settings, "openai_api_key", "test-key")
    monkeypatch.setattr(career_service, "_ask_model", fail)
    out = asyncio.run(career_service.ask("문자가 몇 통 실패했나요"))
    assert out["mode"] == "snippets"
    assert out["sources"]


# ── 넓은 질문 ──

WIDE = [
    {"id": f"p{n}-card", "project": f"p{n}", "title": f"프로젝트{n}", "section": "이력서 카드",
     "href": f"/resume/p{n}", "hash": f"c{n}", "text": f"프로젝트{n} 요약. 백엔드 API 를 만들었습니다."}
    for n in range(5)
] + [
    {"id": f"p0-d{n}", "project": "p0", "title": "프로젝트0", "section": "문제 해결",
     "href": "/resume/p0", "hash": f"d{n}", "text": f"백엔드 경험 {n}. 백엔드 서버 백엔드 배포 백엔드 테스트."}
    for n in range(8)
]
WIDE_PROJECTS = [{"id": f"p{n}", "title": f"프로젝트{n}", "aliases": [f"프로젝트{n}"]} for n in range(5)]


def test_overview_question_gets_every_project_card():
    # 조각이 많은 한 프로젝트가 자리를 다 차지하면 "경험 요약"이 그 프로젝트 이야기만 된다.
    # 낱말("요약", "경험")로 넓은 질문을 가리지 않는다. 프로젝트 이름이 없으면 카드를 넣는다.
    found = CareerIndex(WIDE, WIDE_PROJECTS).search("백엔드 서버를 혼자 만든 것은?")
    assert found.overview
    cards = [h.chunk["project"] for h in found.hits if h.chunk["section"] == "이력서 카드"]
    assert cards == ["p0", "p1", "p2", "p3", "p4"]
    details = [h for h in found.hits if h.chunk["section"] != "이력서 카드"]
    assert len(details) == career_service.PER_PROJECT_CAP


def test_named_project_question_is_not_spread_out():
    found = CareerIndex(WIDE, WIDE_PROJECTS).search("프로젝트0 백엔드 경험")
    assert not found.overview
    assert all(h.chunk["project"] == "p0" for h in found.hits[:3])


def test_answer_sources_are_one_per_page():
    wide_hits = [Hit(chunk=c, score=1.0) for c in WIDE]
    out = career_service.judge(
        "백엔드 경험", wide_hits, {"answerable": True, "answer": "여러 프로젝트에서 했습니다.", "used": [6, 7, 1, 2]}
    )
    assert [s["href"] for s in out["sources"]] == ["/resume/p0", "/resume/p1"]


# ── 넓은 질문: 기록 문장 고르기 ──


def test_split_sentences_keeps_decimals_and_dotted_names():
    text = "응답이 2.0배 빨라졌습니다. Node.js 와 10.02–09 집계를 썼습니다."
    assert career_service.split_sentences(text) == ["응답이 2.0배 빨라졌습니다.", "Node.js 와 10.02–09 집계를 썼습니다."]


def test_context_numbers_every_sentence_so_the_model_can_point_at_it():
    ctx = career_service._context(hits())
    assert "(1.1) 문자 435통 중 244통이 실패했습니다." in ctx
    assert "(1.2) 15:57 에 잔액이 0원이 됐습니다." in ctx
    assert "(2.2) 리프레시 토큰은 회전시킵니다." in ctx


def test_points_become_the_exact_sentences_from_the_records():
    out = career_service.judge("경험 요약", hits(), {"answerable": True, "answer": "", "points": ["1.1", "(2.2)"]})
    assert out["mode"] == "answer"
    lines = out["answer"].split("\n")
    assert lines[0] == career_service.POINTS_LEAD
    assert lines[1] == "AjouFesta: 문자 435통 중 244통이 실패했습니다."
    assert lines[2] == "득근득근: 리프레시 토큰은 회전시킵니다."
    assert [s["href"] for s in out["sources"]] == ["/resume/festflow", "/resume/muscleup"]


def test_points_text_is_never_the_models_own_words():
    # points 가 있으면 answer 에 무엇을 써 보냈든 쓰지 않는다.
    out = career_service.judge(
        "경험 요약", hits(), {"answerable": True, "answer": "문자 실패를 3.1초로 개선했습니다.", "points": ["1.1"]}
    )
    assert "3.1초" not in out["answer"]


def test_bad_point_numbers_are_dropped():
    picked = career_service.resolve_points(["9.1", "1.9", "abc", "1.1", "1.1", 7], hits())
    assert [u for _, u in picked] == ["문자 435통 중 244통이 실패했습니다."]


def test_only_bad_points_and_no_answer_is_a_refusal():
    out = career_service.judge("경험 요약", hits(), {"answerable": True, "answer": "", "points": ["9.9"]})
    assert out["mode"] == "none"


def test_one_project_cannot_fill_the_whole_answer():
    many = [
        {"id": "m", "project": "muscleup", "title": "득근득근", "section": "성능", "href": "/resume/muscleup",
         "hash": "m", "text": "첫째 측정을 했습니다. 둘째 측정을 했습니다. 셋째 측정을 했습니다. 넷째 측정을 했습니다."},
        CHUNKS[0],
    ]
    picked = career_service.resolve_points(["1.1", "1.2", "1.3", "1.4", "2.1"], [Hit(chunk=c, score=1.0) for c in many])
    assert [h.chunk["project"] for h, _ in picked] == ["muscleup", "muscleup", "festflow"]


def test_label_only_lines_are_shown_but_cannot_be_picked():
    text = "프로젝트: aClub" + chr(10) + "무엇: 동아리 모집 공고를 한곳에 모은 서비스입니다." + chr(10) + "상태: 완료"
    card = {"id": "c", "project": "aclub", "title": "aClub", "section": "이력서 카드", "href": "/resume/aclub",
            "hash": "x", "text": text}
    h = [Hit(chunk=card, score=1.0)]
    ctx = career_service._context(h)
    assert "프로젝트: aClub" in ctx and "(1.1) 무엇: 동아리" in ctx and "(1.2)" not in ctx
    out = career_service.judge("어떤 프로젝트", h, {"answerable": True, "answer": "", "points": ["1.1"]})
    assert out["answer"].splitlines()[1] == "aClub: 동아리 모집 공고를 한곳에 모은 서비스입니다."


def test_headings_and_number_tags_cannot_be_picked():
    assert career_service.units("5월 운영에서 겪은 것 · 2026.05.22") == []
    assert career_service.units("8 · SSE 실시간 채널") == []
    assert career_service.units("문자 실패와 신청 저장을 분리했습니다.") == ["문자 실패와 신청 저장을 분리했습니다."]
    assert career_service.units("정재훈이 맡은 일: 기획 · 개발 · 배포") == ["정재훈이 맡은 일: 기획 · 개발 · 배포"]


def test_same_sentence_from_two_chunks_is_shown_once():
    twice = [dict(CHUNKS[0]), dict(CHUNKS[0], id="festflow-9", section="이력서 카드")]
    picked = career_service.resolve_points(["1.1", "2.1"], [Hit(chunk=c, score=1.0) for c in twice])
    assert len(picked) == 1


def test_named_project_question_uses_the_written_answer_not_points():
    out = career_service.judge(
        "FestFlow 문자 실패", hits(),
        {"answerable": True, "answer": "문자 244통이 실패했습니다.", "points": ["1.1", "1.2"]},
        allow_points=False,
    )
    assert out["answer"] == "문자 244통이 실패했습니다."
