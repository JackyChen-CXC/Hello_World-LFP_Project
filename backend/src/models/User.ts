import mongoose, { Document, Schema } from "mongoose";
import { IFinancialPlan } from "./FinancialPlan";

export interface IUser extends Document {
	username: string;
	email?: string;
	googleId?: string;
	isAnonymous: boolean;
	plans?: IFinancialPlan[]
}

/** How anonymous users can be made 
import { v4 as uuidv4 } from "uuid";
const anonymousUser = new User({
	username: `anon-${uuidv4().slice(0, 8)}`, // Generates something like "anon-1a2b3c4d"
	isAnonymous: true,
});
 */

const userSchema = new Schema<IUser>({
	username: { type: String, required: true, unique: true, sparse: true },
	email: { type: String, unique: true, sparse: true },
	googleId: { type: String, unique: true, sparse: true },
	isAnonymous: { type: Boolean, required: true, default: false },
	plans: { type: [{ type: Schema.Types.ObjectId, ref: 'FinancialPlan' }], default: [] }
});

userSchema.index({ username: 1 });

const User = mongoose.model<IUser>('User', userSchema);

export default User;