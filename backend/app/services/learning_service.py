"""코딩테스트 풀이 기록 + CS 전공지식 노트의 저장/조회 + AI 컨텍스트 헬퍼."""

from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.models import CodingTestLog, CsNoteLog
from app.schemas import CodingTestIn, CsNoteIn
from app.time_utils import today_local


# ─────────────────────────── 코딩테스트 ───────────────────────────

def list_coding_tests(db: Session, limit: int | None = None) -> list[CodingTestLog]:
    query = db.query(CodingTestLog).order_by(desc(CodingTestLog.solved_date), desc(CodingTestLog.id))
    if limit:
        query = query.limit(limit)
    return query.all()


def create_coding_test(db: Session, payload: CodingTestIn) -> CodingTestLog:
    log = CodingTestLog(
        solved_date=payload.solved_date or today_local(),
        platform=payload.platform.strip(),
        problem_no=payload.problem_no.strip(),
        title=payload.title.strip(),
        difficulty=payload.difficulty.strip(),
        language=payload.language.strip(),
        url=payload.url.strip(),
        code=payload.code,
        approach=payload.approach.strip(),
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def delete_coding_test(db: Session, log_id: int) -> bool:
    log = db.get(CodingTestLog, log_id)
    if not log:
        return False
    db.delete(log)
    db.commit()
    return True


def count_coding_tests(db: Session) -> int:
    return db.query(func.count(CodingTestLog.id)).scalar() or 0


def count_coding_tests_today(db: Session) -> int:
    return (
        db.query(func.count(CodingTestLog.id))
        .filter(CodingTestLog.solved_date == today_local())
        .scalar()
        or 0
    )


# ─────────────────────────── CS 전공지식 ───────────────────────────

def list_cs_notes(db: Session, limit: int | None = None) -> list[CsNoteLog]:
    query = db.query(CsNoteLog).order_by(desc(CsNoteLog.study_date), desc(CsNoteLog.id))
    if limit:
        query = query.limit(limit)
    return query.all()


def create_cs_note(db: Session, payload: CsNoteIn) -> CsNoteLog:
    note = CsNoteLog(
        study_date=payload.study_date or today_local(),
        category=payload.category.strip(),
        title=payload.title.strip(),
        content=payload.content,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def delete_cs_note(db: Session, note_id: int) -> bool:
    note = db.get(CsNoteLog, note_id)
    if not note:
        return False
    db.delete(note)
    db.commit()
    return True


def count_cs_notes(db: Session) -> int:
    return db.query(func.count(CsNoteLog.id)).scalar() or 0


def count_cs_notes_today(db: Session) -> int:
    return (
        db.query(func.count(CsNoteLog.id))
        .filter(CsNoteLog.study_date == today_local())
        .scalar()
        or 0
    )


# ─────────────────────────── AI 컨텍스트 헬퍼 ───────────────────────────

def coding_test_brief_lines(logs: list[CodingTestLog]) -> list[str]:
    """다른 NPC도 가볍게 언급할 수 있는 한 줄 요약."""
    lines: list[str] = []
    for log in logs:
        platform = log.platform or "코딩테스트"
        diff = f" {log.difficulty}" if log.difficulty else ""
        lang = f" ({log.language})" if log.language else ""
        lines.append(f"- {log.solved_date} {platform}{diff} '{log.title}'{lang}")
    return lines


def coding_test_detail_lines(logs: list[CodingTestLog]) -> list[str]:
    """코딩테스트 전담 NPC가 코드/풀이까지 설명할 수 있는 상세 컨텍스트."""
    blocks: list[str] = []
    for log in logs:
        parts = [
            f"[{log.solved_date}] {log.platform or '코딩테스트'} "
            f"{('#' + log.problem_no + ' ') if log.problem_no else ''}{log.title}"
            f"{(' / 난이도 ' + log.difficulty) if log.difficulty else ''}"
            f"{(' / 언어 ' + log.language) if log.language else ''}"
        ]
        if log.approach.strip():
            parts.append(f"  풀이: {log.approach.strip()}")
        if log.code.strip():
            snippet = log.code.strip()
            if len(snippet) > 1200:
                snippet = snippet[:1200] + "\n...(코드 생략)"
            parts.append(f"  코드:\n{snippet}")
        blocks.append("\n".join(parts))
    return blocks


def cs_note_brief_lines(notes: list[CsNoteLog]) -> list[str]:
    lines: list[str] = []
    for note in notes:
        category = f"[{note.category}] " if note.category else ""
        lines.append(f"- {note.study_date} {category}{note.title}")
    return lines


def cs_note_detail_lines(notes: list[CsNoteLog]) -> list[str]:
    blocks: list[str] = []
    for note in notes:
        category = f"[{note.category}] " if note.category else ""
        content = note.content.strip()
        if len(content) > 1400:
            content = content[:1400] + "\n...(내용 생략)"
        blocks.append(f"[{note.study_date}] {category}{note.title}\n{content}")
    return blocks
