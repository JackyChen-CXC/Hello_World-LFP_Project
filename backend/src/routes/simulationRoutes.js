"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var simulationController_1 = require("../controllers/simulationController");
var simulationRouter = (0, express_1.Router)();
simulationRouter.post("/simulate", simulationController_1.createSimulation);
exports.default = simulationRouter;
