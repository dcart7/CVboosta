import io
import re
from dataclasses import dataclass
import typing

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
    # Remove markdown chars, colons, and extra whitespace
    return re.sub(r"[#*_\\\-|]", "", value).strip().lower().strip(":")


def _split_bullets(lines: list[str]) -> list[str]:
    items: list[str] = []
    for line in lines:
        parts = [p.strip() for p in line.replace("•", "-").split("-") if p.strip()]
        if len(parts) <= 1:
            items.append(line.strip("•- ").strip())
        else:
            items.extend(parts)
    return [item for item in items if item]


def _extract_text_pdfplumber(file_bytes: bytes) -> str:
    """Primary PDF text extraction using pdfplumber."""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        pages = []
        for page in pdf.pages:
            # Try extracting with layout (handles multi-column better)
            text = page.extract_text(layout=True) or page.extract_text() or ""
            pages.append(text)
    return "\n".join(pages)


def _extract_text_pdfminer(file_bytes: bytes) -> str:
    """Fallback PDF text extraction using pdfminer.six."""
    try:
        from pdfminer.high_level import extract_text_to_fp
        from pdfminer.layout import LAParams

        output = io.StringIO()
        laparams = LAParams(
            line_margin=0.5,
            word_margin=0.1,
            char_margin=2.0,
            detect_vertical=True,
        )
        extract_text_to_fp(
            io.BytesIO(file_bytes),
            output,
            laparams=laparams,
            output_type="text",
            codec="utf-8",
        )
        return output.getvalue()
    except Exception:
        return ""


def _extract_sections(text: str) -> dict[str, list[str]]:
    headings: dict[str, set[str]] = {
        "skills": {
            "skills",
            "technical skills",
            "tech skills",
            "core skills",
            "core competencies",
            "competencies",
            "key skills",
            "technologies",
            "tools",
            "languages",
            "stack",
            "hard skills",
            "soft skills",
        },
        "experience": {
            "experience",
            "work experience",
            "professional experience",
            "employment",
            "employment history",
            "work history",
            "career history",
            "positions held",
        },
        "education": {
            "education",
            "academic background",
            "education & training",
            "education and training",
            "qualifications",
            "academic qualifications",
            "degrees",
        },
        "achievements": {
            "achievements",
            "accomplishments",
            "awards",
            "highlights",
            "certifications",
            "certificates",
            "projects",
            "notable projects",
        },
    }
    header_lookup = {alias: key for key, aliases in headings.items() for alias in aliases}
    all_headers = set(header_lookup.keys())

    sections: dict[str, list[str]] = {key: [] for key in headings.keys()}
    current: str | None = None

    lines = [line.strip() for line in text.splitlines()]
    for line in lines:
        if not line:
            continue
        normalized = _normalize_heading(line)
        # Check exact match or suffix match for headings like "TECHNICAL SKILLS:"
        matched = normalized in all_headers or any(
            normalized.startswith(h) or normalized.endswith(h)
            for h in all_headers
        )
        if matched:
            for h, k in header_lookup.items():
                if h in normalized:
                    current = k
                    break
            continue
        if current is not None:
            sections[typing.cast(str, current)].append(line)
    return sections


def _extract_skills(text: str) -> list[str]:
    sections = _extract_sections(text)
    skills_lines = sections.get("skills", [])
    if skills_lines:
        joined = " ".join(skills_lines)
        parts = [p.strip("•- \t").strip() for p in re.split(r"[,;|\n]", joined)]
        return [p for p in parts if p and len(p) > 1]
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
        # Try pdfplumber first
        raw_text = _extract_text_pdfplumber(file_bytes)

        # If pdfplumber returns very little text, fall back to pdfminer
        if len(raw_text.strip()) < 50:
            raw_text = _extract_text_pdfminer(file_bytes)

        # If still nothing, raise a descriptive error
        if not raw_text.strip():
            raise ValueError(
                "Could not extract text from this PDF. "
                "The file may be image-based (scanned). "
                "Please try a text-based PDF or paste the CV as text."
            )
    else:
        # TXT, DOCX fallback (UTF-8)
        raw_text = file_bytes.decode("utf-8", errors="ignore")

    cleaned = _clean_text(raw_text)

    return ParsedCV(
        raw_text=cleaned,
        skills=_extract_skills(raw_text),
        work_experience=_extract_experience(raw_text),
        education=_extract_education(raw_text),
        achievements=_extract_achievements(raw_text),
    )
