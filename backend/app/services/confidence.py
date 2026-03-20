from __future__ import annotations

from dataclasses import dataclass


@dataclass
class ConfidenceBundle:
    model_confidence: float
    evidence_completeness: float
    doctor_confirmed_truth: str | None


def bound_score(value: float) -> float:
    return max(0.0, min(1.0, round(value, 3)))


def compose_confidence(
    model_confidence: float,
    evidence_completeness: float,
    doctor_confirmed_truth: str | None = None,
) -> ConfidenceBundle:
    return ConfidenceBundle(
        model_confidence=bound_score(model_confidence),
        evidence_completeness=bound_score(evidence_completeness),
        doctor_confirmed_truth=doctor_confirmed_truth,
    )
