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
                "question": "Which state do you belong to?",
                "type": "text",
                "required_state": state
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

def evaluate_eligibility(
    eligibility_text,
    answers
):

    text = eligibility_text.lower()

    eligible = True

    reasons = []

    # -------------------------
    # AGE
    # -------------------------

    if "age" in text:

        try:

            user_age = int(
                answers.get(
                    "age",
                    0
                )
            )

            age_match = re.search(
                r'(\d+)',
                text
            )

            if age_match:

                required_age = int(
                    age_match.group(1)
                )

                if user_age >= required_age:

                    reasons.append(
                        f"✔ Age criteria satisfied ({user_age})"
                    )

                else:

                    reasons.append(
                        f"✖ Minimum age required is {required_age}"
                    )

                    eligible = False

        except:
            pass

    # -------------------------
    # STUDENT
    # -------------------------

    if any(word in text for word in [
        "student",
        "school",
        "college",
        "education"
    ]):

        if answers.get(
            "student",
            ""
        ).lower() == "yes":

            reasons.append(
                "✔ Student criteria satisfied"
            )

        else:

            reasons.append(
                "✖ Applicant must be a student"
            )

            eligible = False

    # -------------------------
    # FARMER
    # -------------------------

    if any(word in text for word in [
        "farmer",
        "agriculture",
        "crop"
    ]):

        if answers.get(
            "farmer",
            ""
        ).lower() == "yes":

            reasons.append(
                "✔ Farmer criteria satisfied"
            )

        else:

            reasons.append(
                "✖ Applicant must be a farmer"
            )

            eligible = False

    # -------------------------
    # WOMAN
    # -------------------------

    if any(word in text for word in [
        "woman",
        "women",
        "female"
    ]):

        if answers.get(
            "woman",
            ""
        ).lower() == "yes":

            reasons.append(
                "✔ Women category satisfied"
            )

        else:

            reasons.append(
                "✖ Scheme is only for women"
            )

            eligible = False

    # -------------------------
    # SC
    # -------------------------

    if (
        "scheduled caste" in text
        or "(sc)" in text
    ):

        if answers.get(
            "sc",
            ""
        ).lower() == "yes":

            reasons.append(
                "✔ SC category satisfied"
            )

        else:

            reasons.append(
                "✖ Applicant must belong to SC category"
            )

            eligible = False

    # -------------------------
    # ST
    # -------------------------

    if (
        "scheduled tribe" in text
        or "(st)" in text
    ):

        if answers.get(
            "st",
            ""
        ).lower() == "yes":

            reasons.append(
                "✔ ST category satisfied"
            )

        else:

            reasons.append(
                "✖ Applicant must belong to ST category"
            )

            eligible = False

    # -------------------------
    # OBC
    # -------------------------

    if "obc" in text:

        if answers.get(
            "obc",
            ""
        ).lower() == "yes":

            reasons.append(
                "✔ OBC category satisfied"
            )

        else:

            reasons.append(
                "✖ Applicant must belong to OBC category"
            )

            eligible = False

    # -------------------------
    # DISABILITY
    # -------------------------

    if any(word in text for word in [
        "disabled",
        "disability",
        "divyang",
        "pwd"
    ]):

        if answers.get(
            "disabled",
            ""
        ).lower() == "yes":

            reasons.append(
                "✔ Disability criteria satisfied"
            )

        else:

            reasons.append(
                "✖ Applicant must be a person with disability"
            )

            eligible = False

    # -------------------------
    # STATE
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

            user_state = answers.get(
                "state",
                ""
            ).lower().strip()

            if user_state == state:

                reasons.append(
                    f"✔ State requirement satisfied ({state.title()})"
                )

            else:

                reasons.append(
                    f"✖ Scheme is only for residents of {state.title()}"
                )

                eligible = False

            break
    # -------------------------
    # INCOME
    # -------------------------

    if "income" in text:

        try:

            user_income = int(
                answers.get(
                    "income",
                    0
                )
            )

            income_numbers = re.findall(
                r'\d+',
                text
            )

            if income_numbers:

                income_limit = int(
                    income_numbers[-1]
                )

                if user_income <= income_limit:

                    reasons.append(
                        "✔ Income criteria satisfied"
                    )

                else:

                    reasons.append(
                        f"✖ Income exceeds limit of {income_limit}"
                    )

                    eligible = False

        except:
            pass

    return {
        "eligible": eligible,
        "reasons": reasons
    }