import re

from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

from legal.config.db import db as mongo_db

# SCHEMES MODULE
from schemes.chatbot import chatbot_bp as schemes_chatbot_bp

# LEGAL MODULE
from legal.routes.chatbot import chatbot_bp as legal_chatbot_bp
from legal.services.semantic_search import build_search_index

app = Flask(__name__)
CORS(app)


def _serialize_law(law):
    if not law:
        return None

    law_id = law.get("law_id") or law.get("id") or law.get("_id")
    category = (
        law.get("category")
        or law.get("law_category")
        or law.get("legal_category")
        or law.get("topic")
        or law.get("type")
        or ""
    )

    def normalize_list(value):
        if not value:
            return []
        if isinstance(value, list):
            return [item for item in value if item]
        return [value]

    provisions = normalize_list(law.get("important_provisions") or law.get("provisions"))
    rights = normalize_list(law.get("rights"))
    actions = normalize_list(law.get("actions") or law.get("recommended_actions"))
    situations = normalize_list(
        law.get("applicable_situations")
        or law.get("applicableSituations")
        or law.get("situations")
    )

    return {
        "id": str(law_id) if law_id is not None else "",
        "law_id": str(law_id) if law_id is not None else "",
        "name": law.get("name") or law.get("title") or law.get("law_name") or "Untitled law",
        "summary": law.get("summary") or law.get("description") or "",
        "category": category,
        "applicable_situations": situations,
        "important_provisions": provisions,
        "rights": rights,
        "actions": actions,
    }


def _get_law_categories():
    docs = list(
        mongo_db["laws"].find(
            {},
            {
                "_id": 0,
                "category": 1,
                "law_category": 1,
                "legal_category": 1,
                "topic": 1,
                "type": 1,
            },
        )
    )

    categories = []
    seen = set()

    for law in docs:
        for key in ["category", "law_category", "legal_category", "topic", "type"]:
            value = law.get(key)
            if isinstance(value, str) and value.strip():
                normalized = value.strip()
                if normalized not in seen:
                    seen.add(normalized)
                    categories.append({"name": normalized, "value": normalized})

    if not categories:
        categories = [
            {"name": "Employment", "value": "Employment"},
            {"name": "Consumer", "value": "Consumer"},
            {"name": "Cyber", "value": "Cyber"},
            {"name": "Property", "value": "Property"},
            {"name": "Women & Family", "value": "Women & Family"},
        ]

    return categories

# -------------------------
# REGISTER BLUEPRINTS
# -------------------------

# Schemes Chatbot
app.register_blueprint(
    schemes_chatbot_bp
)

# Legal Chatbot
app.register_blueprint(
    legal_chatbot_bp,
    url_prefix="/api/legal"
)

# -------------------------
# BUILD LEGAL SEARCH INDEX
# -------------------------

print("Building Legal Search Index...")
build_search_index()
print("Legal Search Index Ready.")

# -------------------------
# MYSQL CONNECTION
# -------------------------

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Helloworld123",
    database="jansetu_db"
)
cursor = db.cursor(dictionary=True)

if db.is_connected():
    print("MySQL Connected Successfully!")

cursor = db.cursor(dictionary=True)

# -------------------------
# HOME ROUTE
# -------------------------

@app.route("/")
def home():

    return jsonify({
        "message": "JANSETU Backend Running"
    })

# -------------------------
# GET ALL SCHEMES
# -------------------------

@app.route("/schemes", methods=["GET"])
def get_schemes():

    cursor.execute(
        "SELECT * FROM schemes"
    )

    return jsonify(
        cursor.fetchall()
    )

# -------------------------
# SEARCH SCHEME
# -------------------------

@app.route("/search", methods=["GET"])
def search_scheme():

    query = request.args.get("query")

    sql = """
    SELECT *
    FROM schemes
    WHERE scheme_name LIKE %s
    OR tags LIKE %s
    OR category LIKE %s
    """

    search_term = f"%{query}%"

    cursor.execute(
        sql,
        (
            search_term,
            search_term,
            search_term
        )
    )

    return jsonify(
        cursor.fetchall()
    )

# -------------------------
# CENTRAL SCHEMES
# -------------------------

@app.route("/central", methods=["GET"])
def get_central_schemes():

    cursor.execute(
        "SELECT * FROM schemes WHERE level='Central'"
    )

    return jsonify(
        cursor.fetchall()
    )

# -------------------------
# STATE SCHEMES
# -------------------------

@app.route("/state-schemes", methods=["GET"])
def get_state_level_schemes():

    cursor.execute(
        "SELECT * FROM schemes WHERE level='State'"
    )

    return jsonify(
        cursor.fetchall()
    )

# -------------------------
# SCHEMES BY STATE
# -------------------------

@app.route("/state/<state_name>", methods=["GET"])
def get_state_schemes(state_name):

    cursor.execute(
        "SELECT * FROM schemes WHERE state=%s",
        (state_name,)
    )

    return jsonify(
        cursor.fetchall()
    )

# -------------------------
# SCHEMES BY CATEGORY
# -------------------------

@app.route("/category/<category>", methods=["GET"])
def get_category_schemes(category):

    cursor.execute(
        "SELECT * FROM schemes WHERE category LIKE %s",
        (f"%{category}%",)
    )

    return jsonify(
        cursor.fetchall()
    )

# -------------------------
# RECOMMENDATION API
# -------------------------

@app.route("/recommend", methods=["GET"])
def recommend():

    category = request.args.get("category")
    state = request.args.get("state")

    cursor.execute("""
        SELECT *
        FROM schemes
        WHERE category=%s
        AND state=%s
    """, (
        category,
        state
    ))

    return jsonify(
        cursor.fetchall()
    )


@app.route("/rights/categories", methods=["GET"])
def get_rights_categories():
    return jsonify(_get_law_categories())


@app.route("/rights/laws", methods=["GET"])
def get_rights_laws():
    category = (request.args.get("category") or "").strip()
    if not category:
        return jsonify([])

    query = {
        "$or": [
            {"category": {"$regex": f"^{re.escape(category)}$", "$options": "i"}},
            {"law_category": {"$regex": f"^{re.escape(category)}$", "$options": "i"}},
            {"legal_category": {"$regex": f"^{re.escape(category)}$", "$options": "i"}},
            {"topic": {"$regex": f"^{re.escape(category)}$", "$options": "i"}},
            {"type": {"$regex": f"^{re.escape(category)}$", "$options": "i"}},
        ]
    }

    docs = list(mongo_db["laws"].find(query, {"_id": 0}))
    return jsonify([_serialize_law(doc) for doc in docs if _serialize_law(doc)])


@app.route("/rights/law/<law_id>", methods=["GET"])
def get_rights_law_detail(law_id):
    law = mongo_db["laws"].find_one(
        {"law_id": law_id},
        {"_id": 0},
    )

    if not law:
        return jsonify({"error": "Law not found"}), 404

    return jsonify(_serialize_law(law))

# -------------------------
# RUN APP
# -------------------------

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )