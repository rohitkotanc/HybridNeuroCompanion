type Alert = {
  id: string;
  alert_type: string;
  alert_timestamp: string;
  risk_score: number;
  model_confidence: number;
  evidence_completeness: number;
  urgent_escalation: boolean;
};

export function AlertFeed({ alerts }: { alerts: Alert[] }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2>Alert Feed</h2>
        <span className="eyebrow">Based on body-signal data only</span>
      </div>
      <div className="stack">
        {alerts.map((alert) => (
          <article className="alert-item" key={alert.id}>
            <div>
              <strong>{alert.alert_type}</strong>
              <p>{new Date(alert.alert_timestamp).toLocaleString()}</p>
            </div>
            <div className="metrics">
              <span>Alert score {alert.risk_score.toFixed(2)}</span>
              <span>Model confidence {alert.model_confidence.toFixed(2)}</span>
              <span>Data coverage {alert.evidence_completeness.toFixed(2)}</span>
            </div>
            <a href={`#${alert.id}`}>Open linked time window</a>
            {alert.urgent_escalation ? <p className="critical">Advise urgent clinical or emergency action.</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
