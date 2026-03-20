# Hybrid Neuro Companion

**This prototype is decision-support software and not a substitute for licensed medical judgment.**

Hybrid Neuro Companion is a production-grade prototype for a clinician-support and patient-monitoring platform focused on seizure-support workflows. It is intentionally designed with a strict boundary between:

- vital-data-driven alerting and risk estimation
- doctor-controlled conversational retrieval and summarization over patient-reported data

The system is not a diagnosis engine. It helps doctors, caregivers, and patients work through higher data volumes with auditability, provenance, timestamps, and feedback loops.

## Safety-Critical Product Rules

- Vital data only drives alerts, risk signals, and action recommendations.
- Patient-reported chat never directly drives seizure prediction or automated treatment suggestions.
- Patient messages are only available to the doctor-facing retrieval and summarization layer.
- Obvious seizure signs mentioned by patients are surfaced through a separate editable glossary/rule engine.
- Every answer in the doctor Q&A workflow must include evidence links, timestamps, and source references.
- Every alert and recommendation exposes model confidence, evidence completeness, and doctor-confirmed truth separately.

## Stack

- Backend: FastAPI, SQLAlchemy, Pydantic, scikit-learn scaffold
- Frontend: React, TypeScript, Vite
- Database: PostgreSQL / Timescale-friendly schema scaffold
- Retrieval: PostgreSQL/pgvector-ready abstraction, citation-first service scaffold
- Background jobs: APScheduler scaffold for demo mode
- Local orchestration: Docker Compose

## Quick Start

```bash
docker compose up --build
```

Manual local setup:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload --port 8000
```

```bash
cd frontend
npm install
npm run dev
```

For the current proof-of-concept demo, use:

```bash
cd backend
python -m app.scripts.generate_demo_data
python -m uvicorn app.main:app --host 127.0.0.1 --port 8012
```

In a second terminal:

```bash
cd frontend
npm install
VITE_API_BASE_URL=http://127.0.0.1:8012 npm run dev -- --host 127.0.0.1 --port 5173
```

Then open `http://127.0.0.1:5173`.

## Demo Flow

1. Generate demo data:

```bash
cd backend
python -m app.scripts.generate_demo_data
```

2. Start API and frontend.
3. Open the doctor dashboard and review:
   - alert feed
   - patient timeline
   - raw vitals
   - evidence-linked Q&A
   - doctor outcome confirmation controls

## First API Milestone

The first testable milestone is a demo-data-backed API with:

- patient list retrieval
- time-linked patient timeline retrieval
- vital-only alert estimation
- doctor-controlled Q&A with cited evidence
- exact source-record lookup for evidence links
- outcome capture, annotation, and relevance-tag write-path stubs

## Repository Guide

- [docs/architecture.md](/Users/aneeshsr/Hybrid%20Neuro%20Companion/docs/architecture.md)
- [docs/milestones.md](/Users/aneeshsr/Hybrid%20Neuro%20Companion/docs/milestones.md)
- [docs/safety.md](/Users/aneeshsr/Hybrid%20Neuro%20Companion/docs/safety.md)
- [backend/app/main.py](/Users/aneeshsr/Hybrid%20Neuro%20Companion/backend/app/main.py)
- [frontend/src/App.tsx](/Users/aneeshsr/Hybrid%20Neuro%20Companion/frontend/src/App.tsx)

## Limitations

- No claim of HIPAA compliance, clinical validation, regulatory clearance, or production device interoperability.
- Synthetic data only for demo and testing.
- Model code is a credible scaffold, not a clinically validated seizure predictor.
- Real deployment would require privacy/security hardening, validation, governance, and hospital workflow integration.
