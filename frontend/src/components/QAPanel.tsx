type QaResponse = {
  answer: string;
  insufficient_evidence: boolean;
  model_confidence: number;
  evidence_completeness: number;
  evidence: Array<{
    source_id: string;
    source_type: string;
    timestamp: string;
    snippet: string;
    uri: string;
  }>;
  flagged_possible_seizure_indicators: Array<{
    message_id: string;
    timestamp: string;
    term: string;
    matched_text: string;
  }>;
};

export function QAPanel({
  qa,
  question,
  onQuestionChange,
  onAsk,
  loading
}: {
  qa: QaResponse;
  question: string;
  onQuestionChange: (value: string) => void;
  onAsk: () => void;
  loading: boolean;
}) {
  return (
    <section className="card">
      <div className="card-header">
        <h2>Evidence-Linked Q&amp;A</h2>
        <span className="eyebrow">Runs only when the doctor asks</span>
      </div>
      <div className="query-box">
        <textarea
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          rows={3}
          placeholder="Ask a question about the patient's history."
        />
        <button onClick={onAsk} disabled={loading || !question.trim()}>
          {loading ? "Running query..." : "Run cited query"}
        </button>
      </div>
      <p className={qa.insufficient_evidence ? "warning" : ""}>{qa.answer}</p>
      <div className="metrics">
        <span>Model confidence {qa.model_confidence.toFixed(2)}</span>
        <span>Data coverage {qa.evidence_completeness.toFixed(2)}</span>
      </div>
      <h3>Evidence</h3>
      <div className="stack">
        {qa.evidence.map((item) => (
          <article className="evidence-link" key={item.source_id}>
            <strong>{item.source_type}</strong>
            <span>{new Date(item.timestamp).toLocaleString()}</span>
            <span>{item.snippet}</span>
            <code>{item.uri}</code>
          </article>
        ))}
      </div>
      <h3>Flagged Seizure Phrases In Patient Messages</h3>
      <div className="chips">
        {qa.flagged_possible_seizure_indicators.map((item) => (
          <span className="chip" key={`${item.message_id}-${item.term}`}>
            {item.term} at {new Date(item.timestamp).toLocaleTimeString()}
          </span>
        ))}
      </div>
    </section>
  );
}
