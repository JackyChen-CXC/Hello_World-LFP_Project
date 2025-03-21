import User from "../models/User";
import { v4 as uuidv4 } from "uuid";

// uses addUser when login detects Google Login without a account
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

// For now the difference is only in boolean and without values,
// we could maybe use websockets/sessions or something to improve this functionality
export const addAnonymousUser = async (req: any, res: any) => {
    try {
        const username = `anon-${uuidv4().slice(0, 8)}`;
        const anonymousUser = new User({
            username: username, // Generates something like "anon-1a2b3c4d"
            isAnonymous: true,
        });
        const savedUser = await anonymousUser.save()
            .then(() => {
                console.log(`Saved creating Anonymous User: ${username}`);
            })
            .catch((err) => {
                console.error(`Error creating Anonymous User ${username}:`, err);
            });
        
        return res.status(200).json({
            status: "SUCCESS",
            error: false,
            message: "Anonymous User Created Successfully",
            data: anonymousUser._id,
        });
    }
    catch (error) {
        res.status(200).json({
            status: "ERROR",
            error: true,
            message: "User created unsuccessfully.",
        });
    }
};

// when logout(?) or exit session (maybe timeout if not possible?) as Anonymous User
export const endUser = async (req: any, res: any) => {
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