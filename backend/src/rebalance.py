from pymongo import MongoClient
import re
import os
import numpy as np
from taxCalculator import calculate_federal_tax, calculate_standard_deduction, calculate_state_tax, calculate_captial_gain_tax
client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]

def runRebalance(financialplan,currentYearGain,married_status):
    #get the rebalance event
    rebalance_event = [inv for inv in financialplan.get("eventSeries", []) if inv.get("type") == "rebalance"]
    
    #loop through all rebalance events
    for events in rebalance_event:
        #assetAllocation
        allocationList = events.get("assetAllocation", {})

        item = []
        invest_sum = 0
        for name,percentage in allocationList.items():
            #need to change this from investschedule
            investment = next(
            (inv for inv in financialplan.get("investments", []) if inv.get("id") == name),
            0  
            )
            investment_value = investment.get("value")

            invest_sum += investment_value
            item.append([name,investment_value,percentage])

        for e in item:
            #buy more stocks
            if e[2]*invest_sum > e[1]:
                difference = (e[2] * invest_sum) - e[1]
                investment = next(
                    (inv for inv in financialplan.get("investments", []) if inv.get("id") == e[0]),
                    0  
                    )
                investment["value"] += difference
            elif e[2]*invest_sum < e[1]: #selling stocks here
                difference = e[1] - (e[2] * invest_sum)
                investment = next(
                    (inv for inv in financialplan.get("investments", []) if inv.get("id") == e[0]),
                    0  
                    )
                investment["value"] -= difference
                if investment.get("taxStatus") == "non-retirment":
                    currentYearGain += calculate_captial_gain_tax(difference,married_status)

    return currentYearGain







collection = db["financialplans"]
first_doc = collection.find_one()


#calculateInvestmentValue(first_doc,200)
runInvestEvents(first_doc,0)