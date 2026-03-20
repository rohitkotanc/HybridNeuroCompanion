import { demoTimeline, demoPatients, demoQaResponse } from "../mocks/demoData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8012";

export type Patient = (typeof demoPatients)[number];
export type TimelinePayload = typeof demoTimeline;
export type QaPayload = typeof demoQaResponse;
export type HealthPayload = {
  status: string;
  warning: string;
  timestamp: string;
};

type RequestOptions = {
  method?: string;
  body?: unknown;
};

async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

async function requestWithFallback<T>(path: string, fallback: T, options: RequestOptions = {}): Promise<T> {
  try {
    return await requestJson<T>(path, options);
  } catch {
    return fallback;
  }
}

export async function getPatients() {
  return requestWithFallback("/api/patients", demoPatients);
}

export async function getHealth() {
  return requestWithFallback<HealthPayload>("/api/health", {
    status: "demo",
    warning: "API unavailable. Showing demo fallback data.",
    timestamp: new Date().toISOString()
  });
}

export async function getTimeline(patientId: string) {
  return requestWithFallback(`/api/patients/${patientId}/timeline`, demoTimeline);
}

export async function askDoctorQuestion(payload: {
  patient_id: string;
  question: string;
  time_range_start?: string;
  time_range_end?: string;
  include_self_reports?: boolean;
}) {
  return requestWithFallback("/api/qa/ask", demoQaResponse, {
    method: "POST",
    body: payload
  });
}

export async function submitOutcome(payload: {
  patient_id: string;
  alert_id?: string | null;
  occurred: boolean;
  severity?: string;
  seizure_type?: string;
  confirmed_by: string;
  note?: string;
}) {
  return requestJson<{ status: string; patient_id: string; alert_id?: string; occurred: boolean; confirmed_by: string }>(
    "/api/outcomes",
    { method: "POST", body: payload }
  );
}

export async function submitAnnotation(payload: {
  patient_id: string;
  event_timestamp: string;
  annotation_type: string;
  note: string;
  created_by: string;
}) {
  return requestJson<{ status: string; annotation_type: string; timestamp: string }>("/api/annotations", {
    method: "POST",
    body: payload
  });
}

export async function submitRelevance(payload: {
  patient_id: string;
  message_id: string;
  tag: string;
  is_relevant: boolean;
  created_by: string;
}) {
  return requestJson<{ status: string; message_id: string; tag: string; is_relevant: boolean }>(
    "/api/messages/relevance",
    { method: "POST", body: payload }
  );
}
