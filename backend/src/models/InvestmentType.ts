// Investment Type is the type of Investment made, ex: specific company, bond, etc
// People can Invest in the Investment Type (Make Investment object)
import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { DistributionSchema, IDistribution } from "./Distribution";

export interface IInvestmentType extends Document {
    name: string;
    description: string;
    returnAmtOrPct: "amount" | "percent";
    returnDistribution: IDistribution;
    expectedAnnualReturn: number;
    expenseRatio: number;
    incomeAmtOrPct: "amount" | "percent";
    incomeDistribution: IDistribution;
    annual_income_interestOrDividends: number;
    taxability: boolean;
}

const investmentTypeSchema = new Schema<IInvestmentType>({
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    returnAmtOrPct: { type: String, enum: ["amount", "percent"], required: true},
    returnDistribution: { type: DistributionSchema, required: true },
    expectedAnnualReturn: { type: Number, required: true },
    expenseRatio: { type: Number, required: true },
    incomeAmtOrPct: { type: String, enum: ["amount", "percent"], required: true},
    incomeDistribution: { type: DistributionSchema, required: true },
    annual_income_interestOrDividends: { type: Number, required: true },
    taxability: { type: Boolean, required: true },
});

investmentTypeSchema.index({ username: 1 });

const InvestmentType = mongoose.model<IInvestmentType>('InvestmentType', investmentTypeSchema);

export default InvestmentType;