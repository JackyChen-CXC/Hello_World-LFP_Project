// Investment Type is the type of Investment made, ex: specific company, bond, etc
// People can Invest in the Investment Type (Make Investment object)
import mongoose, { Document, Schema } from "mongoose";
import { DistributionSchema, IDistribution } from "./Distribution";

export interface IInvestmentType extends Document {
    name: string;
    description: string;
    returnAmtOrPct: "amount" | "percent";
    returnDistribution: IDistribution;
    expenseRatio: number;
    incomeAmtOrPct: "amount" | "percent";
    incomeDistribution: IDistribution;
    taxability: boolean;
}

export const investmentTypeSchema = new Schema<IInvestmentType>({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    returnAmtOrPct: { type: String, enum: ["amount", "percent"], required: true},
    returnDistribution: { type: DistributionSchema, required: true },
    expenseRatio: { type: Number, required: true },
    incomeAmtOrPct: { type: String, enum: ["amount", "percent"], required: true},
    incomeDistribution: { type: DistributionSchema, required: true },
    taxability: { type: Boolean, required: true },
});

const InvestmentType = mongoose.model<IInvestmentType>('InvestmentType', investmentTypeSchema);

export default InvestmentType;