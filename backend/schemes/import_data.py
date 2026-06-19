import json
import mysql.connector

# Connect to MySQL
conn = mysql.connector.connect(
    host="localhost",
    user="", #username
    password="", #password
    database="jansetu_db"
)

cursor = conn.cursor()

# Load JSON file
with open("data/scheme_data.json", "r", encoding="utf-8") as file:
    schemes = json.load(file)

# Insert records
for scheme in schemes:
    sql = """
    INSERT INTO schemes (
        id,
        scheme_name,
        implementing_agency,
        target_beneficiaries,
        tags,
        state,
        category,
        level,
        brief_description,
        eligibility_criteria,
        documents_required,
        application_process,
        benefits,
        official_website
    )
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    values = (
        scheme.get("id"),
        scheme.get("scheme_name"),
        scheme.get("implementing_agency"),
        scheme.get("target_beneficiaries"),
        scheme.get("tags"),
        scheme.get("state"),
        scheme.get("category"),
        scheme.get("level"),
        scheme.get("brief_description"),
        scheme.get("eligibility_criteria"),
        scheme.get("documents_required"),
        scheme.get("application_process"),
        scheme.get("benefits"),
        scheme.get("official_website")
    )

    cursor.execute(sql, values)

conn.commit()

print(f"{len(schemes)} schemes imported successfully!")

cursor.close()
conn.close()