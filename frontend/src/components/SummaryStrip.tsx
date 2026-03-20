type SummaryStripProps = {
  apiStatus: string;
  warning: string;
  patientCount: number;
  alertCount: number;
  messageCount: number;
  vitalCount: number;
  latestRisk: number | null;
};

export function SummaryStrip({
  apiStatus,
  warning,
  patientCount,
  alertCount,
  messageCount,
  vitalCount,
  latestRisk
}: SummaryStripProps) {
  return (
    <section className="summary-strip">
      <article className="summary-card">
        <span className="eyebrow">Connection</span>
        <strong>{apiStatus}</strong>
        <p>{warning}</p>
      </article>
      <article className="summary-card">
        <span className="eyebrow">Patients</span>
        <strong>{patientCount}</strong>
        <p>Current demo/API roster loaded into the dashboard.</p>
      </article>
      <article className="summary-card">
        <span className="eyebrow">Monitoring</span>
        <strong>{alertCount} alerts</strong>
        <p>
          {messageCount} messages, {vitalCount} body-signal readings, latest alert score{" "}
          {latestRisk !== null ? latestRisk.toFixed(2) : "n/a"}.
        </p>
      </article>
    </section>
  );
}
