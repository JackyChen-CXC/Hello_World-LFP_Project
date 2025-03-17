import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { IInvestmentType } from "./InvestmentType";

export interface IInvestment extends Document {
    assetType: IInvestmentType;
    balance: number;
    // ISSUE - Check if these are the right 3 tax statuses
    accountTaxStatus: "taxable" | "tax-deferred" | "tax-free";
    growthRate: number;
}

const investmentSchema = new Schema<IInvestment>({
    assetType: { type: Schema.Types.ObjectId, ref: "InvestmentType", required: true },
    balance: { type: Number, required: true },
    accountTaxStatus: { type: String, enum: ["taxable", "tax-deferred", "tax-free"], required: true },
    growthRate: { type: Number, required: true },
});

investmentSchema.index({ assetType: 1 });

const Investment = mongoose.model<IInvestment>('Simulation', investmentSchema);

export default Investment;