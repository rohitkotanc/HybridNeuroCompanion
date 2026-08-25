# Hybrid Neuro Companion

  This prototype is decision-support software and not a substitute for licensed medical judgment.

  Hybrid Neuro Companion is a doctor-facing interface for organizing large amounts of patient information into something a clinician can review quickly and
  verify directly. The point of the system is not to replace a doctor, diagnose a patient, or prescribe behavior. It does not claim to know what the patient
  should eat, when the patient should sleep, what treatment is correct, or whether a seizure definitively occurred. That is the doctor’s job.

  What this system does claim is narrower and more useful:

  - bring together patient messages, vital streams, and basic patient information in one place
  - make that information easier to inspect over time
  - surface patterns and alerts because the system can process more data than a person realistically can at once
  - keep the doctor in control of interpretation and final judgment

  Alerts are therefore not the product claim. They are a consequence of having structured, time-linked data and being able to flag unusual patterns for review.
  The core value is giving the doctor a clearer, faster, more navigable interface to the patient record.

## Contributors

Rohit Kota — GitHub: @rohitkotanc

Aneesh Ramakrishnan — GitHub: @aneeshsrk

Aditya Srivastava - GitHub: @adisri1229

Sidharth Dimri - GitHub: @sidharth-dimri

All contributors participated in the development, experimentation, analysis, and presentation of the project.

  ## Product Focus

  The focus of this project is simple:

  - collect relevant patient data
  - manage it in a way that supports meaningful review
  - present it back to the doctor in a form that is inspectable, time-linked, and evidence-backed

  At every stage, the doctor remains the decision-maker. The system can highlight, summarize, organize, and alert. It does not replace medical judgment.

  ## Roadmap

  ### 1. Data In

  The system is built to ingest the types of information a doctor would otherwise have to piece together manually:

  - patient chats and self-reported symptoms
  - body-signal and device data such as heart rate, pulse, heart rate variability, motion, EEG, sleep-related data, and similar streams
  - basic patient information such as age, sex, height, weight, diagnoses, allergies, and care setting
  - doctor-entered feedback, corrections, and confirmed outcomes
  - time-stamped care events and notes

  This matters because the product is only useful if it can gather the right information before trying to organize it.

  ### 2. Data Management

  The data is organized into a time-linked clinical support pipeline designed to scale from low-history patients to more personalized review over time.

  - incoming signals are normalized into a common event model
  - patient-reported messages are kept separate from the alerting path
  - patient messages are available for doctor-requested review, summarization, and evidence lookup
  - vital streams are handled as multivariate time-series data for alerting and pattern detection
  - patient baseline logic begins with demographic and cohort-style grouping when personal history is sparse
  - patient-specific weighting increases only after enough confirmed outcomes exist to justify it

  The planned modeling direction is a layered time-series architecture that can begin with simpler feature-based methods and progress toward sequence models such
  as an LSTM-based system for temporal pattern recognition where appropriate. The point is not to claim certainty from that architecture. The point is to manage
  continuous, high-volume signals in a way that supports useful clinician review.

  We also plan to introduce a natural language processor to help with language barriers between doctor and patient through a layer in the chat flow where patient
  inputs are translated, normalized, and semantically aligned, while preserving the original text for verification.

  ### 3. Data Out

  The output must stay aligned with the doctor-support focus.

  The system presents:

  - a doctor dashboard that organizes patient information visually
  - time-linked views of body-signal data
  - evidence-linked question answering over patient history
  - timeline navigation across month, week, day, and event levels
  - patient overview information for faster clinical context
  - alerts when unusual signal patterns are detected

  Again, the alerts are not a diagnosis. They are a mechanism for saying: there is enough data here, and enough pattern change here, that this may deserve
  attention.

  The output is useful only if the doctor can verify it. That is why the interface is built around:

  - timestamps
  - source references
  - direct drilldown into underlying records
  - visible patient context
  - doctor confirmation and correction

  ## Core Rules

  - The system does not diagnose.
  - The system does not prescribe lifestyle or treatment decisions.
  - The system does not override the doctor.
  - Patient-reported chat is not used as a direct medical recommendation engine.
  - The doctor is the final authority on whether an event was medically meaningful.

  ## Demo Setup

  Backend:

  cd backend
  python -m app.scripts.generate_demo_data
  python -m uvicorn app.main:app --host 127.0.0.1 --port 8012

  Frontend:

  cd frontend
  npm install
  VITE_API_BASE_URL=http://127.0.0.1:8012 npm run dev -- --host 127.0.0.1 --port 5173

  Then open:

  http://127.0.0.1:5173

  ## Limitations

  - No claim of HIPAA compliance
  - No claim of clinical validation or regulatory clearance
  - Synthetic data only for demo and testing
  - Prototype interface and scaffolded backend, not a production clinical system

  The value of this project is not that it claims to know more than the doctor. The value is that it helps the doctor work with more information, more clearly,
  in less time.
