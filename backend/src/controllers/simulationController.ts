import { IDistribution } from "../models/Distribution";
import FinancialPlan from "../models/FinancialPlan";
import Simulation from "../models/Simulation";
import SimulationResult from "../models/SimulationResult";
import { generateFromDistribution, getCash, hashIntoTotal, probabilityOfSuccess, standardizeTimeRangesForEventSeries, updateIncomeEvents } from "./simulationHelpers";

// Main Functions for making the simulation

// Create Simulation object using Financial Plan object
export const createSimulation = async (req: any, res: any) => {
    try {
        // Get specific financial plan to simulate
        const { id } = req.body;
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

        // async queue (not implemented) -> simulation algorithm (do not await)
        runSimulation(req, res);

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
    try {
        // Get financial plan, simulation & create simulationResult
        const { id, simulations } = req.body;
        let plan = await FinancialPlan.findById(id);
        const simulation = await Simulation.findOne({ planId : id });
        const result = await SimulationResult.findById(simulation?.resultsId);

        // Storage for all simulation raw values
        const totalInvestmentsOverTime: number[][] = [[]];
        const totalExpensesOverTime: number[][] = [[]];
        const totalEarlyWithdrawalTaxOverTime: number[][] = [[]];
        const totalPercentageTotalDiscretionary: number[][] = [[]];
        // Check if everything is there
        if (!plan || ! simulation || ! result) {
            console.log('Items not found.');
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
            const InvestmentsOverTime: number[] = [];
            const ExpensesOverTime: number[] = [];
            const earlyWithdrawalTaxOverTime: number[] = [];
            const percentageTotalDiscretionary: number[] = [];

            // reset financial plan
            plan = await FinancialPlan.findById(id);
            if (!plan) {
                return res.status(404).json({ error: 'Financial Plan not found.' });
            }
            // Preliminary generation of values
            // get number of loops (start -> user's death)
            const lifeExpectancy = generateFromDistribution(plan.lifeExpectancy[0]);
            if(!lifeExpectancy){
                console.log("User Life expectancy not found.");
                return res.status(200).json({
                    status: "ERROR",
                    error: true,
                    message: "Life expectancy not found.",
                });
            }
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
            for(let year = 0; year <= num_years; year++){
                // 1. preliminary
                // true if spouse exists and is alive
                const deathSpouse = spouseYears !== undefined && spouseYears > year;

                // get this year's InflationAssumption
                const inflationRate = generateFromDistribution(plan.inflationAssumption);
                if(!inflationRate){
                    console.log('inflationRate not found.');
                    return res.status(404).json({ error: 'inflationRate not found.' });
                }
                // inflate tax brackets

                // compute & store inflation-adjusted annual limits on retirement account contributions

                // 2. run all income events
                const cash = getCash(plan.investments);
                // retrieve previous year income and updates the incomeEvents after
                let [curYearIncome, socialSecurity] = updateIncomeEvents(plan.eventSeries, inflationRate, deathSpouse);
                // Add the income to the cash investment
                cash.value += curYearIncome;

                // 3. perform RMD for last year if applicable

                // 4. Update investments, expected annual return, reinvestment of income, then expenses.

                // 5. Run the Roth conversion (RC) optimizer, if it is enabled.

                // 6. Pay non-discretionary expenses and the previous year’s taxes

                // 7. Pay discretionary expenses in the order given by the spending strategy

                // 8. Run the invest event scheduled for the current year

                // 9. Run rebalance events scheduled for the current year

            }

            // hash simulation raw values into total arrays
            hashIntoTotal(totalInvestmentsOverTime, InvestmentsOverTime);
            hashIntoTotal(totalExpensesOverTime, ExpensesOverTime);
            hashIntoTotal(totalEarlyWithdrawalTaxOverTime, earlyWithdrawalTaxOverTime);
            hashIntoTotal(totalPercentageTotalDiscretionary, percentageTotalDiscretionary);
        }
        // compute the raw values into simulationResult (probability of success, mean, median & range)
        result.probabilityOverTime = probabilityOfSuccess(plan.financialGoal, totalInvestmentsOverTime);
        

        // await result.save();

    }
    catch (error) {
        console.log(error);
        res.status(200).json({
            status: "ERROR",
            error: true,
            message: "Simulation failed.",
        });
    }
};