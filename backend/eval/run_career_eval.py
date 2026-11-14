"""경력 안내 평가 — 문항을 실제 경로(검색 → 모델 → 검사)로 돌리고 표를 찍는다.

실행(backend/ 에서):  python -m eval.run_career_eval            전체
                      python -m eval.run_career_eval --search   검색만(모델 호출 없음, 문턱 맞출 때)
                      python -m eval.run_career_eval --holdout  맞출 때 쓰지 않은 문항
채점:
  answer  : mode 가 answer 이고 any 중 하나가 답에 있으며, href 가 출처에 있다
  none    : mode 가 none 이다(기록에 없는 것을 없다고 했다)
  careful : 팀원이 한 일을 본인 일로 답하지 않았다(must_not 이 답에 없다). none 도 통과
  broad   : mode 가 answer 이고 any 가운데 min 개 이상을 답에서 들었다(여러 프로젝트를 묶었는지)
"""

import asyncio
import json
import sys
from pathlib import Path

from app.services import career_service

# --holdout: 문턱과 프롬프트를 맞출 때 쓰지 않은 문항. 고친 뒤에 한 번만 돌려 그대로 적는다.
_FILE = (
    "career_questions_holdout2.json" if "--holdout2" in sys.argv
    else "career_questions_holdout.json" if "--holdout" in sys.argv
    else "career_questions.json"
)
QUESTIONS = json.loads((Path(__file__).parent / _FILE).read_text(encoding="utf-8"))


def grade(item: dict, out: dict) -> tuple[bool, str]:
    mode, answer = out["mode"], out["answer"]
    expect = item["expect"]
    if expect == "none":
        return mode == "none", mode
    if expect == "careful":
        bad = [m for m in item.get("must_not", []) if m in answer]
        return not bad, mode + (f" · 금지어 {bad}" if bad else "")
    if expect == "broad":
        # 넓은 질문: 답이 나왔고, any 가운데 min 개 이상(프로젝트 이름 등)을 들었다.
        named = [a for a in item["any"] if a in answer]
        ok = mode == "answer" and len(named) >= item.get("min", 1)
        return ok, f"{mode} · {len(named)}개 언급"
    if mode != "answer":
        return False, mode + (" · " + out["note"] if out["note"] else "")
    if not any(a in answer for a in item["any"]):
        return False, "답에 정답 없음"
    if item.get("href") and item["href"] not in [s["href"] for s in out["sources"]]:
        return False, "출처 다름 " + ",".join(s["href"] for s in out["sources"])
    return True, mode


async def main() -> None:
    search_only = "--search" in sys.argv
    index = career_service.get_index()
    rows, passed = [], {"answer": [0, 0], "none": [0, 0], "careful": [0, 0], "broad": [0, 0]}
    for item in QUESTIONS:
        q = item["q"]
        if search_only:
            qvec = await career_service._embed_query(q)
            found = index.search(q, qvec)
            top = found.hits[0].chunk if found.hits else {}
            hrefs = [h.chunk["href"] for h in found.hits]
            hit = "-" if not item.get("href") else ("O" if item["href"] in hrefs else "X")
            cos = f"{found.top_cosine:.2f}" if found.top_cosine is not None else " -  "
            rows.append(f"{item['expect']:7} cos {cos} cov {found.coverage:.2f} enough {int(found.enough)} hit {hit} | {q[:34]:34} | {top.get('id', '')}")
            continue
        out = await career_service.ask(q)
        ok, why = grade(item, out)
        passed[item["expect"]][0] += ok
        passed[item["expect"]][1] += 1
        rows.append(f"{'PASS' if ok else 'FAIL'} {item['expect']:7} {why:22} | {q[:40]:40} | {out['answer'][:110]}")
    print("\n".join(rows))
    if not search_only:
        total = sum(v[0] for v in passed.values()), sum(v[1] for v in passed.values())
        print(f"\n답해야 하는 문항 {passed['answer'][0]}/{passed['answer'][1]} · 없다고 해야 하는 문항 {passed['none'][0]}/{passed['none'][1]}"
              f" · 팀원 일 함정 {passed['careful'][0]}/{passed['careful'][1]} · 넓은 질문 {passed['broad'][0]}/{passed['broad'][1]} · 합계 {total[0]}/{total[1]}")


if __name__ == "__main__":
    asyncio.run(main())
