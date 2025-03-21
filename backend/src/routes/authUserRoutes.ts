// Authenicating User Routes (Maybe add a checkAuthenication function/route)
import { Router } from "express";
import { login, logout } from "../controllers/authUserController";

const authUserRouter = Router();

authUserRouter.post('/login', login);
authUserRouter.post('/logout', logout);

export default authUserRouter;