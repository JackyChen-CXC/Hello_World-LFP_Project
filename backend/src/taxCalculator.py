#need to pip install pyyaml
from pymongo import MongoClient
import yaml
import re
import os
import numpy as np
from datetime import datetime
client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]


def calculate_standard_deduction(income,married_status):
    current_year = datetime.now().year
    #collection_name = f"standard_deduction_{current_year}"
    collection_name = f"inflation_standard_deduction"
    collection = db[collection_name]
    doc = collection.find_one()

    value = doc.get(married_status)
    result = round((income-value),2)

    if result < 0:
        result = 0
    return result 
    # if married_status == "single":
    #     single_rate = collection.find_one({"single": {"$exists": True}})
    #     single_rate = single_rate["single"]

    #     result = (income-single_rate)
    #     return result if result >= 0 else 0
        
    
    # elif married_status == "married":
    #     married_rate = collection.find_one({"married": {"$exists": True}})
    #     married_rate = married_rate["married"]

    #     result = (income-married_rate)
    #     return result if result >= 0 else 0
        
    
    # else:

    #     print("Error invalid married status")



def calculate_state_tax(income,married_status,state):

    def load_state_tax_data(file_path="tax/inflated_state_tax.yaml"):
        with open(file_path, "r") as file:
            return yaml.safe_load(file)
        
    tax_data = load_state_tax_data()

    state = state.lower().replace(" ", "_")

    if state not in tax_data["states"]:
        print(f"No tax data found for {state}. Please upload it")
        return
 
    
    no_tax_state = ["alaska", "florida", "nevada", "south_dakota", "tennessee", "texas", "wyoming"]
    if state in no_tax_state:
        return 0
    
    state_tax_info = tax_data["states"][state]

    if married_status == "single":
        rates = state_tax_info.get("single", [])
            
    elif married_status == "married":
        rates = state_tax_info.get("married", [])
        
    if income <= 0:
        print("No tax For State")
        return 0
    
    tax = 0
    for bracket in rates:
        min_income = bracket["min"]
        max_income = bracket["max"]
        base_tax = bracket["base_tax"]
        rate = bracket["rate"]

        if income > min_income:
            tax = base_tax + (income * rate)
            if state == "new_york":
                taxable_amount = min(income, max_income) - min_income
                tax = base_tax + (taxable_amount * rate)

        if income <= max_income:
            break

    print(f"Tax amount: {tax}")
    return tax
    

    
def calculate_captial_gain_tax(income, married_status):
    current_year = datetime.now().year
    collection_name = f"captial_gain_tax_{current_year}"
    collection = db[collection_name]

    items = list(collection.find({"status": married_status}))
    
    for item in items:
        min_val = item.get("min", float("-inf"))
        max_val = item.get("max", float("inf"))
        if max_val is None:
            max_val = float("inf")
        
        if min_val <= income <= max_val:
            return item["rate"]*income     


def calculate_federal_tax(income,married_status):
    current_year = datetime.now().year
    #collection_name = f"federal_tax_{current_year}"
    collection_name = f"inflation_federal_tax"
    collection = db[collection_name]

    query = {married_status: True}
    items = list(collection.find(query))

    for item in items:
        min_val = item.get("min_value", float("-inf"))
        max_val = item.get("max_value", float("inf"))
        if max_val is None:
            max_val = float("inf")
        
        if min_val <= income <= max_val:
            return item["tax_rate"]*income
        


####
###
###
###
### federal tax inflation functions

# def update_federal_tax_for_flat_inflation(inflation_rate):
#     inflation_rate = inflation_rate + 1
#     current_year = datetime.now().year
#     collection_name = f"federal_tax_{current_year}"
#     federal_tax = db[collection_name]

#     inflation_db = db["inflation_federal_tax"]
#     inflation_db.delete_many({})

#     document = list(federal_tax.find())

#     for doc in document:
#         tax = doc.get("tax_rate")
#         min_val = doc.get("min_value")
#         max_val = doc.get("max_value")
#         single = doc.get('single')
#         married = doc.get('married')

#         if tax is None or min_val is None:
#             continue  

#         data = {
#             "min_value": min_val * inflation_rate,
#             "max_value": max_val * inflation_rate if max_val is not None else None,
#             "tax_rate": tax,
#             "single": single,
#             "married": married
#         }

#         inflation_db.insert_one(data)


def update_federal_tax_for_flat_inflation(inflation_rate):
    inflation_rate += 1
    current_year = datetime.now().year
    collection_name = f"federal_tax_{current_year}"
    federal_tax = db[collection_name]

    document = list(federal_tax.find())
    adjusted = []

    for doc in document:
        tax = doc.get("tax_rate")
        min_val = doc.get("min_value")
        max_val = doc.get("max_value")
        single = doc.get("single")
        married = doc.get("married")

        if tax is None or min_val is None:
            continue

        adjusted.append({
            "min_value": min_val * inflation_rate,
            "max_value": max_val * inflation_rate if max_val is not None else None,
            "tax_rate": tax,
            "single": single,
            "married": married
        })

    return adjusted


# def update_federal_tax_for_normal_distribution_inflation(mean,std):
#     current_year = datetime.now().year
#     collection_name = f"federal_tax_{current_year}"
#     federal_tax = db[collection_name]

#     inflation_db = db["inflation_federal_tax"]
#     inflation_db.delete_many({})

#     document = list(federal_tax.find())

#     inflation = np.random.normal(mean,std)

#     for doc in document:
#         tax = doc.get("tax_rate")
#         min_val = doc.get("min_value")
#         max_val = doc.get("max_value")
#         single = doc.get('single')
#         married = doc.get('married')

#         if tax is None or min_val is None:
#             continue  

#         data = {
#             "min_value": min_val * (1+inflation),
#             "max_value": max_val * (1+inflation) if max_val is not None else None,
#             "tax_rate": tax,
#             "single": single,
#             "married": married
#         }

#         inflation_db.insert_one(data)

def update_federal_tax_for_normal_distribution_inflation(mean, std):
    current_year = datetime.now().year
    collection_name = f"federal_tax_{current_year}"
    federal_tax = db[collection_name]

    document = list(federal_tax.find())
    inflation = np.random.normal(mean, std)
    adjusted = []

    for doc in document:
        tax = doc.get("tax_rate")
        min_val = doc.get("min_value")
        max_val = doc.get("max_value")
        single = doc.get('single')
        married = doc.get('married')

        if tax is None or min_val is None:
            continue

        adjusted.append({
            "min_value": min_val * (1 + inflation),
            "max_value": max_val * (1 + inflation) if max_val is not None else None,
            "tax_rate": tax,
            "single": single,
            "married": married
        })

    return adjusted


# def update_federal_tax_for_uniform_distribution_inflation(bot,top):
#     current_year = datetime.now().year
#     collection_name = f"federal_tax_{current_year}"
#     federal_tax = db[collection_name]

#     inflation_db = db["inflation_federal_tax"]
#     inflation_db.delete_many({})

#     document = list(federal_tax.find())

#     inflation = np.random.uniform(bot,top)

#     for doc in document:
#         tax = doc.get("tax_rate")
#         min_val = doc.get("min_value")
#         max_val = doc.get("max_value")
#         single = doc.get('single')
#         married = doc.get('married')

#         if tax is None or min_val is None:
#             continue  

#         data = {
#             "min_value": min_val * (1+inflation),
#             "max_value": max_val * (1+inflation) if max_val is not None else None,
#             "tax_rate": tax,
#             "single": single,
#             "married": married
#         }

#         inflation_db.insert_one(data)

def update_federal_tax_for_uniform_distribution_inflation(mean, std):
    current_year = datetime.now().year
    collection_name = f"federal_tax_{current_year}"
    federal_tax = db[collection_name]

    document = list(federal_tax.find())
    inflation = np.random.uniform(mean, std)
    adjusted = []

    for doc in document:
        tax = doc.get("tax_rate")
        min_val = doc.get("min_value")
        max_val = doc.get("max_value")
        single = doc.get('single')
        married = doc.get('married')

        if tax is None or min_val is None:
            continue

        adjusted.append({
            "min_value": min_val * (1 + inflation),
            "max_value": max_val * (1 + inflation) if max_val is not None else None,
            "tax_rate": tax,
            "single": single,
            "married": married
        })

    return adjusted




####
###
###
###
### state tax inflation functions
def updated_state_tax_for_inflation(inflation_rate):
    def load_state_tax_data(file_path="tax/state_tax.yaml"):
        with open(file_path, "r") as file:
            return yaml.safe_load(file)
        
    data = load_state_tax_data()

    for state, categories in data['states'].items():
        for category, brackets in categories.items():
            for bracket in brackets:
                bracket['min'] *= (1 + inflation_rate)
                if bracket['max'] is not None:
                    bracket['max'] *= (1 + inflation_rate)
                bracket['base_tax'] *= (1 + inflation_rate)

    input_file_path = "tax/state_tax.yaml"  
    output_file_path = os.path.join(os.path.dirname(input_file_path), "inflated_state_tax.yaml")
    
    with open(output_file_path, 'w') as f:
        yaml.dump(data, f, default_flow_style=False)


def updated_state_tax_for_normal_distribution_inflation(mean,std):
    def load_state_tax_data(file_path="tax/state_tax.yaml"):
        with open(file_path, "r") as file:
            return yaml.safe_load(file)
        
    data = load_state_tax_data()
    inflation_rate = np.random.normal(mean,std)

    for state, categories in data['states'].items():
        for category, brackets in categories.items():
            for bracket in brackets:
                bracket['min'] *= (1 + inflation_rate)
                if bracket['max'] is not None:
                    bracket['max'] *= (1 + inflation_rate)
                bracket['base_tax'] *= (1 + inflation_rate)

    input_file_path = "tax/state_tax.yaml"  
    output_file_path = os.path.join(os.path.dirname(input_file_path), "inflated_state_tax.yaml")
    
    with open(output_file_path, 'w') as f:
        yaml.dump(data, f, default_flow_style=False)


def updated_state_tax_for_uniform_distribution_inflation(bot,top):
    def load_state_tax_data(file_path="tax/state_tax.yaml"):
        with open(file_path, "r") as file:
            return yaml.safe_load(file)
        
    data = load_state_tax_data()
    inflation_rate = np.random.uniform(bot,top)

    for state, categories in data['states'].items():
        for category, brackets in categories.items():
            for bracket in brackets:
                bracket['min'] *= (1 + inflation_rate)
                if bracket['max'] is not None:
                    bracket['max'] *= (1 + inflation_rate)
                bracket['base_tax'] *= (1 + inflation_rate)

    input_file_path = "tax/state_tax.yaml"  
    output_file_path = os.path.join(os.path.dirname(input_file_path), "inflated_state_tax.yaml")
    
    with open(output_file_path, 'w') as f:
        yaml.dump(data, f, default_flow_style=False)



####
###
###
###
### captial_gain tax inflation functions

# def update_captial_gain_tax_for_flat_inflation(inflation_rate):
#     inflation_rate = inflation_rate + 1
#     current_year = datetime.now().year
#     collection_name = f"captial_gain_tax_{current_year}"
#     federal_tax = db[collection_name]

#     inflation_db = db["inflation_captial_gain_tax"]
#     inflation_db.delete_many({})

#     document = list(federal_tax.find())

#     for doc in document:
#         tax = doc.get("rate")
#         min_val = doc.get("min")
#         max_val = doc.get("max")
#         status = doc.get("status")

#         if tax is None or min_val is None:
#             continue  

#         data = {
#             "min": min_val * inflation_rate,
#             "max": max_val * inflation_rate if max_val is not None else None,
#             "rate": tax,
#             "status": status
#         }

#         inflation_db.insert_one(data)
def update_capital_gain_tax_for_flat_inflation(inflation_rate):
    inflation_rate += 1
    current_year = datetime.now().year
    collection_name = f"captial_gain_tax_{current_year}"
    capital_gain_tax = db[collection_name]

    document = list(capital_gain_tax.find())
    adjusted = []

    for doc in document:
        tax = doc.get("rate")
        min_val = doc.get("min")
        max_val = doc.get("max")
        status = doc.get("status")

        if tax is None or min_val is None:
            continue

        adjusted.append({
            "min": min_val * inflation_rate,
            "max": max_val * inflation_rate if max_val is not None else None,
            "rate": tax,
            "status": status
        })

    return adjusted

# def update_captial_gain_tax_for_normal_distribution_inflation(mean,std):
#     current_year = datetime.now().year
#     collection_name = f"captial_gain_tax_{current_year}"
#     federal_tax = db[collection_name]

#     inflation_db = db["inflation_captial_gain_tax"]
#     inflation_db.delete_many({})

#     document = list(federal_tax.find())
#     inflation_rate = np.random.normal(mean,std)

#     for doc in document:
#         tax = doc.get("rate")
#         min_val = doc.get("min")
#         max_val = doc.get("max")
#         status = doc.get("status")

#         if tax is None or min_val is None:
#             continue  

#         data = {
#             "min": min_val * (1+inflation_rate),
#             "max": max_val * (1+inflation_rate) if max_val is not None else None,
#             "rate": tax,
#             "status": status
#         }

#         inflation_db.insert_one(data)

def update_capital_gain_tax_for_normal_distribution_inflation(mean, std):
    inflation_rate = np.random.normal(mean, std)
    current_year = datetime.now().year
    collection_name = f"captial_gain_tax_{current_year}"
    capital_gain_tax = db[collection_name]

    document = list(capital_gain_tax.find())
    adjusted = []

    for doc in document:
        tax = doc.get("rate")
        min_val = doc.get("min")
        max_val = doc.get("max")
        status = doc.get("status")

        if tax is None or min_val is None:
            continue

        adjusted.append({
            "min": min_val * (1 + inflation_rate),
            "max": max_val * (1 + inflation_rate) if max_val is not None else None,
            "rate": tax,
            "status": status
        })

    return adjusted

# def update_captial_gain_tax_for_uniform_distribution_inflation(bot,top):
#     current_year = datetime.now().year
#     collection_name = f"captial_gain_tax_{current_year}"
#     federal_tax = db[collection_name]

#     inflation_db = db["inflation_captial_gain_tax"]
#     inflation_db.delete_many({})

#     document = list(federal_tax.find())
#     inflation_rate = np.random.uniform(bot,top)
    
#     for doc in document:
#         tax = doc.get("rate")
#         min_val = doc.get("min")
#         max_val = doc.get("max")
#         status = doc.get("status")

#         if tax is None or min_val is None:
#             continue  

#         data = {
#             "min": min_val * (1+inflation_rate),
#             "max": max_val * (1+inflation_rate) if max_val is not None else None,
#             "rate": tax,
#             "status": status
#         }

#         inflation_db.insert_one(data)

def update_capital_gain_tax_for_uniform_distribution_inflation(mean, std):
    inflation_rate = np.random.uniform(mean, std)
    current_year = datetime.now().year
    collection_name = f"captial_gain_tax_{current_year}"
    capital_gain_tax = db[collection_name]

    document = list(capital_gain_tax.find())
    adjusted = []

    for doc in document:
        tax = doc.get("rate")
        min_val = doc.get("min")
        max_val = doc.get("max")
        status = doc.get("status")

        if tax is None or min_val is None:
            continue

        adjusted.append({
            "min": min_val * (1 + inflation_rate),
            "max": max_val * (1 + inflation_rate) if max_val is not None else None,
            "rate": tax,
            "status": status
        })

    return adjusted

####
###
###
###
### standard deduction inflation functions

# def update_standard_deduction_for_inflation(inflation_rate):
#     current_year = datetime.now().year
#     collection_name = f"standard_deduction_{current_year}"
#     federal_tax = db[collection_name]

#     inflation_db = db["inflation_standard_deduction"]
#     inflation_db.delete_many({})

#     document = list(federal_tax.find())

#     for doc in document:
#         single = doc.get("single")
#         married = doc.get("married")
   
#         data = {
#             "single": single * (1+inflation_rate),
#             "married": married * (1+inflation_rate) 
         
#         }

#         inflation_db.insert_one(data)
def update_standard_deduction_for_inflation(inflation_rate):
    current_year = datetime.now().year
    collection_name = f"standard_deduction_{current_year}"
    federal_tax = db[collection_name]

    document = federal_tax.find_one()
    if not document:
        return {}

    single = document.get("single")
    married = document.get("married")

    return {
        "single": single * (1 + inflation_rate) if single is not None else None,
        "married": married * (1 + inflation_rate) if married is not None else None
    }

# def update_standard_deduction_normal_distribution_inflation(mean,std):
#     current_year = datetime.now().year
#     collection_name = f"standard_deduction_{current_year}"
#     federal_tax = db[collection_name]

#     inflation_db = db["inflation_standard_deduction"]
#     inflation_db.delete_many({})

#     document = list(federal_tax.find())
#     inflation_rate = np.random.normal(mean,std)

#     for doc in document:
#         single = doc.get("single")
#         married = doc.get("married")
   
#         data = {
#             "single": single * (1+inflation_rate),
#             "married": married * (1+inflation_rate) 
         
#         }

#         inflation_db.insert_one(data)

def update_standard_deduction_normal_distribution_inflation(mean, std):
    current_year = datetime.now().year
    collection_name = f"standard_deduction_{current_year}"
    federal_tax = db[collection_name]

    document = federal_tax.find_one()
    if not document:
        return {}

    inflation_rate = np.random.normal(mean, std)

    single = document.get("single")
    married = document.get("married")

    return {
        "single": single * (1 + inflation_rate) if single is not None else None,
        "married": married * (1 + inflation_rate) if married is not None else None
    }

# def update_standard_deduction_uniform_distribution_inflation(bot,top):
#     current_year = datetime.now().year
#     collection_name = f"standard_deduction_{current_year}"
#     federal_tax = db[collection_name]

#     inflation_db = db["inflation_standard_deduction"]
#     inflation_db.delete_many({})

#     document = list(federal_tax.find())
#     inflation_rate = np.random.uniform(bot,top)

#     for doc in document:
#         single = doc.get("single")
#         married = doc.get("married")
   
#         data = {
#             "single": single * (1+inflation_rate),
#             "married": married * (1+inflation_rate) 
         
#         }

#         inflation_db.insert_one(data)
def update_standard_deduction_uniform_distribution_inflation(mean, std):
    current_year = datetime.now().year
    collection_name = f"standard_deduction_{current_year}"
    federal_tax = db[collection_name]

    document = federal_tax.find_one()
    if not document:
        return {}

    inflation_rate = np.random.uniform(mean, std)

    single = document.get("single")
    married = document.get("married")

    return {
        "single": single * (1 + inflation_rate) if single is not None else None,
        "married": married * (1 + inflation_rate) if married is not None else None
    }


#
#
#
#
#
#calculate rmd
def calculateRMD(financialplan,age,curYearIncome):
    current_year = datetime.now().year
    collection_name = f"rmd_{current_year}"
    dis = db[collection_name]

    #finds D
    distribution = dis.find_one({"age": age}).get("distribution_period")

    #finds S
    sum = 0
    investments = financialplan.get("investments")
    for investment in investments:
        if investment.get("taxStatus") == "pre-tax":
            sum += investment.get("value")
    
    #findRMD
    rmd = sum/distribution

    #add RMD to current year income
    curYearIncome += rmd

    return curYearIncome

# def calculateRMD_Investment(financialplan,rmd):
#     investments = financialplan.get("investments")
#     pre_tax_invest = investments.find({"taxStatus": "pre-tax"})

#     for invest in pre_tax_invest:
#         invest_value = invest.get("value")-rmd
#         if invest_value < 0:
#             #set the investment value to 0
#             invest.get("value") = 0
#             rmd = rmd-invest_value
            
#             aftertax = investments.find_one({"investmentType": invest.get("investmentType"), "taxStatus": "non-retirement"})
#             if aftertax:
#                 aftertax.get("value") += invest_value
#             else:
#                 new_invest = invest
#                 new_invest.get("taxStatus") = "non-retirement"
#                 new_invest.get("value") = invest_value
#                 financialplan.add(new_invest)
#         else:
#             invest.get("value") = invest_value

#             aftertax = investments.find_one({"investmentType": invest.get("investmentType"), "taxStatus": "non-retirement"})
#             if aftertax:
#                 aftertax.get("value") += invest_value
#             else:
#                 new_invest = invest
#                 new_invest.get("taxStatus") = "non-retirement"
#                 new_invest.get("value") = invest_value
#                 financialplan.add(new_invest)
#             break
