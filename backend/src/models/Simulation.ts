import mongoose, { Document, ObjectId, Schema } from "mongoose";

export interface ISimulation extends Document {
    planId: string;
    status: string;
    resultsId: string;
    // Stores all the detailed paths for each simulation inside for depiction using scenario exploration
    InvestmentsOverTime: number[][]; 
    ExpensesOverTime: number[][];
    earlyWithdrawalTaxOverTime: number[][];
    percentageTotalDiscretionary: number[][];
}

const simulationSchema = new Schema<ISimulation>({
    planId: { type: String, required: true },
    status: { type: String, required: true, enum: ["pending", "running", "completed", "failed"], default: "pending" },
    resultsId: { type: String, },
    InvestmentsOverTime: { type: [[Number]], required: true, default: [] },
    ExpensesOverTime: { type: [[Number]], required: true, default: [] },
    earlyWithdrawalTaxOverTime: { type: [[Number]], required: true, default: [] },
    percentageTotalDiscretionary: { type: [[Number]], required: true, default: [] },
});

simulationSchema.index({ planId: 1 });

const Simulation = mongoose.model<ISimulation>('Simulation', simulationSchema);

export default Simulation;