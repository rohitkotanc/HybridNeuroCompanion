import { useEffect, useState } from "react";
import { AlertFeed } from "./components/AlertFeed";
import { Banner } from "./components/Banner";
import { FeedbackPanel } from "./components/FeedbackPanel";
import { PatientInfoBox } from "./components/PatientInfoBox";
import { PlainLanguageGuide } from "./components/PlainLanguageGuide";
import { QAPanel } from "./components/QAPanel";
import { SummaryStrip } from "./components/SummaryStrip";
import { Timeline } from "./components/Timeline";
import { VitalPlot } from "./components/VitalPlot";
import { VitalsOverview } from "./components/VitalsOverview";
import {
  HealthPayload,
  QaPayload,
  Patient,
  TimelinePayload,
  askDoctorQuestion,
  getHealth,
  getPatients,
  getTimeline,
  submitAnnotation,
  submitOutcome,
  submitRelevance
} from "./lib/api";

export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("patient-001");
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [timeline, setTimeline] = useState<TimelinePayload | null>(null);
  const [qa, setQa] = useState<QaPayload | null>(null);
  const [question, setQuestion] = useState("How did the patient describe symptoms before episodes last month?");
  const [loadingQa, setLoadingQa] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(true);
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [dashboardError, setDashboardError] = useState("");
  const [vitalRangeStart, setVitalRangeStart] = useState("");
  const [vitalRangeEnd, setVitalRangeEnd] = useState("");
  const [hasAppliedVitalRange, setHasAppliedVitalRange] = useState(false);
  const [filteredVitals, setFilteredVitals] = useState<TimelinePayload["vitals"]>([]);
  const [selectedVitalStream, setSelectedVitalStream] = useState("all");
  const [confirmedAlertIds, setConfirmedAlertIds] = useState<string[]>([]);

  useEffect(() => {
    async function bootstrap() {
      setLoadingScreen(true);
      const [healthPayload, patientList] = await Promise.all([getHealth(), getPatients()]);
      setHealth(healthPayload);
      setPatients(patientList);
      const resolvedPatientId = patientList[0]?.id ?? "patient-001";
      setSelectedPatientId(resolvedPatientId);
      setLoadingScreen(false);
    }

    void bootstrap();
  }, []);

  useEffect(() => {
    async function loadPatientWorkspace() {
      if (!selectedPatientId) return;
      setLoadingScreen(true);
      setDashboardError("");
      try {
        const timelinePayload = await getTimeline(selectedPatientId);
        setTimeline(timelinePayload);
        const qaPayload = await askDoctorQuestion({
          patient_id: selectedPatientId,
          question,
          time_range_start: "2026-03-18T00:00:00+00:00",
          time_range_end: "2026-03-19T00:00:00+00:00",
          include_self_reports: true
        });
        setQa(qaPayload);
        setHasAppliedVitalRange(false);
        setFilteredVitals([]);
        setSelectedVitalStream("all");
      } catch (error) {
        setDashboardError(error instanceof Error ? error.message : "Unable to load patient workspace.");
      } finally {
        setLoadingScreen(false);
      }
    }

    void loadPatientWorkspace();
  }, [selectedPatientId]);

  async function handleAskQuestion() {
    setLoadingQa(true);
    setDashboardError("");
    try {
      const result = await askDoctorQuestion({
        patient_id: selectedPatientId,
        question,
        time_range_start: "2026-03-18T00:00:00+00:00",
        time_range_end: "2026-03-19T00:00:00+00:00",
        include_self_reports: true
      });
      setQa(result);
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Q&A request failed.");
    } finally {
      setLoadingQa(false);
    }
  }

  async function handleOutcome(occurred: boolean) {
    if (!timeline?.alerts[0]) return;
    setFeedbackBusy(true);
    try {
      const response = await submitOutcome({
        patient_id: selectedPatientId,
        alert_id: timeline.alerts[0].id,
        occurred,
        severity: occurred ? "moderate" : "none",
        seizure_type: occurred ? "focal impaired awareness" : "not_confirmed",
        confirmed_by: "doctor-demo",
        note: occurred ? "Confirmed via dashboard prototype." : "False positive reviewed in dashboard prototype."
      });
      setFeedbackStatus(`${response.status}: outcome recorded for ${response.alert_id}`);
      if (occurred && response.alert_id) {
        setConfirmedAlertIds((current) => Array.from(new Set([...current, response.alert_id!])));
      }
    } catch (error) {
      setFeedbackStatus(error instanceof Error ? `Action failed: ${error.message}` : "Action failed.");
    } finally {
      setFeedbackBusy(false);
    }
  }

  async function handleAnnotation() {
    if (!timeline?.messages[0]) return;
    setFeedbackBusy(true);
    try {
      const response = await submitAnnotation({
        patient_id: selectedPatientId,
        event_timestamp: timeline.messages[0].timestamp,
        annotation_type: "missed_event",
        note: "Doctor added a clinically relevant event during the interactive dashboard demo.",
        created_by: "doctor-demo"
      });
      setFeedbackStatus(`${response.status}: ${response.annotation_type} at ${new Date(response.timestamp).toLocaleString()}`);
    } catch (error) {
      setFeedbackStatus(error instanceof Error ? `Action failed: ${error.message}` : "Action failed.");
    } finally {
      setFeedbackBusy(false);
    }
  }

  async function handleRelevance() {
    if (!timeline?.messages[0]) return;
    setFeedbackBusy(true);
    try {
      const response = await submitRelevance({
        patient_id: selectedPatientId,
        message_id: timeline.messages[0].id,
        tag: "preictal_symptoms",
        is_relevant: true,
        created_by: "doctor-demo"
      });
      setFeedbackStatus(`${response.status}: ${response.message_id} tagged ${response.tag}`);
    } catch (error) {
      setFeedbackStatus(error instanceof Error ? `Action failed: ${error.message}` : "Action failed.");
    } finally {
      setFeedbackBusy(false);
    }
  }

  const patient = patients.find((item) => item.id === selectedPatientId) ?? patients[0];

  function toComparableDate(value: string) {
    return new Date(value).getTime();
  }

  function toApiDateTime(value: string) {
    return new Date(value).toISOString();
  }

  function handleApplyVitalRange() {
    if (!timeline || !vitalRangeStart || !vitalRangeEnd || selectedVitalStream === "all") return;
    const start = toComparableDate(toApiDateTime(vitalRangeStart));
    const end = toComparableDate(toApiDateTime(vitalRangeEnd));
    const nextVitals = timeline.vitals.filter((item) => {
      const timestamp = toComparableDate(item.timestamp);
      return timestamp >= start && timestamp <= end && item.stream_type === selectedVitalStream;
    });
    setFilteredVitals(nextVitals);
    setHasAppliedVitalRange(true);
  }

  function toDateTimeLocalValue(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  function handleUseLastAlertWindow() {
    if (!timeline?.alerts.length) return;
    const latestAlertTime = new Date(timeline.alerts[0].alert_timestamp);
    const start = new Date(latestAlertTime.getTime() - 30 * 60 * 1000);
    const end = new Date(latestAlertTime.getTime() + 30 * 60 * 1000);
    const nextStart = toDateTimeLocalValue(start);
    const nextEnd = toDateTimeLocalValue(end);
    setVitalRangeStart(nextStart);
    setVitalRangeEnd(nextEnd);
    const targetStream = selectedVitalStream === "all" ? "heart_rate" : selectedVitalStream;
    setSelectedVitalStream(targetStream);

    const startMs = start.getTime();
    const endMs = end.getTime();
    const nextVitals = timeline.vitals.filter((item) => {
      const timestamp = toComparableDate(item.timestamp);
      return timestamp >= startMs && timestamp <= endMs && item.stream_type === targetStream;
    });
    setFilteredVitals(nextVitals);
    setHasAppliedVitalRange(true);
  }

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Clinician-support seizure workflow prototype</p>
          <h1>Hybrid Neuro Companion</h1>
          <p className="subtitle">
            Time-linked vital alerting, doctor-controlled retrieval, evidence-backed review, and outcome capture.
          </p>
        </div>
        <div className="hero-card">
          <p>Selected patient</p>
          <select value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)}>
            {patients.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <strong>{patient?.name ?? "Loading patient"}</strong>
          <span>Hospital / record ID: {patient?.external_id ?? "pending"}</span>
          <span>Personalization level: {patient?.baseline_profile?.baseline_strength ?? "0.00"}</span>
          <span>{health?.status === "ok" ? "Live API connected" : "Demo fallback mode"}</span>
        </div>
      </header>

      <Banner />
      <SummaryStrip
        apiStatus={health?.status ?? "loading"}
        warning={health?.warning ?? "Checking API health..."}
        patientCount={patients.length}
        alertCount={timeline?.alerts.length ?? 0}
        messageCount={timeline?.messages.length ?? 0}
        vitalCount={timeline?.vitals.length ?? 0}
        latestRisk={timeline?.alerts[0]?.risk_score ?? null}
      />

      {timeline && qa && !loadingScreen ? (
        <div className="dashboard-grid">
          <PatientInfoBox patient={patient} />
          <AlertFeed alerts={timeline.alerts} />
          <QAPanel
            qa={qa}
            question={question}
            onQuestionChange={setQuestion}
            onAsk={() => void handleAskQuestion()}
            loading={loadingQa}
          />
          <VitalPlot
            vitals={filteredVitals}
            availableVitals={timeline.vitals}
            rangeStart={vitalRangeStart}
            rangeEnd={vitalRangeEnd}
            selectedStream={selectedVitalStream}
            onSelectedStreamChange={setSelectedVitalStream}
            onRangeStartChange={setVitalRangeStart}
            onRangeEndChange={setVitalRangeEnd}
            onApplyRange={handleApplyVitalRange}
            onUseLastAlertWindow={handleUseLastAlertWindow}
            hasAppliedRange={hasAppliedVitalRange}
            hasAlertWindow={Boolean(timeline.alerts.length)}
          />
          <VitalsOverview vitals={timeline.vitals} />
          <Timeline messages={timeline.messages} events={timeline.events ?? []} alerts={timeline.alerts} confirmedAlertIds={confirmedAlertIds} />
          <FeedbackPanel
            patientId={selectedPatientId}
            alerts={timeline.alerts}
            messages={timeline.messages}
            onConfirmOutcome={handleOutcome}
            onSubmitAnnotation={handleAnnotation}
            onMarkRelevant={handleRelevance}
            lastActionMessage={feedbackStatus}
            busy={feedbackBusy}
          />
        </div>
      ) : (
        <section className="card">Loading dashboard...</section>
      )}
      <PlainLanguageGuide />
      {dashboardError ? <section className="card warning">{dashboardError}</section> : null}
    </main>
  );
}
