from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
DEMO_DIR = ROOT / "data" / "demo"


def _read_json(name: str) -> list[dict]:
    path = DEMO_DIR / name
    if not path.exists():
        return []
    return json.loads(path.read_text())


def get_demo_patients() -> list[dict]:
    return _read_json("patients.json")


def get_demo_messages(patient_id: str) -> list[dict]:
    return [item for item in _read_json("patient_messages.json") if item["patient_id"] == patient_id]


def get_demo_alerts(patient_id: str) -> list[dict]:
    return [item for item in _read_json("alerts.json") if item["patient_id"] == patient_id]


def get_demo_vitals(patient_id: str) -> list[dict]:
    return [item for item in _read_json("vital_events.json") if item["patient_id"] == patient_id]


def get_demo_events(patient_id: str) -> list[dict]:
    return [item for item in _read_json("care_events.json") if item["patient_id"] == patient_id]


def get_source_record(source_type: str, source_id: str) -> dict | None:
    file_map = {
        "patient_chat": "patient_messages.json",
        "vital_pipeline": "alerts.json",
        "wearable": "vital_events.json",
        "eeg_monitor": "vital_events.json",
        "sleep_tracker": "vital_events.json",
        "care_log": "care_events.json",
    }
    name = file_map.get(source_type)
    if not name:
        return None

    for item in _read_json(name):
        if item.get("source_id") == source_id or item.get("id") == source_id:
            return item
    return None
