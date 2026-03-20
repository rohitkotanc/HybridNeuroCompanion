from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TimestampedMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Patient(Base, TimestampedMixin):
    __tablename__ = "patients"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    external_id: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String)
    date_of_birth: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    baseline_profile: Mapped[dict] = mapped_column(JSON, default=dict)
    provenance_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class VitalEvent(Base, TimestampedMixin):
    __tablename__ = "vital_events"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"), index=True)
    stream_type: Mapped[str] = mapped_column(String, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, index=True)
    value: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String)
    source_type: Mapped[str] = mapped_column(String)
    source_id: Mapped[str] = mapped_column(String, index=True)
    provenance_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class VitalWindow(Base, TimestampedMixin):
    __tablename__ = "vital_windows"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"), index=True)
    window_start: Mapped[datetime] = mapped_column(DateTime, index=True)
    window_end: Mapped[datetime] = mapped_column(DateTime, index=True)
    source_type: Mapped[str] = mapped_column(String)
    source_id: Mapped[str] = mapped_column(String)
    raw_stream_summary: Mapped[dict] = mapped_column(JSON, default=dict)
    provenance_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class DerivedFeature(Base, TimestampedMixin):
    __tablename__ = "derived_features"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"), index=True)
    vital_window_id: Mapped[str] = mapped_column(ForeignKey("vital_windows.id"), index=True)
    feature_name: Mapped[str] = mapped_column(String, index=True)
    feature_value: Mapped[float] = mapped_column(Float)
    source_type: Mapped[str] = mapped_column(String)
    source_id: Mapped[str] = mapped_column(String)
    provenance_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class ModelVersion(Base, TimestampedMixin):
    __tablename__ = "model_versions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    model_name: Mapped[str] = mapped_column(String, index=True)
    model_type: Mapped[str] = mapped_column(String)
    training_data_summary: Mapped[dict] = mapped_column(JSON, default=dict)
    calibration_summary: Mapped[dict] = mapped_column(JSON, default=dict)
    provenance_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Alert(Base, TimestampedMixin):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"), index=True)
    vital_window_id: Mapped[str] = mapped_column(ForeignKey("vital_windows.id"), index=True)
    model_version_id: Mapped[str] = mapped_column(ForeignKey("model_versions.id"), index=True)
    alert_type: Mapped[str] = mapped_column(String, index=True)
    status: Mapped[str] = mapped_column(String, default="open")
    risk_score: Mapped[float] = mapped_column(Float)
    model_confidence: Mapped[float] = mapped_column(Float)
    evidence_completeness: Mapped[float] = mapped_column(Float)
    doctor_confirmed_truth: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    alert_timestamp: Mapped[datetime] = mapped_column(DateTime, index=True)
    rationale: Mapped[dict] = mapped_column(JSON, default=dict)
    urgent_escalation: Mapped[bool] = mapped_column(Boolean, default=False)
    source_type: Mapped[str] = mapped_column(String)
    source_id: Mapped[str] = mapped_column(String)
    provenance_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class SeizureOutcome(Base, TimestampedMixin):
    __tablename__ = "seizure_outcomes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"), index=True)
    alert_id: Mapped[Optional[str]] = mapped_column(ForeignKey("alerts.id"), nullable=True, index=True)
    occurred: Mapped[bool] = mapped_column(Boolean)
    severity: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    seizure_type: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    confirmed_at: Mapped[datetime] = mapped_column(DateTime, index=True)
    confirmed_by: Mapped[str] = mapped_column(String)
    source_type: Mapped[str] = mapped_column(String)
    source_id: Mapped[str] = mapped_column(String)
    provenance_metadata: Mapped[dict] = mapped_column(JSON, default=dict)


class DoctorAnnotation(Base, TimestampedMixin):
    __tablename__ = "doctor_annotations"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"), index=True)
    event_timestamp: Mapped[datetime] = mapped_column(DateTime, index=True)
    annotation_type: Mapped[str] = mapped_column(String, index=True)
    note: Mapped[str] = mapped_column(Text)
    source_type: Mapped[str] = mapped_column(String)
    source_id: Mapped[str] = mapped_column(String)
    provenance_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_by: Mapped[str] = mapped_column(String)
    confirmed_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class PatientMessage(Base, TimestampedMixin):
    __tablename__ = "patient_messages"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, index=True)
    author_role: Mapped[str] = mapped_column(String)
    language_code: Mapped[str] = mapped_column(String, default="en")
    content: Mapped[str] = mapped_column(Text)
    source_type: Mapped[str] = mapped_column(String)
    source_id: Mapped[str] = mapped_column(String)
    provenance_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class RelevanceTag(Base, TimestampedMixin):
    __tablename__ = "relevance_tags"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"), index=True)
    message_id: Mapped[str] = mapped_column(ForeignKey("patient_messages.id"), index=True)
    tag: Mapped[str] = mapped_column(String, index=True)
    is_relevant: Mapped[bool] = mapped_column(Boolean)
    source_type: Mapped[str] = mapped_column(String)
    source_id: Mapped[str] = mapped_column(String)
    provenance_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_by: Mapped[str] = mapped_column(String)


class SeizureGlossaryTerm(Base, TimestampedMixin):
    __tablename__ = "seizure_glossary_terms"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    canonical_term: Mapped[str] = mapped_column(String, index=True)
    synonyms: Mapped[list] = mapped_column(JSON, default=list)
    severity_hint: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    source_type: Mapped[str] = mapped_column(String)
    source_id: Mapped[str] = mapped_column(String)
    provenance_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class EvidenceLink(Base, TimestampedMixin):
    __tablename__ = "evidence_links"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"), index=True)
    target_type: Mapped[str] = mapped_column(String, index=True)
    target_id: Mapped[str] = mapped_column(String, index=True)
    source_type: Mapped[str] = mapped_column(String)
    source_id: Mapped[str] = mapped_column(String)
    timestamp: Mapped[datetime] = mapped_column(DateTime, index=True)
    snippet: Mapped[str] = mapped_column(Text)
    provenance_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class QAQuery(Base, TimestampedMixin):
    __tablename__ = "qa_queries"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"), index=True)
    query_text: Mapped[str] = mapped_column(Text)
    filters: Mapped[dict] = mapped_column(JSON, default=dict)
    source_type: Mapped[str] = mapped_column(String)
    source_id: Mapped[str] = mapped_column(String)
    provenance_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_by: Mapped[str] = mapped_column(String)


class QAResponse(Base, TimestampedMixin):
    __tablename__ = "qa_responses"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"), index=True)
    query_id: Mapped[str] = mapped_column(ForeignKey("qa_queries.id"), index=True)
    response_text: Mapped[str] = mapped_column(Text)
    insufficient_evidence: Mapped[bool] = mapped_column(Boolean, default=False)
    model_confidence: Mapped[float] = mapped_column(Float)
    evidence_completeness: Mapped[float] = mapped_column(Float)
    source_type: Mapped[str] = mapped_column(String)
    source_id: Mapped[str] = mapped_column(String)
    provenance_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_by: Mapped[str] = mapped_column(String)


class SourceReference(Base, TimestampedMixin):
    __tablename__ = "source_references"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"), index=True)
    ref_type: Mapped[str] = mapped_column(String, index=True)
    ref_id: Mapped[str] = mapped_column(String, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, index=True)
    title: Mapped[str] = mapped_column(String)
    uri: Mapped[str] = mapped_column(String)
    source_type: Mapped[str] = mapped_column(String)
    source_id: Mapped[str] = mapped_column(String)
    provenance_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class FeedbackRecord(Base, TimestampedMixin):
    __tablename__ = "feedback_records"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"), index=True)
    target_type: Mapped[str] = mapped_column(String, index=True)
    target_id: Mapped[str] = mapped_column(String, index=True)
    feedback_type: Mapped[str] = mapped_column(String, index=True)
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    source_type: Mapped[str] = mapped_column(String)
    source_id: Mapped[str] = mapped_column(String)
    provenance_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_by: Mapped[str] = mapped_column(String)
