from datetime import datetime

from app.schemas.domain import VitalAlertRequest, VitalFeatureInput
from app.services.ml.inference import generate_alert


def test_alert_generation_uses_vital_features_only() -> None:
    request = VitalAlertRequest(
        patient_id="patient-001",
        window_id="vw-001",
        timestamp=datetime.fromisoformat("2026-03-18T11:15:00+00:00"),
        features=[
            VitalFeatureInput(feature_name="mean", feature_value=92.0),
            VitalFeatureInput(feature_name="std", feature_value=11.0),
            VitalFeatureInput(feature_name="max_delta_from_baseline", feature_value=29.0),
        ],
        baseline_context={"baseline_strength": 0.25, "patient_message": "I blacked out"},
    )

    response = generate_alert(request)
    assert response.alert_type in {"seizure-risk-high", "unusual-vitals"}
    assert response.risk_score >= 0.0
    assert "anomaly_pressure" in response.rationale
    assert "patient_message" not in response.rationale
