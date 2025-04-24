import User from "../models/User";
import { v4 as uuidv4 } from "uuid";
import FinancialPlan from "../models/FinancialPlan";

// backend addUser when login detects Google Login without a account
export const addUser = async (req: any, res: any) => {
    try {
        const { googleId, email, name, given_name, picture } = req.body;
        
        if (!googleId || !email) {
            return res.status(400).json({
                status: "ERROR",
                error: true,
                message: "Google ID and email are required",
            });
        }
        
        
        let user = await User.findOne({ googleId });
        
        if (user) {
           
            user.email = email;
            user.username = name || email;
            await user.save();
            
            return res.status(200).json({
                status: "SUCCESS",
                error: false,
                message: "User information updated successfully",
                data: {
                    userId: user._id,
                    googleId: user.googleId,
                    username: user.username,
                    email: user.email,
                    isAnonymous: user.isAnonymous
                }
            });
        } else {
            // Create new user
            const newUser = new User({
                googleId,
                email,
                username: name || email,
                isAnonymous: false
            });
            
            await newUser.save();
            
            return res.status(201).json({
                status: "SUCCESS",
                error: false,
                message: "User created successfully",
                data: {
                    userId: newUser._id,
                    googleId: newUser.googleId,
                    username: newUser.username,
                    email: newUser.email,
                    isAnonymous: newUser.isAnonymous
                }
            });
        }
    }
    catch (error) {
        console.error("Error creating/updating user:", error);
        res.status(500).json({
            status: "ERROR",
            error: true,
            message: "Failed to create/update user",
        });
    }
};


export const addAnonymousUser = async (req: any, res: any) => {
    try {
        const username = `anon-${uuidv4().slice(0, 8)}`;
        const anonymousUser = new User({
            username: username, 
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

export const sharePlanWithUser = async (req: any, res: any) => {
    try {
        const { email, planId } = req.body;
        
        if (!email || !planId) {
            return res.status(400).json({
                status: "ERROR",
                error: true,
                message: "User email and plan ID are required"
            });
        }
        
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                status: "ERROR",
                error: true,
                message: "User not found with this email"
            });
        }
        
        
        const plan = await FinancialPlan.findById(planId);
        if (!plan) {
            return res.status(404).json({
                status: "ERROR",
                error: true,
                message: "Plan not found"
            });
        }
        
        
        if (!user.sharedPlans) {
            user.sharedPlans = [];
        }
        
        if (!user.sharedPlans.includes(planId)) {
            user.sharedPlans.push(planId);
            await user.save();
            
            return res.status(200).json({
                status: "SUCCESS",
                error: false,
                message: "Plan shared successfully"
            });
        } else {
            return res.status(200).json({
                status: "SUCCESS",
                error: false,
                message: "Plan was already shared with this user"
            });
        }
    } catch (error) {
        console.error("Error sharing plan with user:", error);
        return res.status(500).json({
            status: "ERROR",
            error: true,
            message: "Failed to share plan"
        });
    }
};

export const getSharedPlans = async (req: any, res: any) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                status: "ERROR",
                error: true,
                message: "User ID is required"
            });
        }
        
        
        const user = await User.findOne({ googleId: userId });
        
        if (!user) {
            return res.status(404).json({
                status: "ERROR",
                error: true,
                message: "User not found"
            });
        }
        
        
        if (!user.sharedPlans || user.sharedPlans.length === 0) {
            return res.status(200).json({
                status: "SUCCESS",
                error: false,
                message: "No shared plans found",
                data: []
            });
        }
        
        
        const sharedPlans = await FinancialPlan.find({
            _id: { $in: user.sharedPlans }
        });
        
        
        const plansWithFlag = sharedPlans.map(plan => {
            const planObject = plan.toObject();
            return {
                ...planObject,
                isShared: true
            };
        });
        
        return res.status(200).json({
            status: "SUCCESS",
            error: false,
            message: "Shared plans retrieved successfully",
            data: plansWithFlag
        });
    } catch (error) {
        console.error("Error retrieving shared plans:", error);
        return res.status(500).json({
            status: "ERROR",
            error: true,
            message: "Failed to retrieve shared plans"
        });
    }
};

export const stopSharingPlan = async (req: any, res: any) => {
    try {
        const { email, planId } = req.body;
        
        if (!email || !planId) {
            return res.status(400).json({
                status: "ERROR",
                error: true,
                message: "User email and plan ID are required"
            });
        }
        
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                status: "ERROR",
                error: true,
                message: "User not found with this email"
            });
        }
        
        
        if (user.sharedPlans && user.sharedPlans.includes(planId)) {
            user.sharedPlans = user.sharedPlans.filter(id => id !== planId);
            await user.save();
            
            return res.status(200).json({
                status: "SUCCESS",
                error: false,
                message: "Plan sharing removed successfully"
            });
        } else {
            return res.status(200).json({
                status: "SUCCESS",
                error: false,
                message: "Plan was not shared with this user"
            });
        }
    } catch (error) {
        console.error("Error removing shared plan:", error);
        return res.status(500).json({
            status: "ERROR",
            error: true,
            message: "Failed to remove shared plan"
        });
    }
};

export const getSharedUsers = async (req: any, res: any) => {
    try {
        const { planId } = req.params;
        
        if (!planId) {
            return res.status(400).json({
                status: "ERROR",
                error: true,
                message: "Plan ID is required"
            });
        }
        
        
        const users = await User.find({ 
            sharedPlans: planId 
        }).select('username email googleId');
        
        return res.status(200).json({
            status: "SUCCESS",
            error: false,
            message: "Shared users retrieved successfully",
            data: users
        });
    } catch (error) {
        console.error("Error retrieving users with shared plan:", error);
        return res.status(500).json({
            status: "ERROR",
            error: true,
            message: "Failed to retrieve users with shared plan"
        });
    }
};