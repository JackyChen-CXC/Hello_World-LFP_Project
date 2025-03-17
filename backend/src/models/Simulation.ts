import mongoose, { Document, ObjectId, Schema } from "mongoose";

export interface ISimulation extends Document {
    planId: ObjectId;
    status: String;
    resultsId: ObjectId | null;
}

const simulationSchema = new Schema<ISimulation>({
    planId: { type: Schema.Types.ObjectId, ref: "FinancialPlan", required: true },
    status: { type: String, required: true, enum: ["pending", "running", "completed", "failed"] },
    resultsId: { type: Schema.Types.ObjectId, ref: "SimulationResult", default: null },
});

simulationSchema.index({ username: 1 });

const Simulation = mongoose.model<ISimulation>('Simulation', simulationSchema);

export default Simulation;