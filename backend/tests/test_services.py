from app.services.cv_parser import parse_cv
from app.services.matching import compute_match_score


def test_parse_cv_text_sections():
    text = (
        "Skills\n"
        "Python, SQL\n"
        "Experience\n"
        "Backend Developer\n"
        "Education\n"
        "BSc Computer Science\n"
        "Achievements\n"
        "Awarded Top Dev\n"
    )
    parsed = parse_cv(file_bytes=text.encode("utf-8"), filename="resume.txt")
    assert parsed.skills == ["Python", "SQL"]
    assert "Backend Developer" in parsed.work_experience
    assert "BSc Computer Science" in parsed.education
    assert "Awarded Top Dev" in parsed.achievements


def test_compute_match_score():
    score, matched, missing = compute_match_score("Python SQL", ["Python", "Go"])
    assert score == 50
    assert matched == ["Python"]
    assert missing == ["Go"]
