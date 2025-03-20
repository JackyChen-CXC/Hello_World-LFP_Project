// What the frontend needs to communicate with backends
import { Router } from "express";
import { getFinancialPlans, webscrape } from "../controllers/modelController";


const modelRouter = Router();

modelRouter.post("/plans", getFinancialPlans);
modelRouter.post("/webscrape", webscrape);


export default modelRouter;