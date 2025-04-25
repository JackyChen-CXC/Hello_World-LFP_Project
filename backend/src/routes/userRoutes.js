"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// What the User wants to do 
var express_1 = require("express");
var userController_1 = require("../controllers/userController");
var userRouter = (0, express_1.Router)();
userRouter.post("/createplan", userController_1.createPlan);
userRouter.post("/editplan", userController_1.editPlan);
userRouter.post("/deleteplan", userController_1.deletePlan);
userRouter.post("/importplan", userController_1.importPlan);
userRouter.post("/export", userController_1.exportPlan);
exports.default = userRouter;
