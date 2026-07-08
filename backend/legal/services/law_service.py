from legal.config.db import db


def get_laws_by_ids(law_ids):

    if not law_ids:
        return []

    laws = list(
        db["laws"].find(
            {
                "law_id": {
                    "$in": law_ids
                }
            },
            {
                "_id": 0
            }
        )
    )

    return laws