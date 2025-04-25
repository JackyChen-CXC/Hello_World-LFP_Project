"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSampleData = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var InvestmentType_1 = __importDefault(require("./models/InvestmentType"));
var FinancialPlan_1 = __importDefault(require("./models/FinancialPlan"));
var Simulation_1 = __importDefault(require("./models/Simulation"));
var SimulationResult_1 = __importDefault(require("./models/SimulationResult"));
/**
 * GET endpoint that creates sample data for testing frontend functionality
 * Creates InvestmentTypes, a Financial Plan, Simulation, and SimulationResults
 */
var getSampleData = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var existingTypes, sampleInvestmentTypes, savedInvestmentTypes, investmentTypeIds, sampleFinancialPlan, savedFinancialPlan, sampleSimulation, savedSimulation, sampleSimulationResult, savedSimulationResult, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                return [4 /*yield*/, InvestmentType_1.default.find()];
            case 1:
                existingTypes = _a.sent();
                if (existingTypes.length > 0) {
                    res.status(200).json({
                        message: 'Sample data already exists in the database',
                        investmentTypes: existingTypes
                    });
                    return [2 /*return*/];
                }
                sampleInvestmentTypes = [
                    {
                        name: "S&P 500 Index Fund",
                        description: "Tracks the performance of the S&P 500 index",
                        returnAmtOrPct: "percent",
                        returnDistribution: {
                            type: "normal",
                            mean: 0.09, // 9% average annual return
                            stdev: 0.16 // 16% standard deviation
                        },
                        expenseRatio: 0.004, // 0.4% expense ratio
                        incomeAmtOrPct: "percent",
                        incomeDistribution: {
                            type: "fixed",
                            value: 0.02 // 2% dividend yield
                        },
                        taxability: true
                    },
                    {
                        name: "Total Bond Market ETF",
                        description: "Broad exposure to US investment grade bonds",
                        returnAmtOrPct: "percent",
                        returnDistribution: {
                            type: "normal",
                            mean: 0.04, // 4% average annual return
                            stdev: 0.05 // 5% standard deviation
                        },
                        expenseRatio: 0.003, // 0.3% expense ratio
                        incomeAmtOrPct: "percent",
                        incomeDistribution: {
                            type: "fixed",
                            value: 0.03 // 3% yield
                        },
                        taxability: true
                    },
                    {
                        name: "Money Market Fund",
                        description: "Short-term, high-quality investments",
                        returnAmtOrPct: "percent",
                        returnDistribution: {
                            type: "fixed",
                            value: 0.03 // 3% fixed return
                        },
                        expenseRatio: 0.0015, // 0.15% expense ratio
                        incomeAmtOrPct: "percent",
                        incomeDistribution: {
                            type: "fixed",
                            value: 0.03 // 3% yield
                        },
                        taxability: true
                    }
                ];
                return [4 /*yield*/, InvestmentType_1.default.insertMany(sampleInvestmentTypes)];
            case 2:
                savedInvestmentTypes = _a.sent();
                investmentTypeIds = savedInvestmentTypes.map(function (type) { return type._id; });
                sampleFinancialPlan = {
                    userId: new mongoose_1.default.Types.ObjectId().toString(),
                    name: "Retirement Plan 2040",
                    maritalStatus: "couple",
                    birthYears: [1980, 1982],
                    lifeExpectancy: [
                        {
                            type: "normal",
                            mean: 85,
                            stdev: 5
                        },
                        {
                            type: "normal",
                            mean: 87,
                            stdev: 5
                        }
                    ],
                    investmentTypes: investmentTypeIds,
                    investments: [
                        {
                            investmentType: "S&P 500 Index Fund",
                            value: 250000,
                            taxStatus: "pre-tax",
                            id: "inv1"
                        },
                        {
                            investmentType: "Total Bond Market ETF",
                            value: 150000,
                            taxStatus: "pre-tax",
                            id: "inv2"
                        },
                        {
                            investmentType: "S&P 500 Index Fund",
                            value: 100000,
                            taxStatus: "after-tax",
                            id: "inv3"
                        },
                        {
                            investmentType: "Money Market Fund",
                            value: 50000,
                            taxStatus: "non-retirement",
                            id: "inv4"
                        }
                    ],
                    eventSeries: [
                        {
                            name: "Salary Income",
                            description: "Annual income from employment",
                            start: {
                                type: "fixed",
                                value: 2025
                            },
                            duration: {
                                type: "fixed",
                                value: 15
                            },
                            type: "income",
                            initialAmount: 150000,
                            changeAmtOrPct: "percent",
                            changeDistribution: {
                                type: "fixed",
                                value: 0.03
                            },
                            inflationAdjusted: true,
                            userFraction: 1,
                            socialSecurity: false
                        },
                        {
                            name: "Social Security",
                            description: "Social security benefits",
                            start: {
                                type: "fixed",
                                value: 2040
                            },
                            duration: {
                                type: "fixed",
                                value: 20
                            },
                            type: "income",
                            initialAmount: 40000,
                            changeAmtOrPct: "percent",
                            changeDistribution: {
                                type: "fixed",
                                value: 0.02
                            },
                            inflationAdjusted: true,
                            userFraction: 1,
                            socialSecurity: true
                        },
                        {
                            name: "Living Expenses",
                            description: "Basic living expenses",
                            start: {
                                type: "fixed",
                                value: 2025
                            },
                            duration: {
                                type: "fixed",
                                value: 20
                            },
                            type: "expense",
                            initialAmount: 80000,
                            changeAmtOrPct: "percent",
                            changeDistribution: {
                                type: "fixed",
                                value: 0.02
                            },
                            inflationAdjusted: true,
                            userFraction: 1,
                            discretionary: false
                        },
                        {
                            name: "Travel Expenses",
                            description: "Annual travel budget",
                            start: {
                                type: "fixed",
                                value: 2040
                            },
                            duration: {
                                type: "fixed",
                                value: 20
                            },
                            type: "expense",
                            initialAmount: 20000,
                            changeAmtOrPct: "percent",
                            changeDistribution: {
                                type: "fixed",
                                value: 0
                            },
                            inflationAdjusted: true,
                            userFraction: 1,
                            discretionary: true
                        },
                        {
                            name: "Initial Investment Allocation",
                            description: "Asset allocation strategy",
                            start: {
                                type: "fixed",
                                value: 2025
                            },
                            duration: {
                                type: "fixed",
                                value: 15
                            },
                            type: "invest",
                            assetAllocation: {
                                "S&P 500 Index Fund": 0.7,
                                "Total Bond Market ETF": 0.2,
                                "Money Market Fund": 0.1
                            },
                            glidePath: true,
                            assetAllocation2: {
                                "S&P 500 Index Fund": 0.5,
                                "Total Bond Market ETF": 0.4,
                                "Money Market Fund": 0.1
                            },
                            maxCash: 50000
                        },
                        {
                            name: "Annual Rebalance",
                            description: "Yearly portfolio rebalancing",
                            start: {
                                type: "fixed",
                                value: 2025
                            },
                            duration: {
                                type: "fixed",
                                value: 20
                            },
                            type: "rebalance",
                            assetAllocation: {
                                "S&P 500 Index Fund": 0.6,
                                "Total Bond Market ETF": 0.3,
                                "Money Market Fund": 0.1
                            }
                        }
                    ],
                    inflationAssumption: {
                        type: "normal",
                        mean: 0.025,
                        stdev: 0.01
                    },
                    afterTaxContributionLimit: 22500,
                    spendingStrategy: ["inv4", "inv3", "inv1", "inv2"],
                    expenseWithdrawalStrategy: ["inv4", "inv3", "inv1", "inv2"],
                    RMDStrategy: ["inv1", "inv2"],
                    RothConversionOpt: true,
                    RothConversionStart: 2040,
                    RothConversionEnd: 2045,
                    RothConversionStrategy: ["inv1", "inv2"],
                    financialGoal: 2000000,
                    residenceState: "California",
                };
                return [4 /*yield*/, FinancialPlan_1.default.create(sampleFinancialPlan)];
            case 3:
                savedFinancialPlan = _a.sent();
                sampleSimulation = {
                    planId: savedFinancialPlan._id.toString(),
                    status: "completed",
                    resultsId: "", // Will be updated after creating the result
                    InvestmentsOverTime: [
                        // 10 paths x 20 years of predefined data
                        Array(20).fill(0).map(function (_, i) { return 550000 + i * 50000 + Math.random() * 20000; }),
                        Array(20).fill(0).map(function (_, i) { return 530000 + i * 45000 + Math.random() * 20000; }),
                        Array(20).fill(0).map(function (_, i) { return 560000 + i * 48000 + Math.random() * 20000; }),
                        Array(20).fill(0).map(function (_, i) { return 540000 + i * 52000 + Math.random() * 20000; }),
                        Array(20).fill(0).map(function (_, i) { return 555000 + i * 49000 + Math.random() * 20000; }),
                        Array(20).fill(0).map(function (_, i) { return 545000 + i * 51000 + Math.random() * 20000; }),
                        Array(20).fill(0).map(function (_, i) { return 535000 + i * 53000 + Math.random() * 20000; }),
                        Array(20).fill(0).map(function (_, i) { return 565000 + i * 47000 + Math.random() * 20000; }),
                        Array(20).fill(0).map(function (_, i) { return 570000 + i * 46000 + Math.random() * 20000; }),
                        Array(20).fill(0).map(function (_, i) { return 525000 + i * 54000 + Math.random() * 20000; })
                    ],
                    ExpensesOverTime: [
                        // 10 paths x 20 years of predefined data
                        Array(20).fill(0).map(function (_, i) { return 80000 + i * 2000 + Math.random() * 5000; }),
                        Array(20).fill(0).map(function (_, i) { return 82000 + i * 1900 + Math.random() * 5000; }),
                        Array(20).fill(0).map(function (_, i) { return 79000 + i * 2100 + Math.random() * 5000; }),
                        Array(20).fill(0).map(function (_, i) { return 81000 + i * 2050 + Math.random() * 5000; }),
                        Array(20).fill(0).map(function (_, i) { return 83000 + i * 1950 + Math.random() * 5000; }),
                        Array(20).fill(0).map(function (_, i) { return 78000 + i * 2150 + Math.random() * 5000; }),
                        Array(20).fill(0).map(function (_, i) { return 80500 + i * 2025 + Math.random() * 5000; }),
                        Array(20).fill(0).map(function (_, i) { return 81500 + i * 2075 + Math.random() * 5000; }),
                        Array(20).fill(0).map(function (_, i) { return 79500 + i * 2125 + Math.random() * 5000; }),
                        Array(20).fill(0).map(function (_, i) { return 82500 + i * 1975 + Math.random() * 5000; })
                    ],
                    earlyWithdrawalTaxOverTime: [
                        // 10 paths x 20 years of predefined data 
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : 5000 + Math.random() * 1000; }),
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : 4800 + Math.random() * 1000; }),
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : 5200 + Math.random() * 1000; }),
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : 4900 + Math.random() * 1000; }),
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : 5100 + Math.random() * 1000; }),
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : 4700 + Math.random() * 1000; }),
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : 5300 + Math.random() * 1000; }),
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : 4600 + Math.random() * 1000; }),
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : 5400 + Math.random() * 1000; }),
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : 4500 + Math.random() * 1000; })
                    ],
                    percentageTotalDiscretionary: [
                        // 10 paths x 20 years of predefined percentage data
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.2 + i * 0.005 + Math.random() * 0.05)); }),
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.19 + i * 0.0045 + Math.random() * 0.05)); }),
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.21 + i * 0.0055 + Math.random() * 0.05)); }),
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.18 + i * 0.006 + Math.random() * 0.05)); }),
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.22 + i * 0.004 + Math.random() * 0.05)); }),
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.17 + i * 0.0065 + Math.random() * 0.05)); }),
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.23 + i * 0.0035 + Math.random() * 0.05)); }),
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.16 + i * 0.007 + Math.random() * 0.05)); }),
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.24 + i * 0.003 + Math.random() * 0.05)); }),
                        Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.15 + i * 0.0075 + Math.random() * 0.05)); })
                    ]
                };
                return [4 /*yield*/, Simulation_1.default.create(sampleSimulation)];
            case 4:
                savedSimulation = _a.sent();
                sampleSimulationResult = {
                    simulationId: savedSimulation._id,
                    financialGoal: 2000000,
                    inflationAssumption: {
                        type: "normal",
                        mean: 0.025,
                        stdev: 0.01
                    },
                    probabilityOverTime: Array(20).fill(0).map(function (_, i) { return Math.min(0.95, Math.max(0.1, i / 20 * 0.85)); }),
                    // Average values over time
                    avgInvestmentsOverTime: Array(20).fill(0).map(function (_, i) { return 550000 + i * 50000; }),
                    medianInvestmentsOverTime: Array(20).fill(0).map(function (_, i) { return 540000 + i * 48000; }),
                    // Ranges: four ranges per year [min, max] for 10-90%, 20-80%, 30-70%, 40-60%
                    investmentsRange: Array(20).fill(0).map(function (_, i) { return [
                        [500000 + i * 45000, 600000 + i * 55000], // 10-90%
                        [510000 + i * 46000, 590000 + i * 54000], // 20-80%
                        [520000 + i * 47000, 580000 + i * 53000], // 30-70%
                        [530000 + i * 48000, 570000 + i * 52000] // 40-60%
                    ]; }),
                    avgExpensesOverTime: Array(20).fill(0).map(function (_, i) { return 80000 + i * 2000; }),
                    medianExpensesOverTime: Array(20).fill(0).map(function (_, i) { return 79000 + i * 1900; }),
                    expensesRange: Array(20).fill(0).map(function (_, i) { return [
                        [75000 + i * 1800, 85000 + i * 2200], // 10-90%
                        [76000 + i * 1850, 84000 + i * 2150], // 20-80%
                        [77000 + i * 1900, 83000 + i * 2100], // 30-70%
                        [78000 + i * 1950, 82000 + i * 2050] // 40-60%
                    ]; }),
                    avgEarlyWithdrawalTaxOverTime: Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : 5000; }),
                    medianEarlyWithdrawalTaxOverTime: Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : 4800; }),
                    earlyWithdrawTaxRange: Array(20).fill(0).map(function (_, i) { return i < 15 ?
                        [[0, 0], [0, 0], [0, 0], [0, 0]] :
                        [
                            [4000, 6000], // 10-90%
                            [4200, 5800], // 20-80%
                            [4400, 5600], // 30-70%
                            [4600, 5400] // 40-60%
                        ]; }),
                    avgTotalDiscretionary: Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : Math.min(0.5, 0.2 + i * 0.005); }),
                    medianTotalDiscretionary: Array(20).fill(0).map(function (_, i) { return i < 15 ? 0 : Math.min(0.45, 0.19 + i * 0.0048); }),
                    totalDiscretionaryRange: Array(20).fill(0).map(function (_, i) { return i < 15 ?
                        [[0, 0], [0, 0], [0, 0], [0, 0]] :
                        [
                            [Math.max(0, 0.15 + i * 0.004), Math.min(0.6, 0.25 + i * 0.006)], // 10-90%
                            [Math.max(0, 0.16 + i * 0.004), Math.min(0.58, 0.24 + i * 0.006)], // 20-80%
                            [Math.max(0, 0.17 + i * 0.004), Math.min(0.56, 0.23 + i * 0.006)], // 30-70%
                            [Math.max(0, 0.18 + i * 0.004), Math.min(0.54, 0.22 + i * 0.006)] // 40-60%
                        ]; })
                };
                return [4 /*yield*/, SimulationResult_1.default.create(sampleSimulationResult)];
            case 5:
                savedSimulationResult = _a.sent();
                // // Update simulation with result ID
                return [4 /*yield*/, Simulation_1.default.findByIdAndUpdate(savedSimulation._id, {
                        resultsId: savedSimulationResult._id.toString()
                    })];
            case 6:
                // // Update simulation with result ID
                _a.sent();
                // Return success response
                res.status(201).json({
                    message: 'Sample data created successfully',
                    // investmentTypes: savedInvestmentTypes,
                    // financialPlan: savedFinancialPlan,
                    // simulation: savedSimulation,
                    // simulationResult: savedSimulationResult
                });
                return [3 /*break*/, 8];
            case 7:
                error_1 = _a.sent();
                // console.error('Error creating sample data:', error);
                res.status(500).json({
                    message: 'Error creating sample data',
                    error: error_1 instanceof Error ? error_1.message : 'Unknown error'
                });
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.getSampleData = getSampleData;
exports.default = exports.getSampleData;
