//functions for route user login, logout and checkauth
import User from "../models/User";

export const addUser = async (req: any, res: any) => {
    try {
        
    }
    catch (error) {
        res.status(200).json({
            status: "ERROR",
            error: true,
            message: "User created unsuccessfully.",
        });
    }
};