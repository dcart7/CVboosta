import os
import sys
from dotenv import load_dotenv

load_dotenv()

from app.services.llm import _generate_with_gemini

try:
    result = _generate_with_gemini(
        cv_text="Software engineer with 5 years experience.",
        job_text="Need a Python engineer.",
        cv_analysis="Good.",
        job_analysis="Need Python.",
        ats_keywords=["Python", "Software Engineering"],
        target_role="Python Engineer",
        target_company="Acme Corp"
    )
    print(result.optimized_cv)
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

