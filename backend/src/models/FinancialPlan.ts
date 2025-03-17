import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { IUser } from "./User";
import { IInvestment } from "./Investment";
import { ILifeEvent } from "./LifeEvent";


export interface IFinancialPlan extends Document {
    userId: string;
    name: string;
    birthyear: number;
    spousebirthyear: number | null;
    // if null -> sample from normal distribution (skewed?, check requirements)
    lifeExpectancy: number | null;
    financialGoal: number;
    inflationAssumption: number;
    investments: IInvestment[];
    eventSeries: ILifeEvent[];
    // ISSUE - deal with it later
    transactions: [];
    spendingStrat: [];
    expenseWithdrawStrat: [];
	rmdStrat: [];
	rothStrat: [];
    // for now 2 seperate arrays (not sure if can tuple)
    sharedUsersId: IUser[];
    sharedUserPerms: String[];
    version: number;
}

const financialplanSchema = new Schema<IFinancialPlan>({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    birthyear: { type: Number, required: true },
    spousebirthyear: { type: Number, default: null },
    lifeExpectancy: { type: Number, default: null },
    financialGoal: { type: Number, required: true },
    inflationAssumption: { type: Number, required: true },
    // ISSUE -> typing is not strict
    // transactions: { type: Array, default: [] },
    // spendingStrat: { type: Array, default: [] },
    // expenseWithdrawStrat: { type: Array, default: [] },
    // rmdStrat: { type: Array, default: [] },
    // rothStrat: { type: Array, default: [] },
    sharedUsersId: [{ type: Schema.Types.ObjectId, ref: "User" }], 
    sharedUserPerms: { type: [String], default: [] },
    version: { type: Number, required: true, default: 1 },
});

// Index for faster queries by userId
financialplanSchema.index({ userId: 1 });

const FinancialPlan = mongoose.model<IFinancialPlan>("FinancialPlan", financialplanSchema);

export default FinancialPlan;