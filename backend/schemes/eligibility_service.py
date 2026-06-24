import re


def generate_questions(eligibility_text):

    questions = []

    text = eligibility_text.lower()

    # -------------------------
    # STUDENT
    # -------------------------

    if any(word in text for word in [
        "student",
        "school",
        "college",
        "education",
        "scholarship"
    ]):
        questions.append({
            "field": "student",
            "question": "Are you a student?",
            "type": "yes_no"
        })

    # -------------------------
    # FARMER
    # -------------------------

    if any(word in text for word in [
        "farmer",
        "agriculture",
        "cultivator",
        "crop"
    ]):
        questions.append({
            "field": "farmer",
            "question": "Are you a farmer?",
            "type": "yes_no"
        })

    # -------------------------
    # WOMAN
    # -------------------------

    if any(word in text for word in [
        "woman",
        "women",
        "female",
        "girl"
    ]):
        questions.append({
            "field": "woman",
            "question": "Are you a woman?",
            "type": "yes_no"
        })

    # -------------------------
    # HOSTEL
    # -------------------------

    if "hostel" in text:
        questions.append({
            "field": "hostel",
            "question": "Are you staying in a hostel?",
            "type": "yes_no"
        })

    # -------------------------
    # SC
    # -------------------------

    if (
        "scheduled caste" in text
        or "sc " in text
        or "(sc)" in text
    ):
        questions.append({
            "field": "sc",
            "question": "Do you belong to Scheduled Caste (SC)?",
            "type": "yes_no"
        })

    # -------------------------
    # ST
    # -------------------------

    if (
        "scheduled tribe" in text
        or "(st)" in text
        or "st " in text
    ):
        questions.append({
            "field": "st",
            "question": "Do you belong to Scheduled Tribe (ST)?",
            "type": "yes_no"
        })

    # -------------------------
    # OBC
    # -------------------------

    if "obc" in text:
        questions.append({
            "field": "obc",
            "question": "Do you belong to OBC category?",
            "type": "yes_no"
        })

    # -------------------------
    # DISABILITY
    # -------------------------

    if any(word in text for word in [
        "disabled",
        "disability",
        "divyang",
        "pwd"
    ]):
        questions.append({
            "field": "disabled",
            "question": "Are you a person with disability?",
            "type": "yes_no"
        })

    # -------------------------
    # WIDOW
    # -------------------------

    if "widow" in text:
        questions.append({
            "field": "widow",
            "question": "Are you a widow?",
            "type": "yes_no"
        })

    # -------------------------
    # WORKER
    # -------------------------

    if any(word in text for word in [
        "worker",
        "labour",
        "labor",
        "construction worker"
    ]):
        questions.append({
            "field": "worker",
            "question": "Are you a worker/labourer?",
            "type": "yes_no"
        })

    # -------------------------
    # AGE
    # -------------------------

    if "age" in text:

        questions.append({
            "field": "age",
            "question": "What is your age?",
            "type": "number"
        })

    # -------------------------
    # INCOME
    # -------------------------

    if any(word in text for word in [
        "income",
        "annual income",
        "family income"
    ]):

        questions.append({
            "field": "income",
            "question": "What is your annual family income?",
            "type": "number"
        })

    # -------------------------
    # STATE DETECTION
    # -------------------------

    states = [
        "karnataka",
        "maharashtra",
        "gujarat",
        "kerala",
        "rajasthan",
        "tamil nadu",
        "haryana",
        "punjab",
        "uttar pradesh",
        "bihar",
        "assam",
        "odisha",
        "west bengal",
        "delhi"
    ]

    for state in states:

        if state in text:

            questions.append({
                "field": "state",
                "question": f"Do you belong to {state.title()}?",
                "type": "yes_no"
            })

            break

    # -------------------------
    # FALLBACK
    # -------------------------

    if len(questions) == 0:

        questions.append({
            "field": "general",
            "question": "Please enter your age",
            "type": "number"
        })

        questions.append({
            "field": "income",
            "question": "Please enter your annual income",
            "type": "number"
        })

    return questions