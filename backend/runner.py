import json
import os
import time
import requests

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

with open("laws_seed.json", "r", encoding="utf-8") as f:
    laws = json.load(f)

os.makedirs("official_laws", exist_ok=True)

for law in laws:

    name = law["name"]

    print(f"Searching {name}")

    url = (
        "https://www.google.com/search?q=site:indiacode.nic.in+"
        + requests.utils.quote(name)
    )

    response = requests.get(
        url,
        headers=HEADERS
    )

    with open(

        f"official_laws/{law['law_id']}.html",

        "w",

        encoding="utf-8"

    ) as file:

        file.write(response.text)

    time.sleep(2)