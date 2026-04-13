import os
import sys
from google import genai
from google.genai import errors as genai_errors
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
try:
    response = client.models.generate_content(
        model=os.environ.get("GEMINI_MODEL", "gemini-2.5-flash"),
        contents="Hello"
    )
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
    if hasattr(e, '__cause__'):
        print(f"Cause: {e.__cause__}")
