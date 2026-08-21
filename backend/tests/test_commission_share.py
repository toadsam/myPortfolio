"""4단계 — 시안을 손님에게 공개하는 규칙.

시안을 납품물이 아니라 **미끼**로 쓴다. 추상적인 질문 열 개보다 구체적으로 틀린
시안 한 장이 정보를 훨씬 많이 뽑아낸다.

여기서 지키는 것 둘:
1. 기본은 비공개다. 검수 전 산출물이 새 나가면 안 된다.
2. 한 번에 하나만 공개된다. 손님에게 파일 목록을 늘어놓는 자리가 아니라
   반응 하나를 받아내는 자리라서, 여러 개를 띄우면 초점이 흩어진다.
"""

from app.models import CommissionArtifact, CommissionRequest
from app.schemas import CommissionIn
from app.services import commission_service as cs


def _make(db) -> CommissionRequest:
    return cs.create_commission(
        db,
        CommissionIn(
            contact_email="a@b.com",
            site_type="랜딩",
            summary="가게 소개",
            requirements={"pages": ["메인"]},
            consent=True,
        ),
    )


def _artifact(db, commission, rel_path: str, kind: str = "html") -> CommissionArtifact:
    row = CommissionArtifact(
        commission_id=commission.id,
        task_id=1,
        rel_path=rel_path,
        kind=kind,
        size_bytes=100,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def test_artifacts_start_private(db_session):
    commission = _make(db_session)
    artifact = _artifact(db_session, commission, "03-프론트/시안.html")
    assert artifact.shared is False


def test_sharing_one_unshares_the_others(db_session):
    commission = _make(db_session)
    first = _artifact(db_session, commission, "03-프론트/시안.html")
    second = _artifact(db_session, commission, "03-프론트/시안-2.html")

    cs.set_artifact_shared(db_session, commission, first, True)
    cs.set_artifact_shared(db_session, commission, second, True)

    db_session.refresh(first)
    assert first.shared is False
    assert second.shared is True


def test_unsharing_leaves_nothing_shared(db_session):
    commission = _make(db_session)
    artifact = _artifact(db_session, commission, "03-프론트/시안.html")

    cs.set_artifact_shared(db_session, commission, artifact, True)
    cs.set_artifact_shared(db_session, commission, artifact, False)

    assert cs.shared_artifact_for(db_session, commission.id) is None


def test_sharing_does_not_leak_across_commissions(db_session):
    """다른 의뢰의 시안이 이 손님에게 보이면 안 된다."""
    mine = _make(db_session)
    other = _make(db_session)
    other_artifact = _artifact(db_session, other, "03-프론트/시안.html")
    cs.set_artifact_shared(db_session, other, other_artifact, True)

    assert cs.shared_artifact_for(db_session, mine.id) is None


def test_shared_artifact_is_none_when_file_is_gone(db_session):
    """색인만 남고 파일이 사라진 경우 — 워크스페이스를 지웠을 때 실제로 생긴다."""
    commission = _make(db_session)
    artifact = _artifact(db_session, commission, "03-프론트/없는파일.html")
    cs.set_artifact_shared(db_session, commission, artifact, True)

    assert cs.shared_artifact_for(db_session, commission.id) is None
