// import mongoose, { Document, ObjectId, Schema } from "mongoose";
// import { IInvestmentType } from "./InvestmentType";

// export interface IInvestment extends Document {
//     investmentType: IInvestmentType;
//     value: number;
//     taxStatus: "non-retirement" | "pre-tax" | "after-tax";
//     id: string;
// }

// const investmentSchema = new Schema<IInvestment>({
//     investmentType: { type: Schema.Types.ObjectId, ref: "InvestmentType", required: true },
//     value: { type: Number, required: true },
//     taxStatus: { type: String, enum: ["non-retirement", "pre-tax", "after-tax"], required: true },
//     id: { type: String, required: true },
    
// });

// investmentSchema.index({ assetType: 1 });

// const Investment = mongoose.model<IInvestment>('Investment', investmentSchema);

// export default Investment;