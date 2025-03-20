// import { Document, Schema, model } from "mongoose";

// export interface ILifeEvent extends Document {
//     name: string;
//     description: string;
//     startYear: number;
//     durationYears: number;
//     type: "income" | "expense" | "invest" | "rebalance";
// }

// const lifeEventSchema = new Schema<ILifeEvent>({
//     name: { type: String, required: true },
//     description: { type: String, default: "" },
//     startYear: { type: Number, required: true },
//     durationYears: { type: Number, required: true },
//     type: { type: String, required: true, enum: ["income", "expense", "invest", "rebalance"] },
// }, { discriminatorKey: "type", collection: "lifeEvents" });

// lifeEventSchema.index({ type: 1 });

// export const LifeEvent = model<ILifeEvent>("LifeEvent", lifeEventSchema);

// /** Sub-Schemas Using Discriminators */

// // Income Type
// export interface IIncomeEvent extends ILifeEvent {
//     initialAmount: number;
//     expected_annual_change: number;
//     inflation: boolean;
//     socialSecurity: boolean;
//     wages: boolean;
//     percentageUserSpouse: number;
// }

// const incomeEventSchema = new Schema<IIncomeEvent>({
//     initialAmount: { type: Number, required: true },
//     expected_annual_change: { type: Number, required: true },
//     inflation: { type: Boolean, required: true },
//     socialSecurity: { type: Boolean, required: true },
//     wages: { type: Boolean, required: true },
//     percentageUserSpouse: { type: Number, default: 0 },
// });

// export const IncomeEvent = LifeEvent.discriminator<IIncomeEvent>("income", incomeEventSchema);

// // Expense Type
// export interface IExpenseEvent extends ILifeEvent {
//     initialAmount: number;
//     expected_annual_change: number;
//     inflation: boolean;
//     discretionary: boolean;
//     percentageUserSpouse: number;
// }

// const expenseEventSchema = new Schema<IExpenseEvent>({
//     initialAmount: { type: Number, required: true },
//     expected_annual_change: { type: Number, required: true },
//     inflation: { type: Boolean, required: true },
//     discretionary: { type: Boolean, required: true },
//     percentageUserSpouse: { type: Number, default: 0 },
// });

// export const ExpenseEvent = LifeEvent.discriminator<IExpenseEvent>("expense", expenseEventSchema);

// // Invest Type
// export interface IInvestEvent extends ILifeEvent {
//     fixedAllocation: Record<string, number>;
//     useGlidePath: boolean;
//     initialAllocation: Record<string, number>;
//     finalAllocation: Record<string, number>;
//     maximumCash: number;
// }

// const investEventSchema = new Schema<IInvestEvent>({
//     fixedAllocation: { type: Map, of: Number, default: {} },
//     useGlidePath: { type: Boolean, required: true },
//     initialAllocation: { type: Map, of: Number, default: {} },
//     finalAllocation: { type: Map, of: Number, default: {} },
//     maximumCash: { type: Number, required: true },
// });

// export const InvestEvent = LifeEvent.discriminator<IInvestEvent>("invest", investEventSchema);

// export interface IRebalanceEvent extends ILifeEvent {
//     fixedAllocation: Record<string, number>;
// }

// // Rebalance Type
// const rebalanceEventSchema = new Schema<IRebalanceEvent>({
//     fixedAllocation: { type: Map, of: Number, default: {} },
// });

// export const RebalanceEvent = LifeEvent.discriminator<IRebalanceEvent>("rebalance", rebalanceEventSchema);

// export default LifeEvent;