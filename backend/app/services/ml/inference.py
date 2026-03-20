from __future__ import annotations

from app.schemas.domain import AlertResponse, VitalAlertRequest
from app.services.confidence import compose_confidence
from app.services.ml.models import VitalOnlyRiskModel
from app.services.personalization import build_personalization_context


def generate_alert(request: VitalAlertRequest) -> AlertResponse:
    features = {item.feature_name: item.feature_value for item in request.features}
    baseline_strength = float(request.baseline_context.get("baseline_strength", 0.3))
    cohort_baseline_strength = float(request.baseline_context.get("cohort_baseline_strength", 0.45))
    personalization = build_personalization_context(
        date_of_birth=request.baseline_context.get("date_of_birth"),
        sex=request.baseline_context.get("sex"),
        height_cm=request.baseline_context.get("height_cm"),
        weight_kg=request.baseline_context.get("weight_kg"),
        confirmed_seizure_count=int(request.baseline_context.get("confirmed_seizure_count", 0)),
    )
    model = VitalOnlyRiskModel()
    result = model.predict(
        features=features,
        baseline_strength=baseline_strength,
        cohort_baseline_strength=cohort_baseline_strength,
        cohort_weight=personalization.cohort_weight,
        patient_history_weight=personalization.patient_history_weight,
        personalization_stage=personalization.personalization_stage,
        baseline_group_id=personalization.baseline_group_id,
        confirmed_seizure_count=personalization.confirmed_seizure_count,
    )

    confidence = compose_confidence(
        model_confidence=max(0.35, result.risk_score - 0.1),
        evidence_completeness=min(1.0, 0.3 + 0.4 * baseline_strength + 0.3 * personalization.patient_history_weight),
        doctor_confirmed_truth=None,
    )
    alert_type = "seizure-risk-high" if result.risk_score >= 0.7 else "unusual-vitals"
    return AlertResponse(
        alert_id=f"alert-{request.window_id}",
        patient_id=request.patient_id,
        alert_type=alert_type,
        risk_score=result.risk_score,
        model_confidence=confidence.model_confidence,
        evidence_completeness=confidence.evidence_completeness,
        rationale=result.rationale,
        urgent_escalation=result.urgent_escalation,
        evidence_links=[
            {
                "source_type": "vital_window",
                "source_id": request.window_id,
                "timestamp": request.timestamp.isoformat(),
            }
        ],
    )
