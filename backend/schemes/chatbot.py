from flask import Blueprint, request, jsonify

from schemes.gemini_service import generate_response

from schemes.scheme_service import (
    get_schemes_by_category,
    get_schemes_by_category_and_state,
    get_scheme_by_name
)

chatbot_bp = Blueprint(
    "chatbot",
    __name__
)

# Temporary conversation memory
user_profile = {
    "category": None,
    "state": None
}


def detect_category(message):

    message = message.lower()

    if any(word in message for word in [
        "farmer",
        "agriculture",
        "crop",
        "farming"
    ]):
        return "Agriculture & Rural Development"

    elif any(word in message for word in [
        "student",
        "scholarship",
        "education",
        "college",
        "school"
    ]):
        return "Education"

    elif any(word in message for word in [
        "woman",
        "women",
        "girl",
        "mother"
    ]):
        return "Women & Child Development"

    elif any(word in message for word in [
        "worker",
        "labour",
        "labor"
    ]):
        return "Social Welfare & Empowerment"

    elif any(word in message for word in [
        "job",
        "employment",
        "skill",
        "training"
    ]):
        return "Skills & Employment"

    elif any(word in message for word in [
        "artist",
        "art",
        "culture"
    ]):
        return "Culture & Arts"

    elif any(word in message for word in [
        "health",
        "medical",
        "disease"
    ]):
        return "Health & Wellness"

    return None


def detect_state(message):

    states = [
        "Karnataka",
        "Maharashtra",
        "Tamil Nadu",
        "Kerala",
        "Rajasthan",
        "Delhi",
        "Gujarat",
        "Haryana",
        "Punjab",
        "Uttar Pradesh"
    ]

    message = message.lower()

    for state in states:

        if state.lower() in message:
            return state

    return None


def is_explanation_request(message):

    message = message.lower()

    keywords = [
        "explain",
        "tell me about",
        "what is",
        "details of",
        "know more"
    ]

    return any(
        keyword in message
        for keyword in keywords
    )

def is_explanation_request(message):

    message = message.lower()

    keywords = [
        "explain",
        "tell me about",
        "what is",
        "details of",
        "know more"
    ]

    return any(
        keyword in message
        for keyword in keywords
    )


def handle_small_talk(message):

    message = message.lower().strip()

    if message in [
        "thank you",
        "thanks",
        "thankyou",
        "thanks a lot"
    ]:
        return (
            "You're welcome 😊.\n\n"
            "I can help you find government schemes, "
            "check eligibility, or explain any scheme."
        )

    if message in [
        "hi",
        "hello",
        "hey"
    ]:
        return (
            "Hello 👋\n\n"
            "I am JANSETU AI.\n"
            "Tell me about yourself and I will suggest suitable government schemes."
        )

    if message in [
        "okay",
        "ok",
        "great"
    ]:
        return (
            "😊 Glad I could help.\n\n"
            "You can ask about another scheme or tell me your profile."
        )

    if "what next" in message:
        return (
            "You can:\n\n"
            "• Ask for more schemes\n"
            "• Ask scheme eligibility\n"
            "• Ask scheme benefits\n"
            "• Type Explain <Scheme Name>"
        )

    return None


@chatbot_bp.route("/chat", methods=["POST"])
def chat():

    data = request.json

    user_message = data.get(
        "message",
        ""
    )

    small_talk_response = handle_small_talk(
    user_message
    )

    if small_talk_response:

        return jsonify({
            "response": small_talk_response
        })

    # ------------------------
    # EXPLANATION MODE
    # ------------------------

    if is_explanation_request(user_message):

        scheme_name = user_message.lower()

        words_to_remove = [
            "explain",
            "tell me about",
            "what is",
            "details of",
            "know more about",
            "know more"
        ]

        for word in words_to_remove:

            scheme_name = scheme_name.replace(
                word,
                ""
            )

        scheme_name = scheme_name.strip()

        print("SCHEME NAME:", scheme_name)

        scheme = get_scheme_by_name(
            scheme_name
        )

        if not scheme:

            return jsonify({
                "response":
                "Sorry, I couldn't find that scheme."
            })

        prompt = f"""
You are JANSETU AI.

Explain this government scheme in simple English.

Scheme Name:
{scheme['scheme_name']}

Benefits:
{scheme.get('benefits', '')}

Eligibility:
{scheme.get('eligibility_criteria', '')}

Documents Required:
{scheme.get('documents_required', '')}

Application Process:
{scheme.get('application_process', '')}

Instructions:
- Use plain text only
- No markdown
- No **
- Use bullet points with -
- Keep under 250 words
"""

        try:

            response = generate_response(prompt)

            response = (
                response
                .replace("**", "")
                .replace("* ", "• ")
            )

            print("GEMINI RESPONSE:")
            print(response)

            return jsonify({
                "response": response
            })

        except Exception as e:

            print("GEMINI ERROR:")
            print(str(e))

            return jsonify({
                "response": f"ERROR: {str(e)}"
            })
    # ------------------------
    # PROFILE COLLECTION
    # ------------------------

    category = detect_category(
        user_message
    )

    state = detect_state(
        user_message
    )

    if category:
        user_profile["category"] = category

    if state:
        user_profile["state"] = state

    category = user_profile["category"]
    state = user_profile["state"]

    # Ask occupation first

    if not category:

        return jsonify({
            "response":
            "Hello 👋\n\nWhat best describes you?\n\n• Farmer\n• Student\n• Woman\n• Worker\n• Job Seeker\n• Artist"
        })

    # Ask state next

    if not state:

        return jsonify({
            "response":
            f"Great! You are identified under {category}.\n\nWhich state do you belong to?"
        })

    # ------------------------
    # FIND SCHEMES
    # ------------------------

    schemes = get_schemes_by_category_and_state(
        category,
        state
    )

    if not schemes:

        print("USER MESSAGE:", user_message)
        print("SCHEME NAME:", scheme_name)

        schemes = get_schemes_by_category(
            category
        )

    if not schemes:

        return jsonify({
            "response":
            "Sorry, I couldn't find any matching schemes."
        })

    response = (
        f"Based on your profile:\n\n"
        f"Category: {category}\n"
        f"State: {state}\n\n"
        f"Here are some schemes:\n\n"
    )

    for i, scheme in enumerate(
        schemes[:5],
        start=1
    ):

        response += (
            f"{i}. {scheme['scheme_name']}\n"
        )

    response += (
        "\n\nType:\n"
        "Explain <Scheme Name>\n"
        "to know more about any scheme."
    )

    # Reset conversation after recommendation

    user_profile["category"] = None
    user_profile["state"] = None

    return jsonify({
        "response": response
    })