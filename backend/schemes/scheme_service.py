import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="", #mysql username
    password="", #mysql password
    database="jansetu_db"
)

cursor = db.cursor(dictionary=True)


def get_schemes_by_category(category):

    cursor.execute("""
        SELECT scheme_name
        FROM schemes
        WHERE category LIKE %s
        LIMIT 5
    """, (
        f"%{category}%",
    ))

    return cursor.fetchall()


def get_schemes_by_category_and_state(
    category,
    state
):

    cursor.execute("""
        SELECT scheme_name
        FROM schemes
        WHERE category LIKE %s
        AND (
            state=%s
            OR state='All'
        )
        LIMIT 5
    """, (
        f"%{category}%",
        state
    ))

    return cursor.fetchall()

def get_scheme_by_name(
    scheme_name
):

    cursor.execute("""
        SELECT *
        FROM schemes
        WHERE scheme_name LIKE %s
        LIMIT 1
    """, (
        f"%{scheme_name}%",
    ))

    return cursor.fetchone()