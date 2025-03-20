import mongoose, { Document, ObjectId, Schema } from "mongoose";

export interface IInvestmentType extends Document {
    name: string;
    description: string;
    returnAmtOrPct: "amount" | "percent";
    // returnDistribution: 
    expectedAnnualReturn: number;
    expenseRatio: number;
    incomeAmtOrPct: "amount" | "percent";
    annual_income_interestOrDividends: number;
    taxability: boolean;
}

const investmentTypeSchema = new Schema<IInvestmentType>({
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    returnAmtOrPct: { type: String, enum: ["amount", "percent"], required: true},
    expectedAnnualReturn: { type: Number, required: true },
    expenseRatio: { type: Number, required: true },
    incomeAmtOrPct: { type: String, enum: ["amount", "percent"], required: true},
    annual_income_interestOrDividends: { type: Number, required: true },
    taxability: { type: Boolean, required: true },
});

investmentTypeSchema.index({ username: 1 });

const InvestmentType = mongoose.model<IInvestmentType>('InvestmentType', investmentTypeSchema);

export default InvestmentType;