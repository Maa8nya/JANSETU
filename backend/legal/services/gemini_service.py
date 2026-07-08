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

    # ----------------------------
    # Format user answers
    # ----------------------------

    answers_text = ""

    for question, answer in answers.items():

        answers_text += f"""
Question:
{question}

Answer:
{answer}

"""

    # ----------------------------
    # Format retrieved laws
    # ----------------------------

    law_context = ""

    for law in laws:

        law_context += f"""
Law ID:
{law.get("law_id")}

Law:
{law.get("name")}

Category:
{law.get("category")}

Summary:
{law.get("summary")}

Applicable When:
{", ".join(law.get("applicable_when", []))}

Important Provisions:
"""

        for section in (law.get("important_provisions") or []):

            law_context += f"""
Reference:
{section.get("reference")}

Title:
{section.get("title")}

Description:
{section.get("description")}

"""

        law_context += f"""
Keywords:
{", ".join(law.get("keywords", []))}

----------------------------------------

"""

    # ----------------------------
    # Build Prompt
    # ----------------------------

    prompt = f"""
You are JanSetu Legal Assistant.

You are NOT a legal search engine.

Use ONLY the retrieved legal information.

If the retrieved information is insufficient,
say so instead of making assumptions.

====================================================

USER DETAILS

{answers_text}

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

Severity:
{scenario.get("severity")}

Urgency:
{scenario.get("urgency")}

====================================================

RETRIEVED LEGAL KNOWLEDGE

{law_context}

====================================================

Instructions

- Base your response ONLY on the retrieved scenario and laws.
- Do NOT invent legal facts.
- Mention the relevant law names naturally.
- Mention important legal provisions when useful.
- Explain why each recommendation is made.
- Personalize the response using the user's answers.
- If the retrieved information is insufficient, clearly state that.
- Keep the response under 300 words.
- Plain text only.
"""

    # ----------------------------
    # Gemini
    # ----------------------------

    try:

        print("========== GEMINI DEBUG ==========")
        print("Scenario :", scenario.get("scenario"))
        print("No. of Laws :", len(laws))
        print("Prompt Length :", len(prompt))
        print("==================================")

        response = model.generate_content(
            prompt
        )

        print("Gemini Success")

        return response.text

    except Exception as e:

        print("========== GEMINI ERROR ==========")
        print(type(e))
        print(e)
        print("==================================")

        raise