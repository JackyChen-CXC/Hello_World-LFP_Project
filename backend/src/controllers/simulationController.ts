import FinancialPlan from "../models/FinancialPlan";
import Simulation from "../models/Simulation";
import SimulationResult from "../models/SimulationResult";
import { writeLog, createLog } from "./logHelper";
import * as path from 'path';
import { Worker } from 'worker_threads';
import { fork } from 'child_process';
import { calculateInvestmentValue, calculateRMD, calculateRMD_Investment, computeMeanAndMedian, deepCopyDocument, enforceScenarioParameter, generateFromDistribution, generateOutput, generateRange, getCash, getLifeEventsByType, getTotalAssetValue, getValueOfExpenses, getValueOfInvestments, hashIntoTotal, payDiscretionary, payNonDiscretionary, performRothOptimizer, probabilityOfSuccess, runInvestEvents, runRebalance, standardizeTimeRangesForEventSeries, updateCapitalGainTaxForFlatInflation, updateCapitalGainTaxForNormalDistributionInflation, updateCapitalGainTaxForUniformDistributionInflation, updateFederalTaxForFlatInflation, updateFederalTaxForNormalDistributionInflation, updateFederalTaxForUniformDistributionInflation, updateIncomeEvents, updateScenarioParameter, updateStandardDeductionForInflation, updateStandardDeductionNormalDistributionInflation, updateStandardDeductionUniformDistributionInflation, updateStateTaxForInflation } from "./simulationHelpers";

// Main Functions for making the simulation

// simulationResult with a extra dimension for range so for example, [range] [year]
export interface simulationOutput{
    probabilityOverTime: number[][];
    financialGoal: number;
    investmentsRange: number[][][][];
    incomeRange: number[][][][];
    expensesRange: number[][][][];
    earlyWithdrawTaxRange: number[][][][];
    percentageDiscretionaryRange: number[][][][];
    investmentOrder: string[];
    avgInvestmentsOverTime: number[][][];
    medianInvestmentsOverTime: number[][][];
    incomeOrder: string[];
    avgIncomeOverTime: number[][][];
    medianIncomeOverTime: number[][][];
    expensesOrder: string[];
    avgExpensesOverTime: number[][][];
    medianExpensesOverTime: number[][][];
}

export interface scenarioExplorationParams{
    algorithmType: string,
    index: number,
    min: number,
    max: number,
    step: number,
    index2: number,
    min2: number,
    max2: number,
    step2: number,

    itemId?: string,
    itemType?: string,
    itemId2?: string,
    itemType2?: string,
}

// Create Simulation object using Financial Plan object
export const createSimulation = async (req: any, res: any) => {

    try {
        // algorithmType -> standard, 1d, 2d
        // itemType -> rothConversionOpt, start, duration, initalAmount, percentage
        // itemType2 -> start, duriation, initalAmount, percentage
        let { state_tax_file, username, id, simulations, algorithmType, itemType, itemId, min, max, step, itemType2, itemId2, min2, max2, step2} = req.body;

        // Get specific financial plan to simulate
        const plan = await FinancialPlan.findById(id);

        if (!plan) {
            return;
            // return res.status(404).json({ error: 'Financial plan not found' });
        }

        let simulation;
        let result;

        // Create simulation and simulationResult
        simulation = new Simulation({ planId: id });
        result = new SimulationResult({ 
            simulationId: simulation._id,
            inflationAssumption: plan.inflationAssumption,
            financialGoal: plan.financialGoal
        });
        simulation.resultsId = result._id.toString();

        if(algorithmType==="standard"){ // only save for standard simulation algorithm
            await simulation.save();
            await result.save();
        }

        writeLog(username, "started running/queued simulation", "csv");

        // set up Scenario Exploration Params
        let rangeIterator: scenarioExplorationParams;
        if( (algorithmType === "1d" || algorithmType === "2d") && itemType && itemId && min && max && step){
            console.log("scenario parameter 1 defined");
            if(algorithmType === "2d" && itemType2 && itemId2 && min2 && max2 && step2){
                console.log("scenario parameter 2 defined");
                rangeIterator = {
                    algorithmType: algorithmType,
                    index: min,
                    min: min,
                    max: max,
                    step: step,
                    itemId: itemId,
                    itemType: itemType,
                    index2: min2,
                    min2: min2,
                    max2: max2,
                    step2: step2,
                    itemId2: itemId2,
                    itemType2: itemType2,
                };
            } else{
                rangeIterator = {
                    algorithmType: algorithmType,
                    index: min,
                    min: min,
                    max: max,
                    step: step,
                    itemId: itemId,
                    itemType: itemType,
                    index2: 0,
                    min2: 0,
                    max2: 1,
                    step2: 1,
                };
            }
        } else{ // fix scenario parameter 1 && 2 to single run
            rangeIterator = {
                algorithmType: algorithmType,
                index: 0,
                min: 0,
                max: 1,
                step: 1,
                index2: 0,
                min2: 0,
                max2: 1,
                step2: 1,
            }
        }

        writeLog(username, "started running simulations", "csv");
        writeLog(username, "started running simulations", "log");

        // Storage for all simulations' raw values [range][year][simulations][number/[number of items]]
        const totalInvestmentsOverTime: number[][][][] = [];  // individual items for range
        const totalIncomeOverTime: number[][][][] = [];       // individual items for range
        const totalExpensesOverTime: number[][][][] = [];     // individual items for range & total expenses
        const totalEarlyWithdrawalTax: number[][][] = [];             // value
        const totalPercentageTotalDiscretionary: number[][][] = [];   // value
        const totalYealyIncome: number[][][] = [];            // value -> currYearIncome
        const totalYearlyExpenses: number[][][] = [];         // value -> total expenses total

        // const total_worker = 2;
        const total_worker = Math.min(require('os').cpus().length - 1, 4); // Use at most N-1 cores, max 4

        const simulation_per_worker = Math.floor(simulations/total_worker);
        const extra_simulation = simulations % total_worker;

        const workerPath = path.resolve(__dirname, 'simulationWorker.ts');

        let rangeIndex = 0;
        // iterate through scenario parameter 1
        while(rangeIterator.index < rangeIterator.max){
            // iterate through scenario parameter 2
            while(rangeIterator.index2 < rangeIterator.max2){
                // for each rangeIndex
                const workerPromises: Promise<any>[] = [];
                // pseudo-random number generator (PRNG)
                const baseSeed = 12345;

                for(let i = 0; i < total_worker; i++){
                    // initalize new nested arrays
                    totalInvestmentsOverTime[rangeIndex] = [];
                    totalIncomeOverTime[rangeIndex] = [];
                    totalExpensesOverTime[rangeIndex] = [];
                    totalEarlyWithdrawalTax[rangeIndex] = [];
                    totalPercentageTotalDiscretionary[rangeIndex] = [];
                    totalYealyIncome[rangeIndex] = [];
                    totalYearlyExpenses[rangeIndex] = [];

                    const numSimulations = simulation_per_worker + (i < extra_simulation ? 1 : 0);

                    const workerPromise = new Promise((resolve, reject) => {
                        const child = fork(workerPath, [], {
                            execArgv: ['-r', 'ts-node/register'],
                            env: { ...process.env },
                            stdio: 'inherit'
                        });

                        // Send data to child
                        child.send({
                            reqData: {
                                body: {
                                    state_tax_file,
                                    username,
                                    id,
                                    params: rangeIterator,
                                }
                            },
                            numSimulations: numSimulations,
                            workerId: i,
                            seed: baseSeed,
                        });

                        
                        child.on('message', (res: any) => {
                            const { success, message, data } = res;
                            
                            // Only process complete data from workers
                            if(success && data) {
                                // Process all simulations from this worker at once
                                for(let raw_vals of data){
                                    hashIntoTotal(totalInvestmentsOverTime, raw_vals.InvestmentsOverTime, rangeIndex);
                                    hashIntoTotal(totalIncomeOverTime, raw_vals.IncomeOverTime, rangeIndex);
                                    hashIntoTotal(totalExpensesOverTime, raw_vals.ExpensesOverTime, rangeIndex);
                                    hashIntoTotal(totalEarlyWithdrawalTax, raw_vals.earlyWithdrawalTax, rangeIndex);
                                    hashIntoTotal(totalPercentageTotalDiscretionary, raw_vals.percentageTotalDiscretionary, rangeIndex);
                                    hashIntoTotal(totalYealyIncome, raw_vals.yearlyIncome, rangeIndex);
                                    hashIntoTotal(totalYearlyExpenses, raw_vals.yearlyExpenses, rangeIndex);
                                }
                                
                                // This marks the worker as completely done
                                resolve(true);
                            }
                        });
                
                        child.on('error', (err) => {
                            console.error(`Worker ${i} error:`, err);
                            reject(err);
                        });

                        child.on('error', (err) => {
                            console.error(`Worker ${i} error:`, err);
                            reject(err);
                        });
                    });
                    workerPromises.push(workerPromise);
                }
                
                // wait for all to finish
                await Promise.all(workerPromises);

                console.log("Go up one step");

                // update plan based on parameter 2
                updateScenarioParameter(plan, rangeIterator, 2);
                rangeIndex++;
            }
            // update plan based on parameter 1
            rangeIterator.index = min;
            updateScenarioParameter(plan, rangeIterator, 1);
        }
        // OUTPUT - compute the raw values into output type (4.1 probability of success, 4.2 range and 4.3 mean/median values)
        const output = generateOutput();
        // 4.1 probability of success
        output.probabilityOverTime = totalInvestmentsOverTime.map(range => probabilityOfSuccess(plan.financialGoal, range));
        // 4.2 range
        output.financialGoal = plan.financialGoal;
        output.investmentsRange = totalInvestmentsOverTime.map(range => generateRange(range));
        output.incomeRange = totalYealyIncome.map(range => generateRange(range));
        output.expensesRange = totalYearlyExpenses.map(range => generateRange(range));
        output.earlyWithdrawTaxRange = totalEarlyWithdrawalTax.map(range => generateRange(range));
        output.percentageDiscretionaryRange = totalPercentageTotalDiscretionary.map(range => generateRange(range));
        // 4.3 mean + median values (Generate mean/median of items for each year)
        const investmentOverTimeVals = totalInvestmentsOverTime.map(range => computeMeanAndMedian(range));
        output.medianInvestmentsOverTime = investmentOverTimeVals.map(range => range.medians);
        output.avgInvestmentsOverTime = investmentOverTimeVals.map(range => range.means);
        output.investmentOrder = plan.investments.map(investments => investments.id);

        const incomeOverTimeVals = totalIncomeOverTime.map(range => computeMeanAndMedian(range));
        output.medianIncomeOverTime = incomeOverTimeVals.map(range => range.medians);
        output.avgIncomeOverTime = incomeOverTimeVals.map(range => range.means);
        output.incomeOrder = getLifeEventsByType(plan.eventSeries,"income").map(events => events.name);

        const expensesOverTimeVals = totalExpensesOverTime.map(range => computeMeanAndMedian(range));
        output.medianExpensesOverTime = expensesOverTimeVals.map(range => range.medians);
        output.avgExpensesOverTime = expensesOverTimeVals.map(range => range.means);
        let taxOrder: string[] = ["federal income tax", "state income tax", "capital gains tax", "early withdrawal tax"];
        output.expensesOrder = getLifeEventsByType(plan.eventSeries,"expense").map(events => events.name);
        output.expensesOrder.push(...taxOrder);

        createLog(username, "input",incomeOverTimeVals);
        createLog(username, "median output", output.medianIncomeOverTime);
        createLog(username, "mean output", output.avgIncomeOverTime);
        // console.log(output);

        // OUTPUTS - FOR EACH TYPE OF ALGORITHM
        if(algorithmType === "standard" && result){ // standard
            // range is itself so index 0
            result.probabilityOverTime = output.probabilityOverTime[0];
            result.financialGoal = output.financialGoal;
            result.investmentOrder = output.investmentOrder;
            result.investmentsRange = output.investmentsRange[0];
            result.incomeRange = output.incomeRange[0];
            result.expensesRange = output.expensesRange[0];
            result.earlyWithdrawTaxRange = output.earlyWithdrawTaxRange[0];
            result.percentageDiscretionaryRange = output.percentageDiscretionaryRange[0];
            result.medianInvestmentsOverTime = output.medianInvestmentsOverTime[0];
            result.avgInvestmentsOverTime = output.avgInvestmentsOverTime[0];
            result.investmentOrder = output.investmentOrder;
            
            result.medianIncomeOverTime = output.medianIncomeOverTime[0];
            result.avgIncomeOverTime = output.avgIncomeOverTime[0];
            result.incomeOrder = output.incomeOrder;
            
            result.medianExpensesOverTime = output.medianExpensesOverTime[0];
            result.avgExpensesOverTime = output.avgExpensesOverTime[0];
            result.expensesOrder = output.expensesOrder;

            await result.save();
        }
        else if(algorithmType === "1d"){ // 1D
            return res.status(200).json({
                status: "OK",
                error: false,
                message: "1D Scenario Exploration complete",
                data: output,
            });
        }
        else if(algorithmType === "2d"){ // 2D
            return res.status(200).json({
                status: "OK",
                error: false,
                message: "2D Scenario Exploration complete",
                data: output,
            });
        }

        // return OK signal
        return res.status(200).json({
            status: "OK",
            error: false,
            message: "Algorithm complete, but no output. (standard or an error)",
        });
    }
    catch (error) {
        console.log("simulation failed to error");
        return res.status(200).json({
            status: "ERROR",
            error: true,
            message: "Simulation failed.",
        });
    }
};

// Oversee Simulation algorithm and configure SimulationResult
export const runSimulation = async (req: any, res: any) => {
    // Get financial plan, simulation & create simulationResult
    // const start = process.hrtime();
    const { state_tax_file, username, id, params } = req.body;
    

    try {
        createLog(username, "running a simulation");
        const plan = await FinancialPlan.findById(id); // WHY THE FUCK I NEED THIS FOR TAX TO RUN????
        // const simulation = await Simulation.findById(simulationId);
        // const result = await SimulationResult.findOne({ simulationId: simulationId});

        // Check if everything is there
        if (!plan) {
            createLog(username, 'Items not found.');
            return;
            // return res.status(404).json({ error: 'Items not found.' });
        }
        enforceScenarioParameter(plan, params)

        console.log(plan.eventSeries);
        // 1,000–10,000 simulations → good starting range
        // const num_simulations = simulations || 1000;
        const spouse = plan.maritalStatus == "couple"; // boolean
        const startingYear = new Date().getFullYear();
        const age = startingYear - plan.birthYears[0];

        // inside simulations (loop by simulation)
        //for (let simulations = 0; simulations < num_simulations; simulations++) {
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
            return;
            // return res.status(404).json({
            //     status: "ERROR",
            //     error: true,
            //     message: "Life expectancy not found.",
            // });
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
                return;
                // return res.status(404).json({ error: 'inflationRate not found.' });
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
                return;
                // res.status(404).json({ error: '"ERROR, Brackets did not update correctly.' });
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
                    return;
                    // return res.status(404).json({ error: 'Error in calculateRMD()' });
                }
                calculateRMD_Investment(plan, rmd);
                createLog(username, "after 3, investments:", plan.investments);
                writeLog(username, "performed RMD for last year", "log");
            }

            
            // 4. Update investments, expected annual return, reinvestment of income, then expenses.
            createLog(username, `total expense before part4: ${curYearExpenses}`);
            createLog(username, `b4 4, investments: ${plan.investments}, curYearIncome: ${curYearIncome}`);
            createLog(username, `total expense after part4: ${curYearExpenses}`);
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
            
            createLog(username, "b4 6, cash:", cash);
            // // 6. Pay non-discretionary expenses and the previous year's taxes (Pre-tax -> +curYearIncome)
            createLog(username, `total expense before part6: ${curYearExpenses}`);
            createLog(username, `b4 6, currentYearGain: ${currentYearGain}, currentYearEarlyWithdrawal: ${currentYearEarlyWithdrawal}, `);


            const vals = payNonDiscretionary(plan, previousYearIncome, previousYearSocialSecurityIncome, status, plan.residenceState, 
                previousYearGain, previousYearEarlyWithdrawals, age, year, startingYear, curYearIncome, currentYearGain, currentYearEarlyWithdrawal,
                standard_deduction_bracket, federal_tax_bracket, capital_tax_bracket, state_tax_bracket);
            
                
            // TODO - add federal & state tax
            curYearIncome = vals[0];
            currentYearGain = vals[1];
            currentYearEarlyWithdrawal = vals[2];
            curYearExpenses += vals[3];

            createLog(username, `total expense after part6: ${curYearExpenses}`);
            if (Number.isNaN(vals[3])){
                console.log("RETURNED NULL");
            }

            
            let federal_tax = vals[4];
            let state_tax = vals[5]
            createLog(username, `after 6, currentYearGain: ${currentYearGain}, currentYearEarlyWithdrawal: ${currentYearEarlyWithdrawal}, `);

            // writeLog(username, "Paid non-discretionary expenses and the previous year’s taxes ", "log");
            // // 7. Pay discretionary expenses in the order given by the spending strategy (Pre-tax -> +curYearIncome)
            const total_asset = getTotalAssetValue(plan.investments);
            // currYearIncome, currentYearGain, currentYearEarlyWithdrawal
            createLog(username, `b4 7, total_asset: ${total_asset}, curYearIncome: ${curYearIncome}, currentYearGain: ${currentYearGain}, currentYearEarlyWithdrawal: ${currentYearEarlyWithdrawal}, `);
            const vals2 = payDiscretionary(plan, total_asset, curYearIncome, currentYearGain, currentYearEarlyWithdrawal, age, year, startingYear);
            // TODO - OUTPUT expense output didn't add taxes
            curYearIncome = vals2[0];
            currentYearGain = vals2[1];
            currentYearEarlyWithdrawal = vals2[2];
            createLog(username, `after 7, curYearIncome: ${curYearIncome}, currentYearGain: ${currentYearGain}, currentYearEarlyWithdrawal: ${currentYearEarlyWithdrawal}, `);
            //console.log("PERCETNAGHE",vals2[3]);
            percentageTotalDiscretionary.push(vals2[3]);
            writeLog(username, "Paid discretionary expenses", "log");

            createLog(username, "after4 7, cash:", cash);
            // // 8. Run the invest events scheduled for the current year
            createLog(username, `b4 8, investments: ${plan.investments}`);
            runInvestEvents(plan, glidePathValue);
            createLog(username, `after 8, investments: ${plan.investments}`);
            glidePathValue = !glidePathValue;
            
            
            writeLog(username, "Ran the invest events", "log");
        
            // // 9. Run rebalance events scheduled for the current year
            createLog(username, `b4 9, currentYearGain: ${currentYearGain}, investments: ${plan.investments}`);
            currentYearGain = runRebalance(plan, currentYearGain, status, capital_tax_bracket);
            createLog(username, `after 9, currentYearGain: ${currentYearGain}, investments: ${plan.investments}`);

            writeLog(username, "Ran rebalance events", "log");
        
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
        // plan = await FinancialPlan.findById(id);
        // if (!plan) {
        //     return;
        //     // return res.status(404).json({ error: 'Financial Plan not found.' });
        // }

        // OUTPUT - hash simulation raw values into total arrays
        // hashIntoTotal(totalInvestmentsOverTime, InvestmentsOverTime);
        // hashIntoTotal(totalIncomeOverTime, IncomeOverTime);
        // hashIntoTotal(totalYealyIncome, yearlyIncome);
        // hashIntoTotal(totalExpensesOverTime, ExpensesOverTime);
        // hashIntoTotal(totalYearlyExpenses, yearlyExpenses);
        // hashIntoTotal(totalEarlyWithdrawalTax, earlyWithdrawalTax);
        // hashIntoTotal(totalPercentageTotalDiscretionary, percentageTotalDiscretionary);
        //}
        // OUTPUT - compute the raw values into simulationResult (4.1 probability of success, 4.2 range and 4.3 mean/median values)
        // 4.1 probability of success
        // result.probabilityOverTime = probabilityOfSuccess(plan.financialGoal, totalInvestmentsOverTime);
        // // 4.2 range
        // result.financialGoal = plan.financialGoal;
        // result.investmentOrder = plan.investments.map(investments => investments.id);
        // result.investmentsRange = generateRange(totalInvestmentsOverTime);
        // result.incomeRange = generateRange(totalYealyIncome);
        // // console.log(totalYearlyExpenses);
        // result.expensesRange = generateRange(totalYearlyExpenses);
        // result.earlyWithdrawTaxRange = generateRange(totalEarlyWithdrawalTax);
        // result.percentageDiscretionaryRange = generateRange(totalPercentageTotalDiscretionary);
        // // 4.3 mean + median values (Generate mean/median of items for each year, TODO - incomplete)
        // const investmentOverTimeVals = computeMeanAndMedian(totalInvestmentsOverTime);
        // result.medianInvestmentsOverTime = investmentOverTimeVals.medians;
        // result.avgInvestmentsOverTime = investmentOverTimeVals.means;
        // result.investmentOrder = plan.investments.map(investments => investments.id);
        
        // const incomeOverTimeVals = computeMeanAndMedian(totalIncomeOverTime);
        // result.medianIncomeOverTime = incomeOverTimeVals.medians;
        // result.avgIncomeOverTime = incomeOverTimeVals.means;
        // result.incomeOrder = getLifeEventsByType(plan.eventSeries,"income").map(events => events.name);
        
        // const expensesOverTimeVals = computeMeanAndMedian(totalExpensesOverTime);
        // result.medianExpensesOverTime = expensesOverTimeVals.medians;
        // result.avgExpensesOverTime = expensesOverTimeVals.means;
        // // expenses -> taxes ([federal income, state income, capital gains, early withdrawal tax])
        // // let taxOrder: string[] = []; // disable taxes (before completion)
        // let taxOrder: string[] = ["federal income tax", "state income tax", "capital gains tax", "early withdrawal tax"];
        // result.expensesOrder = getLifeEventsByType(plan.eventSeries,"expense").map(events => events.name);
        // result.expensesOrder.push(...taxOrder);
        // console.log(result);
        //await result.save();
        
        // const end = process.hrtime(start);
        // console.log(`Execution time: ${end[0]}s ${end[1] / 1e6}ms`);
        // console.log("ended")
        // console.log(IncomeOverTime[0])

        res.status(200).json({
            status: "OK",
            error: false,
            data: {
                InvestmentsOverTime,
                IncomeOverTime,
                ExpensesOverTime,
                earlyWithdrawalTax,
                percentageTotalDiscretionary,
                yearlyIncome,
                yearlyExpenses
            },
        });
    }
    catch (error) {
        createLog(username, error);
        console.log("Meet a silent error", error);
        res.status(404).json({
            status: "ERROR",
            error: true,
            message: "Simulation failed.",
        });
    }
};
export const getSimulationByPlanId = async (req: any, res: any) => {
    try {
        const { planId } = req.params;
        
        if (!planId) {
            return res.status(400).json({
                status: "error",
                message: "Missing planId parameter"
            });
        }

        const simulation = await Simulation.findOne({ planId });
        
        if (!simulation) {
            return res.status(404).json({
                status: "error",
                message: "No simulation found for this plan"
            });
        }

        return res.status(200).json({
            status: "success",
            data: simulation
        });
    } catch (error) {
        console.error("Error fetching simulation by plan ID:", error);
        return res.status(500).json({
            status: "error",
            message: "Error fetching simulation",
            details: error instanceof Error ? error.message : String(error)
        });
    }
};

// Add a new function to get simulation results by ID
export const getSimulationResults = async (req: any, res: any) => {
  try {
    const { resultsId } = req.params;
    
    // Validate the results ID
    if (!resultsId) {
      return res.status(400).json({
        status: "error",
        message: "Missing results ID parameter"
      });
    }

    // Find the simulation results by ID
    const simulationResults = await SimulationResult.findById(resultsId);
    
    if (!simulationResults) {
      return res.status(404).json({
        status: "error",
        message: "Simulation results not found"
      });
    }

    return res.status(200).json({
      status: "success",
      data: simulationResults
    });
  } catch (error) {
    console.error("Error fetching simulation results:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error while fetching simulation results",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};