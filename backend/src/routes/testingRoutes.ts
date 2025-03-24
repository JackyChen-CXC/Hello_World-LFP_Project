import { Router } from "express";
import getSampleData from "../template";

const testingRouter = Router();

testingRouter.get("/createtemplate", getSampleData);

export default testingRouter;
