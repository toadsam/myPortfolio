"""경력 안내 답변 검사 — 모델이 쓴 답을 화면에 내보내도 되는지 정하는 순수 함수.

견적 클램프(`commission_service._clamp_estimate`)와 같은 생각이다. 모델 출력은 믿지 않고,
내보내기 전에 규칙으로 한 번 거른다. 여기에는 DB 도 네트워크도 없다.

검사는 숫자 하나만 본다. 답에 나온 숫자가 근거 조각이나 질문에 없으면 그 답을 버린다.
문장의 뜻이 근거와 맞는지는 이 함수로 알 수 없고, 평가 세트(`backend/eval/`)로 따로 잰다.
"""

from __future__ import annotations

import re

# 날짜 사슬(2026.10.07)의 일부가 아닌 소수: 17.6, 3.2, 2.0
_DECIMAL = re.compile(r"(?<![\d.])\d+\.\d+(?![\d]|\.\d)")
_INTEGER = re.compile(r"\d[\d,]*")

# 이 값 이하의 정수는 검사하지 않는다. "두 가지", "3단계" 처럼 모델이 항목을 세며 쓰는 숫자와
# 근거의 숫자를 구분할 수 없어서다. 그래서 "1인당 3건"이 "1인당 5건"으로 바뀌는 것은 못 잡는다.
SMALL_INT_EXEMPT = 10


def _norm_int(raw: str) -> str:
    digits = raw.replace(",", "").lstrip("0")
    return digits or "0"


def number_sets(text: str) -> tuple[set[str], set[str]]:
    """(소수 집합, 정수 집합). 정수는 쉼표와 앞자리 0 을 뗀다. 소수의 각 부분도 정수 집합에 든다."""
    decimals = set(_DECIMAL.findall(text))
    integers = {_norm_int(m) for m in _INTEGER.findall(text)}
    return decimals, integers


def unsupported_numbers(answer: str, evidence: str, question: str = "") -> list[str]:
    """답에 있지만 근거·질문 어디에도 없는 숫자 목록. 비어 있으면 통과."""
    ev_dec, ev_int = number_sets(evidence + "\n" + question)
    missing: list[str] = []

    for dec in _DECIMAL.findall(answer):
        if dec not in ev_dec and dec not in missing:
            missing.append(dec)

    rest = _DECIMAL.sub(" ", answer)
    for raw in _INTEGER.findall(rest):
        value = _norm_int(raw)
        if len(value) <= 2 and int(value) <= SMALL_INT_EXEMPT:
            continue
        if value not in ev_int and value not in missing:
            missing.append(value)
    return missing


# \b 는 한글도 낱말 글자로 봐서 "89bd39c에는" 의 해시를 놓쳤다. 영문·숫자 경계만 본다.
_HASH = re.compile(r"(?<![0-9A-Za-z])(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}(?![0-9A-Za-z])")


def strip_commit_hashes(text: str) -> str:
    """근거 조각에 남은 커밋 해시가 답에 섞이면 뺀다. 독자에게 뜻이 없는 글자다."""
    cleaned = _HASH.sub("", text)
    return re.sub(r"[ \t]{2,}", " ", cleaned).strip()
