# API Sketch

## Core Endpoints

- `GET /api/health`
- `GET /api/patients`
- `GET /api/patients/{patient_id}/timeline`
- `GET /api/records/{source_type}/{source_id}`
- `POST /api/alerts/estimate`
- `POST /api/qa/ask`
- `POST /api/outcomes`
- `POST /api/annotations`
- `POST /api/messages/relevance`

## Alert Estimation Contract

`POST /api/alerts/estimate`

- Inputs: patient ID, vital window ID, timestamp, vital-derived features, baseline context
- Forbidden input: patient chat content for medical inference
- Output: alert class, risk score, model confidence, evidence completeness, rationale, urgent escalation flag

## Retrieval Contract

`POST /api/qa/ask`

- Inputs: doctor question, patient ID, source filters, time range, requested relevance tags
- Output: cited answer, timestamps, source IDs, evidence links, possible seizure indicators from glossary rules
- Failure mode: insufficient evidence
