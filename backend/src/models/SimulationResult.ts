import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { ISimulation } from "./Simulation";
import { DistributionSchema, IDistribution } from "./Distribution";

export interface ISimulationResult extends Document {
    _id: mongoose.Types.ObjectId;
    simulationId: string;
    // Add all variables required for chart creation? (+ Scenario Exploration?)
    inflationAssumption: IDistribution; // For displaying items in future dollars? (All charts can be shown in future dollars)
    
    // 4.1 Line chart of probability of success over time
    probabilityOverTime: number[]; // % of simulations that reached the financial goal in year & previous years. Good range is 75-90% zone. Aiming for 85% is ideal.

    // 4.2 Shaded line chart of probability ranges for a selected quantity over time
    // Median -> range [10%-90%, 20%-80%, 30%-70%, 40%-60%]
    // range = [min val, max val]
    financialGoal: number;
    investmentsRange: number[][];
    incomeRange: number[][];
    expensesRange: number[][];
    earlyWithdrawTaxRange: number[][];
    // (the percentage is based on the amounts, not the number, 
    // of the discretionary expenses in that year)
    percentageDiscretionaryRange: number[][];

    // 4.3 Stacked bar chart of median or average values of a selected quantity over time
    // Stores results as average/median desired quantity
    // investmentOrder: any[];
    avgInvestmentsOverTime: number[][];
    medianInvestmentsOverTime: number[][];

    // incomeOrder: any[];
    avgIncomeOverTime: number[][];
    medianIncomeOverTime: number[][];
    
    // includes taxes
    // expensesOrder: any[];
    avgExpensesOverTime: number[][];
    medianExpensesOverTime: number[][];
}

const simulationResultSchema = new Schema<ISimulationResult>({
    simulationId: { type: String, required: true },
    inflationAssumption: { type: DistributionSchema, required: true },
    financialGoal: { type: Number, required: true },
    probabilityOverTime: { type: [Number], required: true, default: [] },

    investmentsRange: { type: [[[Number]]], required: true, default: [] },
    incomeRange: { type: [[[Number]]], required: true, default: [] },
    expensesRange: { type: [[[Number]]], required: true, default: [] },
    earlyWithdrawTaxRange: { type: [[[Number]]], required: true, default: [] },
    percentageDiscretionaryRange: { type: [[[Number]]], required: true, default: [] },

    avgInvestmentsOverTime: { type: [[Number]], required: true, default: [] },
    medianInvestmentsOverTime: { type: [[Number]], required: true, default: [] },
    avgIncomeOverTime: { type: [[Number]], required: true, default: [] },
    medianIncomeOverTime: { type: [[Number]], required: true, default: [] },
    avgExpensesOverTime: { type: [[Number]], required: true, default: [] },
    medianExpensesOverTime: { type: [[Number]], required: true, default: [] },
});

// simulationResultSchema.index({ simulationId: 1 });

const SimulationResult = mongoose.model<ISimulationResult>('SimulationResult', simulationResultSchema);

export default SimulationResult;