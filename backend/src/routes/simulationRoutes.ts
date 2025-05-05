import { Router } from "express";
import { createSimulation, runSimulation, getSimulationByPlanId, getSimulationResults } from "../controllers/simulationController";

const simulationRouter = Router();

simulationRouter.post("/simulate", createSimulation);
// Directly run from algorithm cause it's a shorter iteration and return vals
simulationRouter.post("/scenarioexplore", runSimulation);
// New route to get simulation by planId
simulationRouter.get("/plan/:planId", getSimulationByPlanId);
// Add a new route to get simulation results by ID
simulationRouter.get("/results/:resultsId", getSimulationResults);

export default simulationRouter;