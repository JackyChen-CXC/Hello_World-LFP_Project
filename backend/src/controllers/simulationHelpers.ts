import { IDistribution } from "../models/Distribution";
import { IInvestment, ILifeEvent, IFinancialPlan } from "../models/FinancialPlan";
import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

// Helper Functions

export function getLifeEventsByType(events: ILifeEvent[], type: ILifeEvent["type"]): ILifeEvent[] {
    return events.filter(event => event.type === type);
}

export function getCash(investments: IInvestment[]): IInvestment {
    return investments.filter(investments => investments.id === "cash")[0];
}

// Return a number given Distribution types: "fixed" | "normal" | "uniform"
export function generateFromDistribution(dist: IDistribution): number | undefined {
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
export async function calculateStandardDeduction(income: number, marriedStatus: string): Promise<number | void> {
    const currentYear = new Date().getFullYear();
    const collectionName = `standard_deduction_${currentYear}`;
    const db = getDB();
    const collection = db.collection(collectionName);

    if (marriedStatus === "single") {
        const singleDoc = await collection.findOne({ single: { $exists: true } });
        const singleRate = singleDoc?.single;

        if (typeof singleRate === "number") {
            const result = income - singleRate;
            return result >= 0 ? result : 0;
        }
    } else if (marriedStatus === "married") {
        const marriedDoc = await collection.findOne({ married: { $exists: true } });
        const marriedRate = marriedDoc?.married;

        if (typeof marriedRate === "number") {
            const result = income - marriedRate;
            return result >= 0 ? result : 0;
        }
    } else {
        console.error("Error: invalid married status");
    }
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

    const noTaxStates = ["alaska", "florida", "nevada", "south_dakota", "tennessee", "texas", "wyoming"];
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
            if (normalizedState === "new_york") {
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
export async function calculateCapitalGainTax(income: number, marriedStatus: string): Promise<number | undefined> {
    const currentYear = new Date().getFullYear();
    const collectionName = `captial_gain_tax_${currentYear}`;
    const db = getDB();
    const collection = db.collection(collectionName);

    try {
        const items = await collection.find({ status: marriedStatus }).toArray();

        for (const item of items) {
            const minVal = item.min ?? -Infinity;
            let maxVal = item.max ?? Infinity;

            if (minVal <= income && income <= maxVal) {
                return item.rate * income;
            }
        }
    } catch (err) {
        console.error("Error accessing capital gain tax data:", err);
    }
}




///
///
///
///federal tax
export async function calculateFederalTax(income: number, marriedStatus: string): Promise<number | undefined> {
    const currentYear = new Date().getFullYear();
    const collectionName = `federal_tax_${currentYear}`;
    const db = getDB();
    const collection = db.collection(collectionName);

    try {
        const query = { [marriedStatus]: true };
        const items = await collection.find(query).toArray();

        for (const item of items) {
            const minVal = item.min_value ?? -Infinity;
            let maxVal = item.max_value ?? Infinity;

            if (minVal <= income && income <= maxVal) {
                return item.tax_rate * income;
            }
        }
    } catch (err) {
        console.error("Error calculating federal tax:", err);
    }
}




//
//
//
//federal tax flat inflation
export async function updateFederalTaxForFlatInflation(inflationRate: number): Promise<void> {
    const db = getDB();
    inflationRate += 1;

    const currentYear = new Date().getFullYear();
    const collectionName = `federal_tax_${currentYear}`;
    const federalTax = db.collection(collectionName);
    const inflationDb = db.collection("inflation_federal_tax");

    try {
        await inflationDb.deleteMany({});
        const documents = await federalTax.find().toArray();

        for (const doc of documents) {
            const tax = doc.tax_rate;
            const minVal = doc.min_value;
            const maxVal = doc.max_value;
            const single = doc.single;
            const married = doc.married;

            if (tax === undefined || minVal === undefined) {
                continue;
            }

            const data: Record<string, any> = {
                min_value: minVal * inflationRate,
                tax_rate: tax,
                single,
                married
            };

            if (maxVal !== undefined && maxVal !== null) {
                data.max_value = maxVal * inflationRate;
            } else {
                data.max_value = null;
            }

            await inflationDb.insertOne(data);
        }
    } catch (err) {
        console.error("Error updating federal tax with inflation:", err);
    }
}




//
//
//
//federal tax normal distribution inflation
export async function updateFederalTaxForNormalDistributionInflation(mean: number, std: number): Promise<void> {
    const db = getDB();
    const currentYear = new Date().getFullYear();
    const collectionName = `federal_tax_${currentYear}`;
    const federalTax = db.collection(collectionName);
    const inflationDb = db.collection("inflation_federal_tax");

    try {
        // Clear previous inflation-adjusted tax data
        await inflationDb.deleteMany({});
        
        // Get all tax brackets
        const documents = await federalTax.find().toArray();

        // Generate one sample from normal distribution
        const inflation = generateNormal(mean, std);

        for (const doc of documents) {
            const tax = doc.tax_rate;
            const minVal = doc.min_value;
            const maxVal = doc.max_value;
            const single = doc.single;
            const married = doc.married;

            if (tax === undefined || minVal === undefined) {
                continue;
            }

            const inflationFactor = 1 + inflation;

            const data: Record<string, any> = {
                min_value: minVal * inflationFactor,
                tax_rate: tax,
                single,
                married
            };

            if (maxVal !== undefined && maxVal !== null) {
                data.max_value = maxVal * inflationFactor;
            } else {
                data.max_value = null;
            }

            await inflationDb.insertOne(data);
        }
    } catch (err) {
        console.error("Error updating federal tax with normal distribution inflation:", err);
    }
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
export async function updateFederalTaxForUniformDistributionInflation(bot: number, top: number): Promise<void> {
    const db = getDB();
    const currentYear = new Date().getFullYear();
    const collectionName = `federal_tax_${currentYear}`;
    const federalTax = db.collection(collectionName);
    const inflationDb = db.collection("inflation_federal_tax");

    try {
        await inflationDb.deleteMany({});
        const documents = await federalTax.find().toArray();

        // Generate a single uniform random inflation value
        const inflation = generateUniform(bot, top);

        for (const doc of documents) {
            const tax = doc.tax_rate;
            const minVal = doc.min_value;
            const maxVal = doc.max_value;
            const single = doc.single;
            const married = doc.married;

            if (tax === undefined || minVal === undefined) {
                continue;
            }

            const inflationFactor = 1 + inflation;

            const data: Record<string, any> = {
                min_value: minVal * inflationFactor,
                tax_rate: tax,
                single,
                married
            };

            if (maxVal !== undefined && maxVal !== null) {
                data.max_value = maxVal * inflationFactor;
            } else {
                data.max_value = null;
            }

            await inflationDb.insertOne(data);
        }
    } catch (err) {
        console.error("Error updating federal tax with uniform distribution inflation:", err);
    }
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
export async function updateCapitalGainTaxForFlatInflation(inflationRate: number): Promise<void> {
    const inflationFactor = inflationRate + 1;
    const currentYear = new Date().getFullYear();
    const collectionName = `captial_gain_tax_${currentYear}`;
    const db = getDB(); 

    const federalTaxCollection = db.collection(collectionName);
    const inflationDb = db.collection("inflation_captial_gain_tax");

    try {
        // Clear the inflation collection
        await inflationDb.deleteMany({});

        // Fetch all documents from the federal tax collection
        const documents = await federalTaxCollection.find().toArray();

        for (const doc of documents) {
            const tax = doc?.rate;
            const minVal = doc?.min;
            const maxVal = doc?.max;
            const status = doc?.status;

            if (tax === undefined || minVal === undefined) {
                continue; // Skip if tax or min value is missing
            }

            const data = {
                min: minVal * inflationFactor,
                max: maxVal !== undefined ? maxVal * inflationFactor : null,
                rate: tax,
                status: status,
            };

            // Insert the modified data into the inflation collection
            await inflationDb.insertOne(data);
        }

        console.log("Capital Gain Tax data updated for flat inflation.");
    } catch (err) {
        console.error("Error updating Capital Gain Tax for flat inflation:", err);
    }
}



//
//
//
//captial gain normal distribtion
export async function updateCapitalGainTaxForNormalDistributionInflation(mean: number, std: number): Promise<void> {
    const currentYear = new Date().getFullYear();
    const collectionName = `captial_gain_tax_${currentYear}`;
    const db = getDB(); 

    const federalTaxCollection = db.collection(collectionName);
    const inflationDb = db.collection("inflation_captial_gain_tax");

    try {
        // Clear the inflation collection
        await inflationDb.deleteMany({});

        // Fetch all documents from the federal tax collection
        const documents = await federalTaxCollection.find().toArray();

        // Generate inflation rate using normal distribution
        const inflationRate = generateNormal(mean, std);

        for (const doc of documents) {
            const tax = doc?.rate;
            const minVal = doc?.min;
            const maxVal = doc?.max;
            const status = doc?.status;

            if (tax === undefined || minVal === undefined) {
                continue; // Skip if tax or min value is missing
            }

            const data = {
                min: minVal * (1 + inflationRate),
                max: maxVal !== undefined ? maxVal * (1 + inflationRate) : null,
                rate: tax,
                status: status,
            };

            // Insert the modified data into the inflation collection
            await inflationDb.insertOne(data);
        }

        console.log("Capital Gain Tax data updated for normal distribution inflation.");
    } catch (err) {
        console.error("Error updating Capital Gain Tax for normal distribution inflation:", err);
    }
}


//
//
//
//captial gain uniform distribution
export async function updateCapitalGainTaxForUniformDistributionInflation(bot: number, top: number): Promise<void> {
    const currentYear = new Date().getFullYear();
    const collectionName = `captial_gain_tax_${currentYear}`;
    const db = getDB(); 

    const federalTaxCollection = db.collection(collectionName);
    const inflationDb = db.collection("inflation_captial_gain_tax");

    try {
        // Clear the inflation collection
        await inflationDb.deleteMany({});

        // Fetch all documents from the federal tax collection
        const documents = await federalTaxCollection.find().toArray();

        // Generate inflation rate using uniform distribution
        const inflationRate = generateUniform(bot, top);

        for (const doc of documents) {
            const tax = doc?.rate;
            const minVal = doc?.min;
            const maxVal = doc?.max;
            const status = doc?.status;

            if (tax === undefined || minVal === undefined) {
                continue; // Skip if tax or min value is missing
            }

            const data = {
                min: minVal * (1 + inflationRate),
                max: maxVal !== undefined ? maxVal * (1 + inflationRate) : null,
                rate: tax,
                status: status,
            };

            // Insert the modified data into the inflation collection
            await inflationDb.insertOne(data);
        }

        console.log("Capital Gain Tax data updated for uniform distribution inflation.");
    } catch (err) {
        console.error("Error updating Capital Gain Tax for uniform distribution inflation:", err);
    }
}



//
//
//
//standard deduction for flat inflation
async function updateStandardDeductionForInflation(inflationRate: number) {
    const db = getDB();
    const currentYear = new Date().getFullYear();
    const collectionName = `standard_deduction_${currentYear}`;
    const federalTaxCollection = db.collection(collectionName);

    const inflationDb = db.collection('inflation_standard_deduction');
    await inflationDb.deleteMany({}); // delete all existing documents

    const document = await federalTaxCollection.find().toArray();

    document.forEach((doc) => {
        const single = doc.single;
        const married = doc.married;

        const data = {
            single: single * (1 + inflationRate),
            married: married * (1 + inflationRate),
        };

        inflationDb.insertOne(data);
    });
}


//
//
//
//standard deduction for normal distribution
export function updateStandardDeductionNormalDistributionInflation(mean: number, std: number) {
    const db = getDB();
    const currentYear = new Date().getFullYear();
    const collectionName = `standard_deduction_${currentYear}`;
    const federalTax = db.collection(collectionName);
    const inflationDb = db.collection("inflation_standard_deduction");

    inflationDb.deleteMany({});

    federalTax.find().toArray()
        .then(documents => {
            const inflationRate = generateNormal(mean, std);

            documents.forEach(doc => {
                const single = doc.single;
                const married = doc.married;

                const data = {
                    single: single * (1 + inflationRate),
                    married: married * (1 + inflationRate)
                };

                inflationDb.insertOne(data);
            });
        })
        .catch(err => {
            console.error("Error updating standard deduction for normal distribution inflation:", err);
        });
}


//
//
//
//standard deduction for uniform distribution
export function updateStandardDeductionUniformDistributionInflation(bot: number, top: number) {
    const db = getDB();
    const currentYear = new Date().getFullYear();
    const collectionName = `standard_deduction_${currentYear}`;
    const federalTax = db.collection(collectionName);
    const inflationDb = db.collection("inflation_standard_deduction");

    inflationDb.deleteMany({});

    federalTax.find().toArray()
        .then(documents => {
            const inflationRate = generateUniform(bot, top);

            documents.forEach(doc => {
                const single = doc.single;
                const married = doc.married;

                const data = {
                    single: single * (1 + inflationRate),
                    married: married * (1 + inflationRate)
                };

                inflationDb.insertOne(data);
            });
        })
        .catch(err => {
            console.error("Error updating standard deduction for uniform distribution inflation:", err);
        });
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
//
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
//
//roth optimizer
export async function performRothOptimizer(
    financialPlan: IFinancialPlan,
    currentYearIncome: number,
    currentYearSocialSecurityIncome: number,
    marriedStatus: "married" | "single"
  ): Promise<number> {
    const currentYear = new Date().getFullYear();
    const collectionName = `federal_tax_${currentYear}`;
    const db = getDB();
    const collection = db.collection(collectionName);
  
    const allInvestments = financialPlan.investments;
    const rothStrategy = financialPlan.RothConversionStrategy;
  
    const query = { [marriedStatus]: true };
    const items = await collection.find(query).toArray();
  
    let u = Infinity;
    for (const item of items) {
      const min = item.min_value ?? -Infinity;
      let max = item.max_value ?? Infinity;
  
      if (min <= currentYearIncome && currentYearIncome <= max) {
        u = max;
        break;
      }
    }
  
    const currentYearFedTaxableIncome = currentYearIncome - 0.15 * currentYearSocialSecurityIncome;
    let rc = u - currentYearFedTaxableIncome;
    currentYearIncome += rc;
  
    for (const investId of rothStrategy) {
      const investment = allInvestments.find(inv => inv.id === investId);
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
        inv => inv.investmentType === investment.investmentType && inv.taxStatus === "after-tax"
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