import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { ISimulation } from "./Simulation";

export interface ISimulationResult extends Document {
    simulationId: ObjectId;
    // ISSUE - not sure what to have here so it's empty for now
    // results: | null;
}

const simulationResultSchema = new Schema<ISimulationResult>({
    simulationId: { type: Schema.Types.ObjectId, ref: "Simulation", required: true },
});

simulationResultSchema.index({ simulationId: 1 });

const SimulationResult = mongoose.model<ISimulationResult>('SimulationResult', simulationResultSchema);

export default SimulationResult;