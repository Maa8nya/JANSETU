from flask import Blueprint
from flask import request
from flask import jsonify
from legal.services.law_service import (
    get_laws_by_ids
)

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

from legal.services.gemini_service import (
    generate_legal_response
)

chatbot_bp = Blueprint(
    "legal_chatbot",
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
        query_lower = query.strip().lower()

        GREETINGS = [
            "hi",
            "hello",
            "hey",
            "good morning",
            "good afternoon",
            "good evening",
            "hola"
        ]

        THANKS = [
            "thanks",
            "thank you",
            "thx"
        ]

        GOODBYE = [
            "bye",
            "goodbye",
            "see you"
        ]

        if query_lower in GREETINGS:
            return jsonify({
                "status": "question",
                "question": "Hello! I can help with legal questions. What would you like to know?"
            })

        if query_lower in THANKS:
            return jsonify({
                "status": "question",
                "question": "You're welcome! How can I help you today?"
            })

        if query_lower in GOODBYE:
            return jsonify({
                "status": "question",
                "question": "Goodbye! Feel free to come back if you need legal help."
            })

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
            laws = get_laws_by_ids(
    session["scenario"].get(
        "law_ids",
        []
    )
)


            final_response = generate_legal_response(

                session[
                    "scenario"
                ],

                session[
                    "answers"
                ]

            )

            return jsonify({

                "status":
                "complete",

                "scenario":
                session[
                    "scenario"
                ][
                    "scenario"
                ],

                "response":
                final_response,

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