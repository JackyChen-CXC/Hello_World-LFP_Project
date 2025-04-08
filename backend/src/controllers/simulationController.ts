import Simulation from "../models/Simulation";
import SimulationResult from "../models/SimulationResult";

// Create Simulation object using Financial Plan object
export const createSimulation = async (req: any, res: any) => {
    try {
        // Get specific financial plan to simulate
        const { financialPlanId } = req.body;
        // Create simulation

        // async simulation algorithm (do not await)
        runSimulation(req, res);

        // return OK signal
        return res.status(200).json({
            status: "OK",
            error: false,
            message: "Simulation started",
        });
    }
    catch (error) {
        return res.status(200).json({
            status: "ERROR",
            error: true,
            message: "Simulation failed to start",
        });
    }
};

// Oversee Simulation algorithm and create/configure SimulationResult
export const runSimulation = async (req: any, res: any) => {
    try {
        // simulate
    }
    catch (error) {
        return res.status(200).json({
            status: "ERROR",
            error: true,
            message: "Simulation failed",
        });
    }
};