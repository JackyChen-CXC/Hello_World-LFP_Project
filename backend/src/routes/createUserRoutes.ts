// Create User Routes
import { Router } from "express";
import { addUser } from "../controllers/createUserController";

const createUserRouter = Router();

createUserRouter.post('/adduser', addUser);

export default createUserRouter;