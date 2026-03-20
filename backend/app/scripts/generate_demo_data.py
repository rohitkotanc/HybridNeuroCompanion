from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from math import sin
from pathlib import Path
from random import Random

from app.services.personalization import build_personalization_context


ROOT = Path(__file__).resolve().parents[3]
OUTPUT_DIR = ROOT / "data" / "demo"


def iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).replace(microsecond=0).isoformat()


def main() -> None:
    rng = Random(7)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    patient_id = "patient-001"
    start = datetime(2026, 3, 18, 12, 0, tzinfo=timezone.utc)
    alert_one = datetime(2026, 3, 18, 22, 42, tzinfo=timezone.utc)
    alert_two = datetime(2026, 3, 19, 6, 18, tzinfo=timezone.utc)

    patients = [
        {
            "id": patient_id,
            "external_id": "MRN-1001",
            "name": "Taylor Reed",
            "date_of_birth": "1991-04-12",
            "gender": "Female",
            "height_cm": 168,
            "weight_kg": 64,
            "diagnoses": ["Focal epilepsy"],
            "allergies": ["Lamotrigine intolerance"],
            "care_setting": "Outpatient neurology follow-up",
            "baseline_profile": {
                "heart_rate_mean": 72,
                "hrv_mean": 41,
                "baseline_strength": 0.38,
                "cohort_baseline_strength": 0.45,
                **build_personalization_context(
                    date_of_birth="1991-04-12",
                    sex="Female",
                    height_cm=168,
                    weight_kg=64,
                    confirmed_seizure_count=2,
                ).__dict__,
            },
            "provenance_metadata": {"seed": 7, "demo": True},
        }
    ]

    def minutes_from_alert(timestamp: datetime, anchor: datetime) -> float:
        return abs((timestamp - anchor).total_seconds() / 60.0)

    vital_events = []
    for idx in range(24 * 60):
        timestamp = start + timedelta(minutes=idx)
        circadian = sin(idx / 180)
        heart_rate = 71 + int(5 * circadian) + rng.randint(-3, 3)
        pulse = max(55, heart_rate + rng.randint(-2, 2))
        hrv = 42 + int(4 * sin(idx / 210)) + rng.randint(-4, 4)
        motion = max(0, 5 + int(3 * sin(idx / 45)) + rng.randint(-3, 5))
        eeg = 17 + int(2 * sin(idx / 35)) + rng.randint(-2, 3)
        sleep_score = 54 if 7 <= timestamp.hour <= 22 else 80 + rng.randint(-8, 8)

        near_first = minutes_from_alert(timestamp, alert_one) <= 18
        near_second = minutes_from_alert(timestamp, alert_two) <= 22
        if near_first or near_second:
            heart_rate += 24 if near_first else 18
            pulse += 21 if near_first else 15
            motion += 28 if near_first else 18
            hrv -= 12 if near_first else 9
            eeg += 9 if near_first else 7
            sleep_score -= 10 if near_second else 4

        vital_events.extend(
            [
                {
                    "id": f"ve-hr-{idx}",
                    "patient_id": patient_id,
                    "stream_type": "heart_rate",
                    "timestamp": iso(timestamp),
                    "value": heart_rate,
                    "unit": "bpm",
                    "source_type": "wearable",
                    "source_id": f"device-hr-{idx}",
                },
                {
                    "id": f"ve-pulse-{idx}",
                    "patient_id": patient_id,
                    "stream_type": "pulse",
                    "timestamp": iso(timestamp),
                    "value": pulse,
                    "unit": "bpm",
                    "source_type": "wearable",
                    "source_id": f"device-pulse-{idx}",
                },
                {
                    "id": f"ve-hrv-{idx}",
                    "patient_id": patient_id,
                    "stream_type": "hrv",
                    "timestamp": iso(timestamp),
                    "value": hrv,
                    "unit": "ms",
                    "source_type": "wearable",
                    "source_id": f"device-hrv-{idx}",
                },
                {
                    "id": f"ve-motion-{idx}",
                    "patient_id": patient_id,
                    "stream_type": "motion",
                    "timestamp": iso(timestamp),
                    "value": motion,
                    "unit": "arb",
                    "source_type": "wearable",
                    "source_id": f"device-motion-{idx}",
                },
                {
                    "id": f"ve-eeg-{idx}",
                    "patient_id": patient_id,
                    "stream_type": "eeg",
                    "timestamp": iso(timestamp),
                    "value": eeg,
                    "unit": "uV",
                    "source_type": "eeg_monitor",
                    "source_id": f"device-eeg-{idx}",
                },
                {
                    "id": f"ve-sleep-{idx}",
                    "patient_id": patient_id,
                    "stream_type": "sleep",
                    "timestamp": iso(timestamp),
                    "value": max(0, min(100, sleep_score)),
                    "unit": "score",
                    "source_type": "sleep_tracker",
                    "source_id": f"device-sleep-{idx}",
                },
            ]
        )

    patient_messages = [
        {
            "id": "msg-001",
            "patient_id": patient_id,
            "timestamp": iso(datetime(2026, 3, 18, 22, 30, tzinfo=timezone.utc)),
            "author_role": "patient",
            "language_code": "en",
            "content": "I had a strange aura and then felt confused after. I may have blacked out for a minute.",
            "source_type": "patient_chat",
            "source_id": "chat-001",
        },
        {
            "id": "msg-002",
            "patient_id": patient_id,
            "timestamp": iso(datetime(2026, 3, 18, 23, 5, tzinfo=timezone.utc)),
            "author_role": "patient",
            "language_code": "en",
            "content": "I am still tired and disoriented but can answer basic questions now.",
            "source_type": "patient_chat",
            "source_id": "chat-002",
        },
        {
            "id": "msg-003",
            "patient_id": patient_id,
            "timestamp": iso(datetime(2026, 3, 19, 6, 5, tzinfo=timezone.utc)),
            "author_role": "patient",
            "language_code": "en",
            "content": "I woke up feeling off, then had trouble focusing and felt shaky.",
            "source_type": "patient_chat",
            "source_id": "chat-003",
        },
    ]

    care_events = [
        {
            "id": "evt-001",
            "patient_id": patient_id,
            "timestamp": iso(datetime(2026, 3, 18, 21, 55, tzinfo=timezone.utc)),
            "title": "Medication logged",
            "description": "Evening anti-seizure medication recorded.",
            "event_type": "medication",
            "source_type": "care_log",
            "source_id": "care-001",
        },
        {
            "id": "evt-002",
            "patient_id": patient_id,
            "timestamp": iso(alert_one),
            "title": "High-risk alert raised",
            "description": "Body-signal alert generated for doctor review.",
            "event_type": "alert",
            "source_type": "care_log",
            "source_id": "care-002",
        },
        {
            "id": "evt-003",
            "patient_id": patient_id,
            "timestamp": iso(datetime(2026, 3, 18, 23, 10, tzinfo=timezone.utc)),
            "title": "Post-event check-in",
            "description": "Care team reviewed patient orientation after the event.",
            "event_type": "check_in",
            "source_type": "care_log",
            "source_id": "care-003",
        },
        {
            "id": "evt-004",
            "patient_id": patient_id,
            "timestamp": iso(datetime(2026, 3, 19, 5, 55, tzinfo=timezone.utc)),
            "title": "Sleep disruption noted",
            "description": "Wearable sleep quality dip noted before morning changes.",
            "event_type": "sleep_note",
            "source_type": "care_log",
            "source_id": "care-004",
        },
        {
            "id": "evt-005",
            "patient_id": patient_id,
            "timestamp": iso(alert_two),
            "title": "Morning unusual-vitals alert",
            "description": "Second body-signal pattern prompted review.",
            "event_type": "alert",
            "source_type": "care_log",
            "source_id": "care-005",
        },
        {
            "id": "evt-006",
            "patient_id": patient_id,
            "timestamp": iso(datetime(2026, 3, 19, 7, 0, tzinfo=timezone.utc)),
            "title": "Caregiver note",
            "description": "Caregiver reported slower-than-usual recovery.",
            "event_type": "caregiver_note",
            "source_type": "care_log",
            "source_id": "care-006",
        },
    ]

    alerts = [
        {
            "id": "alert-001",
            "patient_id": patient_id,
            "vital_window_id": "vw-001",
            "model_version_id": "model-001",
            "alert_type": "seizure-risk-high",
            "status": "open",
            "risk_score": 0.84,
            "model_confidence": 0.73,
            "evidence_completeness": 0.61,
            "doctor_confirmed_truth": None,
            "alert_timestamp": iso(alert_one),
            "rationale": {
                "anomaly_pressure": 0.88,
                "variability_pressure": 0.51,
                "baseline_strength": 0.38,
                "fallback_mode": True,
            },
            "urgent_escalation": False,
            "source_type": "vital_pipeline",
            "source_id": "vw-001",
        },
        {
            "id": "alert-002",
            "patient_id": patient_id,
            "vital_window_id": "vw-002",
            "model_version_id": "model-001",
            "alert_type": "unusual-vitals",
            "status": "open",
            "risk_score": 0.67,
            "model_confidence": 0.59,
            "evidence_completeness": 0.64,
            "doctor_confirmed_truth": None,
            "alert_timestamp": iso(alert_two),
            "rationale": {
                "anomaly_pressure": 0.61,
                "variability_pressure": 0.39,
                "baseline_strength": 0.38,
                "fallback_mode": True,
            },
            "urgent_escalation": False,
            "source_type": "vital_pipeline",
            "source_id": "vw-002",
        },
    ]

    for name, payload in {
        "patients.json": patients,
        "vital_events.json": vital_events,
        "patient_messages.json": patient_messages,
        "care_events.json": care_events,
        "alerts.json": alerts,
    }.items():
        (OUTPUT_DIR / name).write_text(json.dumps(payload, indent=2))

    print(f"Wrote demo data to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
