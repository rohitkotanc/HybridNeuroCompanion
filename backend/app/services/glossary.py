from __future__ import annotations

from dataclasses import dataclass


@dataclass
class GlossaryMatch:
    term: str
    matched_text: str


DEFAULT_GLOSSARY = [
    {"canonical_term": "aura", "synonyms": ["aura", "warning feeling"]},
    {"canonical_term": "convulsions", "synonyms": ["convulsions", "convulsing"]},
    {"canonical_term": "blacked out", "synonyms": ["blacked out", "passed out"]},
    {"canonical_term": "lost consciousness", "synonyms": ["lost consciousness", "unconscious"]},
    {"canonical_term": "confusion after episode", "synonyms": ["confused after", "postictal confusion"]},
    {"canonical_term": "tongue bite", "synonyms": ["tongue bite", "bit my tongue"]},
    {"canonical_term": "incontinence", "synonyms": ["incontinence", "wet myself"]},
    {"canonical_term": "staring spell", "synonyms": ["staring spell", "blank stare"]},
    {"canonical_term": "shaking", "synonyms": ["shaking", "shaking hard"]},
    {"canonical_term": "severe disorientation", "synonyms": ["severely disoriented", "very disoriented"]},
    {"canonical_term": "sudden collapse", "synonyms": ["collapsed suddenly", "sudden collapse"]},
]


def scan_text_for_glossary_terms(text: str, glossary: list[dict] | None = None) -> list[GlossaryMatch]:
    glossary = glossary or DEFAULT_GLOSSARY
    lowered = text.lower()
    matches: list[GlossaryMatch] = []
    for entry in glossary:
        for synonym in entry["synonyms"]:
            if synonym.lower() in lowered:
                matches.append(GlossaryMatch(term=entry["canonical_term"], matched_text=synonym))
    return matches
