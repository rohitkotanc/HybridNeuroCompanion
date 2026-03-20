from app.services.glossary import scan_text_for_glossary_terms


def test_glossary_matches_obvious_seizure_indicators() -> None:
    matches = scan_text_for_glossary_terms("Patient says they blacked out and felt confused after.")
    terms = {item.term for item in matches}
    assert "blacked out" in terms
    assert "confusion after episode" in terms
