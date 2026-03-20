export const demoPatients = [
  {
    id: "patient-001",
    external_id: "MRN-1001",
    name: "Taylor Reed",
    date_of_birth: "1991-04-12",
    gender: "Female",
    height_cm: 168,
    weight_kg: 64,
    diagnoses: ["Focal epilepsy"],
    allergies: ["Lamotrigine intolerance"],
    care_setting: "Outpatient neurology follow-up",
    baseline_profile: {
      heart_rate_mean: 72,
      hrv_mean: 41,
      baseline_strength: 0.38
    }
  }
];

const baseStart = new Date("2026-03-18T12:00:00+00:00");
const alertOne = new Date("2026-03-18T22:42:00+00:00");
const alertTwo = new Date("2026-03-19T06:18:00+00:00");

export const demoTimeline = {
  patient_id: "patient-001",
  alerts: [
    {
      id: "alert-001",
      alert_type: "seizure-risk-high",
      alert_timestamp: "2026-03-18T22:42:00+00:00",
      risk_score: 0.84,
      model_confidence: 0.73,
      evidence_completeness: 0.61,
      urgent_escalation: false,
      rationale: {
        anomaly_pressure: 0.88,
        variability_pressure: 0.51,
        baseline_strength: 0.38,
        fallback_mode: true
      }
    },
    {
      id: "alert-002",
      alert_type: "unusual-vitals",
      alert_timestamp: "2026-03-19T06:18:00+00:00",
      risk_score: 0.66,
      model_confidence: 0.58,
      evidence_completeness: 0.55,
      urgent_escalation: false,
      rationale: {
        anomaly_pressure: 0.63,
        variability_pressure: 0.34,
        baseline_strength: 0.38,
        fallback_mode: true
      }
    }
  ],
  events: [
    {
      id: "evt-001",
      timestamp: "2026-03-18T21:55:00+00:00",
      title: "Medication logged",
      description: "Evening anti-seizure medication recorded.",
      event_type: "medication",
      source_type: "care_log",
      source_id: "care-001"
    },
    {
      id: "evt-002",
      timestamp: "2026-03-18T22:42:00+00:00",
      title: "High-risk alert raised",
      description: "Body-signal alert generated for doctor review.",
      event_type: "alert",
      source_type: "care_log",
      source_id: "care-002"
    },
    {
      id: "evt-003",
      timestamp: "2026-03-18T23:10:00+00:00",
      title: "Post-event check-in",
      description: "Care team reviewed patient orientation after the event.",
      event_type: "check_in",
      source_type: "care_log",
      source_id: "care-003"
    },
    {
      id: "evt-004",
      timestamp: "2026-03-19T05:55:00+00:00",
      title: "Sleep disruption noted",
      description: "Wearable sleep quality dip noted before morning changes.",
      event_type: "sleep_note",
      source_type: "care_log",
      source_id: "care-004"
    },
    {
      id: "evt-005",
      timestamp: "2026-03-19T06:18:00+00:00",
      title: "Morning unusual-vitals alert",
      description: "Second body-signal pattern prompted review.",
      event_type: "alert",
      source_type: "care_log",
      source_id: "care-005"
    },
    {
      id: "evt-006",
      timestamp: "2026-03-19T07:00:00+00:00",
      title: "Caregiver note",
      description: "Caregiver reported slower-than-usual recovery.",
      event_type: "caregiver_note",
      source_type: "care_log",
      source_id: "care-006"
    }
  ],
  messages: [
    {
      id: "msg-001",
      timestamp: "2026-03-18T22:30:00+00:00",
      content: "I had a strange aura and then felt confused after. I may have blacked out for a minute.",
      source_type: "patient_chat",
      source_id: "chat-001"
    },
    {
      id: "msg-002",
      timestamp: "2026-03-18T23:05:00+00:00",
      content: "I am still tired and disoriented but can answer basic questions now.",
      source_type: "patient_chat",
      source_id: "chat-002"
    },
    {
      id: "msg-003",
      timestamp: "2026-03-19T06:05:00+00:00",
      content: "I woke up feeling off, then had trouble focusing and felt shaky.",
      source_type: "patient_chat",
      source_id: "chat-003"
    }
  ],
  vitals: Array.from({ length: 24 * 60 }).flatMap((_, idx) => {
    const timestamp = new Date(baseStart.getTime() + idx * 60 * 1000);
    const iso = timestamp.toISOString().replace(".000", "");
    const nearFirst = Math.abs(timestamp.getTime() - alertOne.getTime()) <= 18 * 60 * 1000;
    const nearSecond = Math.abs(timestamp.getTime() - alertTwo.getTime()) <= 22 * 60 * 1000;
    const heartRate = 71 + Math.round(5 * Math.sin(idx / 180)) + (nearFirst ? 24 : nearSecond ? 18 : 0);
    const pulse = heartRate + (idx % 3) - 1 + (nearFirst ? 2 : 0);
    const hrv = 42 + Math.round(4 * Math.sin(idx / 210)) - (nearFirst ? 12 : nearSecond ? 9 : 0);
    const motion = Math.max(0, 5 + Math.round(3 * Math.sin(idx / 45)) + (nearFirst ? 28 : nearSecond ? 18 : 0));
    const eeg = 17 + Math.round(2 * Math.sin(idx / 35)) + (nearFirst ? 9 : nearSecond ? 7 : 0);
    const sleepScore = Math.max(0, Math.min(100, (timestamp.getUTCHours() >= 7 && timestamp.getUTCHours() <= 22 ? 54 : 80) + (nearSecond ? -10 : 0)));

    return [
      {
        id: `ve-hr-${idx}`,
        timestamp: iso,
        stream_type: "heart_rate",
        value: heartRate,
        unit: "bpm",
        source_type: "wearable",
        source_id: `device-hr-${idx}`
      },
      {
        id: `ve-pulse-${idx}`,
        timestamp: iso,
        stream_type: "pulse",
        value: pulse,
        unit: "bpm",
        source_type: "wearable",
        source_id: `device-pulse-${idx}`
      },
      {
        id: `ve-hrv-${idx}`,
        timestamp: iso,
        stream_type: "hrv",
        value: hrv,
        unit: "ms",
        source_type: "wearable",
        source_id: `device-hrv-${idx}`
      },
      {
        id: `ve-motion-${idx}`,
        timestamp: iso,
        stream_type: "motion",
        value: motion,
        unit: "arb",
        source_type: "wearable",
        source_id: `device-motion-${idx}`
      },
      {
        id: `ve-eeg-${idx}`,
        timestamp: iso,
        stream_type: "eeg",
        value: eeg,
        unit: "uV",
        source_type: "eeg_monitor",
        source_id: `device-eeg-${idx}`
      },
      {
        id: `ve-sleep-${idx}`,
        timestamp: iso,
        stream_type: "sleep",
        value: sleepScore,
        unit: "score",
        source_type: "sleep_tracker",
        source_id: `device-sleep-${idx}`
      }
    ];
  })
};

export const demoQaResponse = {
  query_id: "query-demo",
  response_id: "response-demo",
  answer:
    "Latest comparable vital alert was at 2026-03-18T22:42:00+00:00 with risk score 0.84. Retrieved 3 source-backed patient records matching the current filters. Patient-reported possible seizure indicators were surfaced separately via glossary rules.",
  insufficient_evidence: false,
  model_confidence: 0.64,
  evidence_completeness: 0.6,
  evidence: [
    {
      source_id: "msg-001",
      source_type: "patient_chat",
      timestamp: "2026-03-18T22:30:00+00:00",
      snippet: "I had a strange aura and then felt confused after. I may have blacked out for a minute.",
      uri: "/records/patient_chat/msg-001"
    },
    {
      source_id: "msg-002",
      source_type: "patient_chat",
      timestamp: "2026-03-18T23:05:00+00:00",
      snippet: "I am still tired and disoriented but can answer basic questions now.",
      uri: "/records/patient_chat/msg-002"
    },
    {
      source_id: "msg-003",
      source_type: "patient_chat",
      timestamp: "2026-03-19T06:05:00+00:00",
      snippet: "I woke up feeling off, then had trouble focusing and felt shaky.",
      uri: "/records/patient_chat/msg-003"
    }
  ],
  flagged_possible_seizure_indicators: [
    {
      message_id: "msg-001",
      timestamp: "2026-03-18T22:30:00+00:00",
      term: "aura",
      matched_text: "aura"
    },
    {
      message_id: "msg-001",
      timestamp: "2026-03-18T22:30:00+00:00",
      term: "blacked out",
      matched_text: "blacked out"
    },
    {
      message_id: "msg-003",
      timestamp: "2026-03-19T06:05:00+00:00",
      term: "shaking",
      matched_text: "shaky"
    }
  ]
};
