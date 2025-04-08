import User from "../models/User";

// Google Login if saving in backend
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

// Takes off any cookie/websocket, etc used in determining session(?)
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