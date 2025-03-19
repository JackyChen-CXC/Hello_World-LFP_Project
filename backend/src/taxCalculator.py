from pymongo import MongoClient
import re
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
    collection = db["state_tax"]

    state_pattern = f"^{re.escape(state)}"
    document = collection.find_one({"state": {"$regex": state_pattern, "$options": "i"}})

    if document is None:
        print(f"No tax data found for the state: {state}")
        return
    
    no_tax_state = ["alaska", "florida", "nevada", "south_dakota", "tennessee", "texas", "wyoming"]
    if state in no_tax_state:
        return 0

    if married_status == "single":
        rates = document["single_rates"]
        if document["single_deduction"] != None:
            income = income - document["single_deduction"]
        
        if income <= 0:
            print(f"No tax")
            return 0
        
        for i in range(len(rates)):
            rate, max_income = rates[i]
            
            if i + 1 < len(rates):
                next_rate, next_max_income = rates[i + 1]
            else:
                print(f"Tax rate: {rate}")
                return rate * income
            
            if income <= next_max_income:
                print(f"Tax rate: {rate}")
                return rate * income
            
    elif married_status == "married":
        rates = document["married_rates"]
        if document["married_deduction"] != None:
            income = income - document["married_deduction"]
        
        if income <= 0:
            print(f"No tax")
            return 0
        
        for i in range(len(rates)):
            rate, max_income = rates[i]
            
            if i + 1 < len(rates):
                next_rate, next_max_income = rates[i + 1]
            else:
                print(f"Tax rate: {rate}")
                return rate * income
            
            if income <= next_max_income:
                print(f"Tax rate: {rate}")
                return rate * income

    
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


def update_db_for_inflation(inflation):
    return

#print(calculate_standard_deduction(345,"single"))
#print(calculate_state_tax(300000,"married","colorado"))
#print(calculate_captial_gain_tax(5000000,"single"))
#calculate_federal_tax(2000000,"married")