import uuid

sessions = {}

def create_session(
    scenario,
    questions
):

    session_id = str(
        uuid.uuid4()
    )

    sessions[session_id] = {

        "scenario": scenario,

        "questions": questions,

        "question_index": 0,

        "answers": {}

    }

    return session_id


def get_session(
    session_id
):

    return sessions.get(
        session_id
    )