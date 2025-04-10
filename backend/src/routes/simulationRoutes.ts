import { Router } from "express";
import { createSimulation } from "../controllers/simulationController";

const simulationRouter = Router();

simulationRouter.post("/simulate", createSimulation);

export default simulationRouter;