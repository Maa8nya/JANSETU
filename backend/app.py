from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return "JANSETU Backend Running"

@app.route('/legal-query', methods=['POST'])
def legal_query():
    data = request.json
    user_query = data.get("query", "")

    return jsonify({
        "response": f"You asked: {user_query}"
    })

if __name__ == '__main__':
    app.run(debug=True)