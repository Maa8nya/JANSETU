import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(
    api_key=os.getenv(
        "GEMINI_API_KEY"
    )
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)


def generate_legal_response(
    scenario,
    answers
):

    prompt = f"""
You are JanSetu Legal Assistant.

Use ONLY the information provided.

Scenario:
{scenario.get('scenario')}

Description:
{scenario.get('description')}

Rights:
{scenario.get('rights')}

Actions:
{scenario.get('actions')}

Documents Needed:
{scenario.get('documents_needed')}

User Answers:
{answers}

Write in a friendly conversational tone.

Do not use headings unless necessary.

Reference the user's answers naturally.

Explain why each recommendation is being made.

Provide:

1. Rights
2. Recommended Actions
3. Documents Required

Instructions:

- Use plain text only
- No markdown
- No **
- Use bullet points with -
- Keep under 250 words

Respond professionally.
"""

    response = model.generate_content(
        prompt
    )

    return response.text