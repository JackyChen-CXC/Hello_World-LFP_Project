import mongoose, { Document, Schema } from "mongoose";

export interface ISimulation extends Document {
    planId: string;
    status: string;
    resultsId: string;
    time: String;
}

const simulationSchema = new Schema<ISimulation>({
    planId: { type: String, required: true },
    status: { type: String, required: true, enum: ["pending", "running", "completed", "failed"], default: "pending" },
    resultsId: { type: String, },
    time:  { type: String, },
});

simulationSchema.index({ planId: 1 });

const Simulation = mongoose.model<ISimulation>('Simulation', simulationSchema);

export default Simulation;