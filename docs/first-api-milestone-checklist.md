# First API Milestone Checklist

This milestone is the first stage where the product is directly testable through the API using synthetic demo data.

## Startup

- [ ] Demo data generation runs: `cd backend && python -m app.scripts.generate_demo_data`
- [ ] API starts locally: `cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8011`
- [ ] Health check responds: `GET /api/health`

## Read Paths

- [ ] `GET /api/patients` returns at least one demo patient
- [ ] `GET /api/patients/patient-001/timeline` returns alerts, messages, and vital events
- [ ] `GET /api/records/patient_chat/msg-001` or `GET /api/records/patient_chat/chat-001` returns the underlying message record

## Vital-Only Alerting

- [ ] `POST /api/alerts/estimate` accepts vital-derived features and returns:
  - risk score
  - alert type
  - model confidence
  - evidence completeness
  - rationale
  - urgent escalation flag
- [ ] The response includes evidence links to the vital window source
- [ ] Patient self-report text is not required or used by the alert request

## Doctor-Controlled Retrieval

- [ ] `POST /api/qa/ask` returns an evidence-backed answer
- [ ] Each answer includes timestamps and source references
- [ ] Obvious seizure indicators from patient language are surfaced separately as glossary matches
- [ ] The response can return `insufficient_evidence=true` when filters are too narrow or no evidence is found

## Doctor Feedback Write Paths

- [ ] `POST /api/outcomes` accepts seizure confirmation or non-confirmation
- [ ] `POST /api/annotations` accepts a missed medically relevant event
- [ ] `POST /api/messages/relevance` accepts doctor relevance tagging for self-reported content

## Safety and Product Rules Visible at This Milestone

- [ ] Warning banner text appears in API health/root messaging and repository docs
- [ ] Alerting is implemented as a vital-only code path
- [ ] Retrieval is evidence-linked and separate from alert generation

## Current Scope Limitations

- [ ] Persistence is still demo-data-backed JSON, not yet PostgreSQL/TimescaleDB
- [ ] Write endpoints are scaffold responses, not yet durable DB writes
- [ ] The risk model is a prototype scaffold, not clinically validated
