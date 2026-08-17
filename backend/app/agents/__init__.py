"""의뢰 공방 3단계 — 직군별 에이전트가 실제 산출물을 만드는 층.

- gate.py      상태 기계. "관리자 승인 없이는 진행하지 않는다"를 코드로 강제한다
- workspace.py 작업 공간 격리. 에이전트가 지정 폴더 밖에 못 쓰게 한다
- prompts.py   직군별 시스템 프롬프트
- runner.py    Claude Agent SDK 호출
- cli.py       터미널에서 실행하는 경로
"""
