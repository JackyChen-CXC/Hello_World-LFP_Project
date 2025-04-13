import { Router } from "express";
import {
  createFinancialPlan,
  createInvestmentType,
  deleteInvestmentTypeById,
  findInvestmentType,
  getAllEvents,
  getAllFinancialPlans,
  getAllInvestmentTypes,
  getInvestmentsByPlanId,
  getInvestmentTypeById,
  getSpecificFinancialPlan,
  rmdWebscrape,
  updateFinancialPlan,
  webscrape
} from "../controllers/modelController";



const modelRouter = Router();

modelRouter.post("/plans", createFinancialPlan);
modelRouter.get("/plans/:id", getSpecificFinancialPlan);
modelRouter.post("/webscrape", webscrape);
modelRouter.post("/rmdscrape", rmdWebscrape);
modelRouter.post("/plans/all", getAllFinancialPlans);
modelRouter.post("/investment-types", createInvestmentType);
modelRouter.post("/investment-types/find", findInvestmentType);
modelRouter.get("/investment-types/id/:id", getInvestmentTypeById);
modelRouter.get("/investment-types/all", getAllInvestmentTypes);
modelRouter.get("/:plan/EventSeries/all", getAllEvents);
modelRouter.put("/plans/:id", updateFinancialPlan);
modelRouter.get("/:planId/investments", getInvestmentsByPlanId);
modelRouter.delete("/investment-types/:id", deleteInvestmentTypeById);
export default modelRouter;
