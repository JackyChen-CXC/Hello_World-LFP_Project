#do the following so that when you npm install backend it auto webscrape
#pip install requests beautifulsoup4 pymongo
#npm install --save-dev ts-node
#pip install python-dotenv
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

collection_name = f"federal_tax_{current_year}"
collection = db[collection_name]

####
####
####
####
# Federal Tax
def saveFederalTax(min,max,rate,single,married):
    data = {
        "min_value": min,
        "max_value": max,
        "tax_rate": rate,
        "single": single,
        "married": married, 
    }

    #collection.replace_one({}, data, upsert=True)
    collection_name = f"federal_tax_{current_year}"
    collection = db[collection_name]
    collection.insert_one(data)

def scrape_federal_tax():
    url = os.getenv('FEDERAL_TAX_URL')
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    
    ##Stores tax data for single tax payers
    target_paragraph = soup.find('p', string="For a single taxpayer, the rates are:")
    if not target_paragraph:
        print("Error: Single taxpayer <p> not found")
        return

    next_table = target_paragraph.find_next('table')
    tbody = next_table.find('tbody')

    rows = tbody.find_all('tr')
    for row in rows:
        cols = [col.get_text(strip=True) for col in row.find_all(['td', 'th'])]

        rate_str = cols[0].replace('%', '').strip()
        rate = float(rate_str) / 100.0

        min_str = cols[1].replace('$', '').replace(',','').strip()
        min = float(min_str)

        max = None
        try:
            max_str = cols[2].replace('$', '').replace(',', '').strip()
            max = float(max_str)
        except ValueError:
            max = None
        
        saveFederalTax(min,max,rate,True,False)



    ##Stores tax data for married tax payers
    target_paragraph = soup.find('a', string="Married filing jointly or qualifying surviving spouse")
    if not target_paragraph:
        print("Error: Married taxpayer <a> not found")
        return
    
    next_table = target_paragraph.find_next('table')
    tbody = next_table.find('tbody').find_next('tbody')

    rows = tbody.find_all('tr')
    for row in rows:
        cols = [col.get_text(strip=True) for col in row.find_all(['td', 'th'])]
        
        rate_str = cols[0].replace('%', '').strip()
        rate = float(rate_str) / 100.0

        min_str = cols[1].replace('$', '').replace(',','').strip()
        min = float(min_str)

        max = None
        try:
            max_str = cols[2].replace('$', '').replace(',', '').strip()
            max = float(max_str)
        except ValueError:
            max = None
        
        saveFederalTax(min,max,rate,False,True)



####
####
####
####
# Standard Deduction
collection = db["standard_deduction"]
def saveStandardDeduction(single,married):
    data = {
        "single": single,
        "married": married
    }

    collection_name = f"standard_deduction_{current_year}"
    collection = db[collection_name]
    #collection.replace_one({}, data, upsert=True)
    collection.insert_one(data)


def scrape_standard_deduction():
    url = os.getenv('STANDARD_DEDUCTION_URL')
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    target_paragraph = soup.find('b', string="Table 10-1.Standard Deduction Chart for Most People*")
    if not target_paragraph:
        print("Error: Married taxpayer <a> not found")
        return
    
    next_table = target_paragraph.find_next('table')
    tbody = next_table.find('tbody')

    rows = tbody.find_all('tr')
    for row in rows:
        cols = [col.get_text(strip=True) for col in row.find_all(['td', 'th'])]
        if cols[0] == "Single or Married filing separately":
            single_str = cols[1].replace('$', '').replace(',','').strip()
            single = float(single_str)
        if cols[0] == "Married filing jointly or Qualifying surviving spouse":
            married_str = cols[1].replace('$', '').replace(',','').strip()
            married = float(married_str)

    saveStandardDeduction(single,married)



####
####
####
####
# Captial Gain
def extract_number_from_text(text):
    match = re.search(r'\$([\d,]+)', text)
    
    if match:
        number = float(match.group(1).replace(",", ""))
        return number
    else:
        return None

def extract_min_max_from_text(text):
    match = re.findall(r'\$([\d,]+)', text)
    
    if match and len(match) == 2:
        min_value = int(match[0].replace(",", ""))
        max_value = int(match[1].replace(",", ""))
        return min_value, max_value
    else:
        return None, None

collection = db["captial_gain_tax"]
def saveCaptialGain(status,rate,min,max):
    if status == "single":
        data = {
            "status": "single",
            "rate": rate,
            "min": min,
            "max": max
        }
    else:
        data = {
            "status": "married",
            "rate": rate,
            "min": min,
            "max": max
        }
    
    collection_name = f"captial_gain_tax_{current_year}"
    collection = db[collection_name]
    #collection.replace_one({}, data, upsert=True)
    collection.insert_one(data)


def scrape_captial_gain():
    url = os.getenv('CAPTIAL_GAIN_TAX_URL')
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    target_paragraph = next(
        (p for p in soup.find_all("p") if "A capital gains rate of" in p.get_text()), 
        None
    )  
    if not target_paragraph:
        print("Error: captial gain <p> not found")
        return
    
    else:
        b_tags = target_paragraph.find_all("b")
        if b_tags:
            rate = b_tags[-1].get_text(strip=True) 
            rate_str = rate.replace('%', '').strip()
            rate = float(rate_str) / 100.0
            
            cells = target_paragraph.find_next('ul')
            rows = cells.find_all("li")
            for row in rows:
                if 'single' in row.text:
                    single_max = extract_number_from_text(row.text.strip())
                if 'married filing jointly' in row.text:
                    married_max = extract_number_from_text(row.text.strip())
            
            saveCaptialGain("single",rate,0,single_max)
            saveCaptialGain("married",rate,0,married_max)

    target_paragraph = target_paragraph.find_next('p')

    if not target_paragraph:
        print("Error: captial gain <p> not found")
        return
    else:
        b_tags = target_paragraph.find_all("b")
        if b_tags:
            rate = b_tags[0].get_text(strip=True)  
            rate_str = rate.replace('%', '').strip()
            rate = float(rate_str) / 100.0

            cells = target_paragraph.find_next('ul')
            rows = cells.find_all("li")
            for row in rows:
                if 'single' in row.text:
                    single_min, single_max = extract_min_max_from_text(row.text.strip())
                if 'married filing jointly' in row.text:
                    married_min, married_max = extract_min_max_from_text(row.text.strip())
            
            saveCaptialGain("single",rate,single_min,single_max)
            saveCaptialGain("married",rate,married_min,married_max)

    target_paragraph = target_paragraph.find_next('p')

    if not target_paragraph:
        print("Error: captial gain <p> not found")
        return
    else:
        strong_tags = target_paragraph.find_all("strong")
        if strong_tags:
            rate = strong_tags[0].get_text(strip=True)  
            rate_str = rate.replace('%', '').strip()
            rate = float(rate_str) / 100.0
            
            saveCaptialGain("single",rate,single_max,None)
            saveCaptialGain("married",rate,married_max,None)


def database_exists(db_name):
    db_list = client.list_database_names()
    return db_name in db_list
                    


if __name__ == "__main__":
    current_year = datetime.now().year
    fed = f"federal_tax_{current_year}"
    stand = f"standard_deduction_{current_year}"
    captial = f"captial_gain_tax_{current_year}"

    if not database_exists(fed):
        scrape_federal_tax()
    if not database_exists(stand):
        scrape_standard_deduction()
    if not database_exists(captial):
        scrape_captial_gain()
    print("Scrape completed")



