import { useState } from "react";

type Alert = {
  id: string;
};

type Message = {
  id: string;
  timestamp: string;
};

type FeedbackPanelProps = {
  patientId: string;
  alerts: Alert[];
  messages: Message[];
  onConfirmOutcome: (occurred: boolean) => Promise<void>;
  onSubmitAnnotation: () => Promise<void>;
  onMarkRelevant: () => Promise<void>;
  lastActionMessage: string;
  busy: boolean;
};

type PendingAction = "confirm_yes" | "confirm_no" | "annotate" | "relevant" | null;

export function FeedbackPanel({
  patientId,
  alerts,
  messages,
  onConfirmOutcome,
  onSubmitAnnotation,
  onMarkRelevant,
  lastActionMessage,
  busy
}: FeedbackPanelProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  async function runPendingAction() {
    if (pendingAction === "confirm_yes") await onConfirmOutcome(true);
    if (pendingAction === "confirm_no") await onConfirmOutcome(false);
    if (pendingAction === "annotate") await onSubmitAnnotation();
    if (pendingAction === "relevant") await onMarkRelevant();
    setPendingAction(null);
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2>Doctor Review Actions</h2>
        <span className="eyebrow">Doctor makes the final call</span>
      </div>
      <p className="muted">Patient {patientId}</p>
      <p className="muted">Active alert {alerts[0]?.id ?? "none"} | Message {messages[0]?.id ?? "none"}</p>
      <div className="feedback-grid">
        <button onClick={() => setPendingAction("confirm_yes")} disabled={busy || !alerts.length}>
          Confirm seizure occurred
        </button>
        <button onClick={() => setPendingAction("confirm_no")} disabled={busy || !alerts.length}>
          Confirm no seizure
        </button>
        <button onClick={() => setPendingAction("annotate")} disabled={busy || !messages.length}>
          Add missed event
        </button>
        <button onClick={() => setPendingAction("relevant")} disabled={busy || !messages.length}>
          Mark report relevant
        </button>
      </div>
      {pendingAction ? (
        <div className="confirm-box">
          <p className="muted">Confirm this action before it is sent.</p>
          <div className="action-row">
            <button onClick={() => void runPendingAction()} disabled={busy}>
              Confirm action
            </button>
            <button className="secondary-button" onClick={() => setPendingAction(null)} disabled={busy}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
      {lastActionMessage ? <p className="status-banner">{lastActionMessage}</p> : null}
      <p className="muted">
        Every doctor correction should be saved with a record of where it came from and later used to improve future review.
      </p>
    </section>
  );
}
