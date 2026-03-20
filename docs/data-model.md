# Data Model Summary

Core entities implemented in the ORM scaffold:

- Patient
- VitalEvent
- VitalWindow
- DerivedFeature
- Alert
- SeizureOutcome
- DoctorAnnotation
- PatientMessage
- RelevanceTag
- SeizureGlossaryTerm
- EvidenceLink
- QAQuery
- QAResponse
- SourceReference
- ModelVersion
- FeedbackRecord

Shared design principles:

- patient-linked
- timestamped or interval-based
- source type and source ID present
- provenance metadata captured
- creator and confirmer fields available where clinically relevant
