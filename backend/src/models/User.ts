import mongoose, { Document, Schema } from "mongoose";
import { IFinancialPlan } from "./FinancialPlan";

export interface IUser extends Document {
	username: string;
	email?: string;
	googleId?: string;
	isAnonymous: boolean;
	plans?: IFinancialPlan[];
	sharedPlans?: string[]; // Array of plan IDs shared with this user
}

const userSchema = new Schema<IUser>({
	username: { type: String, required: true, unique: true, sparse: true },
	email: { type: String, unique: true, sparse: true },
	googleId: { type: String, unique: true, sparse: true },
	isAnonymous: { type: Boolean, required: true, default: false },
	plans: { type: [Schema.Types.ObjectId], ref: 'FinancialPlan', default: [] },
	sharedPlans: { type: [String], default: [] } // Store plan IDs as strings
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;