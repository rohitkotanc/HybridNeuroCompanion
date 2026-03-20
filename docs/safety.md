# Safety Notes

**This prototype is decision-support software and not a substitute for licensed medical judgment.**

## Guardrails

- The alert engine only uses vital-derived features.
- Patient messages are excluded from medical alert inference paths by design and by code structure.
- The retrieval layer must cite timestamps and source IDs for all claims.
- Unsupported claims must be replaced with an explicit insufficient-evidence response.
- Emergency thresholds escalate to urgent clinical/emergency action advice.
- Hidden chain-of-thought output is not exposed in the UI.

## Key Risks

- False alarms can create alert fatigue.
- False negatives can delay intervention.
- Sparse labels can produce unstable personalization.
- Device quality, dropouts, and timestamp drift can degrade performance.
- Language variation can affect glossary matches and retrieval.

## Privacy and Security

- Prototype only; no compliance claim.
- Real deployment needs PHI handling, encryption, least privilege, audit retention, secure secrets, SSO, access reviews, and clinical governance.

## Bias and Validation TODOs

- TODO: calibrate by cohort and device type.
- TODO: validate across epilepsy subtypes and care settings.
- TODO: review multilingual glossary coverage.
- TODO: define clinically acceptable false alarm thresholds by workflow.
