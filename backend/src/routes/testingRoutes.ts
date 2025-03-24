import { Router } from "express";
import getSampleData from "../testing";

const testingRouter = Router();

testingRouter.get("/createtemplate", getSampleData);

export default testingRouter;
