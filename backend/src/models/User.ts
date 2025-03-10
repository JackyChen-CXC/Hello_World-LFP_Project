import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
	username: string;
	email: string;
}

const userSchema = new Schema<IUser>({
	username: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true },
});

userSchema.index({ username: 1 });

const User = mongoose.model<IUser>('User', userSchema);

export default User;