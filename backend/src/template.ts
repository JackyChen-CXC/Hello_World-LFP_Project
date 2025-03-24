import { Request, Response } from 'express';
import mongoose from 'mongoose';
import InvestmentType from './models/InvestmentType';
import FinancialPlan from './models/FinancialPlan';
import Simulation from './models/Simulation';
import SimulationResult from './models/SimulationResult';


/**
 * GET endpoint that creates sample data for testing frontend functionality
 * Creates InvestmentTypes, a Financial Plan, Simulation, and SimulationResults
 */
export const getSampleData = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if data already exists in the database
    const existingTypes = await InvestmentType.find();
    
    if (existingTypes.length > 0) {
      res.status(200).json({ 
        message: 'Sample data already exists in the database',
        investmentTypes: existingTypes
      });
      return;
    }

    // 1. Sample Investment Types
    const sampleInvestmentTypes = [
      {
        name: "S&P 500 Index Fund",
        description: "Tracks the performance of the S&P 500 index",
        returnAmtOrPct: "percent",
        returnDistribution: {
          type: "normal",
          mean: 0.09,  // 9% average annual return
          stdev: 0.16  // 16% standard deviation
        },
        expenseRatio: 0.004, // 0.4% expense ratio
        incomeAmtOrPct: "percent",
        incomeDistribution: {
          type: "fixed",
          value: 0.02  // 2% dividend yield
        },
        taxability: true
      },
      {
        name: "Total Bond Market ETF",
        description: "Broad exposure to US investment grade bonds",
        returnAmtOrPct: "percent",
        returnDistribution: {
          type: "normal",
          mean: 0.04,  // 4% average annual return
          stdev: 0.05  // 5% standard deviation
        },
        expenseRatio: 0.003, // 0.3% expense ratio
        incomeAmtOrPct: "percent",
        incomeDistribution: {
          type: "fixed",
          value: 0.03  // 3% yield
        },
        taxability: true
      },
      {
        name: "Money Market Fund",
        description: "Short-term, high-quality investments",
        returnAmtOrPct: "percent",
        returnDistribution: {
          type: "fixed",
          value: 0.03  // 3% fixed return
        },
        expenseRatio: 0.0015, // 0.15% expense ratio
        incomeAmtOrPct: "percent",
        incomeDistribution: {
          type: "fixed",
          value: 0.03  // 3% yield
        },
        taxability: true
      }
    ];

    // Insert investment types
    const savedInvestmentTypes = await InvestmentType.insertMany(sampleInvestmentTypes);
    const investmentTypeIds = savedInvestmentTypes.map(type => type._id);

    // 2. Sample Financial Plan
    const sampleFinancialPlan = {
      userId: new mongoose.Types.ObjectId().toString(),
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

    // Insert financial plan
    const savedFinancialPlan = await FinancialPlan.create(sampleFinancialPlan);

    // 3. Sample Simulation
    const sampleSimulation = {
      planId: savedFinancialPlan._id.toString(),
      status: "completed",
      resultsId: "", // Will be updated after creating the result
      InvestmentsOverTime: [
        // 10 paths x 20 years of predefined data
        Array(20).fill(0).map((_, i) => 550000 + i * 50000 + Math.random() * 20000),
        Array(20).fill(0).map((_, i) => 530000 + i * 45000 + Math.random() * 20000),
        Array(20).fill(0).map((_, i) => 560000 + i * 48000 + Math.random() * 20000),
        Array(20).fill(0).map((_, i) => 540000 + i * 52000 + Math.random() * 20000),
        Array(20).fill(0).map((_, i) => 555000 + i * 49000 + Math.random() * 20000),
        Array(20).fill(0).map((_, i) => 545000 + i * 51000 + Math.random() * 20000),
        Array(20).fill(0).map((_, i) => 535000 + i * 53000 + Math.random() * 20000),
        Array(20).fill(0).map((_, i) => 565000 + i * 47000 + Math.random() * 20000),
        Array(20).fill(0).map((_, i) => 570000 + i * 46000 + Math.random() * 20000),
        Array(20).fill(0).map((_, i) => 525000 + i * 54000 + Math.random() * 20000)
      ],
      ExpensesOverTime: [
        // 10 paths x 20 years of predefined data
        Array(20).fill(0).map((_, i) => 80000 + i * 2000 + Math.random() * 5000),
        Array(20).fill(0).map((_, i) => 82000 + i * 1900 + Math.random() * 5000),
        Array(20).fill(0).map((_, i) => 79000 + i * 2100 + Math.random() * 5000),
        Array(20).fill(0).map((_, i) => 81000 + i * 2050 + Math.random() * 5000),
        Array(20).fill(0).map((_, i) => 83000 + i * 1950 + Math.random() * 5000),
        Array(20).fill(0).map((_, i) => 78000 + i * 2150 + Math.random() * 5000),
        Array(20).fill(0).map((_, i) => 80500 + i * 2025 + Math.random() * 5000),
        Array(20).fill(0).map((_, i) => 81500 + i * 2075 + Math.random() * 5000),
        Array(20).fill(0).map((_, i) => 79500 + i * 2125 + Math.random() * 5000),
        Array(20).fill(0).map((_, i) => 82500 + i * 1975 + Math.random() * 5000)
      ],
      earlyWithdrawalTaxOverTime: [
        // 10 paths x 20 years of predefined data 
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : 5000 + Math.random() * 1000),
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : 4800 + Math.random() * 1000),
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : 5200 + Math.random() * 1000),
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : 4900 + Math.random() * 1000),
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : 5100 + Math.random() * 1000),
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : 4700 + Math.random() * 1000),
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : 5300 + Math.random() * 1000),
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : 4600 + Math.random() * 1000),
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : 5400 + Math.random() * 1000),
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : 4500 + Math.random() * 1000)
      ],
      percentageTotalDiscretionary: [
        // 10 paths x 20 years of predefined percentage data
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.2 + i * 0.005 + Math.random() * 0.05))),
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.19 + i * 0.0045 + Math.random() * 0.05))),
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.21 + i * 0.0055 + Math.random() * 0.05))),
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.18 + i * 0.006 + Math.random() * 0.05))),
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.22 + i * 0.004 + Math.random() * 0.05))),
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.17 + i * 0.0065 + Math.random() * 0.05))),
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.23 + i * 0.0035 + Math.random() * 0.05))),
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.16 + i * 0.007 + Math.random() * 0.05))),
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.24 + i * 0.003 + Math.random() * 0.05))),
        Array(20).fill(0).map((_, i) => i < 15 ? 0 : Math.min(0.9, Math.max(0.1, 0.15 + i * 0.0075 + Math.random() * 0.05)))
      ]
    };

    const savedSimulation = await Simulation.create(sampleSimulation);

    // 4. Sample Simulation Result
    const sampleSimulationResult = {
      simulationId: savedSimulation._id,
      financialGoal: 2000000,
      inflationAssumption: {
        type: "normal",
        mean: 0.025,
        stdev: 0.01
      },
      probabilityOverTime: Array(20).fill(0).map((_, i) => Math.min(0.95, Math.max(0.1, i / 20 * 0.85))),
      
      // Average values over time
      avgInvestmentsOverTime: Array(20).fill(0).map((_, i) => 550000 + i * 50000),
      medianInvestmentsOverTime: Array(20).fill(0).map((_, i) => 540000 + i * 48000),
      
      // Ranges: four ranges per year [min, max] for 10-90%, 20-80%, 30-70%, 40-60%
      investmentsRange: Array(20).fill(0).map((_, i) => [
        [500000 + i * 45000, 600000 + i * 55000],  // 10-90%
        [510000 + i * 46000, 590000 + i * 54000],  // 20-80%
        [520000 + i * 47000, 580000 + i * 53000],  // 30-70%
        [530000 + i * 48000, 570000 + i * 52000]   // 40-60%
      ]),
      
      avgExpensesOverTime: Array(20).fill(0).map((_, i) => 80000 + i * 2000),
      medianExpensesOverTime: Array(20).fill(0).map((_, i) => 79000 + i * 1900),
      
      expensesRange: Array(20).fill(0).map((_, i) => [
        [75000 + i * 1800, 85000 + i * 2200],  // 10-90%
        [76000 + i * 1850, 84000 + i * 2150],  // 20-80%
        [77000 + i * 1900, 83000 + i * 2100],  // 30-70%
        [78000 + i * 1950, 82000 + i * 2050]   // 40-60%
      ]),
      
      avgEarlyWithdrawalTaxOverTime: Array(20).fill(0).map((_, i) => i < 15 ? 0 : 5000),
      medianEarlyWithdrawalTaxOverTime: Array(20).fill(0).map((_, i) => i < 15 ? 0 : 4800),
      
      earlyWithdrawTaxRange: Array(20).fill(0).map((_, i) => i < 15 ? 
        [[0, 0], [0, 0], [0, 0], [0, 0]] : 
        [
          [4000, 6000],  // 10-90%
          [4200, 5800],  // 20-80%
          [4400, 5600],  // 30-70%
          [4600, 5400]   // 40-60%
        ]
      ),
      
      avgTotalDiscretionary: Array(20).fill(0).map((_, i) => i < 15 ? 0 : Math.min(0.5, 0.2 + i * 0.005)),
      medianTotalDiscretionary: Array(20).fill(0).map((_, i) => i < 15 ? 0 : Math.min(0.45, 0.19 + i * 0.0048)),
      
      totalDiscretionaryRange: Array(20).fill(0).map((_, i) => i < 15 ? 
        [[0, 0], [0, 0], [0, 0], [0, 0]] : 
        [
          [Math.max(0, 0.15 + i * 0.004), Math.min(0.6, 0.25 + i * 0.006)],  // 10-90%
          [Math.max(0, 0.16 + i * 0.004), Math.min(0.58, 0.24 + i * 0.006)],  // 20-80%
          [Math.max(0, 0.17 + i * 0.004), Math.min(0.56, 0.23 + i * 0.006)],  // 30-70%
          [Math.max(0, 0.18 + i * 0.004), Math.min(0.54, 0.22 + i * 0.006)]   // 40-60%
        ]
      )
    };

    // console.log(sampleSimulationResult.investmentsRange);

    const savedSimulationResult = await SimulationResult.create(sampleSimulationResult);

    // // Update simulation with result ID
    await Simulation.findByIdAndUpdate(savedSimulation._id, { 
      resultsId: savedSimulationResult._id.toString() 
    });

    // Return success response
    res.status(201).json({
      message: 'Sample data created successfully',
      // investmentTypes: savedInvestmentTypes,
      // financialPlan: savedFinancialPlan,
      // simulation: savedSimulation,
      // simulationResult: savedSimulationResult
    });
    
  } catch (error) {
    // console.error('Error creating sample data:', error);
    res.status(500).json({ 
      message: 'Error creating sample data', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export default getSampleData;