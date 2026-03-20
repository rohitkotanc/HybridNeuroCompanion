from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class Provenance(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    source_type: str
    source_id: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class VitalFeatureInput(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    feature_name: str
    feature_value: float


class VitalAlertRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    patient_id: str
    window_id: str
    timestamp: datetime
    features: list[VitalFeatureInput]
    baseline_context: dict[str, Any] = Field(default_factory=dict)


class AlertResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    alert_id: str
    patient_id: str
    alert_type: str
    risk_score: float
    model_confidence: float
    evidence_completeness: float
    doctor_confirmed_truth: str | None = None
    rationale: dict[str, Any]
    urgent_escalation: bool
    evidence_links: list[dict[str, Any]] = Field(default_factory=list)


class DoctorQuestionRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    patient_id: str
    question: str
    requested_tags: list[str] = Field(default_factory=list)
    time_range_start: datetime | None = None
    time_range_end: datetime | None = None
    source_types: list[str] = Field(default_factory=list)
    include_self_reports: bool = True


class SourceEvidence(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    source_id: str
    source_type: str
    timestamp: datetime
    snippet: str
    uri: str


class QAAnswerResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    query_id: str
    response_id: str
    answer: str
    insufficient_evidence: bool
    model_confidence: float
    evidence_completeness: float
    evidence: list[SourceEvidence]
    flagged_possible_seizure_indicators: list[dict[str, Any]] = Field(default_factory=list)


class OutcomeRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    patient_id: str
    alert_id: str | None = None
    occurred: bool
    severity: str | None = None
    seizure_type: str | None = None
    confirmed_by: str
    note: str | None = None


class AnnotationRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    patient_id: str
    event_timestamp: datetime
    annotation_type: str
    note: str
    created_by: str


class RelevanceRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    patient_id: str
    message_id: str
    tag: str
    is_relevant: bool
    created_by: str
