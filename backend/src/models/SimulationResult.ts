import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { ISimulation } from "./Simulation";
import { IDistribution } from "./Distribution";

export interface ISimulationResult extends Document {
    _id: mongoose.Types.ObjectId;
    simulationId: string;
    // Add all variables required for chart creation? (+ Scenario Exploration?)
    financialGoal: number;
    inflationAssumption: IDistribution; // For displaying items in future dollars? (All charts can be shown in future dollars)
    probabilityOverTime: number[]; // % of simulations that reached the financial goal in year & previous years. Good range is 75-90% zone. Aiming for 85% is ideal.
    // Stores results as average/median/probability ranges for desired quantity
    // probability ranges -> 10%-90%, 20%-80%, 30%-70%, 40%-60% -> list of [min val, max val]
    avgInvestmentsOverTime: number[];
    medianInvestmentsOverTime: number[];
    investmentsRange: number[][];

    avgExpensesOverTime: number[];
    medianExpensesOverTime: number[];
    expensesRange: number[][];
    
    avgEarlyWithdrawalTaxOverTime: number[];
    medianEarlyWithdrawalTaxOverTime: number[];
    earlyWithdrawTaxRange: number[][];
    
    avgTotalDiscretionary: number[]; // (the percentage is based on the amounts, not the number, of the discretionary expenses in that year)
    medianTotalDiscretionary: number[];
    totalDiscretionaryRange: number[][];
}

const simulationResultSchema = new Schema<ISimulationResult>({
    simulationId: { type: String, required: true },
    avgInvestmentsOverTime: { type: [Number], required: true, default: [] },
    medianInvestmentsOverTime: { type: [Number], required: true, default: [] },
    investmentsRange: { type: [[[Number]]], required: true, default: [] },
    avgExpensesOverTime: { type: [Number], required: true, default: [] },
    medianExpensesOverTime: { type: [Number], required: true, default: [] },
    expensesRange: { type: [[[Number]]], required: true, default: [] },
    avgEarlyWithdrawalTaxOverTime: { type: [Number], required: true, default: [] },
    medianEarlyWithdrawalTaxOverTime: { type: [Number], required: true, default: [] },
    earlyWithdrawTaxRange: { type: [[[Number]]], required: true, default: [] },
    avgTotalDiscretionary: { type: [Number], required: true, default: [] },
    medianTotalDiscretionary: { type: [Number], required: true, default: [] },
    totalDiscretionaryRange: { type: [[[Number]]], required: true, default: [] },
});

// simulationResultSchema.index({ simulationId: 1 });

const SimulationResult = mongoose.model<ISimulationResult>('SimulationResult', simulationResultSchema);

export default SimulationResult;