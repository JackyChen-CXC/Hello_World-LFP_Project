import mongoose, { Document, ObjectId, Schema } from "mongoose";

export interface IInvestmentType extends Document {
    name: String;
    description: String;
    expectedAnnualReturn: number;
    expenseRatio: number;
    annual_income_interestOrDividends: number;
    taxability: boolean;
}

const investmentTypeSchema = new Schema<IInvestmentType>({
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    expectedAnnualReturn: { type: Number, required: true },
    expenseRatio: { type: Number, required: true },
    annual_income_interestOrDividends: { type: Number, required: true },
    taxability: { type: Boolean, required: true },
});

investmentTypeSchema.index({ username: 1 });

const InvestmentType = mongoose.model<IInvestmentType>('Investment', investmentTypeSchema);

export default InvestmentType;