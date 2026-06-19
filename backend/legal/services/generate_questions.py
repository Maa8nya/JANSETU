import os
import time
from dotenv import load_dotenv

import google.generativeai as genai

from legal.config.db import db

load_dotenv()

genai.configure(
    api_key=os.getenv(
        "GEMINI_API_KEY"
    )
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)


def generate_questions(scenario):

    prompt = f"""
You are helping build a legal assistance system.

Generate 3 to 5 clarification questions.

The questions should:

- Help understand the user's situation
- Sound natural and professional
- Not repeat information already known
- Be useful for legal guidance

Return ONLY a JSON array.

Scenario:
{scenario.get('scenario', '')}

Description:
{scenario.get('description', '')}

Rights:
{scenario.get('rights', [])}

Actions:
{scenario.get('actions', [])}

Documents Needed:
{scenario.get('documents_needed', [])}
"""

    response = model.generate_content(
        prompt
    )

    return response.text


def main():

    scenarios = list(
        db["scenarios"].find({})
    )

    print(
        f"Found {len(scenarios)} scenarios"
    )

    processed_count = 0

    for scenario in scenarios:

        # Skip already completed scenarios
        if scenario.get(
            "clarification_questions"
        ):
            continue

        try:

            questions = generate_questions(
                scenario
            )

            db["scenarios"].update_one(

                {
                    "_id":
                    scenario["_id"]
                },

                {
                    "$set": {
                        "clarification_questions":
                        questions
                    }
                }
            )

            processed_count += 1

            print(
                f"Updated {scenario['scenario_id']}"
            )

            # Sleep after every 4 successful requests
            if processed_count % 4 == 0:

                print(
                    "\nSleeping for 90 seconds...\n"
                )

                time.sleep(90)

        except Exception as e:

            print(
                f"Failed {scenario['scenario_id']}"
            )

            print(e)

            # If Gemini rate limits, wait and continue
            print(
                "\nRate limit hit. Sleeping for 90 seconds...\n"
            )

            time.sleep(90)


if __name__ == "__main__":
    main()