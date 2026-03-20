from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter

from app.schemas.domain import (
    AlertResponse,
    AnnotationRequest,
    DoctorQuestionRequest,
    OutcomeRequest,
    QAAnswerResponse,
    RelevanceRequest,
    VitalAlertRequest,
)
from app.services.demo_repository import (
    get_demo_alerts,
    get_demo_events,
    get_demo_messages,
    get_demo_patients,
    get_demo_vitals,
    get_source_record,
)
from app.services.ml.inference import generate_alert
from app.services.retrieval import build_cited_answer

router = APIRouter()


@router.get("/health")
def healthcheck() -> dict:
    return {
        "status": "ok",
        "warning": "This prototype is decision-support software and not a substitute for licensed medical judgment.",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/patients")
def list_patients() -> list[dict]:
    return get_demo_patients()


@router.get("/patients/{patient_id}/timeline")
def patient_timeline(patient_id: str) -> dict:
    return {
        "patient_id": patient_id,
        "alerts": get_demo_alerts(patient_id),
        "events": get_demo_events(patient_id),
        "messages": get_demo_messages(patient_id),
        "vitals": get_demo_vitals(patient_id),
    }


@router.get("/records/{source_type}/{source_id}")
def source_record(source_type: str, source_id: str) -> dict:
    record = get_source_record(source_type, source_id)
    if record is None:
        return {
            "found": False,
            "source_type": source_type,
            "source_id": source_id,
            "warning": "No matching demo record found.",
        }
    return {
        "found": True,
        "source_type": source_type,
        "source_id": source_id,
        "record": record,
    }


@router.post("/alerts/estimate", response_model=AlertResponse)
def estimate_alert(payload: VitalAlertRequest) -> AlertResponse:
    return generate_alert(payload)


@router.post("/qa/ask", response_model=QAAnswerResponse)
def ask_question(payload: DoctorQuestionRequest) -> QAAnswerResponse:
    messages = get_demo_messages(payload.patient_id) if payload.include_self_reports else []
    alerts = get_demo_alerts(payload.patient_id)
    return build_cited_answer(payload, messages=messages, alerts=alerts)


@router.post("/outcomes")
def capture_outcome(payload: OutcomeRequest) -> dict:
    return {
        "status": "captured",
        "patient_id": payload.patient_id,
        "alert_id": payload.alert_id,
        "occurred": payload.occurred,
        "confirmed_by": payload.confirmed_by,
        "next_step": "Store outcome in SeizureOutcome and FeedbackRecord for retraining.",
    }


@router.post("/annotations")
def create_annotation(payload: AnnotationRequest) -> dict:
    return {"status": "captured", "annotation_type": payload.annotation_type, "timestamp": payload.event_timestamp}


@router.post("/messages/relevance")
def set_relevance(payload: RelevanceRequest) -> dict:
    return {
        "status": "captured",
        "message_id": payload.message_id,
        "tag": payload.tag,
        "is_relevant": payload.is_relevant,
    }
