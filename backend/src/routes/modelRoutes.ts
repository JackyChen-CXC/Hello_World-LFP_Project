// What the frontend needs to communicate with backends
import { Router } from "express";
import { getFinancialPlans, scrapeDoc, webscrape } from "../controllers/modelController";


const modelRouter = Router();

modelRouter.post("/plans", getFinancialPlans);
modelRouter.post("/webscrape", webscrape);
modelRouter.post("/scrapedoc", scrapeDoc);


export default modelRouter;