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
// import Investment, { IInvestment } from "./Investment";
// import LifeEvent, { ILifeEvent } from "./LifeEvent";
var Distribution_1 = require("./Distribution");
var InvestmentType_1 = require("./InvestmentType");
var InvestmentSchema = new mongoose_1.Schema({
    investmentType: { type: String, required: true },
    value: { type: Number, required: true },
    taxStatus: { type: String, enum: ["non-retirement", "pre-tax", "after-tax"], required: true },
    id: { type: String, required: true, unique: true },
}, { _id: false });
var LifeEventSchema = new mongoose_1.Schema({
    name: { type: String, required: true, default: "" },
    description: { type: String },
    start: { type: Distribution_1.DistributionSchema, required: true },
    duration: { type: Distribution_1.DistributionSchema, required: true },
    type: { type: String, required: true, enum: ["income", "expense", "invest", "rebalance"] },
    initialAmount: { type: Number,
        required: function () {
            return this.type === "income" || this.type === "expense";
        } },
    changeAmtOrPct: { type: String, enum: ["amount", "percent"],
        required: function () {
            return this.type === "income" || this.type === "expense";
        } },
    changeDistribution: { type: Distribution_1.DistributionSchema,
        required: function () {
            return this.type === "income" || this.type === "expense";
        } },
    inflationAdjusted: { type: Boolean,
        required: function () {
            return this.type === "income" || this.type === "expense";
        } },
    userFraction: { type: Number,
        required: function () {
            return this.type === "income" || this.type === "expense";
        } },
    socialSecurity: { type: Boolean,
        required: function () {
            return this.type === "income";
        } },
    discretionary: { type: Boolean,
        required: function () {
            return this.type === "expense";
        } },
    assetAllocation: { type: Map, of: Number,
        required: function () {
            return this.type === "invest" || this.type === "rebalance";
        } },
    glidePath: { type: Boolean,
        required: function () {
            return this.type === "invest";
        } },
    assetAllocation2: {
        type: Map,
        of: Number,
        required: function () {
            return this.type === "invest" && this.glidePath === true;
        }
    },
    maxCash: {
        type: Number,
        required: function () {
            return this.type === "invest";
        }
    },
}, { _id: false });
var financialplanSchema = new mongoose_1.Schema({
    userId: { type: String }, // was Schema.Types.ObjectId
    name: { type: String, required: true },
    maritalStatus: { type: String, enum: ["couple", "individual"] },
    birthYears: { type: [Number], required: true, default: [] },
    lifeExpectancy: { type: [Distribution_1.DistributionSchema], required: true, default: [] },
    investmentTypes: { type: [InvestmentType_1.investmentTypeSchema], required: true, default: [] },
    investments: { type: [InvestmentSchema], required: true, default: [] },
    eventSeries: { type: [LifeEventSchema], required: true, default: [] },
    inflationAssumption: { type: Distribution_1.DistributionSchema, required: true },
    afterTaxContributionLimit: { type: Number, required: true },
    spendingStrategy: { type: [String], required: true, default: [] },
    expenseWithdrawalStrategy: { type: [String], required: true, default: [] },
    RMDStrategy: { type: [String], required: true, default: [] },
    RothConversionOpt: { type: Boolean, required: true, default: false },
    RothConversionStart: { type: Number, required: true },
    RothConversionEnd: { type: Number, required: true },
    RothConversionStrategy: { type: [String], default: [] },
    financialGoal: { type: Number, required: true },
    residenceState: { type: String, required: true },
    sharedUsersId: { type: [mongoose_1.Schema.Types.ObjectId], ref: "User", required: true, default: [] },
    sharedUserPerms: { type: [String], required: true, default: [] },
    version: { type: Number, required: true, default: 1 },
});
// Index for faster queries by userId
// financialplanSchema.index({ userId: 1 });
var FinancialPlan = mongoose_1.default.model("FinancialPlan", financialplanSchema);
exports.default = FinancialPlan;
