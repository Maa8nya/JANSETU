import os
import uuid
from datetime import datetime, timezone

from legal.config.db import db

SESSION_COLLECTION = os.getenv("SESSION_COLLECTION", "legal_sessions")


def _collection():
    return db[SESSION_COLLECTION]


def create_session(scenario, questions):
    session_id = str(uuid.uuid4())

    session_doc = {
        "session_id": session_id,
        "scenario": scenario,
        "questions": questions,
        "question_index": 0,
        "answers": {},
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    _collection().insert_one(session_doc)

    print("\n========== SESSION CREATED ==========")
    print("Session ID :", session_id)
    print("Collection :", SESSION_COLLECTION)
    print("=====================================\n")

    return session_id


def get_session(session_id):
    print("\n========== GET SESSION ==========")
    print("Requested Session :", session_id)

    session = _collection().find_one({"session_id": session_id})

    if session:
        session.pop("_id", None)
        print("Session Found : YES")
    else:
        print("Session Found : NO")

    print("=================================\n")

    return session


def save_session(session):
    session_id = session["session_id"]
    session_copy = dict(session)
    session_copy["updated_at"] = datetime.now(timezone.utc)
    session_copy.pop("_id", None)

    _collection().replace_one(
        {"session_id": session_id},
        session_copy,
        upsert=True,
    )

    return session_copy