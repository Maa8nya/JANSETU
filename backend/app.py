from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

from schemes.chatbot import chatbot_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(chatbot_bp)

# MySQL Connection
db = mysql.connector.connect(
    host="localhost",
    user="", #mysql username
    password="", #mysql password
    database="jansetu_db"
)

cursor = db.cursor(dictionary=True)

# Home Route
@app.route("/")
def home():
    return jsonify({
        "message": "JANSETU Backend Running"
    })

# Get All Schemes
@app.route("/schemes", methods=["GET"])
def get_schemes():

    cursor.execute(
        "SELECT * FROM schemes"
    )

    schemes = cursor.fetchall()

    return jsonify(schemes)

# Search Scheme
@app.route("/search", methods=["GET"])
def search_scheme():

    query = request.args.get("query")

    sql = """
    SELECT * FROM schemes
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

    results = cursor.fetchall()

    return jsonify(results)

# Get Central Schemes
@app.route("/central", methods=["GET"])
def get_central_schemes():

    cursor.execute(
        "SELECT * FROM schemes WHERE level='Central'"
    )

    return jsonify(
        cursor.fetchall()
    )

# Get State Schemes
@app.route("/state-schemes", methods=["GET"])
def get_state_level_schemes():

    cursor.execute(
        "SELECT * FROM schemes WHERE level='State'"
    )

    return jsonify(
        cursor.fetchall()
    )

# Get Schemes By State
@app.route("/state/<state_name>", methods=["GET"])
def get_state_schemes(state_name):

    cursor.execute(
        "SELECT * FROM schemes WHERE state=%s",
        (state_name,)
    )

    return jsonify(
        cursor.fetchall()
    )

# Get Schemes By Category
@app.route("/category/<category>", methods=["GET"])
def get_category_schemes(category):

    cursor.execute(
        "SELECT * FROM schemes WHERE category LIKE %s",
        (f"%{category}%",)
    )

    return jsonify(
        cursor.fetchall()
    )

# Recommendation Endpoint
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)