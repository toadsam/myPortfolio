"""검토표용 덤프 — 평가 문항 전부를 실제 경로로 돌려 질문·답·근거 조각을 JSON 으로 쓴다.

실행(backend/ 에서):  python -m eval.dump_career_review <출력.json>
채점하지 않는다. 사람이 답을 읽고 사실과 맞는지 보는 데 쓴다.
"""

import asyncio
import json
import sys
from pathlib import Path

from app.services import career_service as cs

FILES = [
    ("좁은 질문", "career_questions.json"),
    ("새 문항", "career_questions_holdout.json"),
    ("넓은 질문 (새 문항)", "career_questions_holdout2.json"),
]


async def one(index: cs.CareerIndex, q: str) -> dict:
    qvec = await cs._embed_query(q) if index.has_vectors else None
    found = index.search(q, qvec)
    if not found.enough:
        return {"mode": "none", "answer": cs.NONE_ANSWER, "note": "", "used": [], "hits": [], "dropped": []}
    try:
        model_out = await cs._ask_model(q, found.hits)
    except Exception as exc:  # noqa: BLE001
        return {"mode": "snippets", "answer": "", "note": f"모델 호출 실패: {exc}", "used": [], "hits": [], "dropped": []}
    out, dropped = cs.judge(q, found.hits, model_out, allow_points=found.overview), []
    used = [n for n in model_out.get("used") or [] if isinstance(n, int) and 1 <= n <= len(found.hits)]
    hits = [
        {"n": n, "title": h.chunk["title"], "section": h.chunk["section"], "href": h.chunk["href"], "text": h.chunk["text"]}
        for n, h in enumerate(found.hits, start=1)
    ]
    return {"mode": out["mode"], "answer": out["answer"], "note": out["note"], "used": used, "hits": hits, "dropped": dropped}


async def main() -> None:
    index = cs.get_index()
    rows = []
    for group, name in FILES:
        for item in json.loads((Path(__file__).parent / name).read_text(encoding="utf-8")):
            kind = "넓은 질문" if item["expect"] == "broad" else {"none": "없다고 해야 함", "careful": "팀원 일 함정"}.get(item["expect"], group)
            rows.append({"q": item["q"], "kind": kind, "expect": item["expect"], **(await one(index, item["q"]))})
            print(len(rows), item["q"][:30], flush=True)
    Path(sys.argv[1]).write_text(json.dumps(rows, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    asyncio.run(main())
