import FinancialPlan from "../models/FinancialPlan";
import Simulation from "../models/Simulation";
import SimulationResult from "../models/SimulationResult";
import { writeLog } from "./logHelper";
import * as path from 'path';
import { Worker } from 'worker_threads';
import { calculateInvestmentValue, calculateRMD, calculateRMD_Investment, computeMeanAndMedian, generateFromDistribution, generateRange, getCash, getLifeEventsByType, getTotalAssetValue, getValueOfExpenses, getValueOfInvestments, hashIntoTotal, payDiscretionary, payNonDiscretionary, performRothOptimizer, probabilityOfSuccess, runInvestEvents, runRebalance, standardizeTimeRangesForEventSeries, updateCapitalGainTaxForFlatInflation, updateCapitalGainTaxForNormalDistributionInflation, updateCapitalGainTaxForUniformDistributionInflation, updateFederalTaxForFlatInflation, updateFederalTaxForNormalDistributionInflation, updateFederalTaxForUniformDistributionInflation, updateIncomeEvents, updateStandardDeductionForInflation, updateStandardDeductionNormalDistributionInflation, updateStandardDeductionUniformDistributionInflation, updateStateTaxForInflation } from "./simulationHelpers";

// new function that uses console.log with typed rest parameters
const createLog = (username: string, ...args: unknown[]): void => {
    const logInfo = args.map(arg =>
      typeof arg === 'string' ? arg : JSON.stringify(arg)
    ).join(' ') + '\n';
    writeLog(username, logInfo, "log");
    // console.log.apply(console, args); // Optionally keep original logging
  };

// Main Functions for making the simulation

// Create Simulation object using Financial Plan object
export const createSimulation = async (req: any, res: any) => {
    try {
        // Get specific financial plan to simulate
        const { username, id } = req.body;
        const plan = await FinancialPlan.findById(id);

        if (!plan) {
            return res.status(404).json({ error: 'Financial plan not found' });
        }

        // Create simulation
        const simulation = new Simulation({ planId: id });
        const result = new SimulationResult({ 
            simulationId: simulation._id,
            inflationAssumption: plan.inflationAssumption,
            financialGoal: plan.financialGoal
        });
        simulation.resultsId = result._id.toString();
        
        await simulation.save();
        await result.save();

        writeLog(username, "started running/queued simulation", "csv");

        // async queue (not implemented) -> simulation algorithm (do not await)
        //runSimulation(req, res);
        const worker = new Worker(path.resolve(__dirname, './simulationWorker.ts'), {
            workerData: {
                reqData: {
                    body: {
                        username: username,
                        id: id
                    }
                }
            }
        });


        // return OK signal
        return res.status(200).json({
            status: "OK",
            error: false,
            message: "Simulation in queue.",
            simulationId: simulation._id, 
            resultId: result._id
        });
    }
    catch (error) {
        return res.status(200).json({
            status: "ERROR",
            error: true,
            message: "Simulation failed to be added.",
        });
    }
};

// Oversee Simulation algorithm and configure SimulationResult
export const runSimulation = async (req: any, res: any) => {
    // Get financial plan, simulation & create simulationResult
    const { state_tax_file, username, id, simulations } = req.body;
    
    try {
        let plan = await FinancialPlan.findById(id);
        const simulation = await Simulation.findOne({ planId : id });
        const result = await SimulationResult.findById(simulation?.resultsId);

        // Storage for all simulation raw values
        const totalInvestmentsOverTime: number[][][] = [];  // individual items for range
        const totalIncomeOverTime: number[][][] = [];       // individual items for range
        const totalExpensesOverTime: number[][][] = [];     // individual items for range & total expenses
        const totalEarlyWithdrawalTax: number[][] = [];  // value
        const totalPercentageTotalDiscretionary: number[][] = [];// value
        const totalYealyIncome: number[][] = []; // value -> currYearIncome
        const totalYearlyExpenses: number[][] = []; // value -> total expenses total
        // Check if everything is there
        if (!plan || ! simulation || ! result) {
            createLog(username, 'Items not found.');
            return res.status(404).json({ error: 'Items not found.' });
        }

        // 1,000–10,000 simulations → good starting range
        const num_simulations = simulations || 1000;
        const spouse = plan.maritalStatus == "couple"; // boolean
        const startingYear = new Date().getFullYear();
        const age = startingYear - plan.birthYears[0];

        // inside simulations (loop by simulation)
        for (let simulations = 0; simulations < num_simulations; simulations++) {
            // Storage for total yearly raw values
            const InvestmentsOverTime: number[][] = [];
            const IncomeOverTime: number[][] = [];
            const ExpensesOverTime: number[][] = [];

            const earlyWithdrawalTax: number[] = [];
            const percentageTotalDiscretionary: number[] = [];
            const yearlyIncome: number[] = [];
            const yearlyExpenses: number[] = [];

            // Preliminary generation of values
            let previousYearIncome = 0;
            let previousYearSocialSecurityIncome = 0;
            let previousYearGain = 0;
            let previousYearEarlyWithdrawals = 0;
            let currentYearGain = 0;
            let currentYearEarlyWithdrawal = 0;
            let glidePathValue = true;
            

            // get number of loops (start -> user's death)
            const lifeExpectancy = generateFromDistribution(plan.lifeExpectancy[0]);
            if(!lifeExpectancy){
                createLog(username, "User Life expectancy not found.");
                return res.status(200).json({
                    status: "ERROR",
                    error: true,
                    message: "Life expectancy not found.",
                });
            }

            // const num_years = 1;
            const num_years = lifeExpectancy - age;
            // get specified spouse year of death if spouse exists
            let spouseExpectancy: number | undefined;
            let spouseYears: number | undefined;
            if(spouse){
                spouseExpectancy = generateFromDistribution(plan.lifeExpectancy[1]);
                if(spouseExpectancy){
                    spouseYears = spouseExpectancy - (startingYear - plan.birthYears[1]);
                }
            }
            
            // fix all start & duration attribute of Events
            plan.eventSeries = standardizeTimeRangesForEventSeries(plan.eventSeries);

            // Simulate (loop by year, starts in the current year)
            // get exact year using startingYear+year
            for(let year = 0; year < num_years; year++){
                createLog(username, "year", startingYear+year);
                // 1. preliminary
                let curYearExpenses = 0;
                let curYearIncome = 0;
                // true if spouse exists and is alive
                const spouseAlive = spouseYears !== undefined && spouseYears > year;

                // get this year's InflationAssumption
                const inflationRate = generateFromDistribution(plan.inflationAssumption);
                if(!inflationRate){
                    createLog(username, 'inflationRate not found.');
                    return res.status(404).json({ error: 'inflationRate not found.' });
                }
                // inflate tax brackets
                let federal_tax_bracket;
                let capital_tax_bracket;
                let standard_deduction_bracket;
                let state_tax_bracket;
                // update state tax
                state_tax_bracket = updateStateTaxForInflation(state_tax_file, inflationRate, plan.residenceState);
                switch (plan.inflationAssumption.type) {
                    case "fixed":
                        if(plan.inflationAssumption.value){
                            const value = plan.inflationAssumption.value;
                            federal_tax_bracket = await updateFederalTaxForFlatInflation(value);
                            capital_tax_bracket = await updateCapitalGainTaxForFlatInflation(value);
                            standard_deduction_bracket = await updateStandardDeductionForInflation(value);
                        }
                    case "normal":
                        if(plan.inflationAssumption.stdev && plan.inflationAssumption.mean){
                            const stdev = plan.inflationAssumption.stdev;
                            const mean = plan.inflationAssumption.mean;
                            federal_tax_bracket = await updateFederalTaxForNormalDistributionInflation(mean, stdev);
                            capital_tax_bracket = await updateCapitalGainTaxForNormalDistributionInflation(mean, stdev);
                            standard_deduction_bracket = await updateStandardDeductionNormalDistributionInflation(mean, stdev);
                        }   
                    case "uniform":
                        if(plan.inflationAssumption.lower && plan.inflationAssumption.upper){
                            const lower = plan.inflationAssumption.lower;
                            const upper = plan.inflationAssumption.upper;
                            federal_tax_bracket = await updateFederalTaxForUniformDistributionInflation(lower, upper);
                            capital_tax_bracket = await updateCapitalGainTaxForUniformDistributionInflation(lower, upper);
                            standard_deduction_bracket = await updateStandardDeductionUniformDistributionInflation(lower, upper);
                        }
                }
                if(!federal_tax_bracket || !capital_tax_bracket || !standard_deduction_bracket || !state_tax_bracket){
                    createLog(username, "ERROR, Brackets did not update correctly.")
                    return res.status(404).json({ error: '"ERROR, Brackets did not update correctly.' });
                }
                // compute & store inflation-adjusted annual limits on retirement account contributions
                if(plan.afterTaxContributionLimit){
                    plan.afterTaxContributionLimit *= (1 + inflationRate);
                }
                writeLog(username, "Finished updating Preliminary values", "log");
                
                // 2. run all income events
                const cash = getCash(plan.investments);
                createLog(username, "b4 2, cash:", cash, "\nincome events:",getLifeEventsByType(plan.eventSeries, "income"));
                // retrieve previous year income and updates the incomeEvents after
                let [incomeEvents, socialSecurity] = updateIncomeEvents(plan.eventSeries, inflationRate, spouseAlive);
                // Add the total income to the cash investment
                IncomeOverTime.push(incomeEvents);
                curYearIncome += incomeEvents.reduce((sum: number, val: number) => sum + val, 0);
                cash.value += curYearIncome;

                createLog(username, "after 2, cash:", cash, "\nsocial security", socialSecurity,"\nincome events:",getLifeEventsByType(plan.eventSeries, "income"));
                writeLog(username, "Ran all income events", "log");

                // 3. perform RMD for last year if simulated age == 74
                if(age+year >= 74){
                    createLog(username, "b4 3, investments:", plan.investments);
                    const rmd = await calculateRMD(plan, age + year, curYearIncome);
                    if ( rmd == -1 ){
                        createLog(username, "Error in calculateRMD()");
                        return res.status(404).json({ error: 'Error in calculateRMD()' });
                    }
                    calculateRMD_Investment(plan, rmd);
                    createLog(username, "after 3, investments:", plan.investments);
                    writeLog(username, "performed RMD for last year", "log");
                }

                // 4. Update investments, expected annual return, reinvestment of income, then expenses.
                createLog(username, `b4 4, investments: ${plan.investments}, curYearIncome: ${curYearIncome}`);
                // return [currentYearIncome, taxable_income, non_taxable_income];
                const incomes = calculateInvestmentValue(plan, curYearIncome);
                curYearIncome = incomes[0];
                const taxable_income = incomes[1];
                const non_taxable_income = incomes[2];
                curYearExpenses += incomes[3];
                createLog(username, `after 4, investments: ${plan.investments}, curYearIncome: ${curYearIncome}, taxable_income ${taxable_income}, non_taxable_income: ${non_taxable_income}`);
                writeLog(username, "Updated value of investments", "log");

                // 5. Run the Roth conversion (RC) optimizer, if it is enabled.
                const status = spouseAlive ? "married" : "single";
                if (plan.RothConversionOpt == true && startingYear+year >= plan.RothConversionStart && startingYear+year < plan.RothConversionEnd){
                    createLog(username, `b4 5, curYearIncome: ${curYearIncome}, socialSecurity: ${socialSecurity}, investments ${plan.investments}`);
                    curYearIncome = performRothOptimizer(plan, curYearIncome, socialSecurity, status, federal_tax_bracket, standard_deduction_bracket);
                    createLog(username, `after 5, curYearIncome: ${curYearIncome}, investments ${plan.investments}`);
                    writeLog(username, "Ran the Roth conversion (RC) optimizer", "log");
                }
                
                // // 6. Pay non-discretionary expenses and the previous year’s taxes (Pre-tax -> +curYearIncome)
                createLog(username, `b4 6, currentYearGain: ${currentYearGain}, currentYearEarlyWithdrawal: ${currentYearEarlyWithdrawal}, `);
                const vals = payNonDiscretionary(plan, previousYearIncome, previousYearSocialSecurityIncome, status, plan.residenceState, 
                    previousYearGain, previousYearEarlyWithdrawals, age, year, startingYear, curYearIncome, currentYearGain, currentYearEarlyWithdrawal,
                    standard_deduction_bracket, federal_tax_bracket, capital_tax_bracket, state_tax_bracket);
                // TODO - add federal & state tax
                curYearIncome = vals[0];
                currentYearGain = vals[1];
                currentYearEarlyWithdrawal = vals[2];
                curYearExpenses += vals[3];
                let federal_tax = vals[4];
                let state_tax = vals[5]
                createLog(username, `after 6, currentYearGain: ${currentYearGain}, currentYearEarlyWithdrawal: ${currentYearEarlyWithdrawal}, `);

                // writeLog(username, "Paid non-discretionary expenses and the previous year’s taxes ", "log");
                
                // // 7. Pay discretionary expenses in the order given by the spending strategy (Pre-tax -> +curYearIncome)
                const total_asset = getTotalAssetValue(plan.investments);
                // currYearIncome, currentYearGain, currentYearEarlyWithdrawal
                const vals2 = payDiscretionary(plan, total_asset, curYearIncome, currentYearGain, currentYearEarlyWithdrawal, age, year, startingYear);
                // TODO - OUTPUT expense output didn't add taxes
                curYearIncome = vals2[0];
                currentYearGain = vals2[1];
                currentYearEarlyWithdrawal = vals2[2];
                percentageTotalDiscretionary.push(vals2[3]);
                writeLog(username, "Paid discretionary expenses", "log");

                // // 8. Run the invest events scheduled for the current year
                createLog(username, `b4 8, investments: ${plan.investments}`);
                runInvestEvents(plan, glidePathValue);
                createLog(username, `after 8, investments: ${plan.investments}`);
                glidePathValue = !glidePathValue;
                
                
                // writeLog(username, "Ran the invest events", "log");

                // // 9. Run rebalance events scheduled for the current year
                createLog(username, `b4 9, currentYearGain: ${currentYearGain}, investments: ${plan.investments}`);
                currentYearGain = runRebalance(plan, currentYearGain, status, capital_tax_bracket);
                createLog(username, `after 9, currentYearGain: ${currentYearGain}, investments: ${plan.investments}`);

                // writeLog(username, "Ran rebalance events", "log");
                
                // investments
                InvestmentsOverTime.push(getValueOfInvestments(plan.investments));
                // incomes alr pushed
                // total income
                yearlyIncome.push(curYearIncome);
                // expenses + taxes
                const expenseItems = getValueOfExpenses(plan.eventSeries, year, startingYear)
                expenseItems.push(federal_tax);
                expenseItems.push(state_tax);
                expenseItems.push(currentYearGain);
                expenseItems.push(currentYearEarlyWithdrawal);
                ExpensesOverTime.push(expenseItems);
                // total expenses
                yearlyExpenses.push(curYearExpenses);
                // early withdraw tax
                earlyWithdrawalTax.push(currentYearEarlyWithdrawal);
                // percentageTotalDiscretionary alr pushed

                // Update between years, change curr to previous, curr to 0 
                previousYearIncome = curYearIncome;
                previousYearSocialSecurityIncome = socialSecurity;
                previousYearGain = currentYearGain;
                previousYearEarlyWithdrawals = currentYearEarlyWithdrawal;
                currentYearGain = 0;
                currentYearEarlyWithdrawal = 0;
            }
            // reset financial plan
            plan = await FinancialPlan.findById(id);
            if (!plan) {
                return res.status(404).json({ error: 'Financial Plan not found.' });
            }

            // OUTPUT - hash simulation raw values into total arrays
            hashIntoTotal(totalInvestmentsOverTime, InvestmentsOverTime);
            hashIntoTotal(totalIncomeOverTime, IncomeOverTime);
            hashIntoTotal(totalYealyIncome, yearlyIncome);
            hashIntoTotal(totalExpensesOverTime, ExpensesOverTime);
            hashIntoTotal(totalYearlyExpenses, yearlyExpenses);
            hashIntoTotal(totalEarlyWithdrawalTax, earlyWithdrawalTax);
            hashIntoTotal(totalPercentageTotalDiscretionary, percentageTotalDiscretionary);
        }
        // OUTPUT - compute the raw values into simulationResult (4.1 probability of success, 4.2 range and 4.3 mean/median values)
        // 4.1 probability of success
        result.probabilityOverTime = probabilityOfSuccess(plan.financialGoal, totalInvestmentsOverTime);
        // 4.2 range
        result.financialGoal = plan.financialGoal;
        result.investmentOrder = plan.investments.map(investments => investments.id);
        result.investmentsRange = generateRange(totalInvestmentsOverTime);
        result.incomeRange = generateRange(totalYealyIncome);
        result.expensesRange = generateRange(totalYearlyExpenses);
        result.earlyWithdrawTaxRange = generateRange(totalEarlyWithdrawalTax);
        result.percentageDiscretionaryRange = generateRange(totalPercentageTotalDiscretionary);
        // 4.3 mean + median values (Generate mean/median of items for each year, TODO - incomplete)
        const investmentOverTimeVals = computeMeanAndMedian(totalInvestmentsOverTime);
        result.medianInvestmentsOverTime = investmentOverTimeVals.medians;
        result.avgInvestmentsOverTime = investmentOverTimeVals.means;
        result.investmentOrder = plan.investments.map(investments => investments.id);
        
        const incomeOverTimeVals = computeMeanAndMedian(totalIncomeOverTime);
        result.medianIncomeOverTime = incomeOverTimeVals.medians;
        result.avgIncomeOverTime = incomeOverTimeVals.means;
        result.incomeOrder = getLifeEventsByType(plan.eventSeries,"income").map(events => events.name);
        
        const expensesOverTimeVals = computeMeanAndMedian(totalExpensesOverTime);
        result.medianExpensesOverTime = expensesOverTimeVals.medians;
        result.avgExpensesOverTime = expensesOverTimeVals.means;
        // expenses -> taxes ([federal income, state income, capital gains, early withdrawal tax])
        // let taxOrder: string[] = []; // disable taxes (before completion)
        let taxOrder: string[] = ["federal income tax", "state income tax", "capital gains tax", "early withdrawal tax"];
        result.expensesOrder = getLifeEventsByType(plan.eventSeries,"expense").map(events => events.name);
        result.expensesOrder.push(...taxOrder);
        
        await result.save();

    }
    catch (error) {
        createLog(username, error);
        res.status(200).json({
            status: "ERROR",
            error: true,
            message: "Simulation failed.",
        });
    }
};