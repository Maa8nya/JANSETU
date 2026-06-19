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

        return scenario[
            "clarification_questions"
        ]

    return [

        "Can you tell me more about what happened?",

        "How long has this issue been ongoing?",

        "Do you have any supporting documents?"

    ]