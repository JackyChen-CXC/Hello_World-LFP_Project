"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stateTaxUploadController_1 = require("../controllers/stateTaxUploadController");
var express_1 = require("express");
var stateTaxRouter = (0, express_1.Router)();
stateTaxRouter.post('/upload-state-tax', stateTaxUploadController_1.uploadStateTaxMiddleware, stateTaxUploadController_1.uploadStateTaxFile);
exports.default = stateTaxRouter;
