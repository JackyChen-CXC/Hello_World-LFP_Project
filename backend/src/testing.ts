import mongoose from "mongoose";
import Simulation from "./models/Simulation";
import FinancialPlan from "./models/FinancialPlan";
import SimulationResult from "./models/SimulationResult";

// Creates a template financial plan, simulation & simulation result to simulate the use of each
export const seedTestData = async () => {
  try {
    // First create a financial plan
    const financialPlan = new FinancialPlan({
      name: "Retirement Plan 2045",
      description: "Balanced portfolio targeting retirement at age 65",
      retirementAge: 65,
      currentAge: 35,
      initialInvestment: 250000,
      annualContribution: 25000,
      annualContributionIncrease: 0.03, // 3% annual increase
      inflationAssumption: {
        type: "fixed",
        value: 0.025 // 2.5% inflation
      },
      retirementExpenses: 85000,
      investmentAllocation: [
        { 
          name: "S&P 500 Index Fund", 
          allocation: 0.60, 
          expectedReturn: 0.08
        },
        { 
          name: "US Treasury Bonds", 
          allocation: 0.30, 
          expectedReturn: 0.035
        },
        { 
          name: "Real Estate Investment Trust", 
          allocation: 0.10, 
          expectedReturn: 0.065
        }
      ],
      financialGoal: 2000000,
      savingsRate: 0.20, // 20% of income
      taxBracket: 0.24 // 24% tax bracket
    });

    await financialPlan.save();
    console.log("Financial plan created with ID:", financialPlan._id);

    // Create simulation with sample paths
    const numYears = 30;
    const numSimulations = 1000;
    
    // Generate random paths for investments, expenses, taxes, and discretionary percentages
    const investmentsOverTime = generateSimulationPaths(numSimulations, numYears, 250000, 0.07);
    const expensesOverTime = generateSimulationPaths(numSimulations, numYears, 85000, 0.025);
    const earlyWithdrawalTaxOverTime = generateSimulationPaths(numSimulations, numYears, 0, 0);
    const percentageTotalDiscretionary = generateSimulationPaths(numSimulations, numYears, 0.25, 0.01);

    const simulation = new Simulation({
      planId: financialPlan._id,
      status: "completed",
      InvestmentsOverTime: investmentsOverTime,
      ExpensesOverTime: expensesOverTime,
      earlyWithdrawalTaxOverTime: earlyWithdrawalTaxOverTime,
      percentageTotalDiscretionary: percentageTotalDiscretionary
    });

    await simulation.save();
    console.log("Simulation created with ID:", simulation._id);

    // Create simulation results
    const simulationResult = new SimulationResult({
      simulationId: simulation._id,
      financialGoal: 2000000,
      inflationAssumption: {
        type: "fixed",
        value: 0.025
      },
      probabilityOverTime: calculateProbabilityOverTime(investmentsOverTime, 2000000),
      
      // Average investment values over time
      avgInvestmentsOverTime: [
        250000, 272500, 297025, 323757, 352795, 384546, 418955, 456261, 496724, 540629,
        588285, 640231, 696851, 758567, 825838, 899163, 979088, 1066106, 1161055, 1264750,
        1378577, 1503449, 1640659, 1791318, 1956637, 2137934, 2336649, 2548347, 2777699, 3027692
      ],
      
      // Median investment values over time
      medianInvestmentsOverTime: [
        250000, 271000, 294035, 319228, 346912, 377181, 410141, 446053, 485168, 527957,
        574773, 625902, 681607, 742050, 807835, 879539, 957692, 1042884, 1135743, 1237159,
        1348353, 1470705, 1605068, 1752524, 1914252, 2091535, 2285774, 2498494, 2731359, 2986181
      ],
      
      // Investment ranges (10-90%, 20-80%, 30-70%, 40-60%)
      investmentsRange: generateProbabilityRanges(investmentsOverTime),
      
      // Average expenses over time
      avgExpensesOverTime: [
        85000, 87125, 89303, 91536, 93824, 96170, 98574, 101038, 103564, 106153,
        108807, 111527, 114316, 117174, 120103, 123106, 126184, 129338, 132572, 135886,
        139283, 142765, 146334, 149993, 153742, 157586, 161526, 165564, 169703, 173946
      ],
      
      // Median expenses over time
      medianExpensesOverTime: [
        85000, 86700, 88434, 90203, 92007, 93847, 95724, 97638, 99591, 101583,
        103615, 105687, 107801, 109957, 112156, 114399, 116687, 119021, 121401, 123829,
        126306, 128832, 131409, 134037, 136718, 139452, 142241, 145086, 147988, 150948
      ],
      
      // Expense ranges
      expensesRange: generateProbabilityRanges(expensesOverTime),
      
      // Early withdrawal tax metrics
      avgEarlyWithdrawalTaxOverTime: Array(numYears).fill(0),
      medianEarlyWithdrawalTaxOverTime: Array(numYears).fill(0),
      earlyWithdrawTaxRange: Array(numYears).fill([0, 0, 0, 0, 0, 0, 0, 0]),
      
      // Discretionary spending percentages
      avgTotalDiscretionary: Array(numYears).fill(0.25).map((val, i) => val + (i * 0.002)),
      medianTotalDiscretionary: Array(numYears).fill(0.25).map((val, i) => val + (i * 0.002)),
      totalDiscretionaryRange: generateProbabilityRanges(percentageTotalDiscretionary)
    });

    await simulationResult.save();
    console.log("Simulation result created with ID:", simulationResult._id);
    
    console.log("Simulation result created with ID:", simulationResult._id); // Debugging check

    if (!simulationResult._id) {
       throw new Error("simulationResult._id is undefined after saving.");
    }
    // Update simulation with results ID
    simulation.resultsId = simulationResult._id.toString();
    
    await simulation.save();
    console.log("Updated simulation with result ID");

    console.log("Database seeded with example template.");
    console.log(financialPlan);
    console.log(simulation);
    console.log(simulationResult);
  } catch (error) {
    console.error("Error adding template to database:", error);
    throw error;
  }
};

// Helper function to generate simulation paths
function generateSimulationPaths(numPaths: number, numYears: number, startValue: number, avgGrowth: number) {
  const paths = [];
  
  for (let i = 0; i < numPaths; i++) {
    const path = [startValue];
    
    for (let year = 1; year < numYears; year++) {
      // Generate random growth with some volatility
      const growthRate = avgGrowth + ((Math.random() - 0.5) * 0.04);
      const prevValue = path[year - 1];
      const nextValue = prevValue * (1 + growthRate);
      path.push(Number(nextValue.toFixed(2)));
    }
    
    paths.push(path);
  }
  
  return paths;
}

// Helper function to calculate probability of reaching financial goal
function calculateProbabilityOverTime(investmentPaths: any, goal: number) {
  const numYears = investmentPaths[0].length;
  const numPaths = investmentPaths.length;
  const probabilities = [];
  
  for (let year = 0; year < numYears; year++) {
    let successCount = 0;
    
    for (let path = 0; path < numPaths; path++) {
      if (investmentPaths[path][year] >= goal) {
        successCount++;
      }
    }
    
    probabilities.push(Number((successCount / numPaths).toFixed(4)));
  }
  
  return probabilities;
}

// Helper function to generate probability ranges
function generateProbabilityRanges(paths: any) {
  const numYears = paths[0].length;
  const ranges = [];
  
  for (let year = 0; year < numYears; year++) {
    // Create sample ranges based on the growth pattern
    const baseValue = paths[0][year];
    
    // Format: [10%, 90%, 20%, 80%, 30%, 70%, 40%, 60%]
    ranges.push([
      baseValue * 0.85,  // 10th percentile
      baseValue * 1.15,  // 90th percentile
      baseValue * 0.9,   // 20th percentile
      baseValue * 1.1,   // 80th percentile
      baseValue * 0.95,  // 30th percentile
      baseValue * 1.05,  // 70th percentile
      baseValue * 0.98,  // 40th percentile
      baseValue * 1.02   // 60th percentile
    ].map(v => Number(v.toFixed(2))));
  }
  
  return ranges;
}

export default seedTestData;