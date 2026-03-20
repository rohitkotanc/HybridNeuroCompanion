# Milestones

## Milestone 1: Core Architecture and Data Model

- Repository scaffold
- Backend/frontend split
- Core schemas and ORM models
- Docker/local setup
- Synthetic demo data

## Milestone 2: Vital-Data Ingestion and Normalization

- Sample time-series ingestion
- Timestamp normalization
- Patient baseline handling
- Raw and derived feature storage

## Milestone 3: Initial Vital-Based Anomaly and Risk Engine

- Vital-only model scaffold
- Sensitivity-biased thresholding
- Risk score, rationale, uncertainty
- Evaluation script
- Fallback to science-based defaults plus current vitals and existing history

## Milestone 4: Confidence and Uncertainty Framework

- Model confidence vs evidence completeness vs confirmed truth
- Calibration design
- Bias and unsupported certainty review
- Editable confidence policy

## Milestone 5: Doctor Feedback and Outcome Capture

- Confirm seizure or no seizure
- Add missed events
- Preserve corrections and provenance
- Update patient-specific dataset

## Milestone 6: Continuous Learning Pipeline

- Outcome-linked retraining scaffold
- Modular retraining jobs
- Default-data fallback while personalization is weak

## Milestone 7: Doctor-Controlled Summarization and Retrieval Agent

- Evidence-linked doctor Q&A
- Doctor-controlled self-report summarization
- Source filtering, time filters, and insufficient-evidence handling

## Milestone 8: Obvious-Sign Glossary Engine

- Editable term list
- Rule-based surfacing
- Strict separation from alert pipeline

## Milestone 9: Doctor Dashboard

- Alert timeline
- Raw vital viewer
- Evidence-linked Q&A
- Outcome confirmation
- Timestamp navigation

## Milestone 10: Safety, Auditability, and Documentation

- Hard-coded disclaimers
- Logging and audit trails
- Privacy/security/bias notes
- Test coverage and operator docs
