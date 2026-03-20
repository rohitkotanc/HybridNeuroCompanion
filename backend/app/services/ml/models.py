from __future__ import annotations

from dataclasses import dataclass


@dataclass
class RiskModelOutput:
    risk_score: float
    rationale: dict
    urgent_escalation: bool


class VitalOnlyRiskModel:
    """
    Prototype vital-only risk scoring scaffold.
    Patient-reported text must never be passed into this class.
    """

    def __init__(self, sensitivity_bias: float = 0.65, emergency_threshold: float = 0.92):
        self.sensitivity_bias = sensitivity_bias
        self.emergency_threshold = emergency_threshold

    def predict(
        self,
        features: dict[str, float],
        baseline_strength: float,
        *,
        cohort_baseline_strength: float,
        cohort_weight: float,
        patient_history_weight: float,
        personalization_stage: str,
        baseline_group_id: str,
        confirmed_seizure_count: int,
    ) -> RiskModelOutput:
        anomaly_pressure = min(1.0, abs(features.get("max_delta_from_baseline", 0.0)) / 25.0)
        variability_pressure = min(1.0, features.get("std", 0.0) / 15.0)
        effective_baseline_strength = min(
            1.0,
            baseline_strength * patient_history_weight + cohort_baseline_strength * cohort_weight,
        )
        sparse_history_penalty = 1.0 - effective_baseline_strength
        fallback_support = 0.25 * sparse_history_penalty

        risk_score = min(
            1.0,
            0.55 * anomaly_pressure + 0.2 * variability_pressure + self.sensitivity_bias * 0.25 + fallback_support,
        )
        urgent_escalation = risk_score >= self.emergency_threshold
        rationale = {
            "anomaly_pressure": round(anomaly_pressure, 3),
            "variability_pressure": round(variability_pressure, 3),
            "baseline_strength": round(baseline_strength, 3),
            "cohort_baseline_strength": round(cohort_baseline_strength, 3),
            "effective_baseline_strength": round(effective_baseline_strength, 3),
            "fallback_mode": effective_baseline_strength < 0.4,
            "sensitivity_bias": round(self.sensitivity_bias, 3),
            "baseline_group_id": baseline_group_id,
            "personalization_stage": personalization_stage,
            "confirmed_seizure_count": confirmed_seizure_count,
            "cohort_weight": round(cohort_weight, 3),
            "patient_history_weight": round(patient_history_weight, 3),
            "full_personalization_enabled": confirmed_seizure_count >= 3,
        }
        return RiskModelOutput(risk_score=round(risk_score, 3), rationale=rationale, urgent_escalation=urgent_escalation)
