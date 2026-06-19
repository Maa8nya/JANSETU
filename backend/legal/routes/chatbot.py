from flask import Blueprint
from flask import request
from flask import jsonify

from legal.services.semantic_search import (
    find_best_scenario
)

from legal.services.question_generator import (
    get_questions
)

from legal.services.session_manager import (
    create_session,
    get_session
)

chatbot_bp = Blueprint(
    "chatbot",
    __name__
)


@chatbot_bp.route(
    "/start-chat",
    methods=["POST"]
)
def start_chat():

    try:

        data = request.get_json()

        query = data.get(
            "query",
            ""
        )

        result = find_best_scenario(
            query
        )

        scenario = result[
            "scenario"
        ]

        questions = get_questions(
            scenario
        )

        session_id = create_session(
            scenario,
            questions
        )

        return jsonify({

            "status":
            "question",

            "session_id":
            session_id,

            "scenario":
            scenario[
                "scenario"
            ],

            "score":
            result[
                "score"
            ],

            "question":
            questions[0]

        })

    except Exception as e:

        return jsonify({

            "status":
            "error",

            "message":
            str(e)

        }), 500


@chatbot_bp.route(
    "/answer",
    methods=["POST"]
)
def answer():

    try:

        data = request.get_json()

        session_id = data.get(
            "session_id"
        )

        answer_text = data.get(
            "answer"
        )

        session = get_session(
            session_id
        )

        if not session:

            return jsonify({

                "status":
                "error",

                "message":
                "Invalid session"

            }), 404

        current_index = session[
            "question_index"
        ]

        current_question = session[
            "questions"
        ][
            current_index
        ]

        session[
            "answers"
        ][
            current_question
        ] = answer_text

        session[
            "question_index"
        ] += 1

        if session[
            "question_index"
        ] >= len(
            session[
                "questions"
            ]
        ):

            return jsonify({

                "status":
                "complete",

                "scenario":
                session[
                    "scenario"
                ],

                "answers":
                session[
                    "answers"
                ]

            })

        next_question = session[
            "questions"
        ][
            session[
                "question_index"
            ]
        ]

        return jsonify({

            "status":
            "question",

            "question":
            next_question

        })

    except Exception as e:

        return jsonify({

            "status":
            "error",

            "message":
            str(e)

        }), 500