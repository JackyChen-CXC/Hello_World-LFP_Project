import { Router } from "express";
import { createSimulation, runSimulation } from "../controllers/simulationController";

const simulationRouter = Router();

simulationRouter.post("/simulate", createSimulation);
// Directly run from algorithm cause it's a shorter iteration and return vals
simulationRouter.post("/scenarioexplore", runSimulation);

export default simulationRouter;