from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

# SCHEMES MODULE
from schemes.chatbot import chatbot_bp as schemes_chatbot_bp

# LEGAL MODULE
from legal.routes.chatbot import chatbot_bp as legal_chatbot_bp
from legal.services.semantic_search import build_search_index

app = Flask(__name__)
CORS(app)

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
    password="root",
    database="jansetu_db"
)

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

# -------------------------
# RUN APP
# -------------------------

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )