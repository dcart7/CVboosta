import io
from dataclasses import dataclass

import pdfplumber


@dataclass
class ParsedCV:
    raw_text: str
    skills: list[str]
    work_experience: list[str]
    education: list[str]
    achievements: list[str]


def _clean_text(text: str) -> str:
    return " ".join(text.split())


def _normalize_heading(value: str) -> str:
    return value.strip().lower().strip(":")


def _split_bullets(lines: list[str]) -> list[str]:
    items: list[str] = []
    for line in lines:
        parts = [p.strip() for p in line.replace("•", "-").split("-") if p.strip()]
        if len(parts) <= 1:
            items.append(line.strip("•- ").strip())
        else:
            items.extend(parts)
    return [item for item in items if item]


def _extract_sections(text: str) -> dict[str, list[str]]:
    headings = {
        "skills": {
            "skills",
            "technical skills",
            "tech skills",
            "core skills",
            "core competencies",
            "competencies",
            "key skills",
        },
        "experience": {
            "experience",
            "work experience",
            "professional experience",
            "employment",
            "employment history",
            "work history",
        },
        "education": {
            "education",
            "academic background",
            "education & training",
            "education and training",
        },
        "achievements": {
            "achievements",
            "accomplishments",
            "awards",
            "highlights",
        },
    }
    header_lookup = {alias: key for key, aliases in headings.items() for alias in aliases}
    all_headers = set(header_lookup.keys())

    sections = {key: [] for key in headings.keys()}
    current: str | None = None

    lines = [line.strip() for line in text.splitlines()]
    for line in lines:
        if not line:
            continue
        normalized = _normalize_heading(line)
        if normalized in all_headers:
            current = header_lookup[normalized]
            continue
        if current:
            sections[current].append(line)
    return sections


def _extract_skills(text: str) -> list[str]:
    sections = _extract_sections(text)
    skills_lines = sections.get("skills", [])
    if skills_lines:
        joined = " ".join(skills_lines)
        parts = [p.strip("•- ").strip() for p in joined.replace(";", ",").split(",")]
        return [p for p in parts if p]
    return []


def _extract_experience(text: str) -> list[str]:
    sections = _extract_sections(text)
    experience_lines = sections.get("experience", [])
    return _split_bullets(experience_lines)


def _extract_education(text: str) -> list[str]:
    sections = _extract_sections(text)
    education_lines = sections.get("education", [])
    return _split_bullets(education_lines)


def _extract_achievements(text: str) -> list[str]:
    sections = _extract_sections(text)
    achievement_lines = sections.get("achievements", [])
    return _split_bullets(achievement_lines)


def parse_cv(file_bytes: bytes, filename: str) -> ParsedCV:
    if filename.lower().endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages = [page.extract_text() or "" for page in pdf.pages]
        raw_text = "\n".join(pages)
    else:
        raw_text = file_bytes.decode("utf-8", errors="ignore")

    cleaned = _clean_text(raw_text)
    return ParsedCV(
        raw_text=cleaned,
        skills=_extract_skills(raw_text),
        work_experience=_extract_experience(raw_text),
        education=_extract_education(raw_text),
        achievements=_extract_achievements(raw_text),
    )
