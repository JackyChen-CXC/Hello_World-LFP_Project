from pymongo import MongoClient
import re
import os
import numpy as np
client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]


def calculateInvestmentValue(financialplan, currentYearIncome):
    investments = financialplan.get("investments", [])
    investment_types = {t["name"]: t for t in financialplan.get("investmentTypes", [])}
    
    taxable_income = 0
    non_taxable_income = 0

    for investment in investments:
        invest_type = investment_types.get(investment.get("investmentType"))
        if not invest_type:
            continue
            
        value = investment.get("value")
        dist = invest_type.get("incomeDistribution", {})
        dist_type = dist.get("type")
        dist_param = [v for k, v in dist.items() if k != "type"]
        # Calculate income based on distribution
        if dist_type == "fixed":
            income_val = dist_param[0] if dist_param else 0
        elif dist_type == "normal":
            income_val = np.random.normal(*dist_param)
        elif dist_type == "uniform":
            income_val = np.random.uniform(*dist_param)
        else:
            continue
            
        # Apply amount or percentage
        if invest_type.get("incomeAmtOrPct") == "percent":
            print("income",income_val)
            income = value * income_val
        else:  # "amount"
            print("income",income_val)
            income = income_val
        
        # Categorize income
        tax_status = investment.get("taxStatus")
        if invest_type.get("taxability"):
            if tax_status == "non-retirement":
                currentYearIncome += income
            elif tax_status == "pre-tax":
                taxable_income += income
            elif tax_status == "after-tax":
                non_taxable_income += income


        
        ###
        ###part D and c      
        dist = invest_type.get("returnDistribution", {})
        dist_type = dist.get("type")
        dist_param = [v for k, v in dist.items() if k != "type"]

        # Calculate income based on distribution
        if dist_type == "fixed":
            income_val = dist_param[0] if dist_param else 0
        elif dist_type == "normal":
            income_val = np.random.normal(*dist_param)
        elif dist_type == "uniform":
            income_val = np.random.uniform(*dist_param)
        else:
            continue


        # Apply amount or percentage
        if invest_type.get("incomeAmtOrPct") == "percent":
            income = value * income_val
            investment["value"] += income
        else:  # "amount"
            income = income_val
            investment["value"] += income

        ###
        ###
        ###part e caculate year expense
        expense_ratio = invest_type.get("expenseRatio", 0)
        expense = expense_ratio * ( (value + investment["value"])/2)
        investment["value"] -= expense
        investment["value"] = round(investment["value"],2)
    

    print(investments)
    print(currentYearIncome,taxable_income,non_taxable_income)
    return currentYearIncome,taxable_income,non_taxable_income
        








collection = db["financialplans"]
first_doc = collection.find_one()
calculateInvestmentValue(first_doc,200)