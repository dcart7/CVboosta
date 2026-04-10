import os
import sys
# Add project root and backend to path
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "backend"))

# Mock settings if needed
os.environ["GEMINI_API_KEY"] = "mock_not_needed_for_import"

try:
    from backend.app.services.llm import generate_interview_prep
    from backend.app.schemas.pipeline import InterviewPrepRequest
    print("Imports successful")
except Exception as e:
    print(f"Import failed: {e}")
