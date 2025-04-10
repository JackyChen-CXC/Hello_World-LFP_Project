import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient
import re
import sys
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path
import os

env_path = Path(__file__).resolve().parent.parent / '.env.example'
load_dotenv(dotenv_path=env_path)

current_year = datetime.now().year

client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]

collection_name = f"rmd_{current_year}"
collection = db[collection_name]

####
####
####
####
# RMD
def saveRMD(age,distribution):
    data = {
        "age": age,
        "distribution_period": distribution,
       
    }

    #collection.replace_one({}, data, upsert=True)
    collection_name = f"rmd_{current_year}"
    collection = db[collection_name]
    collection.insert_one(data)

def scrap_RMD():
    url = os.getenv('RMD_URL')
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    target_paragraph = soup.find('b', string="Appendix B. Uniform Lifetime Table")

    if not target_paragraph:
        print("Error: Single taxpayer <p> not found")
        return

    next_table = target_paragraph.find_next('table')
    tbody = next_table.find('tbody')

    rows = tbody.find_all('tr')
    for index, row in enumerate(rows):
        if index < 5:
            continue  # Skip the first 6 rows

        cols = [col.get_text(strip=True) for col in row.find_all(['td', 'th'])]
        age1 = cols[0]
        dis1 = cols[1]

        age2 = cols[2]
        dis2 = cols[3]

        if age1 != "" and dis1 != "":
            age = None
            try:
                age = float(age1)
            except ValueError:
                age = None
            dis = float(dis1)
            saveRMD(age,dis)

        if age2 != "" and dis2 != "":
            age = None
            try:
                age = float(age2)
            except ValueError:
                age = None
            dis = float(dis2)
            saveRMD(age,dis)


def database_exists(db_name):
    db_list = client.list_database_names()
    return db_name in db_list
       

if __name__ == "__main__":
    current_year = datetime.now().year
    rmd = f"rmd_{current_year}"

    if not database_exists(rmd):
        scrap_RMD()
