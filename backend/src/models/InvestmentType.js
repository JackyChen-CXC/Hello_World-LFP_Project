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
exports.investmentTypeSchema = void 0;
// Investment Type is the type of Investment made, ex: specific company, bond, etc
// People can Invest in the Investment Type (Make Investment object)
var mongoose_1 = __importStar(require("mongoose"));
var Distribution_1 = require("./Distribution");
exports.investmentTypeSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    returnAmtOrPct: { type: String, enum: ["amount", "percent"], required: true },
    returnDistribution: { type: Distribution_1.DistributionSchema, required: true },
    expenseRatio: { type: Number, required: true },
    incomeAmtOrPct: { type: String, enum: ["amount", "percent"], required: true },
    incomeDistribution: { type: Distribution_1.DistributionSchema, required: true },
    taxability: { type: Boolean, required: true },
});
var InvestmentType = mongoose_1.default.model('InvestmentType', exports.investmentTypeSchema);
exports.default = InvestmentType;
