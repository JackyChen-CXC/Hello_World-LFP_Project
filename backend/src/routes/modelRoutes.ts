import { Router } from "express";
import {
  getSpecificFinancialPlan,
  scrapeDoc,
  webscrape,
  createFinancialPlan,
  getAllFinancialPlans,
} from "../controllers/modelController";

const modelRouter = Router();

modelRouter.post("/plans", createFinancialPlan);
modelRouter.get("/plans/:id", getSpecificFinancialPlan); 
modelRouter.post("/webscrape", webscrape);
modelRouter.post("/scrapedoc", scrapeDoc);
modelRouter.post("/plans/all", getAllFinancialPlans)
export default modelRouter;
