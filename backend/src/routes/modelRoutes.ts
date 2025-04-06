import { Router } from "express";
import {
  createFinancialPlan,
  createInvestmentType,
  findInvestmentType,
  getAllFinancialPlans,
  getInvestmentTypeByName,
  getInvestmentTypesByPlanId,
  getSpecificFinancialPlan,
  updateFinancialPlan,
  webscrape
} from "../controllers/modelController";



const modelRouter = Router();

modelRouter.post("/plans", createFinancialPlan);
modelRouter.get("/plans/:id", getSpecificFinancialPlan);
modelRouter.post("/webscrape", webscrape);
modelRouter.post("/plans/all", getAllFinancialPlans);
modelRouter.get("/investment-types/name/:name", getInvestmentTypeByName);
modelRouter.post("/investment-types", createInvestmentType);
modelRouter.post("/investment-types/find", findInvestmentType);
modelRouter.get("/investment-types/plan/:planId", getInvestmentTypesByPlanId);
modelRouter.put("/plans/:id", updateFinancialPlan);
export default modelRouter;
