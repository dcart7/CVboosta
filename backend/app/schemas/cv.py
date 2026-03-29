from pydantic import BaseModel


class ParsedCvResponse(BaseModel):
    raw_text: str
    skills: list[str]
    work_experience: list[str]
    education: list[str]
    achievements: list[str]
    pretty_json: str | None = None
    markdown: str | None = None
    feedback: str
