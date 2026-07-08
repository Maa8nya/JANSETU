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
    # Format User Answers
    # ----------------------------

    answers_text = ""

    for question, answer in answers.items():

        answers_text += (
            f"- {question}\n"
            f"  Answer: {answer}\n"
        )

    # ----------------------------
    # Format Laws
    # ----------------------------

    law_context = ""

    for law in laws:

        law_context += f"""
Law:
{law.get("name")}

Summary:
{law.get("summary")}
"""

        provisions = law.get(
            "important_provisions",
            []
        )

        if provisions:

            law_context += "Important Provisions:\n"

            for section in provisions:

                law_context += (
                    f"- {section.get('reference')}: "
                    f"{section.get('title')}\n"
                )

        law_context += "\n"

    # ----------------------------
    # Prompt
    # ----------------------------

    prompt = f"""
You are JanSetu, an Indian legal assistance chatbot.

Use ONLY the retrieved scenario and legal information below.

Do NOT invent legal facts.

If the available information is insufficient, clearly say so.

====================================

USER DETAILS

{answers_text}

====================================

MATCHED SCENARIO

Title:
{scenario.get("scenario")}

Description:
{scenario.get("description")}

Rights:
{", ".join(scenario.get("rights", []))}

Recommended Actions:
{", ".join(scenario.get("actions", []))}

====================================

RELEVANT LAWS

{law_context}

====================================

Instructions

Write a concise and helpful response.

Use the following structure:

Legal Position:
- Mention only 1-2 relevant law names naturally.
- Do NOT explain the laws in detail.
(Mention ONLY the names of the 1-2 most relevant retrieved laws. Do NOT explain the laws or sections unless absolutely necessary.)

What You Should Do:
(Provide 3-5 practical next steps.)

Important Rules

- Use simple and easy-to-understand English.
- Base the response ONLY on the retrieved scenario and retrieved laws.
- Do NOT invent legal facts.
- Personalize the response using the user's answers.
- Mention only 1-2 relevant law names naturally.
- Do NOT explain the laws in detail.
- Do NOT list every retrieved law.
- Mention legal sections only if they are essential.
- Avoid repeating information.
- Maximum 150 words.
- Plain text only.
"""

    # ----------------------------
    # Gemini
    # ----------------------------

    try:

        print("\n========== GEMINI ==========")
        print("Scenario :", scenario.get("scenario"))
        print("Retrieved Laws :", len(laws))
        print("Prompt Length :", len(prompt))
        print("============================\n")

        response = model.generate_content(
            prompt
        )

        return response.text

    except Exception as e:

        print("\n========== GEMINI ERROR ==========")
        print(type(e))
        print(e)
        print("==================================\n")
        raise