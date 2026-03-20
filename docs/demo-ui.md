# Demo UI Runbook

This proof-of-concept UI is safe to fast-track now because it sits on top of the current API contracts:

- patient list
- patient timeline
- doctor-controlled Q&A
- doctor feedback actions

Those contracts can remain stable while storage, model quality, ingestion, and learning pipelines improve underneath.

## Start the Backend

```bash
cd "/Users/aneeshsr/Hybrid Neuro Companion/backend"
python -m app.scripts.generate_demo_data
python -m uvicorn app.main:app --host 127.0.0.1 --port 8012
```

## Start the Frontend

```bash
cd "/Users/aneeshsr/Hybrid Neuro Companion/frontend"
npm install
VITE_API_BASE_URL=http://127.0.0.1:8012 npm run dev -- --host 127.0.0.1 --port 5173
```

Open:

- `http://127.0.0.1:5173`

## Demo Script

1. Confirm the warning banner is visible.
2. Confirm the selected patient card loads.
3. Review the vital-driven alert feed.
4. Review the time-linked patient timeline.
5. Use the Q&A panel to run a cited question.
6. Confirm evidence and glossary hits appear.
7. Use doctor feedback controls to:
   - confirm seizure occurred
   - add missed event
   - mark report relevant
8. Confirm the status banner updates after each action.

## Known Limits

- The dashboard is presentation-ready but still backed by demo JSON on the read side.
- The feedback actions call real endpoints, but persistence is still scaffold-level.
- The UI is intentionally aligned to the current API so it will not block future backend hardening.
