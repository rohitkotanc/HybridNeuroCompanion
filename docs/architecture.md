# Architecture Overview

**This prototype is decision-support software and not a substitute for licensed medical judgment.**

## System Boundary

The platform has two intentionally separated intelligence paths:

1. **Vital Alerting Pipeline**
   - Inputs: wearable/device streams, EEG, sleep, HR, HRV, motion, oxygen, similar physiological series
   - Outputs: risk scores, unusual-vitals alerts, clinician-support recommendations, postictal support context
   - Constraint: only vital-derived features may trigger alerts or action guidance

2. **Doctor-Controlled Retrieval and Summarization Pipeline**
   - Inputs: patient messages, clinician notes, confirmed outcomes, annotations, flagged glossary hits
   - Outputs: doctor-facing synthesis, evidence-linked history inspection, postictal communication support
   - Constraint: patient-reported text does not influence the alert model

## Major Modules

- Data ingestion and normalization
- Time-series feature engineering and patient baseline estimation
- Risk scoring and alert generation
- Confidence and uncertainty scoring
- Doctor-controlled retrieval and summarization
- Obvious-sign glossary engine
- Doctor dashboard UI
- Feedback capture and continuous learning scaffold
- Audit logging and provenance

## Storage Model

- PostgreSQL for relational records and auditable metadata
- TimescaleDB-compatible schema design for high-volume vital events and windows
- Vector-ready retrieval abstraction for future pgvector integration
- Separate tables for inferred outputs, source events, and doctor-confirmed labels

## Safety and Auditability

- Provenance links required for doctor-facing answers
- Model outputs logged with model version and rationale
- Doctor overrides stored as first-class records
- Emergency threshold logic returns urgent escalation guidance, not certainty claims

## Prototype Implementation Choice

This first pass uses:

- simple supervised/semi-supervised scaffolds instead of deep RL
- calibrated, sensitivity-biased risk scoring
- retrieval that only returns cited evidence-backed summaries
- synthetic local demo data to exercise the full workflow

This keeps the prototype technically credible, testable, and easier to harden later.
