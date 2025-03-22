import { Router } from "express";
import {
  getFinancialPlans,
  scrapeDoc,
  webscrape,
  createFinancialPlan,
} from "../controllers/modelController";

const modelRouter = Router();

modelRouter.post("/plans", createFinancialPlan);
modelRouter.get("/plans", getFinancialPlans); 
modelRouter.post("/webscrape", webscrape);
modelRouter.post("/scrapedoc", scrapeDoc);

export default modelRouter;
