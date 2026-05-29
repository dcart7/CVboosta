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
            "core competence",
            "key competencies",
            "key skills",
            "key expertise",
            "areas of expertise",
            "expertise",
            "strengths",
            "core strengths",
            "competencies",
            "technologies",
            "tools",
            "languages",
            "stack",
            "hard skills",
            "soft skills",
            # Ukrainian / Russian common headings
            "навички",
            "ключові навички",
            "технічні навички",
            "експертиза",
            "ключова експертиза",
            "сильні сторони",
            "компетенції",
            "технології",
            "інструменти",
            "стек",
            "мови",
            "языки",
            "навыки",
            "ключевые навыки",
            "технические навыки",
            "экспертиза",
            "ключевая экспертиза",
            "сильные стороны",
            "инструменты",
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
            "досвід",
            "досвід роботи",
            "професійний досвід",
            "кар'єра",
            "опыт",
            "опыт работы",
            "профессиональный опыт",
        },
        "education": {
            "education",
            "academic background",
            "education & training",
            "education and training",
            "qualifications",
            "academic qualifications",
            "degrees",
            "освіта",
            "навчання",
            "образование",
            "обучение",
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
            "досягнення",
            "сертифікати",
            "сертифікації",
            "проєкти",
            "достижения",
            "сертификаты",
            "проекты",
        },
    }
    header_lookup = {alias: key for key, aliases in headings.items() for alias in aliases}
    all_headers = set(header_lookup.keys())

    def _is_section_heading(normalized: str) -> bool:
        """True only for real section titles, not bullets ending with e.g. 'skills'."""
        core = normalized.rstrip(":").strip()
        if core in all_headers:
            return True
        for h in all_headers:
            if normalized.startswith(f"{h}:") or core.startswith(f"{h}:"):
                return True
        return False

    def _heading_category(normalized: str) -> str | None:
        core = normalized.rstrip(":").strip()
        for h, k in header_lookup.items():
            if core == h or normalized.startswith(f"{h}:") or core.startswith(f"{h}:"):
                return k
        return None

    sections: dict[str, list[str]] = {key: [] for key in headings.keys()}
    current: str | None = None
    # Stop-capture headings that often appear inside CVs but are not professional sections.
    # When encountered while we're inside "skills", we end the skills section to avoid
    # ingesting hobby/personal paragraphs as skills.
    stop_headings: set[str] = {
        "hobbies",
        "hobby",
        "interests",
        "about me",
        "summary",
        "profile",
        "personal",
        "personal information",
        "additional information",
        "misc",
        "other",
        "хоббі",
        "інтереси",
        "про мене",
        "профіль",
        "резюме",
        "додаткова інформація",
        "особисте",
        "хобби",
        "интересы",
        "обо мне",
        "дополнительная информация",
        "личное",
    }

    lines = [line.strip() for line in text.splitlines()]
    for line in lines:
        if not line:
            continue
        normalized = _normalize_heading(line)
        # End the "skills" section if we hit an "About/Hobbies" style heading.
        core = normalized.rstrip(":").strip()
        if current == "skills":
            for stop in stop_headings:
                if core == stop or core.startswith(f"{stop}:") or core.startswith(stop):
                    current = None
                    break
            if current is None:
                continue
        if _is_section_heading(normalized):
            cat = _heading_category(normalized)
            if cat is not None:
                current = cat
            continue
        if current is not None:
            sections[typing.cast(str, current)].append(line)
    return sections


def _extract_skills(text: str) -> list[str]:
    def _normalize_skill_token(item: str) -> str:
        value = item.strip().strip("•- \t")
        # Remove trailing sentence punctuation that often appears at end-of-line.
        value = value.strip().strip(".,;:").strip()
        return value

    def _looks_like_skill(item: str) -> bool:
        value = _normalize_skill_token(item)
        if not value or len(value) < 2:
            return False
        if len(value) > 80:
            return False
        if value.count(" ") > 8:
            return False

        lowered = value.casefold()
        noise_markers = (
            "хоб",
            "hobby",
            "interests",
            "інтерес",
            "особист",
            "about me",
            "про мене",
            "обо мне",
            "сім'я",
            "семья",
            "діти",
            "дети",
            "доньк",
            "дочь",
            "сын",
            "married",
            "children",
        )
        if any(marker in lowered for marker in noise_markers):
            return False

        # Filter sentence-like fragments (common when "About me" content gets misclassified as skills).
        if ". " in value or "!" in value or "?" in value:
            return False

        return True

    sections = _extract_sections(text)
    skills_lines = sections.get("skills", [])
    if skills_lines:
        joined = " ".join(skills_lines)
        parts = [p.strip("•- \t").strip() for p in re.split(r"[,;|\n]", joined)]
        # Drop paragraph-sized blobs mistaken for skills; keep short tokens only
        out: list[str] = []
        for p in parts:
            normalized = _normalize_skill_token(p)
            if _looks_like_skill(normalized):
                out.append(normalized)
        return out[:40]

    # Fallback: some CVs don't have a dedicated Skills section, but include
    # dense comma/bullet lists (often in "Summary"/"Profile"). Extract only
    # clearly list-like lines to avoid pulling paragraphs.
    candidate_lines: list[str] = []
    for line in (ln.strip() for ln in text.splitlines()):
        if not line:
            continue
        normalized = _normalize_heading(line)
        core = normalized.rstrip(":").strip()
        # Skip obvious non-skill headings.
        if core in {"summary", "profile", "about me", "про мене", "обо мне"}:
            continue
        has_many_commas = line.count(",") >= 2
        has_bullets = "•" in line or re.search(r"(^|\\s)[\\-–•]\\s+\\S+", line) is not None
        if not (has_many_commas or has_bullets):
            continue
        # Avoid long sentences.
        if len(line) > 160:
            continue
        candidate_lines.append(line)
        if len(candidate_lines) >= 8:
            break

    if not candidate_lines:
        return []

    joined = " ".join(candidate_lines)
    parts = [p.strip("•- \t").strip() for p in re.split(r"[,;|\n]", joined)]
    out: list[str] = []
    for p in parts:
        normalized = _normalize_skill_token(p)
        if _looks_like_skill(normalized):
            out.append(normalized)
    return out[:40]


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
