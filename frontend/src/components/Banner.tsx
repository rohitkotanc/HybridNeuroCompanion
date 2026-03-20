export function Banner() {
  return (
    <section className="banner">
      <p>This prototype is decision-support software and not a substitute for licensed medical judgment.</p>
      <p>
        Alerts are based only on body-signal data such as heart rate, motion, and similar vital streams. Patient
        messages are shown separately for doctor-requested summaries and record review, with seizure-related phrases
        flagged on their own.
      </p>
    </section>
  );
}
