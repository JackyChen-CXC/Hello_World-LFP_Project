import User from "../models/User";

// In case, not sure if we need it, null if no user found
export const getUserByUserName = async (username: string) => {
	return User.findOne({ username: username });
}

// Assumes concistency on how GoogleId is stored based on token is correct, null if no user found
export const getUserByGoogleId = async (googleId: string) => {
	return User.findOne({ googleId: googleId });
}
