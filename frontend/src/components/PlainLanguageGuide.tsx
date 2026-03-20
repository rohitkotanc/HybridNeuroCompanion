const TERMS = [
  {
    label: "Hospital / record ID",
    meaning: "The patient ID from another care system, such as a hospital chart or medical record number."
  },
  {
    label: "Personalization level",
    meaning: "How much patient-specific history the system has for learning that person's normal patterns."
  },
  {
    label: "Alert score",
    meaning: "How strongly the vital-sign system thinks this time window deserves review. It is not a diagnosis."
  },
  {
    label: "Model confidence",
    meaning: "How strongly the software favors its own output based on the data it was given."
  },
  {
    label: "Data coverage",
    meaning: "How complete the supporting data was for the result. Lower coverage means more caution is needed."
  },
  {
    label: "Evidence",
    meaning: "The exact records the answer was based on, including timestamps and source IDs."
  },
  {
    label: "Flagged seizure phrases",
    meaning: "Words in patient messages that may point to seizure-related symptoms and are always surfaced for review."
  },
  {
    label: "Body-signal readings",
    meaning: "Measurements from sensors, such as heart rate, pulse, heart rate variability, body movement, EEG, or sleep-related data."
  }
];

export function PlainLanguageGuide() {
  return (
    <section className="card">
      <div className="card-header">
        <h2>Plain-Language Guide</h2>
        <span className="eyebrow">Key terms explained</span>
      </div>
      <div className="guide-grid">
        {TERMS.map((term) => (
          <article className="guide-item" key={term.label}>
            <strong>{term.label}</strong>
            <p>{term.meaning}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
