import { IDistribution } from "../models/Distribution";
import FinancialPlan from "../models/FinancialPlan";
import Simulation from "../models/Simulation";
import SimulationResult from "../models/SimulationResult";

// Helper Functions

// Return a number given Distribution types: "fixed" | "normal" | "uniform"
function generateFromDistribution(dist: IDistribution): number | undefined {
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

// Main Functions

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
        const { id } = req.body;
        const plan = await FinancialPlan.findById(id);
        const simulation = await Simulation.findOne({ planId : id });
        const result = await SimulationResult.findById(simulation?.resultsId);

        // Check if everything is there
        if (!plan || ! simulation || ! result) {
            console.log('Items not found.');
            return res.status(404).json({ error: 'Items not found.' });
        }

        // 1,000–10,000 simulations → good starting range
        const num_simulations = 1000;
        // Boolean
        const spouse = plan.maritalStatus == "couple";
        // get number of loops (start -> user's death)
        
        
        // simulate

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