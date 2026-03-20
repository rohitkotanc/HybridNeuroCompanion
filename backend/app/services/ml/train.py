from __future__ import annotations

from dataclasses import dataclass


@dataclass
class TrainingSummary:
    auroc: float
    auprc: float
    sensitivity: float
    specificity: float
    false_alarm_rate: float
    time_to_warning_minutes: float
    calibration_error: float


def run_training_stub() -> TrainingSummary:
    """
    Placeholder for supervised/semi-supervised training.
    Intended future flow:
    - train on science-based default dataset
    - adapt with patient-specific confirmed outcomes
    - preserve patient-level and temporal splits to avoid leakage
    """
    return TrainingSummary(
        auroc=0.78,
        auprc=0.51,
        sensitivity=0.89,
        specificity=0.58,
        false_alarm_rate=0.19,
        time_to_warning_minutes=12.0,
        calibration_error=0.08,
    )
