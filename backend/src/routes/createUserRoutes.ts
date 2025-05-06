// Manage User Routes
import { Router } from "express";
import {
    addAnonymousUser,
    addUser,
    endUser,
    getSharedPlans,
    getSharedUsers,
    sharePlanWithUser,
    stopSharingPlan,
    updateAccess
} from "../controllers/createUserController";

const createUserRouter = Router();

createUserRouter.post('/adduser', addUser);
createUserRouter.get('/addanonymoususer', addAnonymousUser);
createUserRouter.post('/enduser', endUser);
createUserRouter.post('/users/update-access', updateAccess);
createUserRouter.post('/users/share-plan', sharePlanWithUser);
createUserRouter.post('/users/shared-plans', getSharedPlans);
createUserRouter.post('/users/stop-sharing', stopSharingPlan);
createUserRouter.get('/users/shared-with/:planId', getSharedUsers);


export default createUserRouter;