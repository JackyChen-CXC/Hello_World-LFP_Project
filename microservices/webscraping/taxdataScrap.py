#do
#pip install requests beautifulsoup4 pymongo
import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient
import re


client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]
collection = db["federal_tax"]

def clean_and_convert(value):
    """ Remove '$' and ',' then convert to integer """
    return float(re.sub(r'[^\d]', '', value)) if value else None

def string_to_float(s):
    cleaned_string = s.replace('$', '').replace(',', '').strip()  
    return float(cleaned_string)

def saveFederalTax(min,max,single,married,over,rate,subamount,type):
    data = {
        "min_value": min,
        "max_value": max,
        "single": single,
        "married": married,

        "over_100k": over,
        "tax_rate": rate,
        "subtract_amount": subamount,
        "marriage_type": type

    }

    #collection.replace_one({}, data, upsert=True)
    collection = db["federal_tax"]
    collection.insert_one(data)

def scrape_federal_tax():
    url = "https://www.irs.gov/publications/p17#d0e50262"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    
    target_div = soup.find("div", {"id": "idm140408599469648"})
    if not target_div:
        print("Error: id might have been changed")
        return

    rows = target_div.find_all("tr")
    for i, row in enumerate(rows):
        #last row is a empty row needs to skip
        if i == len(rows) - 1:
            continue

        cells = row.find_all("td")
        if len(cells) == 6:
            min_value = clean_and_convert(cells[0].text.strip())
            max_value = clean_and_convert(cells[1].text.strip())   
            single_value = clean_and_convert(cells[2].text.strip()) 
            married_value = clean_and_convert(cells[3].text.strip())


            saveFederalTax(min_value,max_value,single_value,married_value,False,None,None,None)


    #
    #
    #
    #Scrapes the income table for single
    a_tag = soup.find("a", {"name": "en_US_2024_publink1000142871"})

    if a_tag:
        parent_div = a_tag.find_parent("div")
    else:
        print("Error: tag name changed")

    rows = parent_div.find_all("tr")
    for i, row in enumerate(rows):
        if i == 0:
            continue
        cells = row.find_all("td")
        if len(cells) == 6:

            match = re.search(r" \$(\d{1,3}(?:,\d{3})*) but not over \$(\d{1,3}(?:,\d{3})*)", cells[0].text.strip())
            if match:
                min_val = int(match.group(1).replace(",", ""))
                max_val = int(match.group(2).replace(",", ""))
                
                rate = re.search(r"\(([-+]?\d*\.\d+)\)", cells[2].text.strip()).group(1)
                subamount = cells[4].text.strip()

            
                rate = string_to_float(rate)
                subamount = string_to_float(subamount)

                saveFederalTax(min_val,max_val,None,None,True,rate,subamount,"single")
    
            else:
                match = re.search(r"Over \$(\d{1,3}(?:,\d{3})*)", cells[0].text.strip())
                if match:
                    min_val = int(match.group(1).replace(",", ""))
                    
                rate = re.search(r"\(([-+]?\d*\.\d+)\)", cells[2].text.strip()).group(1)

                subamount = cells[4].text.strip()

        
                rate = string_to_float(rate)
                subamount = string_to_float(subamount)

                saveFederalTax(min_val,None,None,None,True,rate,subamount,"single")



    #
    #
    #
    #Scrapes the income table for married
    a_tag = soup.find("a", {"name": "en_US_2024_publink1000142872"})

    if a_tag:
        parent_div = a_tag.find_parent("div")
    else:
        print("Error: tag name changed")

    rows = parent_div.find_all("tr")
    for i, row in enumerate(rows):
        if i == 0:
            continue
        cells = row.find_all("td")
        if len(cells) == 6:

            match = re.search(r" \$(\d{1,3}(?:,\d{3})*) but not over \$(\d{1,3}(?:,\d{3})*)", cells[0].text.strip())
            if match:
                min_val = int(match.group(1).replace(",", ""))
                max_val = int(match.group(2).replace(",", ""))
                
                rate = re.search(r"\(([-+]?\d*\.\d+)\)", cells[2].text.strip()).group(1)

                subamount = cells[4].text.strip()

            
                rate = string_to_float(rate)
                subamount = string_to_float(subamount)

                saveFederalTax(min_val,max_val,None,None,True,rate,subamount,"married")
    
            else:
                match = re.search(r"Over \$(\d{1,3}(?:,\d{3})*)", cells[0].text.strip())
                if match:
                    min_val = int(match.group(1).replace(",", ""))
                    
                
                rate = re.search(r"\(([-+]?\d*\.\d+)\)", cells[2].text.strip()).group(1)

                subamount = cells[4].text.strip()

          
                rate = string_to_float(rate)
                subamount = string_to_float(subamount)

                saveFederalTax(min_val,None,None,None,True,rate,subamount,"married")

        
            


import pandas as pd
from io import StringIO

collection = db["state_tax"]
def saveStateTax(state,single_rate,married_rate,single_deduc,married_deduc,single_exemp,married_exemp):
    data = {
        "state":state,
        #[2,0],[5,500] meaning 2% > $0 or 5% if > %500
        "single_rates": single_rate,
        "married_rates": married_rate,
        "single_deduction": single_deduc,
        "married_deduction": married_deduc,
        "single_exemption": single_exemp,
        "married_exemption": married_exemp

    }

    collection = db["state_tax"]
    #collection.replace_one({}, data, upsert=True)
    collection.insert_one(data)

def parse_percentage(value):
    value = value.strip().strip("%")
    value = re.sub(r'[^0-9.]', '', value)
    return None if value.lower() in {"none", "n.a.", "n/a", ""} else float(value) / 100
def parse_currency(value):
    value = value.strip().replace("$", "").replace(",", "")
    value = value.replace("credit", "").strip()
    return None if value.lower() in {"none", "n.a.", "n/a", "", "n.a"} else int(value)

def scrape_state_tax():
    
    state_tax_url = "https://taxfoundation.org/data/all/state/state-income-tax-rates-2024/"

    response = requests.get(state_tax_url)
    soup = BeautifulSoup(response.text, "html.parser")

    
    target_table = soup.find("table", {"id": "tablepress-320"})
    if not target_table:
        print("Error: Table may have been removed")
        return

    tbody = target_table.find("tbody")
    rows = tbody.find_all("tr")

    state = ""
    single_rate = []
    married_rate = []
    single_deduction = 0
    married_deduction = 0
    single_exemption  = 0
    married_exemption = 0

    for i, row in enumerate(rows):

        cells = row.find_all("td")
        if len(cells) == 12:

            s_rate = parse_percentage(cells[1].text.strip())
            s_bracket = parse_currency(cells[3].text.strip())
            m_rate = parse_percentage(cells[4].text.strip())
            m_bracket = parse_currency(cells[6].text.strip())
            s_sd = parse_currency(cells[7].text.strip())
            m_sd = parse_currency(cells[8].text.strip())
            s_em = parse_currency(cells[9].text.strip())
            m_em = parse_currency(cells[10].text.strip())
            name = cells[0].text.strip()
            if name not in state:
                saveStateTax(state, single_rate, married_rate, single_deduction, married_deduction, single_exemption, married_exemption)
                single_rate = []
                married_rate = []

                state = name
                single_rate.append([s_rate,s_bracket])
                married_rate.append([m_rate,m_bracket])
                single_deduction = s_sd
                married_deduction = m_sd
                single_exemption = s_em
                married_exemption = m_em

            else:
                single_rate.append([s_rate,s_bracket])
                married_rate.append([m_rate,m_bracket])
        


                
    if state:
        saveStateTax(state, single_rate, married_rate, single_deduction, married_deduction, single_exemption, married_exemption)






collection = db["standard_deduction"]
def saveStandardDeduction(single,married):
    data = {
        "single": single,
        "married": married
    }

    collection = db["standard_deduction"]
    #collection.replace_one({}, data, upsert=True)
    collection.insert_one(data)


def scrape_standard_deduction():
    url = "https://www.irs.gov/publications/p17#en_US_2024_publink1000283781"

    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    
    a_tag = soup.find("a", {"name": "en_US_2024_publink1000283782"})

    if a_tag:
        parent_div = a_tag.find_parent("div")
    else:
        print("Error: tag name changed")

    single = 0
    married = 0
    rows = parent_div.find_all("tr")
    for i, row in enumerate(rows):
        if i == 0:
            continue
        cells = row.find_all("td")
   
        if "single or married" in cells[0].text.strip().lower():
            single = parse_currency(cells[1].text.strip())


        if "married filing jointly" in cells[0].text.strip().lower():
            married = parse_currency(cells[1].text.strip())


    saveStandardDeduction(single,married)



def extract_number_from_text(text):
    match = re.search(r'\$([\d,]+)', text)
    
    if match:
        number = int(match.group(1).replace(",", ""))
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
def saveCaptialGain(single,married):
    data = {
        "single": single,
        "married": married
    }

    collection = db["captial_gain_tax"]
    #collection.replace_one({}, data, upsert=True)
    collection.insert_one(data)


def scrape_captial_gain():
    url = "https://www.irs.gov/taxtopics/tc409"

    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")


    rows = soup.find_all("ul")
    count = 0
    rate = 0
    single = []
    married = []
    for i, row in enumerate(rows):
        cells = row.find_all("li")
        if len(cells) == 3 or len(cells) == 4:
            for cell in cells:
                if 'single' in cell.text:
                    max = extract_number_from_text(cell.text.strip())
                    single.append([rate,0,max])
                    count += 1

                if 'married filing jointly' in cell.text:
                    min, max = extract_min_max_from_text(cell.text.strip())

                    if min == None:
                        max = extract_number_from_text(cell.text.strip())
                        married.append([rate,0,max])
                    else:
                        married.append([rate,min,max])
                    count += 1
                
                if count == 2:
                    rate = .15
                


    saveCaptialGain(single,married)
                

                    

scrape_federal_tax()
#scrape_state_tax()
#scrape_standard_deduction()
#scrape_captial_gain()





