# 마을 포트폴리오 구조 지도(/resume/village-portfolio/structure)를 다시 만든다.
# template.html 에 저장소에서 세고 뽑은 값(주소 수 · 표 · 테스트 수 · 코드 발췌)을 채운다.
#
#   cd backend && python -m pytest --collect-only -q      # 맨 끝 줄의 건수를 읽는다
#   python -I -X utf8 scripts/village-structure/extract_models.py backend/app/models.py <models.json>
#   python -I -X utf8 scripts/village-structure/build.py . <models.json> <건수> <out.html>
#   node scripts/import-structure.mjs village-portfolio <out.html>
#
# 발췌 줄 번호(SPECS)는 코드가 바뀌면 밀린다. 다시 만들 때 첫 줄과 끝 줄을 눈으로 확인한다.
import io, json, os, re, sys, datetime

repo, models_json, collected, out = sys.argv[1:5]
here = os.path.dirname(os.path.abspath(__file__))
rd = lambda p: io.open(os.path.join(repo, p), encoding="utf-8").read()

# 발췌: id -> (파일, 첫 줄, 끝 줄)
SPECS = {
    "clamp": ("backend/app/services/commission_service.py", 163, 188),
    "gate": ("backend/app/agents/gate.py", 166, 195),
    "guard": ("backend/app/agents/runner.py", 75, 102),
    "numbers": ("backend/app/services/career_guard.py", 35, 51),
    "ask": ("backend/app/services/career_service.py", 572, 595),
    "outcome": ("backend/app/services/relationship_rules.py", 302, 322),
    "answer": ("backend/app/services/chat_service.py", 61, 75),
    "derive": ("backend/app/services/village_service.py", 69, 85),
    "warmup": ("src/components/village/VillageScene.tsx", 1036, 1047),
    "push": ("src/components/ui/landing/pushWithTransition.ts", 36, 61),
    "plan": ("backend/app/services/plan_service.py", 128, 143),
}
code = {}
for k, (f, a, b) in SPECS.items():
    lines = rd(f).split("\n")[a - 1 : b]
    lines = [l.rstrip("\r")[:160] for l in lines]
    code[k] = {"file": f, "start": a, "lines": lines}

main = rd("backend/app/main.py")
endpoints = len(re.findall(r"(?m)^@app\.(?:get|post|put|delete|patch)\(", main))
tables = json.load(io.open(models_json, encoding="utf-8"))
test_files = len([f for f in os.listdir(os.path.join(repo, "backend/tests")) if re.match(r"test_.*\.py$", f)])
services = len([f for f in os.listdir(os.path.join(repo, "backend/app/services")) if f.endswith(".py") and f != "__init__.py"])
buildings = len(re.findall(r"(?m)^\s*kind:", rd("src/lib/constants.ts")))
facts = {
    "endpoints": endpoints, "tables": len(tables), "tests": int(collected), "testFiles": test_files,
    "services": services, "buildings": buildings, "date": datetime.date.today().isoformat(),
}
tpl = io.open(os.path.join(here, "template.html"), encoding="utf-8").read()
js = lambda v: json.dumps(v, ensure_ascii=False).replace("</", "<\\/")
for mark, val in (("/*FACTS*/{}", facts), ("/*TABLES*/[]", tables), ("/*CODE*/{}", code)):
    assert mark in tpl, mark
    tpl = tpl.replace(mark, js(val))
# 아티팩트는 올릴 때 겉 틀을 씌워 준다. 사이트에 정적 파일로 둘 때는 직접 씌운다.
SKELETON = (
    '<!doctype html><html lang="ko"><head><meta charset="utf-8">'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
    "<style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);"
    "padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;padding:0;font:14px sans-serif}"
    "img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>"
)
if "--bare" not in sys.argv:
    tpl = SKELETON + chr(10) + tpl + chr(10) + "</body></html>" + chr(10)
io.open(out, "w", encoding="utf-8", newline="").write(tpl)
print(json.dumps(facts, ensure_ascii=False), len(tpl))
