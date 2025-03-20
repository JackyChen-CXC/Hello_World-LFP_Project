import User from "../models/User";

export const login = async (req: any, res: any) => {
	try {
		
	} catch (error) {
		res.status(200).json({
			status: "ERROR",
			error: true,
			message: "Login failed.",
		});
	}
};

export const logout = async (req: any, res: any) => {
	try {
		
	} catch (error) {
		res.status(200).json({
			status: "ERROR",
			error: true,
			message: "Logout failed.",
		});
	}
};