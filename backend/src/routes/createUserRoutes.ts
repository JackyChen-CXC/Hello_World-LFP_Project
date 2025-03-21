// Manage User Routes
import { Router } from "express";
import { addAnonymousUser, addUser, endUser } from "../controllers/createUserController";

const createUserRouter = Router();

createUserRouter.post('/adduser', addUser);
createUserRouter.get('/addanonymoususer', addAnonymousUser);
createUserRouter.post('/enduser', endUser);

export default createUserRouter;