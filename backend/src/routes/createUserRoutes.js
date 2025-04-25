"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Manage User Routes
var express_1 = require("express");
var createUserController_1 = require("../controllers/createUserController");
var createUserRouter = (0, express_1.Router)();
createUserRouter.post('/adduser', createUserController_1.addUser);
createUserRouter.get('/addanonymoususer', createUserController_1.addAnonymousUser);
createUserRouter.post('/enduser', createUserController_1.endUser);
exports.default = createUserRouter;
