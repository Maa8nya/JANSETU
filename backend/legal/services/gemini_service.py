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
    laws,
    answers
):
        # Format the laws nicely
    law_context = ""

    for law in laws:

        law_context += f"""
Law:
{law.get("name")}

Summary:
{law.get("summary")}

Sections:
{law.get("sections")}

-----------------------
"""
    prompt = f"""
You are JanSetu Legal Assistant.

You are NOT a legal search engine.

Use ONLY the legal information provided below.

If the information is insufficient,
say so instead of making assumptions.

====================================================

USER QUERY DETAILS

{answers}

====================================================

SCENARIO

Title:
{scenario.get("scenario")}

Description:
{scenario.get("description")}

Rights:
{scenario.get("rights")}

Immediate Actions:
{scenario.get("immediate_actions")}

Recommended Actions:
{scenario.get("actions")}

Required Documents:
{scenario.get("documents_needed")}

Red Flags:
{scenario.get("red_flags")}

Possible Outcomes:
{scenario.get("possible_outcomes")}

References:
{scenario.get("references")}

Severity:
{scenario.get("severity")}

Urgency:
{scenario.get("urgency")}

====================================================

RELEVANT LAWS

{laws}

====================================================

Instructions

- Use ONLY the retrieved information.
- Do NOT invent legal facts.
- Explain the legal situation naturally.
- Mention relevant laws where appropriate.
- Personalize the advice using the user's answers.
- Keep the response below 300 words.
- Plain text only.
"""
    response = model.generate_content(
        prompt
    )

    return response.text