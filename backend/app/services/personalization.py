from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime


FULL_PERSONALIZATION_SEIZURE_THRESHOLD = 3


@dataclass
class PersonalizationContext:
    baseline_group_id: str
    personalization_stage: str
    confirmed_seizure_count: int
    cohort_weight: float
    patient_history_weight: float
    full_personalization_enabled: bool


def compute_age(date_of_birth: str | None, today: date | None = None) -> int | None:
    if not date_of_birth:
        return None
    today = today or date.today()
    birth = datetime.fromisoformat(date_of_birth).date()
    age = today.year - birth.year
    if (today.month, today.day) < (birth.month, birth.day):
        age -= 1
    return age


def assign_baseline_group(
    *,
    age: int | None,
    sex: str | None,
    height_cm: float | None,
    weight_kg: float | None,
) -> str:
    age_band = "unknown_age"
    if age is not None:
        if age < 18:
            age_band = "pediatric"
        elif age < 40:
            age_band = "adult_18_39"
        elif age < 65:
            age_band = "adult_40_64"
        else:
            age_band = "older_adult"

    sex_band = (sex or "unknown").strip().lower().replace(" ", "_")
    body_band = "unknown_body"
    if height_cm and weight_kg and height_cm > 0:
        bmi = weight_kg / ((height_cm / 100) ** 2)
        if bmi < 18.5:
            body_band = "low_bmi"
        elif bmi < 25:
            body_band = "mid_bmi"
        elif bmi < 30:
            body_band = "high_bmi"
        else:
            body_band = "very_high_bmi"

    return f"{age_band}__{sex_band}__{body_band}"


def determine_personalization_stage(confirmed_seizure_count: int) -> str:
    if confirmed_seizure_count <= 0:
        return "cold_start"
    if confirmed_seizure_count < FULL_PERSONALIZATION_SEIZURE_THRESHOLD:
        return "early_personalization"
    return "personalized"


def build_personalization_context(
    *,
    date_of_birth: str | None,
    sex: str | None,
    height_cm: float | None,
    weight_kg: float | None,
    confirmed_seizure_count: int,
) -> PersonalizationContext:
    age = compute_age(date_of_birth, today=date(2026, 3, 19))
    baseline_group_id = assign_baseline_group(age=age, sex=sex, height_cm=height_cm, weight_kg=weight_kg)
    stage = determine_personalization_stage(confirmed_seizure_count)

    if stage == "cold_start":
        cohort_weight = 0.85
        patient_history_weight = 0.15
    elif stage == "early_personalization":
        cohort_weight = 0.55
        patient_history_weight = 0.45
    else:
        cohort_weight = 0.2
        patient_history_weight = 0.8

    return PersonalizationContext(
        baseline_group_id=baseline_group_id,
        personalization_stage=stage,
        confirmed_seizure_count=confirmed_seizure_count,
        cohort_weight=cohort_weight,
        patient_history_weight=patient_history_weight,
        full_personalization_enabled=confirmed_seizure_count >= FULL_PERSONALIZATION_SEIZURE_THRESHOLD,
    )
