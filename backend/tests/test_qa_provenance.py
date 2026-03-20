from datetime import datetime

from app.schemas.domain import DoctorQuestionRequest
from app.services.retrieval import build_cited_answer


def test_qa_answers_include_evidence_or_insufficient_evidence() -> None:
    request = DoctorQuestionRequest(
        patient_id="patient-001",
        question="How did the patient describe symptoms before episodes last month?",
        time_range_start=datetime.fromisoformat("2026-03-18T00:00:00+00:00"),
        time_range_end=datetime.fromisoformat("2026-03-19T00:00:00+00:00"),
    )
    response = build_cited_answer(
        request,
        messages=[
            {
                "id": "msg-001",
                "source_type": "patient_chat",
                "timestamp": "2026-03-18T10:50:00+00:00",
                "content": "I had a strange aura and then felt confused after.",
            }
        ],
        alerts=[],
    )
    assert response.evidence
    assert response.evidence[0].source_id == "msg-001"
