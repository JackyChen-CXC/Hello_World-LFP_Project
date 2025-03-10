// routing to functions of user login, logout and checkauth
import { Router } from "express";
import { login, logout } from "../controllers/authUserController";

const authUserRouter = Router();

authUserRouter.post('/login', login);
authUserRouter.post('/logout', logout);

export default authUserRouter;