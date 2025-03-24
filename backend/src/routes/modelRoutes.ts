import { Router } from "express";
import {
  createFinancialPlan,
  getAllFinancialPlans,
  getSpecificFinancialPlan,
  scrapeDoc,
  webscrape,
} from "../controllers/modelController";

const modelRouter = Router();

modelRouter.post("/plans", createFinancialPlan);
modelRouter.get("/plans/:id", getSpecificFinancialPlan);
modelRouter.post("/webscrape", webscrape);
modelRouter.post("/scrapedoc", scrapeDoc);
modelRouter.post("/plans/all", getAllFinancialPlans)
export default modelRouter;
