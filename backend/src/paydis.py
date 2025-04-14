from pymongo import MongoClient
import re
import os
import numpy as np
from taxCalculator import calculate_federal_tax, calculate_standard_deduction, calculate_state_tax, calculate_captial_gain_tax
client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]

def findTotalNonDiscretionary(financialplan):
    # Get all expense events that are discretionary
    all_events = financialplan.get("eventSeries", [])
    expense_events = [e for e in all_events if e.get("type") == "expense"]
    discretionary_events = [e for e in expense_events if not e.get("discretionary", False)]
    
 
    total = 0
    for event in discretionary_events:
        cost = event.get("initialAmount", 0)
        dist = event.get("changeDistribution", {})
        dist_type = dist.get("type")
        dist_params = [v for k, v in dist.items() if k != "type"]

        # Calculate change value
        if dist_type == "fixed":
            change = dist_params[0] if dist_params else 0
        elif dist_type == "normal":
            change = np.random.normal(*dist_params)
        elif dist_type == "uniform":
            change = np.random.uniform(*dist_params)
        else:
            change = 0

        # Apply change
        if event.get("changeAmtOrPct") == "percent":
            total += cost * (1 + change)
        else:  # "amount"
            total += cost + change

    return total

def payNonDiscretionary(financialplan, previousYearIncome, previousYearSocialSecurityIncome,married_status,state,previousYearGain,previousYearEarlyWithdrawals, age,currentYearGain,currentYearEarlyWithdrawal):
   
    total_income = previousYearIncome+previousYearSocialSecurityIncome 
    #part a
    total_taxable_income = calculate_standard_deduction(total_income,married_status)
    federal_tax = calculate_federal_tax(total_taxable_income,married_status)
    state_tax = calculate_state_tax(total_taxable_income,married_status,state)

    #partb
    if previousYearGain > 0:
        captial_gain_tax = calculate_captial_gain_tax(previousYearGain,married_status)
    else:
        captial_gain_tax = 0


    #partc
    if previousYearEarlyWithdrawals > 0 and age < 59:
        early_withdrawal_tax = previousYearEarlyWithdrawals * .1
    else:
        early_withdrawal_tax = 0

    #partd
    total_non_discretionary = findTotalNonDiscretionary(financialplan)
    total_payment_amount = total_non_discretionary+federal_tax+state_tax+captial_gain_tax+early_withdrawal_tax


    #parte
    cash_investments = [i for i in financialplan.get("investments", []) 
                    if i.get("investmentType") == "cash"]
    total_cash = sum(i.get("value", 0) for i in cash_investments)

    total_withdrawal_amount = total_payment_amount - total_cash

    
    #partf
    all_investments = financialplan.get("investments",[])
    withdrawal_strategy = financialplan.get("expenseWithdrawalStrategy",[])
    if total_withdrawal_amount >= 0:
        for invest_id in withdrawal_strategy:
            investment = next((inv for inv in all_investments if inv.get("id") == invest_id), None)
            if not investment:
                continue
            
            invest_value = investment.get("value",0)
            early_withdrawal_total = 0
            
            if invest_value <= total_withdrawal_amount: #sells entire investment
                total_withdrawal_amount -= invest_value
                investment["value"] = 0
                

                if investment.get("taxStatus") != "pre-tax":
                    #following line assumes we have created a field that stores the total purchased price
                    #remember to create the field for the investment once algorithmn starts
                    purchase_price = investment.get("total_purchase_price")
                    currentYearGain += (invest_value - purchase_price)

                
                if (investment.get("taxStatus") == "pre-tax" or investment.get("taxStatus") == "after-tax") and age < 59:
                    early_withdrawal_total += invest_value
            else:
                investment["value"] -= total_withdrawal_amount #sells part of investment
                total_withdrawal_amount = 0
        

                if investment.get("taxStatus") != "pre-tax":
                    #following line assumes we have created a field that stores the total purchased price
                    #remember to create the field for the investment once algorithmn starts
                    purchase_price = investment.get("total_purchase_price")
                    fraction = total_withdrawal_amount/invest_value
                    currentYearGain += fraction * (invest_value - purchase_price)

                
                if (investment.get("taxStatus") == "pre-tax" or investment.get("taxStatus") == "after-tax") and age <59:
                    early_withdrawal_total += invest_value

            currentYearEarlyWithdrawal += total_withdrawal_amount
            if total_withdrawal_amount == 0:
                break




collection = db["financialplans"]
first_doc = collection.find_one()


#calculateInvestmentValue(first_doc,200)
print(findTotalNonDiscretionary(first_doc))
print("next function -----------------")
payNonDiscretionary(first_doc,20000,0,"single","new_york",0,0,70,0,0)




























































def payDiscretionary(financialplan, total_asset):
    #all_investments = financialplan.get("investments",[])
    all_events = financialplan.get("eventSeries",[])
    spending_strategy = financialplan.get("spendingStrategy",[])
   
    for event_id in spending_strategy:
        event = next((inv for inv in all_events if inv.get("name") == event_id), None)
        if not event:
            continue
        
        #caclulates the total cost of the event
        cost = event.get("initialAmount", 0)
        dist = event.get("changeDistribution", {})
        dist_type = dist.get("type")
        dist_params = [v for k, v in dist.items() if k != "type"]

        if dist_type == "fixed":
            change = dist_params[0] if dist_params else 0
        elif dist_type == "normal":
            change = np.random.normal(*dist_params)
        elif dist_type == "uniform":
            change = np.random.uniform(*dist_params)
        else:
            change = 0
        
        if event.get("changeAmtOrPct") == "percent":
            total_event_cost += cost * (1 + change)
        else:  # "amount"
            total_event_cost += cost + change
        
        #if the event will reduce user asset to below financial goal stops paying
        if total_asset - total_event_cost < financialplan.get("financialGoal"):
            break

        
        all_investments = financialplan.get("investments",[])
        withdrawal_strategy = financialplan.get("expenseWithdrawalStrategy",[])
        if total_event_cost >= 0:
            for invest_id in withdrawal_strategy:
                investment = next((inv for inv in all_investments if inv.get("id") == invest_id), None)
                if not investment:
                    continue
                
                invest_value = investment.get("value",0)
                early_withdrawal_total = 0
                
                if invest_value <= total_event_cost: #sells entire investment
                    total_event_cost -= invest_value
                    investment["value"] = 0
                    

                    if investment.get("taxStatus") != "pre-tax":
                        #following line assumes we have created a field that stores the total purchased price
                        #remember to create the field for the investment once algorithmn starts
                        purchase_price = investment.get("total_purchase_price")
                        currentYearGain += (invest_value - purchase_price)

                    
                    if (investment.get("taxStatus") == "pre-tax" or investment.get("taxStatus") == "after-tax") and age < 59:
                        early_withdrawal_total += invest_value
                else:
                    investment["value"] -= total_event_cost #sells part of investment
                    total_event_cost = 0
            

                    if investment.get("taxStatus") != "pre-tax":
                        #following line assumes we have created a field that stores the total purchased price
                        #remember to create the field for the investment once algorithmn starts
                        purchase_price = investment.get("total_purchase_price")
                        fraction = total_event_cost/invest_value
                        currentYearGain += fraction * (invest_value - purchase_price)

                    
                    if (investment.get("taxStatus") == "pre-tax" or investment.get("taxStatus") == "after-tax") and age <59:
                        early_withdrawal_total += invest_value

                currentYearEarlyWithdrawal += total_event_cost
                if total_event_cost == 0:
                    break

        
       