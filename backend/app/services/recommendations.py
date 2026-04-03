from __future__ import annotations


def build_recommendations(missing_skills: list[str]) -> list[str]:
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
