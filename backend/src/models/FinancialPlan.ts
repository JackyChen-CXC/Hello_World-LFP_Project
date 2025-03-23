import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { IUser } from "./User";
// import Investment, { IInvestment } from "./Investment";
// import LifeEvent, { ILifeEvent } from "./LifeEvent";
import { DistributionSchema, IDistribution } from "./Distribution";
import { IInvestmentType } from "./InvestmentType";

// Investments individual to Financial Plan (Unlike InvestmentType)
export interface IInvestment extends Document {
    id: string;
    investmentType: IInvestmentType;
    investmentName?: string;
    investmentDescription?: string;
    investmentValue?: number;
  
    annualReturnType?: "fixed" | "normal" | "markov";
    annualReturnFixed?: number;
    annualReturnMean?: number;
    annualReturnStdev?: number;
    annualReturnDrift?: number;
    annualReturnVolatility?: number;
  
    annualIncomeType?: "fixed" | "normal" | "markov";
    annualIncomeFixed?: number;
    annualIncomeMean?: number;
    annualIncomeStdev?: number;
    annualIncomeDrift?: number;
    annualIncomeVolatility?: number;
  
    taxability?: "taxable" | "tax-exempt";
    taxFile?: string; // file name or path if stored
  
    taxStatus: "non-retirement" | "pre-tax" | "after-tax";
    accountType?: string;
    value: number;
}  

const InvestmentSchema = new Schema<IInvestment>({
    id: { type: String, required: true },
    investmentType: { type: String, required: true },
    investmentName: { type: String, required: false },
    investmentDescription: { type: String, required: false },
    investmentValue:{ type: Number },
  
    annualReturnType: { type: String, enum: ["fixed", "normal", "markov"], required: false },
    annualReturnFixed: { type: Number },
    annualReturnMean: { type: Number },
    annualReturnStdev: { type: Number },
    annualReturnDrift: { type: Number },
    annualReturnVolatility: { type: Number },
  
    annualIncomeType: { type: String, enum: ["fixed", "normal", "markov"], required: false },
    annualIncomeFixed: { type: Number },
    annualIncomeMean: { type: Number },
    annualIncomeStdev: { type: Number },
    annualIncomeDrift: { type: Number },
    annualIncomeVolatility: { type: Number },
  
    taxability: { type: String, enum: ["taxable", "tax-exempt"], required: false },
    taxFile: { type: String }, // store file path or filename reference
  
    accountType: { type: String, enum: ["non-retirement", "pre-tax", "after-tax"], required: true }
  }, { _id: false });
  

// LifeEvents are also individual to Financial Plans
// ATTRIBUTES PER TYPE
// income    -> initialAmount, changeAmtOrPct, changeDistribution, inflationAdjusted, userFraction, socialSecurity
// expense   -> initialAmount, changeAmtOrPct, changeDistribution, inflationAdjusted, userFraction, discretionary
// invest    -> assetAllocation, glidePath, assetAllocation2, maxCash
// rebalance -> assetAllocation
export interface ILifeEvent extends Document {
    id: string;
    name: string;
    description: string;
    lifeEventType: "income" | "expense" | "invest" | "rebalance";
  
    // Start
    startType?: "startingYear" | "normal" | "startEvent" | "startEndEvent";
    startYear?: number;
    startMean?: number;
    startStdev?: number;
    startEvent?: string;
    startEndEvent?: string;
  
    durationYears: number;

    annualChangeType?: "fixed" | "normal";
    annualChangeFixed?: number;
    annualChangeMean?: number;
    annualChangeStdev?: number;

    inflationType?: "fixed" | "normal";
    inflationFixed?: number;
    inflationMean?: number;
    inflationStdev?: number;
  
    inflationAdjusted?: boolean;
    userFraction?: number;
    socialSecurity?: boolean;
    discretionary?: boolean;

    assetAllocation?: Record<string, number>;
    glidePath?: boolean;
    assetAllocation2?: Record<string, number>;
    maxCash?: number;
  }
  

const LifeEventSchema = new Schema<ILifeEvent>({
    id: { type: String, required: true },
    lifeEventType: { type: String, enum: ["income", "expense", "invest", "rebalance"], required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
  
    // Start Date Options
    startType: { type: String, enum: ["startingYear", "normal", "startEvent", "startEndEvent"] },
    startYear: { type: Number },
    startMean: { type: Number },
    startStdev: { type: Number },
    startEvent: { type: String },
    startEndEvent: { type: String },
  
    durationYears: { type: Number, required: true },
  
    // Annual Change
    annualChangeType: { type: String, enum: ["fixed", "normal"] },
    annualChangeFixed: { type: Number },
    annualChangeMean: { type: Number },
    annualChangeStdev: { type: Number },
  
    // Inflation
    inflationType: { type: String, enum: ["fixed", "normal"] },
    inflationFixed: { type: Number },
    inflationMean: { type: Number },
    inflationStdev: { type: Number },
  
    // Extra Optional Flags
    inflationAdjusted: { type: Boolean },
    userFraction: { type: Number },
    socialSecurity: { type: Boolean },
    discretionary: { type: Boolean },
  
    // Investment-specific
    assetAllocation: { type: Map, of: Number },
    glidePath: { type: Boolean },
    assetAllocation2: { type: Map, of: Number },
    maxCash: { type: Number }
  }, { _id: false });
  

// FROM CHATGPT, AS A ALTERNATIVE TO INDIVIDUAL REQUIRED FUNCTIONS
// **Pre-validation for required fields**
// LifeEventSchema.pre("validate", function (next) {
//     const event = this as ILifeEvent;
//     const requiredFieldsByType: Record<string, string[]> = {
//         income: ["initialAmount", "changeAmtOrPct", "changeDistribution", "inflationAdjusted", "userFraction", "socialSecurity"],
//         expense: ["initialAmount", "changeAmtOrPct", "changeDistribution", "inflationAdjusted", "userFraction", "discretionary"],
//         invest: ["assetAllocation", "glidePath", "assetAllocation2", "maxCash"],
//         rebalance: ["assetAllocation"],
//     };

//     const requiredFields = requiredFieldsByType[event.type] || [];

//     for (const field of requiredFields) {
//         if (event[field] === undefined) {
//             return next(new Error(`Missing required field "${field}" for event type "${event.type}"`));
//         }
//     }
//     next();
// });

// Actual Financial Plan

export interface IFinancialPlan extends Document {
    userId: IUser;
    name: string;
    maritalStatus: "couple" | "individual"
    currentAge: number[];
    spouseAge: number[];
    birthYears: number[];
    lifeExpectancy: IDistribution[];
    spousebirthyear: IDistribution[];
    investmentTypes: IInvestmentType[];
    investments: IInvestment[];
    eventSeries: ILifeEvent[];
    inflationAssumption: IDistribution;
    afterTaxContributionLimit: number;
    spendingStrategy: string[];
    expenseWithdrawalStrategy: string[]; // list of investments, identified by id
    RMDStrategy: string[];  // list of pre-tax investments, identified by id
    RothConversionOpt: boolean;
    RothConversionStart: number;
    RothConversionEnd: number;
    RothConversionStrategy: string[]; // ist of pre-tax investments, identified by id
    financialGoal: number;
    residenceState: string;
    // Sharing Controls
    // for now 2 seperate arrays (not sure if can tuple)
    sharedUsersId: IUser[];
    sharedUserPerms: string[];
    version: number;
}

const financialplanSchema = new Schema<IFinancialPlan>({
    userId: { type: String, required: true }, // was Schema.Types.ObjectId
    name: { type: String, required: true },
    maritalStatus : { type: String, enum: ["couple", "individual"] },
    currentAge: { type: [Number], required: true , default: [] },
    spouseAge: { type: [Number], required: false, default:[] },
    birthYears: { type: [Number], required: true , default: [] },
    lifeExpectancy: { type: [DistributionSchema], required: true },
    spousebirthyear: { type: [Number], required: false , default: [] },
    investmentTypes: { type: [Schema.Types.ObjectId], ref: "InvestmentType", required: true},
    investments: { type: [InvestmentSchema], required: true, default: [] },
    eventSeries: { type: [LifeEventSchema], required: true, default: [] },
    inflationAssumption: { type: DistributionSchema, required: true},
    afterTaxContributionLimit: { type: Number, required: true },
    spendingStrategy: { type: [String], required: true, default: [] },
    expenseWithdrawalStrategy: { type: [String], required: true, default: [] },
    RMDStrategy: { type: [String], required: true, default: []  },
    RothConversionOpt: { type: Boolean, required: true, default: false },
    RothConversionStart: { type: Number, required: true },
    RothConversionEnd: { type: Number, required: true },
    RothConversionStrategy: { type: [String], default: [] },
    financialGoal: { type: Number, required: true },
    residenceState: { type: String, required: true },
    sharedUsersId: { type: [Schema.Types.ObjectId], ref: "User", required: true, default: [] }, 
    sharedUserPerms: { type: [String], required: true, default: [] },
    version: { type: Number, required: true, default: 1 },
});

// Index for faster queries by userId
financialplanSchema.index({ userId: 1 });

const FinancialPlan = mongoose.model<IFinancialPlan>("FinancialPlan", financialplanSchema);

export default FinancialPlan;