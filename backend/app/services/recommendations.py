from __future__ import annotations


def build_recommendations(missing_skills: list[str]) -> list[str]:
    if not missing_skills:
        return [
            "Tighten bullet points to emphasize impact metrics (%, $, scale, time saved).",
            "Align the Summary with the top job requirements.",
            "Ensure Skills section mirrors the exact job keywords (only if truthful).",
        ]
    recommendations: list[str] = []
    for skill in missing_skills:
        cleaned = skill.strip()
        if not cleaned:
            continue
        recommendations.append(
            f"Add a bullet that demonstrates hands-on experience with {cleaned}."
        )
    if not recommendations:
        recommendations.append("Highlight your strongest, most relevant achievements.")
    return recommendations
