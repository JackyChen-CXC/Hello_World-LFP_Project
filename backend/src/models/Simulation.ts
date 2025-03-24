import mongoose, { Document, ObjectId, Schema } from "mongoose";

export interface ISimulation extends Document {
    planId: ObjectId;
    status: String;
    resultsId: ObjectId | null;
    // Stores all the detailed paths for each simulation inside for depiction using scenario exploration
    InvestmentsOverTime: number[][]; 
    ExpensesOverTime: number[][];
    earlyWithdrawalTaxOverTime: number[][];
    percentageTotalDiscretionary: number[][];
}

const simulationSchema = new Schema<ISimulation>({
    planId: { type: Schema.Types.ObjectId, ref: "FinancialPlan", required: true },
    status: { type: String, required: true, enum: ["pending", "running", "completed", "failed"], default: "pending" },
    resultsId: { type: Schema.Types.ObjectId, ref: "SimulationResult", default: null },
    InvestmentsOverTime: { type: [[Number]], required: true, default: [] },
    ExpensesOverTime: { type: [[Number]], required: true, default: [] },
    earlyWithdrawalTaxOverTime: { type: [[Number]], required: true, default: [] },
    percentageTotalDiscretionary: { type: [[Number]], required: true, default: [] },
});

simulationSchema.index({ username: 1 });

const Simulation = mongoose.model<ISimulation>('Simulation', simulationSchema);

export default Simulation;