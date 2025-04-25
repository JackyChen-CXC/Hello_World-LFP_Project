from pymongo import MongoClient
import re
import os
import numpy as np
from taxCalculator import calculate_federal_tax, calculate_standard_deduction, calculate_state_tax, calculate_captial_gain_tax
client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]


#helper function for part 8
def runInvestEvents(financialplan,glidePathValue):
    # Get current cash amount
    total_cash = next(
    (inv.get("value") for inv in financialplan.get("investments", []) if inv.get("investmentType") == "cash"),
    0  
    )
    
    
    my_investment = [inv for inv in financialplan.get("eventSeries", []) if inv.get("type") == "invest"]

    for investments in my_investment:
        excess_cash = investments.get("maxCash")

        #total amount that can be used to invest
        total_cash = 2000 #this is a place holder
        invest_amount = total_cash - excess_cash


        all_investment = financialplan.get("investments", [])
        if invest_amount <= 0:
            print("No excess cash. abort investing")
            return
        
        item = []
        if investments.get("glidePath"):
            if glidePathValue%2 == 0:
                allocationList = investments.get("assetAllocation", {})
            else:
                allocationList = investments.get("assetAllocation2", {})
        else:
            allocationList = investments.get("assetAllocation", {})
            
        for name,percentage in allocationList.items():
            total = percentage * invest_amount

            each_investment = next(
            (inv for inv in financialplan.get("investments", []) if inv.get("id") == name),
            0  
            )
            tax_status = each_investment.get("taxStatus")
            #print(invest_name,total,tax_status)
            item.append([name,total,tax_status])
        
        B_total_purchase = 0
        for e in item:
            if e[2] == "after-tax":
                B_total_purchase += e[1]
        
        L_contributionLimit = financialplan.get("afterTaxContributionLimit")

        if B_total_purchase > L_contributionLimit:
            scalefactor = L_contributionLimit / B_total_purchase

            sum = 0
            for e in item:
                if e[2] == "after-tax":
                    e[1] *= scalefactor
                sum += e[1]
            
            accounts = 0
            for e in item:
                if e[2] == "non-retirement":
                    accounts += 1
            
            scale_up_amount = sum/accounts
            for e in item:
                if e[2] == "non-retirement":
                    e[1] += scale_up_amount

                    
        #invest_name,total,tax_status
        for investment in item:
            buy_investment = next(
                (inv for inv in all_investment 
                if inv.get("id") == investment[0] and inv.get("taxStatus") == investment[2]), 
                None
            )
            buy_investment["value"] += investment[1]

    print("array: ",item)
    print(all_investment)
    
    
    
                

 




collection = db["financialplans"]
first_doc = collection.find_one()


#calculateInvestmentValue(first_doc,200)
runInvestEvents(first_doc,0)