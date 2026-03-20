from app.services.personalization import (
    FULL_PERSONALIZATION_SEIZURE_THRESHOLD,
    assign_baseline_group,
    build_personalization_context,
    determine_personalization_stage,
)


def test_assign_baseline_group_uses_demographics() -> None:
    group_id = assign_baseline_group(age=34, sex="Female", height_cm=168, weight_kg=64)
    assert group_id == "adult_18_39__female__mid_bmi"


def test_personalization_waits_until_three_confirmed_seizures() -> None:
    assert determine_personalization_stage(0) == "cold_start"
    assert determine_personalization_stage(FULL_PERSONALIZATION_SEIZURE_THRESHOLD - 1) == "early_personalization"
    assert determine_personalization_stage(FULL_PERSONALIZATION_SEIZURE_THRESHOLD) == "personalized"


def test_build_personalization_context_sets_weights() -> None:
    context = build_personalization_context(
        date_of_birth="1991-04-12",
        sex="Female",
        height_cm=168,
        weight_kg=64,
        confirmed_seizure_count=2,
    )
    assert context.personalization_stage == "early_personalization"
    assert context.full_personalization_enabled is False
    assert context.cohort_weight > context.patient_history_weight
