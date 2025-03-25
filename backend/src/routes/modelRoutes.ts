import { Router } from "express";
import {
  createFinancialPlan,
  createInvestmentType,
  getAllFinancialPlans,
  getInvestmentTypeById,
  getInvestmentTypesByPlanId,
  getSpecificFinancialPlan,
  scrapeDoc,
  updateFinancialPlan,
  webscrape
} from "../controllers/modelController";



const modelRouter = Router();

modelRouter.post("/plans", createFinancialPlan);
modelRouter.get("/plans/:id", getSpecificFinancialPlan);
modelRouter.post("/webscrape", webscrape);
modelRouter.post("/scrapedoc", scrapeDoc);
modelRouter.post("/plans/all", getAllFinancialPlans);
modelRouter.get("/investment-types/:id", getInvestmentTypeById);
modelRouter.post("/investment-types", createInvestmentType);
modelRouter.get("/investment-types/plan/:planId", getInvestmentTypesByPlanId);
modelRouter.put("/plans/:id", updateFinancialPlan);
export default modelRouter;
