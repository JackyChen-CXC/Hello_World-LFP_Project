"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importStar(require("mongoose"));
var Distribution_1 = require("./Distribution");
var simulationResultSchema = new mongoose_1.Schema({
    simulationId: { type: String, required: true },
    inflationAssumption: { type: Distribution_1.DistributionSchema, required: true },
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
var SimulationResult = mongoose_1.default.model('SimulationResult', simulationResultSchema);
exports.default = SimulationResult;
