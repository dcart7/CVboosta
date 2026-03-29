from pydantic import BaseModel


class ParsedCvResponse(BaseModel):
    raw_text: str
    skills: list[str]
    work_experience: list[str]
    education: list[str]
    achievements: list[str]
    feedback: str
