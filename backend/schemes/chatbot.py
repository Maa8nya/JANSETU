from flask import Blueprint, request, jsonify

from schemes.gemini_service import generate_response

from schemes.eligibility_service import (
    generate_questions,
    evaluate_eligibility
)

from schemes.scheme_service import (
    get_scheme_by_name,
    get_schemes_by_category,
    get_schemes_by_category_and_state,
    get_scheme_by_id
)

chatbot_bp = Blueprint(
    "schemes_chatbot",
    __name__
)

# ------------------------------------
# Conversation Memory
# ------------------------------------

user_profile = {
    "category": None,
    "state": None,
    "scheme": None
}

# ------------------------------------
# Category Keywords
# ------------------------------------

CATEGORY_KEYWORDS = {

    "Education": [
        "student","students","study","studying",
        "education","college","school","scholarship",
        "engineering","degree","btech","be","hostel",
        "fees","education loan","student loan",
        "higher education","university","exam"
    ],

    "Agriculture & Rural Development":[
        "farmer","farm","farming","agriculture",
        "crop","kisan","tractor","irrigation",
        "soil","seed","fertilizer","livestock",
        "dairy"
    ],

    "Housing & Shelter":[
        "house","housing","home","flat",
        "apartment","construction","shelter",
        "own house","build house","home loan",
        "property","rent"
    ],

    "Skills & Employment":[
        "job","employment","work","career",
        "training","skill","internship",
        "placement","salary","income",
        "business","startup","earning",
        "unemployed"
    ],

    "Health & Wellness":[
        "health","hospital","medical",
        "doctor","medicine","treatment",
        "operation","surgery","clinic",
        "healthcare","disease"
    ],

    "Women & Child Development":[
        "woman","women","girl","female",
        "mother","pregnant","daughter",
        "child","children"
    ],

    "Social Welfare & Empowerment":[
        "widow","disabled","divyang",
        "pwd","worker","labour",
        "labor","pension","senior citizen"
    ],

    "Culture & Arts":[
        "artist","art","music",
        "dance","craft","culture"
    ]
}

# ------------------------------------
# States
# ------------------------------------

STATES = [

"Andhra Pradesh",
"Arunachal Pradesh",
"Assam",
"Bihar",
"Chhattisgarh",
"Central",
"Delhi",
"Goa",
"Gujarat",
"Haryana",
"Himachal Pradesh",
"Jharkhand",
"Karnataka",
"Kerala",
"Madhya Pradesh",
"Maharashtra",
"Manipur",
"Meghalaya",
"Mizoram",
"Nagaland",
"Odisha",
"Punjab",
"Rajasthan",
"Sikkim",
"Tamil Nadu",
"Telangana",
"Tripura",
"Uttar Pradesh",
"Uttarakhand",
"West Bengal"

]

# ------------------------------------
# Intent Keywords
# ------------------------------------

BENEFIT_WORDS = [
    "benefit",
    "benefits",
    "advantages",
    "advantage"
]

ELIGIBILITY_WORDS = [
    "eligibility",
    "eligible",
    "who can apply",
    "can i apply"
]

DOCUMENT_WORDS = [
    "documents",
    "document",
    "papers",
    "required documents"
]

APPLICATION_WORDS = [
    "apply",
    "application",
    "application process",
    "how to apply"
]

EXPLAIN_WORDS = [
    "explain",
    "what is",
    "tell me about",
    "details",
    "information",
    "describe",
    "brief"
]

SCHEME_WORDS = [

    "scheme",
    "schemes",
    "yojana",
    "government scheme",
    "government help",
    "recommend",
    "suggest",
    "subsidy",
    "loan",
    "financial assistance",
    "support"

]

# ------------------------------------
# Helper Functions
# ------------------------------------

def detect_category(message):

    message = message.lower()

    for category, words in CATEGORY_KEYWORDS.items():

        if any(word in message for word in words):

            return category

    return None


def detect_state(message):

    message = message.lower()

    for state in STATES:

        if state.lower() in message:

            return state

    return None


def detect_scheme(message):

    scheme = get_scheme_by_name(message)

    if scheme:
        return scheme

    cleaned = message.lower()

    remove = [

        "benefits of",
        "benefit of",
        "eligibility of",
        "documents for",
        "documents required for",
        "how to apply for",
        "apply for",
        "tell me about",
        "what is",
        "describe",
        "details of",
        "explain"

    ]

    for word in remove:

        cleaned = cleaned.replace(word,"")

    cleaned = cleaned.strip()

    return get_scheme_by_name(cleaned)


def detect_intent(message):

    message = message.lower()

    if any(x in message for x in BENEFIT_WORDS):
        return "benefits"

    if any(x in message for x in ELIGIBILITY_WORDS):
        return "eligibility"

    if any(x in message for x in DOCUMENT_WORDS):
        return "documents"

    if any(x in message for x in APPLICATION_WORDS):
        return "application"

    return "general"


def handle_small_talk(message):

    message = message.lower().strip()

    if message in ["hi","hello","hey"]:

         # Start a fresh conversation
        user_profile["category"] = None
        user_profile["state"] = None
        user_profile["scheme"] = None

        return (
            "Hello 👋\n\n"
            "I'm JANSETU AI.\n"
            "Let's start a new conversation.\n"
            "Tell me about yourself or ask about any government scheme."
        )

    if message in ["thanks","thank you","thankyou"]:

        return (
            "You're welcome 😊.\n\n"
            "Happy to help."
        )

    if message in ["bye","goodbye"]:

        user_profile["category"] = None
        user_profile["state"] = None
        user_profile["scheme"] = None

        return "Goodbye 👋"

    return None


@chatbot_bp.route("/chat", methods=["POST"])
def chat():

    data = request.json or {}

    user_message = data.get("message", "").strip()

    if not user_message:

        return jsonify({
            "response": "Please enter a message."
        })

    # ------------------------------------
    # Small Talk
    # ------------------------------------

    response = handle_small_talk(user_message)

    if response:

        return jsonify({
            "response": response
        })

    # ------------------------------------
    # Detect User Intent
    # ------------------------------------

    intent = detect_intent(user_message)

    category = detect_category(user_message)

    state = detect_state(user_message)

    scheme = None

    # Only try to detect a scheme if the user is asking ABOUT a scheme
    if (
        any(word in user_message.lower() for word in EXPLAIN_WORDS)
        or any(word in user_message.lower() for word in BENEFIT_WORDS)
        or any(word in user_message.lower() for word in ELIGIBILITY_WORDS)
        or any(word in user_message.lower() for word in DOCUMENT_WORDS)
        or any(word in user_message.lower() for word in APPLICATION_WORDS)
    ):
        scheme = detect_scheme(user_message)

    # If no scheme is found, remember the previous one
    if (
        not scheme
        and intent in [
            "benefits",
            "eligibility",
            "documents",
            "application"
        ]
    ):
        scheme = user_profile["scheme"]

    # ------------------------------------
    # Save Conversation Memory
    # ------------------------------------

    if category:
        user_profile["category"] = category

    if state:
        user_profile["state"] = state

    if scheme:
        user_profile["scheme"] = scheme

    category = user_profile["category"]
    state = user_profile["state"]
    scheme = user_profile["scheme"]

    # =====================================================
    # SCHEME FOUND
    # =====================================================

    if scheme:

        if intent == "benefits":

            return jsonify({
                "response":
                f"🎁 Benefits of {scheme['scheme_name']}\n\n"
                f"{scheme.get('benefits','Not available.')}"
            })

        elif intent == "eligibility":

            return jsonify({
                "response":
                f"✅ Eligibility for {scheme['scheme_name']}\n\n"
                f"{scheme.get('eligibility_criteria','Not available.')}"
            })

        elif intent == "documents":

            return jsonify({
                "response":
                f"📄 Documents Required\n\n"
                f"{scheme.get('documents_required','Not available.')}"
            })

        elif intent == "application":

            return jsonify({
                "response":
                f"📝 Application Process\n\n"
                f"{scheme.get('application_process','Not available.')}"
            })

        # ------------------------------------
        # Gemini Explanation
        # ------------------------------------

        prompt = f"""
You are JANSETU AI.

Explain the following government scheme in simple English.

Scheme:
{scheme['scheme_name']}

Description:
{scheme.get('brief_description','')}

Benefits:
{scheme.get('benefits','')}

Eligibility:
{scheme.get('eligibility_criteria','')}

Documents:
{scheme.get('documents_required','')}

Application Process:
{scheme.get('application_process','')}

Rules:
- Simple English
- Use bullets
- Under 250 words
- No markdown
"""

        try:

            reply = generate_response(prompt)

            reply = (
                reply
                .replace("**", "")
                .replace("* ", "• ")
            )

            return jsonify({
                "response": reply
            })

        except Exception as e:

            print("Gemini Error:", e)

            fallback = f"""
📄 {scheme['scheme_name']}

📌 Description
{scheme.get('brief_description','Not available')}

━━━━━━━━━━━━━━━━━━

🎁 Benefits
{scheme.get('benefits','Not available')}

━━━━━━━━━━━━━━━━━━

✅ Eligibility
{scheme.get('eligibility_criteria','Not available')}

━━━━━━━━━━━━━━━━━━

📄 Documents Required
{scheme.get('documents_required','Not available')}

━━━━━━━━━━━━━━━━━━

📝 Application Process
{scheme.get('application_process','Not available')}

━━━━━━━━━━━━━━━━━━

🌐 Official Website
{scheme.get('official_website','Not available')}
"""

            return jsonify({
                "response": fallback.strip()
            })

    # =====================================================
    # CATEGORY NOT FOUND
    # =====================================================

    if not category:

        return jsonify({
            "response":
            "👋 Tell me about yourself so I can recommend schemes.\n\n"
            "Examples:\n\n"
            "• Student\n"
            "• Farmer\n"
            "• Woman\n"
            "• Need Housing\n"
            "• Looking for Job\n"
            "• Need Scholarship"
        })

    # =====================================================
    # FIND SCHEMES
    # =====================================================

    if state:

        schemes = get_schemes_by_category_and_state(
            category,
            state
        )

    else:

        schemes = get_schemes_by_category(
            category
        )

    if not schemes:

        return jsonify({
            "response":
            "Sorry, I couldn't find that scheme.\n"

            "Please check the spelling or try asking:\n"
            "• PM Kisan\n"
            "• PM Awas Yojana\n"
            "• Ayushman Bharat\n"
            "• Sukanya Samriddhi Yojana"
        })

    response = f"I found these {category.lower()} schemes"

    if state:
        response += f" for {state}"

    response += ".\n\n"

    icons = {
        "Education":"🎓",
        "Agriculture & Rural Development":"🌾",
        "Housing & Shelter":"🏠",
        "Skills & Employment":"💼",
        "Health & Wellness":"🏥",
        "Women & Child Development":"👩",
        "Social Welfare & Empowerment":"🤝",
        "Culture & Arts":"🎨"
    }

    icon = icons.get(category, "📄")

    for i, s in enumerate(schemes[:5], 1):

        response += (
            f"{i}. {icon} {s['scheme_name']}\n"
        )

    response += """

You can now ask about any of the above schemes.

Examples:

• Explain <Scheme Name>
• Benefits of <Scheme Name>
• Eligibility of <Scheme Name>
• Documents for <Scheme Name>
• How to apply for <Scheme Name>
"""

    return jsonify({
        "response": response
    })


@chatbot_bp.route(
    "/eligibility-questions",
    methods=["POST"]
)
def eligibility_questions():

    data = request.json

    scheme_id = data.get(
        "scheme_id"
    )

    scheme = get_scheme_by_id(
        scheme_id
    )

    if not scheme:

        return jsonify({
            "error": "Scheme not found"
        }), 404

    eligibility_text = " ".join([

        scheme.get(
            "eligibility_criteria",
            ""
        ),

        scheme.get(
            "target_beneficiaries",
            ""
        ),

        scheme.get(
            "category",
            ""
        ),

        scheme.get(
            "tags",
            ""
        )

    ])

    questions = generate_questions(
        eligibility_text
    )

    return jsonify({
        "scheme_name":
            scheme["scheme_name"],

        "questions":
            questions
    })


@chatbot_bp.route(
    "/check-eligibility",
    methods=["POST"]
)
def check_eligibility():

    data = request.json or {}

    scheme_id = data.get("scheme_id")

    answers = data.get(
        "answers",
        {}
    )

    scheme = get_scheme_by_id(
        scheme_id
    )

    if not scheme:

        return jsonify({
            "error": "Scheme not found"
        }), 404

    eligibility_text = " ".join([

        scheme.get(
            "eligibility_criteria",
            ""
        ),

        scheme.get(
            "target_beneficiaries",
            ""
        ),

        scheme.get(
            "tags",
            ""
        )

    ])

    result = evaluate_eligibility(
        eligibility_text,
        answers
    )

    return jsonify(result)