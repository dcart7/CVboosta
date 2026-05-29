from app.services.cv_parser import parse_cv
from app.services.matching import compute_match_score
from app.services.keyword_clean import extract_whitelist_keywords


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


def test_parse_cv_skills_ukrainian_heading_filters_hobbies():
    text = (
        "Навички\n"
        "Python, SQL, Docker\n"
        "Хоббі: Вважаю, що хоббі допомагає переключити свою увагу.\n"
        "Досвід роботи\n"
        "Backend Developer\n"
    )
    parsed = parse_cv(file_bytes=text.encode("utf-8"), filename="resume.txt")
    assert "Python" in parsed.skills
    assert "SQL" in parsed.skills
    assert "Docker" in parsed.skills
    assert all("хоб" not in s.casefold() for s in parsed.skills)


def test_compute_match_score():
    score, matched, missing = compute_match_score("Python SQL", ["Python", "Go"])
    assert score == 50
    assert matched == ["Python"]
    assert missing == ["Go"]


def test_extract_whitelist_keywords_avoids_short_token_false_positives():
    text = "We need ongoing ownership and good communication."
    keywords = extract_whitelist_keywords(text, limit=50)
    assert "Go" not in keywords


def test_extract_whitelist_keywords_matches_punctuated_terms():
    text = "Stack: Node.js, CI/CD, C++ and C#."
    keywords = extract_whitelist_keywords(text, limit=50)
    assert "Node.js" in keywords
    assert "CI/CD" in keywords
    assert "C++" in keywords
    assert "C#" in keywords
