import { IDistribution } from "../models/Distribution";
import FinancialPlan from "../models/FinancialPlan";
import Simulation from "../models/Simulation";
import SimulationResult from "../models/SimulationResult";
import { generateFromDistribution } from "./simulationHelpers";

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
        const result = new SimulationResult({ simulationId: simulation._id });
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
        const plan = await FinancialPlan.findById(id);
        const simulation = await Simulation.findOne({ planId : id });
        const result = await SimulationResult.findById(simulation?.resultsId);

        // Storage for raw values
        const InvestmentsOverTime = [[]];
        const ExpensesOverTime = [[]];
        const earlyWithdrawalTaxOverTime = [[]];
        const percentageTotalDiscretionary = [[]];
        // Check if everything is there
        if (!plan || ! simulation || ! result) {
            console.log('Items not found.');
            return res.status(404).json({ error: 'Items not found.' });
        }

        // 1,000–10,000 simulations → good starting range
        const num_simulations = simulations || 1000;
        const spouse = plan.maritalStatus == "couple"; // boolean


        // inside simulations (loop by simulation)
        for (let simulations = 0; simulations < num_simulations; simulations++) {
            // Define Preliminary Values
            // get number of loops (start -> user's death)
            const num_years = generateFromDistribution(plan.lifeExpectancy[0]);
            if(!num_years){
                console.log("User Life expecentancy not found.");
                return res.status(200).json({
                    status: "ERROR",
                    error: true,
                    message: "Life expecentancy not found.",
                });
            }
            // Simulate (loop by year)
            for(let year = 0; year < num_years; year++){
                // run all income events, add them to cash investment
                
                // perform RMD for last year if applicable

                // Update investments, expected annual return, reinvestment of income, then expenses.

                // Run the Roth conversion (RC) optimizer, if it is enabled.

                // Pay non-discretionary expenses and the previous year’s taxes

                // Pay discretionary expenses in the order given by the spending strategy

                // Run the invest event scheduled for the current year

                // Run rebalance events scheduled for the current year

            }
        }
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