#need to pip install pyyaml
from pymongo import MongoClient
import yaml
import re
import os
client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]


def calculate_standard_deduction(income,married_status):
    collection = db["standard_deduction"]
    if married_status == "single":
        single_rate = collection.find_one({"single": {"$exists": True}})
        single_rate = single_rate["single"]

        result = (income-single_rate)
        return result if result >= 0 else 0
    
    elif married_status == "married":
        married_rate = collection.find_one({"married": {"$exists": True}})
        married_rate = married_rate["married"]

        result = (income-married_rate)
        return result if result >= 0 else 0
    
    else:

        print("Error invalid married status")



def calculate_state_tax(income,married_status,state):

    def load_state_tax_data(file_path="tax/state_tax.yaml"):
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
        print("No tax")
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
    collection = db["captial_gain_tax"]
    document = collection.find_one()

    if married_status == "single":
        rates = document["single"]
        
        for i in range(len(rates)):
            rate,min_income, max_income = rates[i]
            
            if i == len(rates)-1:
                print(f"Tax rate: {rate}")
                return rate*income
            if income >= min_income and income <= max_income:
                print(f"Tax rate: {rate}")
                return rate*income
    
    elif married_status == "married":
        rates = document["married"]
        
        for i in range(len(rates)):
            rate,min_income, max_income = rates[i]
            
            if i == len(rates)-1:
                print(f"Tax rate: {rate}")
                return rate*income
            if income >= min_income and income <= max_income:
                print(f"Tax rate: {rate}")
                return rate*income         


def calculate_federal_tax(income,married_status):
    collection = db["federal_tax"]
    query = {
        "min_value": {"$lte": income},
        "max_value": {"$gte": income}
    }
    document = collection.find_one(query)

    if married_status == "single" and income < 100000:
        print(f"Tax rate: {document['single']}")
        return document["single"]
    
    elif married_status == "married" and income < 100000:
        print(f"Tax rate: {document['married']}")
        return document["married"]
    
    elif married_status == "single" and income > 100000:
        #find the document with following fields
        query = {
            "min_value": {"$lte": income},
            "max_value": {"$gte": income},
            "marriage_type": "single"
        }
        document = collection.find_one(query)

        #if not found then it's a super large value(over 600k)
        if not document:
            query = {
                "min_value": {"$lte": income},
                "max_value": {"$eq": None},
                "marriage_type": "single"
            }
            document = collection.find_one(query)

        #if not found then probabaly error
        if not document:
            print("No document Found")
            return None
        
        rate = document["tax_rate"]
        print(f"rate: {rate}")
        tax = (income*rate)-document["subtract_amount"]
        print(f"Tax rate: {tax}")
        return tax
    elif married_status == "married" and income > 100000:
        query = {
            "min_value": {"$lte": income},
            "max_value": {"$gte": income},
            "marriage_type": "married"
        }
        document = collection.find_one(query)

        if not document:
            query = {
                "min_value": {"$lte": income},
                "max_value": {"$eq": None},
                "marriage_type": "married"
            }
            document = collection.find_one(query)

        if not document:
            print("No document Found02")
            return None
        

        rate = document["tax_rate"]
        print(f"rate: {rate}")
        tax = (income*rate)-document["subtract_amount"]
        print(f"Tax rate: {tax}")
        return tax


def update_federal_tax_for_flat_inflation(inflation_rate):
    federal_tax = db["federal_tax"]
    inflation_db = db["inflation_federal_tax"]

    documents = federal_tax.find()

    for doc in documents:
        if doc["over_100k"] == False:
            inflated_doc = {
                "min_value": doc["min_value"] * inflation_rate,
                "max_value": doc["max_value"] * inflation_rate,
                "single": doc["single"] * inflation_rate,
                "married": doc["married"] * inflation_rate,
                "over_100k": doc["over_100k"],
                "tax_rate": doc["tax_rate"],
                "subtract_amount": doc["subtract_amount"],
                "marriage_type": doc["marriage_type"]
            }
            inflation_db.insert_one(inflated_doc)
        else:
            inflated_doc = {
                "min_value": doc["min_value"] * inflation_rate,
                "max_value": doc["max_value"] * inflation_rate,
                "single": doc["single"],
                "married": doc["married"],
                "over_100k": doc["over_100k"],
                "tax_rate": doc["tax_rate"] * inflation_rate,
                "subtract_amount": doc["subtract_amount"] * inflation_rate,
                "marriage_type": doc["marriage_type"]
            }
            inflation_db.insert_one(inflated_doc)


#print(calculate_standard_deduction(345,"single"))
#print(calculate_state_tax(300000,"married","colorado"))
#print(calculate_captial_gain_tax(5000000,"single"))
#calculate_federal_tax(2000000,"married")
#print(calculate_state_tax(300000,"married","colorado"))