import { IDistribution } from "../models/Distribution";
import { IInvestment, ILifeEvent, IFinancialPlan } from "../models/FinancialPlan";
import { IInvestmentType } from "../models/InvestmentType";
import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

// Helper Functions

// Get percentage of total investments >= financial goal per year
export function probabilityOfSuccess(financialGoal: number, totalInvestmentsOverTime: number[][]): number[] {
    const totalProbability: number[] = [];
    for (let year = 0; year < totalInvestmentsOverTime.length; year++) {
        totalProbability[year] = 
            totalInvestmentsOverTime[year].filter(totalValue => totalValue >= financialGoal).length /
            totalInvestmentsOverTime[year].length;
    }
    return totalProbability;
}

// raw values -> median -> ranges
// [investments, income, expenses + taxes, early withdrawal tax, percentage of total discretionary expenses incurred]
export function generateRanges(total: number[][]){
    const avg: number[] = [];
    const median: number[] = [];
    const range: number[][] = []; // [min, max], 
    for (let year = 0; year < total.length; year++) {
        
    }
    return [avg, median, range];
}

// hash simulated values into total values
// @number[] sim: array of one number per year
// @number[][] total: nested array of unsorted simulated numbers per year
export function hashIntoTotal(total: number[][], sim: number[]) {
    for (let year = 0; year < sim.length; year++) {
        if (!total[year]) {
            total[year] = [];
        }
        total[year].push(sim[year]);
    }
}

export function getLifeEventsByType(eventSeries: ILifeEvent[], type: ILifeEvent["type"]): ILifeEvent[] {
    return eventSeries.filter(event => event.type === type);
}

export function getCash(investments: IInvestment[]): IInvestment {
    return investments.filter(investment => investment.id === "cash")[0];
}

// Helper for 2, Parameters: eventSeries, inflationRate, SpouseDeath
export function updateIncomeEvents(eventSeries: ILifeEvent[], inflationRate: number, deathSpouse: boolean): number[] {
    let cash = 0;
    let socialSecurity = 0;
    const year = new Date().getFullYear();
    const incomeEvents = getLifeEventsByType(eventSeries, "income");
    for(let income of incomeEvents){
        if(income.initialAmount){
            // if active
            if(income.start.value && income.duration.value && year >= income.start.value && year < income.start.value+income.duration.value){
                // depending on death of spouse & userFraction (could fix to one time function for all values on spouse death)
                if(!deathSpouse){ // no spouse or spouse alive
                    // sum up last year's income liquidity
                    cash+= income.initialAmount;
                    // if social security, add to it
                    if(income.socialSecurity === true){
                        socialSecurity += income.initialAmount;
                    }
                } else{ // decrease amount gained by UserFraction
                    if(income.userFraction){
                        // sum up last year's income liquidity
                        cash+= income.initialAmount*income.userFraction;
                        // if social security, add to it
                        if(income.socialSecurity === true){
                            socialSecurity += income.initialAmount*income.userFraction;
                        }
                    }
                }
                // update income event by annual change
                const change = generateFromDistribution(income.changeDistribution);
                if(change){
                    if(income.changeAmtOrPct == "amount"){
                        income.initialAmount += change;
                    } else{ // percent
                        income.initialAmount *= (1+change);
                    }
                }
                
            }
            // update amount by inflation if applicable inflationAdjusted
            if(income.inflationAdjusted === true){
                income.initialAmount *= (1+inflationRate);
            }
        }
    }
    return [cash, socialSecurity];
}

// Return a number given Distribution types: "fixed" | "normal" | "uniform"
export function generateFromDistribution(dist: IDistribution | undefined): number | undefined {
    if(dist){
        switch (dist.type) { // fixed number
            case "fixed":
                return dist.value;
            case "normal": // normal distibution
                if (typeof dist.mean === "number" && typeof dist.stdev === "number") {
                    // Box-Muller transform
                    const u1 = Math.random();
                    const u2 = Math.random();
                    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
                    return dist.mean + dist.stdev * z;
                }
            case "uniform": // uniform distibution
                if (typeof dist.lower === "number" && typeof dist.upper === "number") {
                    return dist.lower + Math.random() * (dist.upper - dist.lower);
                }
            default:
                // wrong use of function
                console.log("Wrong use of Distribution function");
                return undefined;
        }
    }      
}

// for start & duration that need a specific year start from a Distribution
export function standardizeTimeRangesForEventSeries(eventSeries: ILifeEvent[]): ILifeEvent[] {
    // store all startWith & endWhen
    const roundTwo = [];
    // fix all normal and uniform start/durations
    for(const event of eventSeries){
        // Start
        if(event.start.type === "normal" || event.start.type === "uniform"){
            event.start = { type: "fixed", value: generateFromDistribution(event.start)};
        }
        else if (event.start.type === "startWith" || event.start.type === "endWhen"){
            roundTwo.push(event);
        }
        // Duration
        if(event.duration.type === "normal" || event.duration.type === "uniform"){
            event.duration = { type: "fixed", value: generateFromDistribution(event.duration)};
        }
    }
    // do a second round to fix all startWith & endWhen
    for(const event of roundTwo){
        // find event
        const tempEvent = eventSeries.filter(temp => temp.name === event.start.eventSeries)[0];
        
        if(event.start.type === "startWith"){
            event.start = {type: "fixed", value: tempEvent.start.value};
        }
        else{
            if(tempEvent.start.value && tempEvent.duration.value ){ // the year after a specified event series ends.
                event.start = {type: "fixed", value: tempEvent.start.value + tempEvent.duration.value + 1};
            }
        }
    }
    return eventSeries;
}

// to write/get specific files from raw DB
export function getDB(){
    const db = mongoose.connection;
    return db;
}

// Example uses
// const result = await db.createCollection("new_tax_collection");
// const collection = db.collection("tax_data");
// const result = await collection.insertOne({
//     year: 2025,
//     bracket: "10%",
//     incomeLimit: 11000
//   });



//
//
//Standard Deduction
export async function getStandardDeduction(status: 'single' | 'married', data: any[]): Promise<number | null> {
    // Loop through the data to find the matching status
    for (const item of data) {
      const { status: itemStatus, rate } = item;
  
      // Check if the status matches
      if (itemStatus === status) {
        return rate; // Return the rate if a match is found
      }
    }
  
    // Return null if no matching status is found
    return null;
  }


//
//
//
//Calculate stateTax
interface TaxBracket {
    min: number;
    max: number;
    base_tax: number;
    rate: number;
}

interface StateTaxInfo {
    single?: TaxBracket[];
    married?: TaxBracket[];
}

interface TaxData {
    states: Record<string, StateTaxInfo>;
}

function loadStateTaxData(filePath = "tax/state_tax.yaml"): TaxData | null {
    try {
        const file = fs.readFileSync(filePath, 'utf8');
        return yaml.load(file) as TaxData;
    } catch (error) {
        console.error("Error loading tax data:", error);
        return null;
    }
}

export function calculateStateTax(income: number, marriedStatus: string, state: string): number | void {
    const taxData = loadStateTaxData();
    if (!taxData) return;

    const normalizedState = state.toLowerCase().replace(/\s+/g, "_");

    if (!(normalizedState in taxData.states)) {
        console.error(`No tax data found for ${normalizedState}. Please upload it.`);
        return;
    }
    //                   "alaska", "florida", "nevada", "south_dakota", "tennessee", "texas", "wyoming"
    const noTaxStates = ["ak", "fl", "nv", "sd", "tn", "tx", "wy"];
    if (noTaxStates.includes(normalizedState)) {
        return 0;
    }

    const stateTaxInfo = taxData.states[normalizedState];
    const rates: TaxBracket[] = stateTaxInfo[marriedStatus as "single" | "married"] || [];

    if (income <= 0) {
        console.log("No tax");
        return 0;
    }

    let tax = 0;
    for (const bracket of rates) {
        const { min, max, base_tax, rate } = bracket;

        if (income > min) {
            if (normalizedState === "ny") {
                const taxableAmount = Math.min(income, max) - min;
                tax = base_tax + (taxableAmount * rate);
            } else {
                tax = base_tax + (income * rate);
            }
        }

        if (income <= max) {
            break;
        }
    }

    console.log(`Tax amount: ${tax}`);
    return tax;
}




//
//
//
//captial gain tax
export async function getCapitalGainTaxRate(income: number, status: 'single' | 'married', adjusted: any[]): Promise<number | null> {
    // Loop through the adjusted tax brackets
    for (const bracket of adjusted) {
      const { min, max, rate, status: bracketStatus } = bracket;
  
      // Check if the value is within the range for this tax bracket
      // and if the status matches the bracket's status
      if (
        income >= min &&
        (max === null || income <= max) &&
        bracketStatus === status
      ) {
        // Return the rate if conditions are met
        return rate*income;
      }
    }
  
    // Return null if no matching tax bracket is found
    return null;
  }




///
///
///
///federal tax
export async function getFederalTaxRate(income: number, marriedStatus: 'single' | 'married', adjusted: any[]): Promise<number | null> {
    // Find the tax bracket that matches the income and marital status
    for (const bracket of adjusted) {
      const { min_value, max_value, tax_rate, single, married } = bracket;
  
      // Check if the income falls within the range for this bracket and the marital status matches
      if (
        income >= min_value &&
        (max_value === null || income <= max_value) &&
        ((marriedStatus === 'single' && single !== undefined) || (marriedStatus === 'married' && married !== undefined))
      ) {
        // Return the tax rate if conditions are met
        return tax_rate*income;
      }
    }
  
    // Return null if no bracket is found
    return null;
  }




//
//
//
//federal tax flat inflation
export async function updateFederalTaxForFlatInflation(inflationRate: number) {
    inflationRate += 1;
    const currentYear = new Date().getFullYear();
    const collectionName = `federal_tax_${currentYear}`;
    const db = getDB(); // Assuming getdb is a function that returns a MongoDB connection
    const federalTaxCollection = db.collection(collectionName);
  
    const documents = await federalTaxCollection.find().toArray();
    const adjusted: any[] = [];
  
    for (const doc of documents) {
      const tax = doc.tax_rate;
      const minVal = doc.min_value;
      const maxVal = doc.max_value;
      const single = doc.single;
      const married = doc.married;
  
      if (tax === undefined || minVal === undefined) {
        continue;
      }
  
      adjusted.push({
        min_value: minVal * inflationRate,
        max_value: maxVal !== undefined ? maxVal * inflationRate : null,
        tax_rate: tax,
        single: single,
        married: married,
      });
    }
  
    return adjusted;
  }




//
//
//
//federal tax normal distribution inflation
export async function updateFederalTaxForNormalDistributionInflation(mean: number, std: number) {
    const currentYear = new Date().getFullYear();
    const collectionName = `federal_tax_${currentYear}`;
    const db = getDB(); // Assuming getdb is a function that returns the MongoDB connection
    const federalTaxCollection = db.collection(collectionName);
  
    const documents = await federalTaxCollection.find().toArray();
    const inflation = generateNormal(mean, std);
    const adjusted: any[] = [];
  
    for (const doc of documents) {
      const tax = doc.tax_rate;
      const minVal = doc.min_value;
      const maxVal = doc.max_value;
      const single = doc.single;
      const married = doc.married;
  
      if (tax === undefined || minVal === undefined) {
        continue;
      }
  
      adjusted.push({
        min_value: minVal * (1 + inflation),
        max_value: maxVal !== undefined ? maxVal * (1 + inflation) : null,
        tax_rate: tax,
        single: single,
        married: married,
      });
    }
  
    return adjusted;
  }

// Simple normal distribution generator using Box-Muller transform
function generateNormal(mean: number, std: number): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // avoid 0
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * std + mean;
}



//
//
//
//
//federal tax uniform distribution
export async function updateFederalTaxForUniformDistributionInflation(mean: number, std: number) {
    const currentYear = new Date().getFullYear();
    const collectionName = `federal_tax_${currentYear}`;
    const db = getDB(); // Assuming getdb is a function that returns the MongoDB connection
    const federalTaxCollection = db.collection(collectionName);
  
    const documents = await federalTaxCollection.find().toArray();
    const inflation = generateUniform(mean, std);
    const adjusted: any[] = [];
  
    for (const doc of documents) {
      const tax = doc.tax_rate;
      const minVal = doc.min_value;
      const maxVal = doc.max_value;
      const single = doc.single;
      const married = doc.married;
  
      if (tax === undefined || minVal === undefined) {
        continue;
      }
  
      adjusted.push({
        min_value: minVal * (1 + inflation),
        max_value: maxVal !== undefined ? maxVal * (1 + inflation) : null,
        tax_rate: tax,
        single: single,
        married: married,
      });
    }
  
    return adjusted;
  }

// Generate a single value from a uniform distribution between bot and top
function generateUniform(bot: number, top: number): number {
    return Math.random() * (top - bot) + bot;
}


//
//
//
//
//state tax for flat inflation
export function updateStateTaxForInflation(inflationRate: number): void {
    const inputFilePath = "tax/state_tax.yaml";
    const outputFilePath = path.join(path.dirname(inputFilePath), "inflated_state_tax.yaml");

    try {
        const fileContents = fs.readFileSync(inputFilePath, "utf8");
        const data = yaml.load(fileContents) as any;

        if (!data.states) {
            console.error("No 'states' key found in tax data");
            return;
        }

        for (const state in data.states) {
            const categories = data.states[state];
            for (const category in categories) {
                const brackets = categories[category];
                for (const bracket of brackets) {
                    bracket.min *= (1 + inflationRate);
                    if (bracket.max !== null && bracket.max !== undefined) {
                        bracket.max *= (1 + inflationRate);
                    }
                    bracket.base_tax *= (1 + inflationRate);
                }
            }
        }

        const updatedYaml = yaml.dump(data, { flowLevel: -1 });
        fs.writeFileSync(outputFilePath, updatedYaml, "utf8");
        console.log(`Inflated state tax data saved to ${outputFilePath}`);
    } catch (err) {
        console.error("Error processing state tax YAML:", err);
    }
}



//
//
//
//state tax normal distribution
export function updateStateTaxForNormalDistributionInflation(mean: number, std: number): void {
    const inputFilePath = "tax/state_tax.yaml";
    const outputFilePath = path.join(path.dirname(inputFilePath), "inflated_state_tax.yaml");

    try {
        const fileContents = fs.readFileSync(inputFilePath, "utf8");
        const data = yaml.load(fileContents) as any;

        const inflationRate = generateNormal(mean, std);

        if (!data.states) {
            console.error("No 'states' key found in tax data");
            return;
        }

        for (const state in data.states) {
            const categories = data.states[state];
            for (const category in categories) {
                const brackets = categories[category];
                for (const bracket of brackets) {
                    bracket.min *= (1 + inflationRate);
                    if (bracket.max !== null && bracket.max !== undefined) {
                        bracket.max *= (1 + inflationRate);
                    }
                    bracket.base_tax *= (1 + inflationRate);
                }
            }
        }

        const updatedYaml = yaml.dump(data, { flowLevel: -1 });
        fs.writeFileSync(outputFilePath, updatedYaml, "utf8");
        console.log(`Inflated state tax data (normal dist) saved to ${outputFilePath}`);
    } catch (err) {
        console.error("Error processing state tax YAML:", err);
    }
}



//
//
//
//
//state tax uniform distribution
export function updateStateTaxForUniformDistributionInflation(bot: number, top: number): void {
    const inputFilePath = "tax/state_tax.yaml";
    const outputFilePath = path.join(path.dirname(inputFilePath), "inflated_state_tax.yaml");

    try {
        const fileContents = fs.readFileSync(inputFilePath, "utf8");
        const data = yaml.load(fileContents) as any;

        const inflationRate = generateUniform(bot, top);

        if (!data.states) {
            console.error("No 'states' key found in tax data");
            return;
        }

        for (const state in data.states) {
            const categories = data.states[state];
            for (const category in categories) {
                const brackets = categories[category];
                for (const bracket of brackets) {
                    bracket.min *= (1 + inflationRate);
                    if (bracket.max !== null && bracket.max !== undefined) {
                        bracket.max *= (1 + inflationRate);
                    }
                    bracket.base_tax *= (1 + inflationRate);
                }
            }
        }

        const updatedYaml = yaml.dump(data, { flowLevel: -1 });
        fs.writeFileSync(outputFilePath, updatedYaml, "utf8");
        console.log(`Inflated state tax data (uniform dist) saved to ${outputFilePath}`);
    } catch (err) {
        console.error("Error processing state tax YAML:", err);
    }
}



//
//
//
//captain gain flat inflation
export async function updateCapitalGainTaxForFlatInflation(inflationRate: number) {
    inflationRate += 1;
    const currentYear = new Date().getFullYear();
    const collectionName = `capital_gain_tax_${currentYear}`;
    const db = getDB(); 
    const capitalGainTaxCollection = db.collection(collectionName);
  
    const documents = await capitalGainTaxCollection.find().toArray();
    const adjusted: any[] = [];
  
    for (const doc of documents) {
      const tax = doc.rate;
      const minVal = doc.min;
      const maxVal = doc.max;
      const status = doc.status;
  
      if (tax === undefined || minVal === undefined) {
        continue;
      }
  
      adjusted.push({
        min: minVal * inflationRate,
        max: maxVal !== undefined ? maxVal * inflationRate : null,
        rate: tax,
        status: status,
      });
    }
  
    return adjusted;
  }



//
//
//
//captial gain normal distribtion
export async function updateCapitalGainTaxForNormalDistributionInflation(mean: number, std: number) {
    const inflationRate = generateNormal(mean, std);
    const currentYear = new Date().getFullYear();
    const collectionName = `capital_gain_tax_${currentYear}`;
    const db = getDB(); 
    const capitalGainTaxCollection = db.collection(collectionName);
  
    const documents = await capitalGainTaxCollection.find().toArray();
    const adjusted: any[] = [];
  
    for (const doc of documents) {
      const tax = doc.rate;
      const minVal = doc.min;
      const maxVal = doc.max;
      const status = doc.status;
  
      if (tax === undefined || minVal === undefined) {
        continue;
      }
  
      adjusted.push({
        min: minVal * (1 + inflationRate),
        max: maxVal !== undefined ? maxVal * (1 + inflationRate) : null,
        rate: tax,
        status: status,
      });
    }
  
    return adjusted;
}


//
//
//
//captial gain uniform distribution
export async function updateCapitalGainTaxForUniformDistributionInflation(mean: number, std: number) {
    const inflationRate = generateUniform(mean, std);
    const currentYear = new Date().getFullYear();
    const collectionName = `capital_gain_tax_${currentYear}`;
    const db = getDB(); 
    const capitalGainTaxCollection = db.collection(collectionName);
  
    const documents = await capitalGainTaxCollection.find().toArray();
    const adjusted: any[] = [];
  
    for (const doc of documents) {
      const tax = doc.rate;
      const minVal = doc.min;
      const maxVal = doc.max;
      const status = doc.status;
  
      if (tax === undefined || minVal === undefined) {
        continue;
      }
  
      adjusted.push({
        min: minVal * (1 + inflationRate),
        max: maxVal !== undefined ? maxVal * (1 + inflationRate) : null,
        rate: tax,
        status: status,
      });
    }
  
    return adjusted;
}


//
//
//
//standard deduction for flat inflation
export async function updateStandardDeductionForInflation(inflationRate: number) {
    const currentYear = new Date().getFullYear();
    const collectionName = `standard_deduction_${currentYear}`;
    const db = getDB(); 
    const federalTaxCollection = db.collection(collectionName);
  
    const document = await federalTaxCollection.findOne();
    if (!document) {
      return {};
    }
  
    const single = document.single;
    const married = document.married;
  
    return {
      single: single !== undefined ? single * (1 + inflationRate) : null,
      married: married !== undefined ? married * (1 + inflationRate) : null,
    };
}

//
//
//
//standard deduction for normal distribution
export async function updateStandardDeductionNormalDistributionInflation(mean: number, std: number) {
    const currentYear = new Date().getFullYear();
    const collectionName = `standard_deduction_${currentYear}`;
    const db = getDB(); 
    const federalTaxCollection = db.collection(collectionName);
  
    const document = await federalTaxCollection.findOne();
    if (!document) {
      return {};
    }
  
    const inflationRate = generateNormal(mean, std); 
  
    const single = document.single;
    const married = document.married;
  
    return {
      single: single !== undefined ? single * (1 + inflationRate) : null,
      married: married !== undefined ? married * (1 + inflationRate) : null,
    };
  }


//
//
//
//standard deduction for uniform distribution
export async function updateStandardDeductionUniformDistributionInflation(mean: number, std: number) {
    const currentYear = new Date().getFullYear();
    const collectionName = `standard_deduction_${currentYear}`;
    const db = getDB(); 
    const federalTaxCollection = db.collection(collectionName);
  
    const document = await federalTaxCollection.findOne();
    if (!document) {
      return {};
    }
  
    const inflationRate = generateUniform(mean, std); 
  
    const single = document.single;
    const married = document.married;
  
    return {
      single: single !== undefined ? single * (1 + inflationRate) : null,
      married: married !== undefined ? married * (1 + inflationRate) : null,
    };
  }


///
//
//
//calculate the rmd
export function calculateRMD(financialPlan: IFinancialPlan, age: number, curYearIncome: number): number {
    const db = getDB();
    const currentYear = new Date().getFullYear();
    const collectionName = `rmd_${currentYear}`;
    const dis = db.collection(collectionName);

    // Find distribution period (D)
    dis.findOne({ age: age })
        .then(doc => {
            if (doc && doc.distribution_period) {
                const distribution: number = doc.distribution_period;

                // Find sum of pre-tax investments (S)
                let sum = 0;
                financialPlan.investments.forEach(investment => {
                    if (investment.taxStatus === "pre-tax") {
                        sum += investment.value;
                    }
                });

                // Calculate RMD
                const rmd = sum / distribution;

                // Add RMD to current year income
                curYearIncome += rmd;

                return curYearIncome;
            } else {
                throw new Error("Distribution period not found for the given age");
            }
        })
        .catch(err => {
            console.error("Error calculating RMD:", err);
            return curYearIncome; // Return current income if there's an error
        });

    return curYearIncome; // Return the income as a fallback
}



//
//
//Helper Function for part 3 of simulation
//RMD move
export function calculateRMD_Investment(financialPlan: IFinancialPlan, rmd: number): IInvestment[] {
    const allInvestments = financialPlan.investments;
    const preTaxInvest = financialPlan.RMDStrategy;

    for (const investId of preTaxInvest) {
        const investment = allInvestments.find(inv => inv.id === investId);

        if (!investment) {
            continue; // Skip if the investment isn't found
        }

        let investValue = investment.value;
        let movedValue = 0;

        if (investValue <= rmd) {
            // If RMD is more than or equal to investment value
            rmd -= investValue;
            investment.value = 0;
            movedValue = investValue;
        } else {
            // If RMD is less than investment value
            investment.value -= rmd;
            movedValue = rmd;
            rmd = 0;
        }

        // Add moved value to corresponding after-tax investment
        const foundInvest = allInvestments.find(inv => inv.investmentType === investment.investmentType && inv.taxStatus === "non-retirement");

        if (foundInvest) {
            foundInvest.value += movedValue;
        } else {
            // Create new non-retirement investment
            const newInvest = {
                id: `${investment.id}_nonret`,
                value: movedValue,
                investmentType: investment.investmentType,
                taxStatus: "non-retirement",
            } as IInvestment;
            
            allInvestments.push(newInvest);
        }

        if (rmd === 0) {
            break; // Stop if the RMD has been fully allocated
        }
    }

    return allInvestments; // Return the updated investments array
}


//
//
//Helper function got part 5 of the simulation
//roth optimizer
export function performRothOptimizer(
    financialPlan: IFinancialPlan,
    currentYearIncome: number,
    currentYearSocialSecurityIncome: number,
    marriedStatus: "married" | "single",
    taxBrackets: any[],
    standardDeduction: any
  ): number {
    const allInvestments = financialPlan.investments;
    const rothStrategy = financialPlan.RothConversionStrategy;
  
    // Find the applicable upper bracket limit
    let u = Infinity;
    for (const bracket of taxBrackets) {
      const min = bracket.min_value ?? -Infinity;
      const max = bracket.max_value ?? Infinity;
  
      if (bracket[marriedStatus] && currentYearIncome >= min && currentYearIncome <= max) {
        u = max;
        break;
      }
    }
  
    const fedTaxableIncome = currentYearIncome - 0.15 * currentYearSocialSecurityIncome;
  
    // Access the standard deduction for the correct status, defaulting to 0 if null
    const deductionValue = standardDeduction[marriedStatus] ?? 0;
    
    let rc = u - (fedTaxableIncome - deductionValue);
    currentYearIncome += rc;
  
    for (const investId of rothStrategy) {
      const investment = allInvestments.find((inv) => inv.id === investId);
      if (!investment) continue;
  
      let investValue = investment.value;
      let movedValue = 0;
  
      if (investValue <= rc) {
        rc -= investValue;
        investment.value = 0;
        movedValue = investValue;
      } else {
        investment.value -= rc;
        movedValue = rc;
        rc = 0;
      }
  
      const foundInvest = allInvestments.find(
        (inv) =>
          inv.investmentType === investment.investmentType &&
          inv.taxStatus === "after-tax"
      );
  
      if (foundInvest) {
        foundInvest.value += movedValue;
      } else {
        const newInvest = {
          id: `${investment.id}_after-tax`,
          value: movedValue,
          investmentType: investment.investmentType,
          taxStatus: "after-tax",
        } as IInvestment;
  
        allInvestments.push(newInvest);
      }
  
      if (rc === 0) break;
    }
  
    return currentYearIncome;
  }







//
//
//
//Helper function for part 4 of simulation
export function calculateInvestmentValue(financialplan: IFinancialPlan, currentYearIncome: number): [number, number, number] {
    const investments = financialplan.investments;
    const investmentTypesMap = new Map<string, IInvestmentType>(
        financialplan.investmentTypes.map(t => [t.name, t]) // Use name of InvestmentType as the key
    );

    let taxable_income = 0;
    let non_taxable_income = 0;

    for (const investment of investments) {
        // Assuming investment.investmentType is a string (the name of the investment type)
        const investType = investmentTypesMap.get(investment.investmentType.name);
        if (!investType) continue;

        const value = investment.value;
        const dist = investType.incomeDistribution;
        const distType = dist.type;
        const distParam = Object.entries(dist)
            .filter(([key]) => key !== "type")
            .map(([_, v]) => v);

        let incomeVal = 0;
        if (distType === "fixed") {
            incomeVal = distParam[0] ?? 0;
        } else if (distType === "normal") {
            incomeVal = generateNormal(distParam[0], distParam[1]);
        } else if (distType === "uniform") {
            incomeVal = generateUniform(distParam[0], distParam[1]);
        } else {
            continue;
        }

        let income: number;
        if (investType.incomeAmtOrPct === "percent") {
            console.log("income", incomeVal);
            income = value * incomeVal;
        } else {
            console.log("income", incomeVal);
            income = incomeVal;
        }

        if (investType.taxability) {
            if (investment.taxStatus === "non-retirement") {
                currentYearIncome += income;
            } else if (investment.taxStatus === "pre-tax") {
                taxable_income += income;
            } else if (investment.taxStatus === "after-tax") {
                non_taxable_income += income;
            }
        }

        // Handle return distribution logic
        const returnDist = investType.returnDistribution;
        const returnType = returnDist.type;
        const returnParams = Object.entries(returnDist)
            .filter(([key]) => key !== "type")
            .map(([_, v]) => v);

        if (returnType === "fixed") {
            incomeVal = returnParams[0] ?? 0;
        } else if (returnType === "normal") {
            incomeVal = generateNormal(returnParams[0], returnParams[1]);
        } else if (returnType === "uniform") {
            incomeVal = generateUniform(returnParams[0], returnParams[1]);
        } else {
            continue;
        }

        if (investType.incomeAmtOrPct === "percent") {
            income = value * incomeVal;
            investment.value += income;
        } else {
            income = incomeVal;
            investment.value += income;
        }

        // Calculate expense
        const expenseRatio = investType.expenseRatio ?? 0;
        const expense = expenseRatio * ((value + investment.value) / 2);
        investment.value -= expense;
        investment.value = Math.round(investment.value * 100) / 100;
    }

    console.log(investments);
    console.log(currentYearIncome, taxable_income, non_taxable_income);

    return [currentYearIncome, taxable_income, non_taxable_income];
}



