import ast
import json


def _parse_questions(text):
    if not isinstance(text, str):
        return text

    text = text.strip()
    if not text:
        return []

    try:
        questions = json.loads(text)
    except json.JSONDecodeError:
        try:
            questions = ast.literal_eval(text)
        except Exception:
            return [text]

    if isinstance(questions, list):
        return questions

    return [str(questions)]


def get_questions(
    scenario
):

    if (
        "clarification_questions"
        in scenario
        and
        scenario[
            "clarification_questions"
        ]
    ):

        questions = scenario[
            "clarification_questions"
        ]

        if isinstance(
            questions,
            str
        ):
            questions = _parse_questions(
                questions
            )

        if isinstance(
            questions,
            list
        ):
            return questions

    return [

        "Can you tell me more about what happened?",

        "How long has this issue been ongoing?",

        "Do you have any supporting documents?"

    ]