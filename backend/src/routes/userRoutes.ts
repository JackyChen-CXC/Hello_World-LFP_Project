// What the User wants to do 
import { Router } from "express";
import { createPlan, deletePlan, editPlan, exportPlan, importPlan } from "../controllers/userController";

const userRouter = Router();

userRouter.post("/createplan", createPlan);
userRouter.post("/editplan", editPlan);
userRouter.post("/deleteplan", deletePlan);
userRouter.post("/importplan", importPlan);
userRouter.post("/export", exportPlan);


export default userRouter;