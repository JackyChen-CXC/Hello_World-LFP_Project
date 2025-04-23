import { IDistribution } from "../models/Distribution";
import { IInvestment, ILifeEvent, IFinancialPlan } from "../models/FinancialPlan";
import { IInvestmentType } from "../models/InvestmentType";
import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { inflate } from "zlib";

// Helper Functions

// Get percentage of total investments >= financial goal per year
export function probabilityOfSuccess(financialGoal: number, totalInvestmentsOverTime: number[][][]): number[] {
    // sum inner nested array
    const summedInvestmentsOverTime = totalInvestmentsOverTime.map(year =>
        year.map(sim => sim.reduce((sum, val) => sum + val, 0)));
    
    const totalProbability: number[] = [];
    for (let year = 0; year < summedInvestmentsOverTime.length; year++) {
        totalProbability[year] = 
            summedInvestmentsOverTime[year].filter(totalValue => totalValue >= financialGoal).length /
            summedInvestmentsOverTime[year].length;
    }
    return totalProbability;
}

// raw values -> median -> ranges
// @input = [year][simulation][number || items]
// [investments, income, expenses + taxes, early withdrawal tax, percentage of total discretionary expenses incurred]
export function generateRange(total: any[][]){
    const range: number[][] = []; // [min, max],
    // check if need to convert from 3D to 2D array
    const check = Array.isArray(total[0][0]);
    if(check){
        total = total.map(year =>
            year.map(sim => sim.reduce((sum: number, val: number) => sum + val, 0)));
    }
    // calculate ranges for each year 
    for (let year = 0; year < total.length; year++) {
        const sorted = total[year].sort((a, b) => a - b);
        
    }
    return range;
}


// hash simulated values into total values
// @number[] sim: array of one number per year
// @number[][] total: nested array of unsorted simulated numbers per year
export function hashIntoTotal(total: any[][], sim: any[]) {
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
// @Output = array of income amounts by order of income events
export function updateIncomeEvents(eventSeries: ILifeEvent[], inflationRate: number, deathSpouse: boolean): any[] {
    let income = [];
    let socialSecurity = 0;
    const year = new Date().getFullYear();
    const incomeEvents = getLifeEventsByType(eventSeries, "income");
    for(let event of incomeEvents){
        if(event.initialAmount){
            let cash = 0; // to preserve order with 0 values if not active
            // if active
            if(event.start.value && event.duration.value && year >= event.start.value && year < event.start.value + event.duration.value){
                // depending on death of spouse & userFraction (could fix to one time function for all values on spouse death)
                if(!deathSpouse){ // no spouse or spouse alive
                    // sum up last year's income liquidity
                    cash += (event.initialAmount);
                    // if social security, add to it
                    if(event.socialSecurity === true){
                        socialSecurity += event.initialAmount;
                    }
                } else{ // decrease amount gained by UserFraction
                    if(event.userFraction){
                        // sum up last year's income liquidity
                        cash += (event.initialAmount*event.userFraction);
                        // if social security, add to it
                        if(event.socialSecurity === true){
                            socialSecurity += event.initialAmount*event.userFraction;
                        }
                    }
                }
                // update income event by annual change
                const change = generateFromDistribution(event.changeDistribution);
                if(change){
                    if(event.changeAmtOrPct == "amount"){
                        event.initialAmount += change;
                    } else{ // percent
                        event.initialAmount *= (1+change);
                    }
                }
                
            }
            income.push(cash);
            // update amount by inflation if applicable inflationAdjusted
            if(event.inflationAdjusted === true){
                event.initialAmount *= (1+inflationRate);
            }
        }
    }
    console.log("updated income events");
    console.log(incomeEvents);
    console.log("output of part 2:", income, socialSecurity);
    return [income, socialSecurity];
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
export function getStandardDeduction(status: 'single' | 'married', data: any[]): number | null {
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
type TaxBracket = {
  min: number;
  max: number | null;
  base_tax: number;
  rate: number;
};

type TaxData = {
  single: TaxBracket[];
  married: TaxBracket[];
};
export function calculateStateTax(income: number, marriedStatus: "single" | "married", adjusted: TaxData | number): number {
    //adjusted is 0 meaning it's one of the taxless states
    if (adjusted === 0) return 0;

    const brackets = (adjusted as TaxData)[marriedStatus];

    for (const bracket of brackets) {
      if (income >= bracket.min && (bracket.max === null || income <= bracket.max)) {
        console.log("state tax amount: ",bracket.base_tax + parseFloat((bracket.rate * income).toFixed(2)));
        return bracket.base_tax + parseFloat((bracket.rate * income).toFixed(2));
      }
    }

    console.log(`Tax amount not found`);
    return 0;
}




//
//
//
//captial gain tax
export function getCapitalGainTaxRate(income: number, status: 'single' | 'married', adjusted: any[]): number | null {
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
export function getFederalTaxRate(income: number, marriedStatus: 'single' | 'married', adjusted: any[]): number | null {
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
export function updateStateTaxForInflation(state_tax_file: string, inflation: number, state: string) {
    state = state.toLowerCase();
//                   "alaska", "florida", "nevada", "south_dakota", "tennessee", "texas", "wyoming"
    const noTaxStates = ["ak", "fl", "nv", "sd", "tn", "tx", "wy"];
    if (noTaxStates.includes(state)) {
      console.log("no state tax");
      return undefined;
    }
// if input is "ny", "nj" or "ct" use "src/tax/state_tax.yaml", otherwise use state_tax_file
    let inputFilePath = "src/tax/";
    if (state == "ny" || state == "nj" || state == "ct"){
      inputFilePath+="state_tax.yaml";
      // TODO: add a return blank state tax bracket
    }
    else{
      if(state_tax_file.length!=0){
        inputFilePath+=state_tax_file;
      }
      inputFilePath+=state_tax_file;
    }
    const adjusted = {
      single: [] as {
        min: number;
        max: number | null;
        base_tax: number;
        rate: number;
      }[],
      married: [] as {
        min: number;
        max: number | null;
        base_tax: number;
        rate: number;
      }[],
    };
    try {
        const fileContents = fs.readFileSync(inputFilePath, "utf8");
        const data = yaml.load(fileContents) as any;

        let state_data = data.states[state];      
        
        if (!state_data) {
          const fallbackFilePath = "src/tax/state_tax.yaml"; 
          const fallbackContents = fs.readFileSync(fallbackFilePath, "utf8");
          const fallbackData = yaml.load(fallbackContents) as any;

          state_data = fallbackData.states[state];
        }


        for (const single of state_data.single) {
          adjusted.single.push({
            min: parseFloat((single.min * (1 + inflation)).toFixed(2)),
            max: single.max !== undefined ? parseFloat((single.max * (1 + inflation)).toFixed(2)) : null,
            base_tax: parseFloat((single.base_tax * (1+inflation)).toFixed(2)),
            rate: single.rate,
          });
        }

        for (const married of state_data.married) {
          adjusted.married.push({
            min: parseFloat((married.min * (1 + inflation)).toFixed(2)),
            max: married.max !== undefined ? parseFloat((married.max * (1 + inflation)).toFixed(2)) : null,
            base_tax: parseFloat((married.base_tax * (1+inflation)).toFixed(2)),
            rate: married.rate,
          });
        }
        
        return adjusted;
    } catch (err) {
        console.error("Error processing state tax YAML:", err);
        // TODO: add a return blank state tax bracket
        
    }
}



//
//
//
//state tax normal distribution
export function updateStateTaxForNormalDistributionInflation(mean: number, std: number, state: string) {
  state = state.toLowerCase();
//                   "alaska", "florida", "nevada", "south_dakota", "tennessee", "texas", "wyoming"
  const noTaxStates = ["ak", "fl", "nv", "sd", "tn", "tx", "wy"];
  if (noTaxStates.includes(state)) {
    console.log("no state tax");
    return 0;
  }

  const inputFilePath = "src/tax/state_tax.yaml";
  const adjusted = {
    single: [] as {
      min: number;
      max: number | null;
      base_tax: number;
      rate: number;
    }[],
    married: [] as {
      min: number;
      max: number | null;
      base_tax: number;
      rate: number;
    }[],
  };
  try {
      const fileContents = fs.readFileSync(inputFilePath, "utf8");
      const data = yaml.load(fileContents) as any;

      const inflation = generateNormal(mean,std);

      let state_data = data.states[state];  
      if (!state_data) {

        const fallbackFilePath = "src/tax/imported_state_tax.yaml"; 
        const fallbackContents = fs.readFileSync(fallbackFilePath, "utf8");
        const fallbackData = yaml.load(fallbackContents) as any;

        state_data = fallbackData.states[state];
      }
     
          
      for (const single of state_data.single) {
        adjusted.single.push({
          min: parseFloat((single.min * (1 + inflation)).toFixed(2)),
          max: single.max !== undefined ? parseFloat((single.max * (1 + inflation)).toFixed(2)) : null,
          base_tax: parseFloat((single.base_tax * (1+inflation)).toFixed(2)),
          rate: single.rate,
        });
      }

      for (const married of state_data.married) {
        adjusted.married.push({
          min: parseFloat((married.min * (1 + inflation)).toFixed(2)),
          max: married.max !== undefined ? parseFloat((married.max * (1 + inflation)).toFixed(2)) : null,
          base_tax: parseFloat((married.base_tax * (1+inflation)).toFixed(2)),
          rate: married.rate,
        });
      }
      
      return adjusted;
  } catch (err) {
      console.error("Error processing state tax YAML:", err);
  }
}



//
//
//
//
//state tax uniform distribution
export function updateStateTaxForUniformDistributionInflation(bot: number, top: number, state: string){
  state = state.toLowerCase();
//                   "alaska", "florida", "nevada", "south_dakota", "tennessee", "texas", "wyoming"
  const noTaxStates = ["ak", "fl", "nv", "sd", "tn", "tx", "wy"];
  if (noTaxStates.includes(state)) {
    console.log("no state tax");
    return 0;
  }

  const inputFilePath = "src/tax/state_tax.yaml";
  const adjusted = {
    single: [] as {
      min: number;
      max: number | null;
      base_tax: number;
      rate: number;
    }[],
    married: [] as {
      min: number;
      max: number | null;
      base_tax: number;
      rate: number;
    }[],
  };
  try {
      const fileContents = fs.readFileSync(inputFilePath, "utf8");
      const data = yaml.load(fileContents) as any;

      const inflation = generateUniform(bot,top);
      let state_data = data.states[state];  
      if (!state_data) {
        const fallbackFilePath = "src/tax/imported_state_tax.yaml"; 
        const fallbackContents = fs.readFileSync(fallbackFilePath, "utf8");
        const fallbackData = yaml.load(fallbackContents) as any;

        state_data = fallbackData.states[state];
      }
     
          
      for (const single of state_data.single) {
        adjusted.single.push({
          min: parseFloat((single.min * (1 + inflation)).toFixed(2)),
          max: single.max !== undefined ? parseFloat((single.max * (1 + inflation)).toFixed(2)) : null,
          base_tax: parseFloat((single.base_tax * (1+inflation)).toFixed(2)),
          rate: single.rate,
        });
      }

      for (const married of state_data.married) {
        adjusted.married.push({
          min: parseFloat((married.min * (1 + inflation)).toFixed(2)),
          max: married.max !== undefined ? parseFloat((married.max * (1 + inflation)).toFixed(2)) : null,
          base_tax: parseFloat((married.base_tax * (1+inflation)).toFixed(2)),
          rate: married.rate,
        });
      }
      

      return adjusted;
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
// export async function calculateRMD(financialPlan: IFinancialPlan, age: number, curYearIncome: number): Promise<number> {    
//     try{
//         const db = getDB();
//         const currentYear = new Date().getFullYear();
//         const collectionName = `rmd_${currentYear}`;
//         const dis = db.collection(collectionName);

//         // Find distribution period (D)
//         dis.findOne({ age: age })
//             .then(doc => {
//                 if (doc && doc.distribution_period) {
//                     const distribution: number = doc.distribution_period;

//                     // Find sum of pre-tax investments (S)
//                     let sum = 0;
//                     financialPlan.investments.forEach(investment => {
//                         if (investment.taxStatus === "pre-tax") {
//                             sum += investment.value;
//                         }
//                     });

//                     // Calculate RMD
//                     const rmd = sum / distribution;

//                     // Add RMD to current year income
//                     curYearIncome += rmd;

//                     return rmd;
//                 } else {
//                     throw new Error("Distribution period not found for the given age");
//                 }
//             })
//             .catch(err => {
//                 console.error("Error calculating RMD:", err);
//                 return -1; // Return current income if there's an error
//             });
        

//         return -1; // Return the income as a fallback
//     } catch (err) {
//         console.error("Error calculating RMD:", err);
//         return -1;
//     }
// }
export async function calculateRMD(financialPlan: IFinancialPlan, age: number, curYearIncome: number): Promise<number> {    
  try {
      //console.log("Starting RMD calculation function")
      const db = getDB();
      const currentYear = new Date().getFullYear();
      const collectionName = `rmd_${currentYear}`;
      const dis = db.collection(collectionName);

      // Find distribution period (D) with await to handle async operation
      const doc = await dis.findOne({ age: age });

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

          return rmd; // Return the calculated RMD
      } else {
          throw new Error("Distribution period not found for the given age");
      }
  } catch (err) {
      console.error("Error calculating RMD:", err);
      return -1; // Return -1 if there's an error
  }
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
    console.log("starting roth optimizer-----------------")
    const allInvestments = financialPlan.investments;
    const rothStrategy = financialPlan.RothConversionStrategy;
  
    // Find the applicable upper bracket limit
    const sortedBrackets = taxBrackets
      .filter(b => b[marriedStatus])
      .sort((a, b) => (a.min_value ?? 0) - (b.min_value ?? 0));

    let u = Infinity;
    for (const bracket of sortedBrackets) {
      const min = Number(bracket.min_value ?? -Infinity);
      const max = Number(bracket.max_value ?? Infinity);
        
      if (currentYearIncome >= min && currentYearIncome <= max) {
        console.log("Match found!");
        u = max;
        break;
      }
    }
    
  
    const fedTaxableIncome = currentYearIncome - 0.15 * currentYearSocialSecurityIncome;
  
    // Access the standard deduction for the correct status, defaulting to 0 if null
    const deductionValue = standardDeduction[marriedStatus] ?? 0;
    
    let rc = u - (fedTaxableIncome - deductionValue);

    // console.log("current year income: ",currentYearIncome)
    // console.log("current year ss: ",currentYearSocialSecurityIncome)
    // console.log("deduction: ", deductionValue)
    // console.log("federal bracket: ", u)
    // console.log("rc value: ",rc)

    for (const investId of rothStrategy) {
      const investment = allInvestments.find((inv) => inv.id === investId);
      if (!investment) continue;
  
      let investValue = investment.value;
      let movedValue = 0;
  
      if (investValue <= rc) {
        rc -= investValue;
        investment.value = 0;
        movedValue = investValue;
        // console.log("here we are moving everything---------")
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
  
    currentYearIncome += rc;
    return currentYearIncome;
  }







//
//
//
//Helper function for part 4 of simulation
export function calculateInvestmentValue(financialplan: IFinancialPlan, currentYearIncome: number): [number, number, number] {
    console.log("Start Helper Function 4")
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

    //console.log(investments);
    console.log(currentYearIncome, taxable_income, non_taxable_income);

    return [currentYearIncome, taxable_income, non_taxable_income];
}




//
//
//
//Helper function for part 6
export function findTotalNonDiscretionary(financialplan: any): number {
    const allEvents = financialplan.eventSeries || [];
    const expenseEvents = allEvents.filter((e: any) => e.type === "expense");
    const nonDiscretionaryEvents = expenseEvents.filter((e: any) => !e.discretionary);

    let total = 0;

    for (const event of nonDiscretionaryEvents) {
        const cost = event.initialAmount || 0;
        const dist = event.changeDistribution || {};
        const distType = dist.type;
        const distParams: number[] = Object.entries(dist)
            .filter(([key]) => key !== "type")
            .map(([_, value]) => typeof value === 'number' ? value : Number(value));
        // Calculate change value
        let change = 0;
        if (distType === "fixed") {
            change = distParams[0] || 0;
        } else if (distType === "normal") {
            // Assuming a normal distribution function is defined
            change = generateNormal(distParams[0], distParams[1]);
        } else if (distType === "uniform") {
            change = generateUniform(distParams[0], distParams[1]);
        }

        // Apply change
        if (event.changeAmtOrPct === "percent") {
            total += cost * (1 + change);
        } else {
            total += cost + change;
        }
    }

    return total;
}


export function payNonDiscretionary(
    financialplan: any,
    previousYearIncome: number,
    previousYearSocialSecurityIncome: number,
    married_status: "single" | "married",
    state: string,
    previousYearGain: number,
    previousYearEarlyWithdrawals: number,
    age: number,
    currentYearGain: number,
    currentYearEarlyWithdrawal: number,
    standardDeductionBrackets: any, // CHANGE FROM any []
    federalTaxBracket: any [],
    captialGainTaxBracket: any [],
    stateTaxBracket: TaxData

): void {

    const total_income = previousYearIncome + previousYearSocialSecurityIncome;

    // part a
    const total_taxable_income = total_income - (getStandardDeduction(married_status,standardDeductionBrackets) ?? 0);
    const federal_tax = getFederalTaxRate(total_taxable_income ?? 0,married_status,federalTaxBracket);
    const state_tax = calculateStateTax(total_taxable_income ?? 0, married_status, stateTaxBracket);

    // part b
    const capital_gain_tax = previousYearGain > 0
        ? getCapitalGainTaxRate(previousYearGain, married_status,captialGainTaxBracket)
        : 0;

    // part c
    const early_withdrawal_tax = (previousYearEarlyWithdrawals > 0 && age < 59)
        ? previousYearEarlyWithdrawals * 0.1
        : 0;

    // part d
    const total_non_discretionary = findTotalNonDiscretionary(financialplan);
    const total_payment_amount = total_non_discretionary + (federal_tax ?? 0) + (state_tax ?? 0) + (capital_gain_tax ?? 0) + early_withdrawal_tax;

    // part e
    const cash_investments = (financialplan.investments || []).filter((i: any) => i.investmentType === "cash");
    const total_cash = cash_investments.reduce((sum: number, i: any) => sum + (i.value || 0), 0);

    let total_withdrawal_amount = total_payment_amount - total_cash;

    // part f
    const all_investments = financialplan.investments || [];
    const withdrawal_strategy: string[] = financialplan.expenseWithdrawalStrategy || [];

    if (total_withdrawal_amount >= 0) {
        for (const invest_id of withdrawal_strategy) {
            const investment = all_investments.find((inv: any) => inv.id === invest_id);
            if (!investment) continue;

            const invest_value = investment.value || 0;
            let early_withdrawal_total = 0;

            if (invest_value <= total_withdrawal_amount) {
                total_withdrawal_amount -= invest_value;
                investment.value = 0;

                if (investment.taxStatus !== "pre-tax") {
                    //following line assumes we have created a field that stores the total purchased price
                    //remember to create the field for the investment once algorithmn starts or store it in a array
                    const purchase_price = investment.total_purchase_price || 0;
                    currentYearGain += (invest_value - purchase_price);
                }

                if ((investment.taxStatus === "pre-tax" || investment.taxStatus === "after-tax") && age < 59) {
                    early_withdrawal_total += invest_value;
                }
            } else {
                investment.value -= total_withdrawal_amount;

                if (investment.taxStatus !== "pre-tax") {
                    //following line assumes we have created a field that stores the total purchased price
                    //remember to create the field for the investment once algorithmn starts or store it in a array
                    const purchase_price = investment.total_purchase_price || 0;
                    const fraction = total_withdrawal_amount / invest_value;
                    currentYearGain += fraction * (invest_value - purchase_price);
                }

                if ((investment.taxStatus === "pre-tax" || investment.taxStatus === "after-tax") && age < 59) {
                    early_withdrawal_total += total_withdrawal_amount;
                }

                total_withdrawal_amount = 0;
            }

            currentYearEarlyWithdrawal += total_withdrawal_amount;
            if (total_withdrawal_amount === 0) break;
        }
    }
}







//
//
//
// Helper function for part7

export function payDiscretionary(
    financialplan: IFinancialPlan,
    total_asset: number,
    currentYearGain: number,
    currentYearEarlyWithdrawal: number,
    age: number
  ): void {
    const all_events = financialplan.eventSeries ?? [];
    const spending_strategy = financialplan.spendingStrategy ?? [];
  
    let total_event_cost = 0;
  
    for (const event_id of spending_strategy) {
      const event = all_events.find(e => e.name === event_id);
      if (!event) continue;
  
      // Calculates the total cost of the event
      const cost = event.initialAmount ?? 0;
      const dist = event.changeDistribution;
  
      // Check if dist is defined
      if (dist) {
        const dist_type = dist.type;
        const dist_params = Object.entries(dist)
          .filter(([key]) => key !== 'type')
          .map(([, value]) => value);
  
        let change = 0;
        if (dist_type === 'fixed') {
          change = dist_params[0] ?? 0;
        } else if (dist_type === 'normal') {
          change = generateNormal(dist_params[0], dist_params[1]);
        } else if (dist_type === 'uniform') {
          change = generateUniform(dist_params[0], dist_params[1]);
        }
  
        if (event.changeAmtOrPct === 'percent') {
          total_event_cost += cost * (1 + change);
        } else {
          total_event_cost += cost + change;
        }
      } else {
        // If dist is not defined, handle accordingly (e.g., no change)
        total_event_cost += cost;
      }
  
      // If the event will reduce user asset to below financial goal, stop paying
      if (total_asset - total_event_cost < financialplan.financialGoal) {
        break;
      }
  
      const all_investments = financialplan.investments ?? [];
      const withdrawal_strategy = financialplan.expenseWithdrawalStrategy ?? [];
  
      if (total_event_cost >= 0) {
        for (const invest_id of withdrawal_strategy) {
          const investment = all_investments.find(inv => inv.id === invest_id);
          if (!investment) continue;
  
          const invest_value = investment.value ?? 0;
          let early_withdrawal_total = 0;
  
          if (invest_value <= total_event_cost) {
            // Sells entire investment
            total_event_cost -= invest_value;
            investment.value = 0;
  
            if (investment.taxStatus !== 'pre-tax') {
                //following line assumes we have created a field that stores the total purchased price
                //remember to create the field for the investment once algorithmn starts
                //const purchase_price = investment.total_purchase_price;
                const purchase_price = 0;

                currentYearGain += invest_value - purchase_price;
            }
  
            if ((investment.taxStatus === 'pre-tax' || investment.taxStatus === 'after-tax') && age < 59) {
              early_withdrawal_total += invest_value;
            }
          } else {
            // Sells part of investment
            investment.value -= total_event_cost;
  
            if (investment.taxStatus !== 'pre-tax') {

                //following line assumes we have created a field that stores the total purchased price
                //remember to create the field for the investment once algorithmn starts
                //const purchase_price = investment.total_purchase_price;
                const purchase_price = 0;

                const fraction = total_event_cost / invest_value;
                currentYearGain += fraction * (invest_value - purchase_price);
            }
  
            if ((investment.taxStatus === 'pre-tax' || investment.taxStatus === 'after-tax') && age < 59) {
              early_withdrawal_total += total_event_cost;
            }
  
            total_event_cost = 0;
          }
  
          currentYearEarlyWithdrawal += total_event_cost;
  
          if (total_event_cost === 0) {
            break;
          }
        }
      }
    }
  }








//
///
///
///
///Helper function for part 8
export function runInvestEvents(financialplan: IFinancialPlan, glidePathValue: boolean): void {
    let total_cash =
      financialplan.investments.find((inv) => inv.id === "cash")?.value || 0;
  
    const my_investment = financialplan.eventSeries.filter((inv) => inv.type === "invest");
  
    for (const investments of my_investment) {
      const excess_cash = investments.maxCash ?? 0;
      //total_cash = 2000; // placeholder
      const invest_amount = total_cash - excess_cash;
  
      const all_investment = financialplan.investments;
      if (invest_amount <= 0) {
        console.log("No excess cash. abort investing");
        return;
      }
  
      const item: [string, number, string][] = [];
  
      let allocationList: { [key: string]: number } = {};
      if (investments.glidePath) {
        allocationList = glidePathValue
          ? investments.assetAllocation || {}
          : investments.assetAllocation2 || {};
      } else {
        allocationList = investments.assetAllocation || {};
      }
  
      for (const [name, percentage] of Object.entries(allocationList)) {
        const total = percentage * invest_amount;
        const each_investment = financialplan.investments.find((inv) => inv.id === name);
        const tax_status = each_investment?.taxStatus || "unknown";
        item.push([name, total, tax_status]);
      }
  
      let B_total_purchase = 0;
      for (const e of item) {
        if (e[2] === "after-tax") {
          B_total_purchase += e[1];
        }
      }
  
      const L_contributionLimit = financialplan.afterTaxContributionLimit;
  
      if (B_total_purchase > L_contributionLimit) {
        const scalefactor = L_contributionLimit / B_total_purchase;
  
        let sum = 0;
        for (const e of item) {
          if (e[2] === "after-tax") {
            e[1] *= scalefactor;
          }
          sum += e[1];
        }
  
        const accounts = item.filter((e) => e[2] === "non-retirement").length;
        const scale_up_amount = accounts > 0 ? sum / accounts : 0;
  
        for (const e of item) {
          if (e[2] === "non-retirement") {
            e[1] += scale_up_amount;
          }
        }
      }
  
      for (const investment of item) {
        const buy_investment = all_investment.find(
          (inv) => inv.id === investment[0] && inv.taxStatus === investment[2]
        );
        if (buy_investment) {
          buy_investment.value += investment[1];
        }
      }
  
      console.log("array: ", item);
      console.log(all_investment);
    }
  }








//
//
///
//
//Helper function for part 9
export function runRebalance(
    financialplan: IFinancialPlan,
    currentYearGain: number,
    marriedStatus: "single" | "married",
    captialGainTaxBracket: any []
  ): number {
    const rebalanceEvents = financialplan.eventSeries.filter(event => event.type === "rebalance");
  
    for (const event of rebalanceEvents) {
      const allocationList = event.assetAllocation || {};
  
      const item: [string, number, number][] = [];
      let investSum = 0;
  
      for (const [name, percentage] of Object.entries(allocationList)) {
        const investment = financialplan.investments.find(inv => inv.id === name);
        const investmentValue = investment?.value ?? 0;
  
        investSum += investmentValue;
        item.push([name, investmentValue, percentage]);
      }
  
      for (const [id, currentValue, targetPercent] of item) {
        const targetValue = targetPercent * investSum;
        const investment = financialplan.investments.find(inv => inv.id === id);
  
        if (!investment) continue;
  
        if (targetValue > currentValue) {
          const diff = targetValue - currentValue;
          investment.value += diff;
        } else if (targetValue < currentValue) {
          const diff = currentValue - targetValue;
          investment.value -= diff;
  
          if (investment.taxStatus === "non-retirement") {
            currentYearGain += getCapitalGainTaxRate(diff, marriedStatus,captialGainTaxBracket) ?? 0;
          }
        }
      }
    }
  
    return currentYearGain;
  }