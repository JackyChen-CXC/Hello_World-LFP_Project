import { Router } from "express";
import seedTestData from "../testing";

const testingRouter = Router();

testingRouter.get("createtemplate", seedTestData);

export default testingRouter;
