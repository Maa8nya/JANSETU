import os

from legal.config.db import db


def get_scenarios():

    collection_name = os.getenv(
        "SCENARIO_COLLECTION"
    )

    scenarios = list(
        db[collection_name].find(
            {},
            {"_id": 0}
        )
    )

    return scenarios