import { IDistribution } from "../models/Distribution";
import { IInvestment, ILifeEvent, IFinancialPlan } from "../models/FinancialPlan";
import InvestmentType, { IInvestmentType } from "../models/InvestmentType";
import mongoose from "mongoose";
import { Document } from "mongodb";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { inflate } from "zlib";
import { writeLog } from "./logHelper";
import { scenarioExplorationParams, simulationOutput, purchasePrice } from "./simulationController";

// Helper Functions

// use plan without mutating original copy
export function deepCopyDocument<T extends Document>(doc: T): T {
    const plainObject = doc.toObject();
    const deepCopy = JSON.parse(JSON.stringify(plainObject));
    return deepCopy as T;
}
// Scenario Exploration Enforcer
export function enforceScenarioParameter(plan: IFinancialPlan, params: scenarioExplorationParams): void {
  // param 1
  let temp: ILifeEvent;
  if(params.algorithmType !== "standard") { // 1d & 2d
    switch(params.itemType){
      case "rothConversionOpt":
        for(let i = 0;  i < params.index; i++){
          plan.RothConversionOpt = !plan.RothConversionOpt;
        }
        break;
      case "start":
        temp = plan.eventSeries.filter(event => event.name === params.itemId)[0];
        if(temp.start.value)
          temp.start.value = params.index;
        break;
      case "duration":
        temp = plan.eventSeries.filter(event => event.name === params.itemId)[0];
        if(temp.duration.value)
          temp.duration.value = params.index;
        break;
      case "initialAmount":
        temp = plan.eventSeries.filter(event => event.name === params.itemId)[0];
        if(temp.initialAmount)
          temp.initialAmount = params.index;
        break;
      case "percentage":
        temp = plan.eventSeries.filter(event => event.name === params.itemId)[0];
        if(temp.assetAllocation){
          temp.assetAllocation[0] = params.index;
          temp.assetAllocation[1] = 1 - params.index;
        }
        console.log(temp.assetAllocation);
        break;
      default:
        console.log(`ISSUE AT STEP PARAM 1: ${params.itemType}, ${params.index}, ${params.index2}`)
    }
    // param 2
    if(params.algorithmType === "2d") {
      switch(params.itemType){
        case "rothConversionOpt":
          for(let i = 0;  i < params.index2; i++){
            plan.RothConversionOpt = !plan.RothConversionOpt;
          }
          break;
        case "start":
          temp = plan.eventSeries.filter(event => event.name === params.itemId)[0];
          if(temp.start.value)
            temp.start.value = params.index2;
          break;
        case "duration":
          temp = plan.eventSeries.filter(event => event.name === params.itemId)[0];
          if(temp.duration.value)
            temp.duration.value = params.index2;
          break;
        case "initialAmount":
          temp = plan.eventSeries.filter(event => event.name === params.itemId)[0];
          if(temp.initialAmount)
            temp.initialAmount = params.index2;
          break;
        case "percentage":
          temp = plan.eventSeries.filter(event => event.name === params.itemId)[0];
          if(temp.assetAllocation){
            console.log("b4",temp.assetAllocation);
            temp.assetAllocation[0] = params.index;
            temp.assetAllocation[1] = 1 - params.index;
            console.log("after",temp.assetAllocation);
          }
          break;
        default:
          console.log(`ISSUE AT STEP PARAM 2: ${params.itemType2}, ${params.index}, ${params.index2}`);
      }
    }
  }
}

// Scenario Exploration Updater (param 1 or 2)
export function updateScenarioParameter(plan: IFinancialPlan, params: scenarioExplorationParams, index: 1 | 2): void {
  try {
    if(index === 1){
      params.index += params.step;
    } else if(index === 2){
      params.index2 += params.step2;
    } 
  } catch(error){
    console.log("cannot update",error)
  }
}

// store algorithm output as simulationOutput
export function generateOutput(){
    const output: simulationOutput = {
      probabilityOverTime: [],
      financialGoal: 0,
      investmentsRange: [],
      incomeRange: [],
      expensesRange: [],
      earlyWithdrawTaxRange: [],
      percentageDiscretionaryRange: [],
      investmentOrder: [],
      avgInvestmentsOverTime: [],
      medianInvestmentsOverTime: [],
      incomeOrder: [],
      avgIncomeOverTime: [],
      medianIncomeOverTime: [],
      expensesOrder: [],
      avgExpensesOverTime: [],
      medianExpensesOverTime: []
  };
  return output;
}

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
// @output = [year] range = [10%-90%, 20%-80%, 30%-70%, 40%-60%, 50%-50% (median value)]
// [investments, income, expenses + taxes, early withdrawal tax, percentage of total discretionary expenses incurred]
export function generateRange(total: any[][]){
  const range: number[][][] = []; // [min, max],
  // check if need to convert from 3D to 2D array
  const check = Array.isArray(total[0][0]);
  if(check){ // reduce simulation numbers into one simulation number
      total = total.map(year =>
          year.map(sim => sim.reduce((sum: number, val: number) => sum + val, 0)));
  }
  // calculate ranges for each year 
  for (let year = 0; year < total.length; year++) {
    const sorted = [...total[year]].sort((a, b) => a - b);
    range[year] = [];

    const getPercentile = (p: number) => {
      const idx = (sorted.length - 1) * p;
      const lower = Math.floor(idx);
      const upper = Math.ceil(idx);
      if (lower === upper) return sorted[lower];
      return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
    };
    const r10_90 = [getPercentile(0.1), getPercentile(0.9)];
    const r20_80 = [getPercentile(0.2), getPercentile(0.8)];
    const r30_70 = [getPercentile(0.3), getPercentile(0.7)];
    const r40_60 = [getPercentile(0.4), getPercentile(0.6)];
    const median = getPercentile(0.5);
    range[year].push([r10_90[0], r10_90[1]]);
    range[year].push([r20_80[0], r20_80[1]]);
    range[year].push([r30_70[0], r30_70[1]]);
    range[year].push([r40_60[0], r40_60[1]]);
    range[year].push([median, median]);
  }
  return range;
}

// combine simulation sets of items into one set per year for median or mean
export function computeMeanAndMedian(data: number[][][]): { means: number[][], medians: number[][] } {
  const years = data.length;
  const means: number[][] = [];
  const medians: number[][] = [];
  for (let y = 0; y < years; y++) {
      const simulations = data[y];
      if (simulations.length === 0) {
          means.push([]);
          medians.push([]);
          continue;
      }
      const numCount = simulations[0].length;
      const yearMeans: number[] = [];
      const yearMedians: number[] = [];
      for (let i = 0; i < numCount; i++) {
          const values = simulations.map(sim => sim[i]);
          const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
          values.sort((a, b) => a - b);
          const mid = Math.floor(values.length / 2);
          const median = values.length % 2 === 0
              ? (values[mid - 1] + values[mid]) / 2
              : values[mid];
          yearMeans.push(mean);
          yearMedians.push(median);
      }
      means.push(yearMeans);
      medians.push(yearMedians);
  }
  return { means, medians };
}

// hash simulated values into total values
// @any[] sim: array of one number/arr per year
// @any[][] total: nested array of unsorted simulated numbers per year
export function hashIntoTotal(total: any[][][], sim: any[], rangeIndex: number) {
  for (let year = 0; year < sim.length; year++) {
      if (!total[rangeIndex][year]) {
          total[rangeIndex][year] = [];
      }
      total[rangeIndex][year].push(sim[year]);
  }
}

export function getValueOfInvestments(investments: IInvestment[]): number[] {
  return investments.map(investment => investment.value);
}

export function getValueOfExpenses(eventSeries: ILifeEvent[], year: number, startingYear: number): number[] {
  const events = getLifeEventsByType(eventSeries, "expense");
  const output: number[] = [];
  if(events){
    for(const event of events){
      if (event && event.start.value && event.duration.value && 
      startingYear + year > event.start.value && startingYear + year < startingYear + event.duration.value){
        output.push(event.initialAmount ?? 0);
      } else{
        output.push(0); // presevere order
      }
    }
  }
  return output;
}

export function getLifeEventsByType(eventSeries: ILifeEvent[], type: ILifeEvent["type"]): ILifeEvent[] {
    return eventSeries.filter(event => event.type === type);
}

export function getCash(investments: IInvestment[]): IInvestment {
    return investments.filter(investment => investment.id === "cash")[0];
}

// Get total value of assets (investments)
export function getTotalAssetValue(investments: IInvestment[]): number {
  return investments.reduce((total, investment) => total + investment.value, 0);
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
    return [income, socialSecurity];
}

// Return a number given Distribution types: "fixed" | "normal" | "uniform"
export function generateFromDistribution(dist: IDistribution | undefined): number {
    if(dist){
        switch (dist.type) { // fixed number
            case "fixed":
              if(dist.value)
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
        }
    }
    return new Date().getFullYear();
}

// for start & duration that need a specific year start from a Distribution
export function standardizeTimeRangesForEventSeries(eventSeries: ILifeEvent[]): ILifeEvent[] {
    // store all startWith & endWhen
    const roundTwo = [];
    // fix all normal and uniform start/durations
    for(const event of eventSeries){
        // Start
        if(event.start.type === "normal" || event.start.type === "uniform" && event.start){
            event.start = { type: "fixed", value: Math.floor(generateFromDistribution(event.start))};
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
export function getStandardDeduction(status: 'single' | 'married', data: Record<string, number>): number | null {
    // Loop through the data to find the matching status
    return data[status] ?? null;
    // console.log("inside deducytion");
    // console.log(data)
    // for (const item of data) {
    //   console.log("d");
    //   console.log("tem",item);
    //   const { status: itemStatus, rate } = item;
    //   console.log("inside deducytion",item);
    //   // Check if the status matches
    //   if (itemStatus === status) {
    //     return rate; // Return the rate if a match is found
    //   }
    // }
    // console.log("stopped dedication")
    // // Return null if no matching status is found
    // return null;
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
        //console.log("state tax amount: ",bracket.base_tax + parseFloat((bracket.rate * income).toFixed(2)));
        return bracket.base_tax + parseFloat((bracket.rate * income).toFixed(2));
      }
    }

    //console.log(`Tax amount not found`);
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
export function getFederalTaxRate(income: number, marriedStatus: 'single' | 'married', adjusted: any[]): number {
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
    return 0;
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
  state = state.toLowerCase();
//                   "alaska", "florida", "nevada", "south_dakota", "tennessee", "texas", "wyoming"
  const noTaxStates = ["ak", "fl", "nv", "sd", "tn", "tx", "wy"];
  if (noTaxStates.includes(state)) {
    adjusted.single.push({
      min: 0,
      max: 0,
      base_tax: 0,
      rate: 0,
    });
    adjusted.married.push({
      min: 0,
      max: 0,
      base_tax: 0,
      rate: 0,
    });
    return adjusted;
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
  }
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
      adjusted.single.push({
        min: 0,
        max: 0,
        base_tax: 0,
        rate: 0,
      });
      adjusted.married.push({
        min: 0,
        max: 0,
        base_tax: 0,
        rate: 0,
      });
      return adjusted;
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
    const rmdstrategy = financialPlan.RMDStrategy;

    for (const investId of rmdstrategy) {
        //the investments with pre-tax status
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

        // Find investment with same investmentType and non-retirment status 
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
  
    //PartA of 5
    const fedTaxableIncome = currentYearIncome - 0.15 * currentYearSocialSecurityIncome;
    // Find the applicable upper bracket limit
    const sortedBrackets = taxBrackets
      .filter(b => b[marriedStatus])
      .sort((a, b) => (a.min_value ?? 0) - (b.min_value ?? 0));

    let u = Infinity;
    for (const bracket of sortedBrackets) {
      const min = Number(bracket.min_value ?? -Infinity);
      const max = Number(bracket.max_value ?? Infinity);
        
      if (fedTaxableIncome >= min && fedTaxableIncome <= max) {
        u = max;
        break;
      }
    }
    
    const deductionValue = standardDeduction[marriedStatus] ?? 0;
    
    //PartB of 5
    let rc = u - (fedTaxableIncome - deductionValue);
    let amount_transferred = 0;

    //Part C of 5
    for (const investId of rothStrategy) {
      const investment = allInvestments.find((inv) => inv.id === investId);
      if (!investment) continue;
  
      let investValue = investment.value;
      let movedValue = 0;
  
      //remove values from pre-tax investment
      if (investValue <= rc) {//Remove the from the values in pre-tax investment
        amount_transferred += investValue;
        rc -= investValue;
        investment.value = 0;
        movedValue = investValue;
      } else { //remove part from pre-tax investment
        amount_transferred += rc;
        investment.value -= rc;
        movedValue = rc;
        rc = 0;
      }
  
      //finds all investment with "after tax" and same investmentTYpe
      const foundInvest = allInvestments.find(
        (inv) =>
          inv.investmentType === investment.investmentType &&
          inv.taxStatus === "after-tax"
      );
  
      //ADDs the value to the "after-tax" investment
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

    //Part D of 5
    currentYearIncome += amount_transferred;

    return currentYearIncome;
  }







//
//
//
//Helper function for part 4 of simulation
export function calculateInvestmentValue(financialplan: IFinancialPlan, currentYearIncome: number): [number, number, number, number] {
    const investments = financialplan.investments;
    const investmentTypesMap = new Map<string, IInvestmentType>(
        financialplan.investmentTypes.map(t => [t.name, t]) // Use name of InvestmentType as the key
    );

  
    let taxable_income = 0;
    let non_taxable_income = 0;
    let total_expense = 0;

    for (const investment of investments) {
        // Assuming investment.investmentType is a string (the name of the investment type)
        const investType = investmentTypesMap.get(investment.investmentType);
        if (!investType) continue;


        //part 4 step A
        const value = investment.value;
        const income_dist = investType.incomeDistribution;
        const income_distType = income_dist.type;
        

        let incomeVal;
        if (income_distType === "fixed") {
            incomeVal = income_dist.value
        } else if (income_distType === "normal") {
            incomeVal = generateNormal((income_dist.mean ?? 0), (income_dist.stdev ?? 0));
        } else if (income_distType === "uniform") {
            //might cause a bug here since it might not be mean or stdev for uniform but something else
            incomeVal = generateUniform((income_dist.lower ?? 0), (income_dist.upper ?? 0));
        } else {
            continue;
        }

        incomeVal = incomeVal ?? 0;
        let income: number;
        if (investType.incomeAmtOrPct === "percent") {
            income = value * incomeVal;
        } else {
            income = incomeVal;
        }

        //total income of the investment for the year
        income = Number(income.toFixed(2));

        
        //part 4 step B
        if (investType.taxability && investment.taxStatus === "non-retirement") {
          currentYearIncome += income;
          taxable_income += income;
        }
        if (investment.taxStatus === "pre-tax") {
          taxable_income += income;
        }
        

        // Handle return distribution logic part 4 D and C
        const returnDist = investType.returnDistribution;
        const returnType = returnDist.type;

        if (returnType === "fixed") {
            incomeVal = returnDist.value;
        } else if (returnType === "normal") {
            incomeVal = generateNormal(returnDist.mean ?? 0, returnDist.stdev ?? 0);
        } else if (returnType === "uniform") {
            incomeVal = generateUniform(returnDist.lower ?? 0, returnDist.upper ?? 0);
        } else {
            continue;
        }

        //calculates the change in value and store it in incomval
        incomeVal = incomeVal ?? 0;
        if (investType.incomeAmtOrPct === "percent") {
          //Update the change in value
          investment.value = investment.value + (investment.value * incomeVal);
          //Add the income to the investment
          investment.value += income;
        } else {
          investment.value = investment.value + (investment.value + incomeVal);
          investment.value += income;
        }

        // Calculate expense part 4 part e
        const expenseRatio = investType.expenseRatio ?? 0;
        const expense = expenseRatio * ((value + investment.value) / 2);
        total_expense += expense;
        investment.value -= expense;
    }

    //console.log(investments);
    // console.log(currentYearIncome, taxable_income, non_taxable_income);

    return [currentYearIncome, taxable_income, non_taxable_income, total_expense];
}




//
//
//
//Helper function for part 6
export function findTotalNonDiscretionary(financialplan: any, year: number, startingYear: number): number {
    const allEvents = financialplan.eventSeries || [];
    const expenseEvents = allEvents.filter((e: any) => e.type === "expense");
    const nonDiscretionaryEvents = expenseEvents.filter((e: any) => !e.discretionary);

    let total = 0;

    for (const event of nonDiscretionaryEvents) {
      let cost_of_event = 0;
      if (event && event.start.value && event.duration.value && 
      startingYear + year < event.start.value && startingYear + year > startingYear + event.duration.value){
        continue; // skip event if not active
      }

      const cost = event.initialAmount || 0;
      const dist = event.changeDistribution;
      const distType = dist.type;

      // Calculate change value (change Distribution)
      let change = 0;
      if (distType === "fixed") {
          change = dist.value;
      } else if (distType === "normal") {
          change = generateNormal(dist.mean ?? 0, dist.stdev ?? 0);
      } else if (distType === "uniform") {
          change = generateUniform(dist.lower ?? 0, dist.upper ?? 0);
      }

      //store the change in cost_of_event
      if (event.changeAmtOrPct === "percent") {
          cost_of_event += cost * (1 + change);
      } else {
          cost_of_event += cost + change;
      }

      //apply for inflation
      if(event.inflationAdjusted === true){
        if(financialplan.inflationAssumption.type === 'fixed'){
          cost_of_event = cost_of_event * (1+(financialplan.inflationAssumption.value ?? 0));
        }else if(financialplan.inflationAssumption.type === 'normal'){
          cost_of_event = cost_of_event * (1+(generateNormal(financialplan.inflationAssumption.mean ?? 0, financialplan.inflationAssumption.stdev ?? 0)));
        }else if(financialplan.inflationAssumption.type === 'uniform'){
          cost_of_event = cost_of_event * (1+(generateUniform(financialplan.inflationAssumption.lower ?? 0, financialplan.inflationAssumption.upper ?? 0)));
        }
      }

      //apply for userfraction
      cost_of_event = cost_of_event * event.userFraction;
      total += cost_of_event;
  }
  // console.log(total);
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
    currentAge: number,
    year: number,
    startingYear: number,
    currYearIncome: number,
    currentYearGain: number,
    currentYearEarlyWithdrawal: number,
    standardDeductionBrackets: any, // CHANGE FROM any []
    federalTaxBracket: any [],
    captialGainTaxBracket: any [],
    stateTaxBracket: TaxData,
    list_of_purchase_price: Record<string, purchasePrice>,

): number[] {
    const age = currentAge + year;
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
    const total_non_discretionary = findTotalNonDiscretionary(financialplan, year, startingYear);
    const total_payment_amount = total_non_discretionary + (federal_tax ?? 0) + (state_tax ?? 0) + (capital_gain_tax ?? 0) + early_withdrawal_tax;


    // part e
    const cash_investments = (financialplan.investments || []).filter((i: any) => i.investmentType === "cash");
    const total_cash = cash_investments.reduce((sum: number, i: any) => sum + (i.value || 0), 0);

    let total_withdrawal_amount = total_payment_amount - total_cash;
    let total_paid = total_payment_amount;
    //pay in cash
    for (const cash_event of cash_investments){
      if (total_paid > cash_event.value){
        total_paid -= cash_event.event
        cash_event.value = 0;
      }else{
        cash_event.value -= total_paid;
      }
    }

    // part f
    const all_investments = financialplan.investments || [];
    const withdrawal_strategy: string[] = financialplan.expenseWithdrawalStrategy || [];


    if (total_withdrawal_amount > 0) { //this means not enough cash on hand pay with investment
        for (const invest_id of withdrawal_strategy) {
            const investment = all_investments.find((inv: any) => inv.id === invest_id);
            if (!investment) continue;

            const invest_value = investment.value || 0;
            let early_withdrawal_total = 0;
            if (invest_value <= total_withdrawal_amount) {//sells entire investment
                total_withdrawal_amount -= invest_value;
                investment.value = 0;

                //part I of f
                if (investment.taxStatus == "non-retirement") {
                    const purchase_price = list_of_purchase_price[investment.id]?.purchase_price ?? 0;
                    currentYearGain += (invest_value - purchase_price);

                    //reset purchase price to 0
                    if (list_of_purchase_price[investment.id]) {
                      list_of_purchase_price[investment.id].purchase_price = 0;
                    }
                }

                //part III of f
                if (investment.taxStatus === "pre-tax") {
                  currYearIncome += invest_value;
                }

                //part IV of f
                if ((investment.taxStatus === "pre-tax" || investment.taxStatus === "after-tax") && age < 59) {
                    early_withdrawal_total += invest_value;
                }
                
                
            } else {//sells part investment
                investment.value -= total_withdrawal_amount;
                    
                if (investment.taxStatus == "non-retirement") {
                    const purchase_price = list_of_purchase_price[investment.id]?.purchase_price ?? 0;
                    const fraction = total_withdrawal_amount / invest_value;
                    currentYearGain += fraction * (invest_value - purchase_price);


                    //reset purchase price 
                    if (list_of_purchase_price[investment.id]) {
                      list_of_purchase_price[investment.id].purchase_price = (1-fraction)*purchase_price;
                    }
                }

                if (investment.taxStatus === "pre-tax") {
                  currYearIncome += total_withdrawal_amount;
                }

                if ((investment.taxStatus === "pre-tax" || investment.taxStatus === "after-tax") && age < 59) {
                    early_withdrawal_total += total_withdrawal_amount;
                }


                total_withdrawal_amount = 0;
            }
            currentYearEarlyWithdrawal += early_withdrawal_total;
            if (total_withdrawal_amount === 0) break;
        }
    }
    return [currYearIncome, currentYearGain, currentYearEarlyWithdrawal, total_payment_amount, federal_tax, state_tax];
}







//
//
//
// Helper function for part7

export function payDiscretionary(
    financialplan: IFinancialPlan,
    total_asset: number,
    currYearIncome: number,
    currentYearGain: number,
    currentYearEarlyWithdrawal: number,
    currentAge: number,
    year: number,
    startingYear: number,
    list_of_purchase_price: Record<string, purchasePrice>,
  ): number[] {
    const all_events = financialplan.eventSeries ?? [];
    const spending_strategy = financialplan.spendingStrategy ?? [];

    // output 
    let total_cost_paid = 0;
    let total_disc_cost = 0;

    let total_event_cost = 0;
    const events = [];
    const age = currentAge + year;

    //finds all the discretionary events and store it in events
    for (const event_id of spending_strategy) { 
      const event = all_events.find(e => e.name === event_id);
      if (event && event.discretionary && event.start.value && event.duration.value && 
        startingYear + year > event.start.value && startingYear + year < startingYear + event.duration.value){ // check
        events.push(event);
      }
    }
  
    //event are the discrentionary events
    for (const event of events) {
      // Calculates the total cost of the event
      const cost = event.initialAmount ?? 0;
      const dist = event.changeDistribution;
  
      // Check if change disttribution is defined
      if (dist) {
        const dist_type = dist.type;
        let change;
        if (dist_type === "fixed") {
          change = dist.value;
        } else if (dist_type === "normal") {
            change = generateNormal(dist.mean ?? 0, dist.stdev ?? 0);
        } else if (dist_type === "uniform") {
            change = generateUniform(dist.lower ?? 0, dist.upper ?? 0);
        }
        change = change ?? 0;
        if (event.changeAmtOrPct === 'percent') {
          total_event_cost += cost * (1 + change);
        } else {
          total_event_cost += cost + change;
        }
      } else {
        total_event_cost += cost;
      }
  
      // If the event will reduce user asset to below financial goal, stop paying
      if (total_asset - total_event_cost < financialplan.financialGoal) {
        console.log("could not afford");
        break;
      }
  
      //check for inflation
      if(event.inflationAdjusted == true){
        if(financialplan.inflationAssumption.type === 'fixed'){
          total_event_cost = total_event_cost * (1+(financialplan.inflationAssumption.value ?? 0));
        }else if(financialplan.inflationAssumption.type === 'normal'){
          total_event_cost = total_event_cost * (1+(generateNormal(financialplan.inflationAssumption.mean ?? 0, financialplan.inflationAssumption.stdev ?? 0)));
        }else if(financialplan.inflationAssumption.type === 'uniform'){
          total_event_cost = total_event_cost * (1+(generateUniform(financialplan.inflationAssumption.lower ?? 0, financialplan.inflationAssumption.upper ?? 0)));
        }
      }

      //check for userfraction
      total_event_cost = total_event_cost * (event.userFraction ?? 0);
      total_disc_cost += total_event_cost;

      //check if cash exist
      const cash_investment = (financialplan.investments || []).find((i: any) => i.investmentType === "cash");
      if (cash_investment){
        const paid_with_cash = total_event_cost - (cash_investment.value);
        if (paid_with_cash <= 0){ //this means we have enough cash to pay for event
          cash_investment.value -= total_event_cost;
          total_cost_paid += total_event_cost;
          continue; //if we have enough cash, pay for discretionary event and move to next event
        }else{
          total_cost_paid += total_event_cost;
          cash_investment.value -= total_event_cost;
        }
      }

      //if we dont have enough cash we remove from investements
      const all_investments = financialplan.investments ?? [];
      const withdrawal_strategy = financialplan.expenseWithdrawalStrategy ?? [];
  
      let early_withdrawal_total = 0;
      if (total_event_cost >= 0) {
        for (const invest_id of withdrawal_strategy) {
          const investment = all_investments.find(inv => inv.id === invest_id);
          if (!investment) continue;
  
          const invest_value = investment.value ?? 0;
  
          if (invest_value <= total_event_cost) {
            // Sells entire investment
            total_event_cost -= invest_value;
            total_cost_paid += invest_value;
            investment.value = 0;
  
            if (investment.taxStatus == "non-retirement") {
              const purchase_price = list_of_purchase_price[investment.id]?.purchase_price ?? 0;
              currentYearGain += (invest_value - purchase_price);

              if (list_of_purchase_price[investment.id]) {
                list_of_purchase_price[investment.id].purchase_price = 0;
              }
            }

            if (investment.taxStatus === "pre-tax") {
              currYearIncome += invest_value;
            }

            if ((investment.taxStatus === "pre-tax" || investment.taxStatus === "after-tax") && age < 59) {
                early_withdrawal_total += invest_value;
            }
          } else {
            // Sells part of investment
            investment.value -= total_event_cost;
            
            if (investment.taxStatus == "non-retirement") {
              const purchase_price = list_of_purchase_price[investment.id]?.purchase_price ?? 0;
              const fraction = total_event_cost / invest_value;
              currentYearGain += fraction * (invest_value - purchase_price);


              //reset purchase price 
              if (list_of_purchase_price[investment.id]) {
                list_of_purchase_price[investment.id].purchase_price = (1-fraction)*purchase_price;
              }
            }

            if (investment.taxStatus === "pre-tax") {
              currYearIncome += total_event_cost;
            }

            if ((investment.taxStatus === "pre-tax" || investment.taxStatus === "after-tax") && age < 59) {
                early_withdrawal_total += total_event_cost;
            }
            
            total_cost_paid += total_event_cost;
            total_event_cost = 0;
          }
            
          if (total_event_cost === 0) {
            break;
          }

        }
      }
    }
    const percentage = Number.isNaN(total_cost_paid/total_disc_cost) ? 0 : total_cost_paid/total_disc_cost;
    //console.log(percentage);
    return [currYearIncome, currentYearGain, currentYearEarlyWithdrawal, percentage ];
  }








//
///
///
///
///Helper function for part 8
export function runInvestEvents(financialplan: IFinancialPlan, glidePathValue: boolean, list_of_purchase_price: Record<string, purchasePrice>): void {
    let total_cash =
      financialplan.investments.find((inv) => inv.id === "cash")?.value || 0;
  
    const my_investment = financialplan.eventSeries.filter((inv) => inv.type === "invest");
    console.log("type: ",my_investment)
  
    //stores all investment with type 'invest' in my_investment
    for (const investments of my_investment) {

      //calculate total cash fot investment
      const excess_cash = investments.maxCash ?? 0;
      const invest_amount = total_cash - excess_cash;
  
      //gets all the investments
      const all_investment = financialplan.investments;
      if (invest_amount <= 0) {
        console.log("No excess cash. abort investing");
        return;
      }
  
      //store the list of assetAllocations in allocationList
      //item is used to calculate B and L
      const item: [string, number, string][] = [];
      let allocationList: { [key: string]: number } = {};
      if (investments.glidePath) {
        allocationList = glidePathValue
          ? investments.assetAllocation || {}
          : investments.assetAllocation2 || {};
      } else {
        allocationList = investments.assetAllocation || {};
      }
      console.log("items: ",item);
      console.log("list: ",allocationList);
      
      for (const [name, percentage] of Object.entries(allocationList)) {
        const total = percentage * invest_amount;
        const each_investment = financialplan.investments.find((inv) => inv.id === name);
        const tax_status = each_investment?.taxStatus || "unknown";
        item.push([name, total, tax_status]);
      }
  
      //total amount of after-tax investments
      let B_total_purchase = 0;
      for (const e of item) {
        if (e[2] === "after-tax") {
          B_total_purchase += e[1];
        }
      }
  
      //contribution limit
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
  
      //subtract cash from cash account
      const cash_invest = financialplan.investments.find((inv) => inv.id === 'cash');
      if (cash_invest){
        cash_invest.value -= L_contributionLimit;
      }

      //buys investment
      for (const investment of item) {
        console.log("each investment: ",investment);
        const buy_investment = all_investment.find(
          (inv) => inv.id === investment[0] && inv.taxStatus === investment[2]
        );
        if (buy_investment) {
          buy_investment.value += investment[1];
          console.log("buying investment");
          //update the purchase price
          if (list_of_purchase_price[buy_investment.id]) {
            list_of_purchase_price[buy_investment.id].purchase_price += investment[1];
          }
        }
      }
  
      // console.log("array: ", item);
      // console.log(all_investment);
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
    captialGainTaxBracket: any [],
    list_of_purchase_price: Record<string, purchasePrice>
    
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

          //update the purchase price
          if (list_of_purchase_price[investment.id]) {
            list_of_purchase_price[investment.id].purchase_price += diff;
          }
        } else if (targetValue < currentValue) {
          const diff = currentValue - targetValue;
          investment.value -= diff;
          
          //update the purchase price
          if (list_of_purchase_price[investment.id]) {
            list_of_purchase_price[investment.id].purchase_price -= diff;
          }

          if (investment.taxStatus === "non-retirement") {
            currentYearGain += getCapitalGainTaxRate(diff, marriedStatus,captialGainTaxBracket) ?? 0;
          }
        }
      }
    }
  
    return currentYearGain;
  }