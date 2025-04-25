"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var template_1 = __importDefault(require("../template"));
var testingRouter = (0, express_1.Router)();
testingRouter.get("/createtemplate", template_1.default);
exports.default = testingRouter;
