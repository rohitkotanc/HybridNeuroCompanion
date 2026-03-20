from __future__ import annotations

from datetime import datetime

from app.schemas.domain import DoctorQuestionRequest, QAAnswerResponse, SourceEvidence
from app.services.glossary import scan_text_for_glossary_terms


def build_cited_answer(
    request: DoctorQuestionRequest,
    messages: list[dict],
    alerts: list[dict],
) -> QAAnswerResponse:
    filtered_messages = []
    for message in messages:
        timestamp = datetime.fromisoformat(message["timestamp"])
        if request.time_range_start and timestamp < request.time_range_start:
            continue
        if request.time_range_end and timestamp > request.time_range_end:
            continue
        filtered_messages.append(message)

    evidence = [
        SourceEvidence(
            source_id=item["id"],
            source_type=item["source_type"],
            timestamp=datetime.fromisoformat(item["timestamp"]),
            snippet=item["content"][:180],
            uri=f"/records/{item['source_type']}/{item['id']}",
        )
        for item in filtered_messages[:5]
    ]

    glossary_hits = []
    for item in filtered_messages:
        for match in scan_text_for_glossary_terms(item["content"]):
            glossary_hits.append(
                {
                    "message_id": item["id"],
                    "timestamp": item["timestamp"],
                    "term": match.term,
                    "matched_text": match.matched_text,
                }
            )

    if not evidence and not alerts:
        return QAAnswerResponse(
            query_id="query-demo",
            response_id="response-demo",
            answer="Insufficient evidence in the selected time range and filters.",
            insufficient_evidence=True,
            model_confidence=0.2,
            evidence_completeness=0.1,
            evidence=[],
            flagged_possible_seizure_indicators=glossary_hits,
        )

    answer_lines = []
    if alerts:
        latest_alert = alerts[0]
        answer_lines.append(
            f"Latest comparable vital alert was at {latest_alert['alert_timestamp']} with risk score {latest_alert['risk_score']}."
        )
    if evidence:
        answer_lines.append(
            f"Retrieved {len(evidence)} source-backed patient records matching the current filters."
        )
    if glossary_hits:
        answer_lines.append("Patient-reported possible seizure indicators were surfaced separately via glossary rules.")

    return QAAnswerResponse(
        query_id="query-demo",
        response_id="response-demo",
        answer=" ".join(answer_lines),
        insufficient_evidence=False,
        model_confidence=0.64,
        evidence_completeness=min(1.0, 0.3 + 0.15 * len(evidence)),
        evidence=evidence,
        flagged_possible_seizure_indicators=glossary_hits[:10],
    )
