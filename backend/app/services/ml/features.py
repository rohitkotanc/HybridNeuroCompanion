from __future__ import annotations

from statistics import mean, pstdev


def compute_window_features(samples: list[float], baseline_mean: float | None = None) -> dict[str, float]:
    if not samples:
        return {"mean": 0.0, "std": 0.0, "max_delta_from_baseline": 0.0}

    current_mean = mean(samples)
    baseline_mean = baseline_mean if baseline_mean is not None else current_mean
    return {
        "mean": current_mean,
        "std": pstdev(samples) if len(samples) > 1 else 0.0,
        "max_delta_from_baseline": max(abs(value - baseline_mean) for value in samples),
    }
