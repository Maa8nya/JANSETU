from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from legal.config.db import db
import numpy as np

# Load model once
model = SentenceTransformer("all-MiniLM-L6-v2")

# Global cache
scenario_cache = []


def build_search_index():
    global scenario_cache

    print("Loading scenarios from MongoDB...")

    scenarios = list(
        db["scenarios"].find(
            {},
            {"_id": 0}
        )
    )

    scenario_cache = []

    for scenario in scenarios:

        search_text = " ".join([

            scenario.get("scenario", ""),

            scenario.get("description", ""),

            " ".join(
                scenario.get(
                    "keywords",
                    []
                )
            ),

            " ".join(
                scenario.get(
                    "example_queries",
                    []
                )
            )

        ])

        embedding = model.encode(
            search_text
        )

        scenario_cache.append({
            "scenario": scenario,
            "embedding": embedding
        })

    print(
        f"Loaded {len(scenario_cache)} scenarios."
    )


def find_best_scenario(query):

    query_embedding = model.encode(
        query
    )

    best_score = -1
    best_match = None

    for item in scenario_cache:

        score = cosine_similarity(
            [query_embedding],
            [item["embedding"]]
        )[0][0]

        if score > best_score:

            best_score = score
            best_match = item["scenario"]

    return {
        "score": float(best_score),
        "scenario": best_match
    }