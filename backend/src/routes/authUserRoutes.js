"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Authenicating User Routes (Maybe add a checkAuthenication function/route)
var express_1 = require("express");
var authUserController_1 = require("../controllers/authUserController");
var authUserRouter = (0, express_1.Router)();
authUserRouter.post('/login', authUserController_1.login);
authUserRouter.post('/logout', authUserController_1.logout);
exports.default = authUserRouter;
