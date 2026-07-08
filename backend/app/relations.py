"""NPC들 사이의 관계 — 마주쳐 대화할 때 성격/러닝개그가 묻어나게 하기 위한 힌트."""


def canon(npc_id: str) -> str:
    """실제 npc_id(동적 포함)를 관계용 대표 종류로 정규화."""
    if npc_id == "overseer-npc" or "overseer" in npc_id:
        return "overseer"
    if "codingtest" in npc_id:
        return "coding"
    if npc_id == "cs-npc" or "study-cs" in npc_id or npc_id.endswith("-cs"):
        return "cs"
    if npc_id == "guide-npc":
        return "guide"
    if npc_id == "developer-npc" or "skill" in npc_id or "backend" in npc_id or "frontend" in npc_id:
        return "developer"
    if npc_id == "archivist-npc" or "exp" in npc_id:
        return "archivist"
    if npc_id == "contact-npc" or "post" in npc_id or "contact" in npc_id:
        return "contact"
    return "project"


# 대표 종류 쌍 → 관계 설명(대화 톤 힌트). 키는 정렬된 튜플.
_RELATIONS: dict[tuple[str, str], str] = {
    ("guide", "project"): "오래된 단짝. 서로 챙기고 장난도 잘 친다. 편하게 농담 주고받는 사이.",
    ("developer", "project"): "티격태격하는 라이벌. 기술 자부심 대 프로젝트 자부심으로 은근히 투닥거리지만 사실 친함.",
    ("archivist", "contact"): "차분한 콤비. 잔잔하게 서로의 하루를 물어보는 어른스러운 사이.",
    ("coding", "developer"): "둘 다 알고리즘·코드 덕후. 문제 얘기 시작하면 삼천포로 빠져 신나게 떠든다.",
    ("archivist", "cs"): "기록과 공부로 통하는 사이. 서로의 노트를 진지하게 존중한다.",
    ("contact", "project"): "포스트가 픽셀에게 '연락 좀 잘 넘겨줘~'라고 투덜대는 러닝개그가 있다. 티격태격 정겨움.",
    ("guide", "developer"): "루미가 테오의 장황한 기술 설명을 귀엽게 끊어주는 사이.",
    ("coding", "cs"): "알고와 노바, 공부 파트너. 서로 '오늘 몇 문제 풀었어?' '무슨 개념 봤어?' 하고 챙긴다.",
}

# 총괄(분신)은 모두를 아끼는 큰형/사장님. 만나면 다들 반가워한다.
_OVERSEER_RELATION = "정재훈(총괄)이 아끼는 마을 식구. 만나면 반갑게 안부를 주고받고, 정재훈은 늘 다정하게 챙긴다."


def relation_for(npc_a: str, npc_b: str) -> str:
    a, b = canon(npc_a), canon(npc_b)
    if a == "overseer" or b == "overseer":
        return _OVERSEER_RELATION
    key = tuple(sorted((a, b)))
    return _RELATIONS.get(key, "마을에서 함께 사는 친한 동료. 편하게 안부를 나누는 사이.")
