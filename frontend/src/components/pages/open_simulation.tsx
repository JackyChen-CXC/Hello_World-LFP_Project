import React, { useEffect, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Label,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import "../css_files/page_style.css";
import { useParams } from "react-router-dom";
import Plot from 'react-plotly.js';

// Simulation result data
const mockSimulationResult = {
  _id: "sim-001",
  simulationId: "sim-001",
  inflationAssumption: {
    mean: 0.02,
    stdDev: 0.005,
    type: "normal",
  },
  financialGoal: 200000,
  investmentsRange: [
    [[70000, 130000], [80000, 120000], [85000, 115000], [87000, 113000]],
    [[80000, 140000], [90000, 130000], [95000, 125000], [97000, 123000]],
    [[90000, 150000], [100000, 140000], [105000, 135000], [107000, 133000]],
    [[95000, 160000], [105000, 150000], [110000, 145000], [112000, 143000]],
    [[100000, 170000], [110000, 160000], [115000, 155000], [117000, 153000]],
  ],
  incomeRange: [
    [[30000, 50000], [32000, 48000], [34000, 46000], [35000, 45000]],
    [[32000, 52000], [34000, 50000], [36000, 48000], [37000, 47000]],
    [[34000, 54000], [36000, 52000], [38000, 50000], [39000, 49000]],
    [[36000, 56000], [38000, 54000], [40000, 52000], [41000, 51000]],
    [[38000, 58000], [40000, 56000], [42000, 54000], [43000, 53000]],
  ],
  expensesRange: [
    [[25000, 40000], [26000, 39000], [27000, 38000], [27500, 37500]],
    [[26000, 41000], [27000, 40000], [28000, 39000], [28500, 38500]],
    [[27000, 42000], [28000, 41000], [29000, 40000], [29500, 39500]],
    [[28000, 43000], [29000, 42000], [30000, 41000], [30500, 40500]],
    [[29000, 44000], [30000, 43000], [31000, 42000], [31500, 41500]],
  ],
  earlyWithdrawTaxRange: [
    [[1000, 3000], [1100, 2900], [1200, 2800], [1300, 2700]],
    [[1100, 3100], [1200, 3000], [1300, 2900], [1400, 2800]],
    [[1200, 3200], [1300, 3100], [1400, 3000], [1500, 2900]],
    [[1300, 3300], [1400, 3200], [1500, 3100], [1600, 3000]],
    [[1400, 3400], [1500, 3300], [1600, 3200], [1700, 3100]],
  ],
  percentageDiscretionaryRange: [
    [[0.2, 0.5], [0.25, 0.45], [0.3, 0.4], [0.35, 0.38]],
    [[0.22, 0.52], [0.27, 0.47], [0.32, 0.42], [0.37, 0.4]],
    [[0.24, 0.54], [0.29, 0.49], [0.34, 0.44], [0.39, 0.42]],
    [[0.26, 0.56], [0.31, 0.51], [0.36, 0.46], [0.41, 0.44]],
    [[0.28, 0.58], [0.33, 0.53], [0.38, 0.48], [0.43, 0.46]],
  ],
  avgInvestmentsOverTime: [
    [90000, 95000, 98000], [100000, 105000, 108000],
    [110000, 115000, 118000], [120000, 125000, 128000],
    [130000, 135000, 138000]
  ],
  medianInvestmentsOverTime: [
    [88000, 93000, 96000], [98000, 103000, 106000],
    [108000, 113000, 116000], [118000, 123000, 126000],
    [128000, 133000, 136000]
  ],
  avgIncomeOverTime: [
    [35000, 36000], [37000, 38000], [39000, 40000], [41000, 42000], [43000, 44000]
  ],
  medianIncomeOverTime: [
    [34000, 35000], [36000, 37000], [38000, 39000], [40000, 41000], [42000, 43000]
  ],
  avgExpensesOverTime: [
    [28000, 29000], [30000, 31000], [32000, 33000], [34000, 35000], [36000, 37000]
  ],
  medianExpensesOverTime: [
    [27000, 28000], [29000, 30000], [31000, 32000], [33000, 34000], [35000, 36000]
  ]
};

// Types for scenario exploration
type NumericOption = {
  type: 'numeric';
  label: string;
  min: number;
  max: number;
  step: number;
  category: 'all' | 'income' | 'expense' | 'invest';
}

type BooleanOption = {
  type: 'boolean';
  label: string;
}

type ScenarioParameter = NumericOption | BooleanOption;

// Type for option values in the state
type OptionValues = Record<string, [number, number] | boolean>;

// Mock data for scenario exploration
const scenarioOptions: Record<string, ScenarioParameter> = {
  rothOptimizerEnabled: {
    type: 'boolean',
    label: 'Roth Conversion Optimizer'
  },
  startYear: {
    type: 'numeric',
    label: 'Start Year',
    min: 2025,
    max: 2050,
    step: 5,
    category: 'all'
  },
  duration: {
    type: 'numeric',
    label: 'Duration (years)',
    min: 5,
    max: 30,
    step: 5,
    category: 'all'
  },
  initialIncomeAmount: {
    type: 'numeric',
    label: 'Initial Income Amount',
    min: 50000,
    max: 200000,
    step: 25000,
    category: 'income'
  },
  initialExpenseAmount: {
    type: 'numeric',
    label: 'Initial Expense Amount',
    min: 30000,
    max: 150000,
    step: 20000,
    category: 'expense'
  },
  stockAllocation: {
    type: 'numeric',
    label: 'Stock Allocation (%)',
    min: 20,
    max: 80,
    step: 20,
    category: 'invest'
  }
};

// Mock scenario results for different parameter values
const mockScenarioResults = {
  baseline: {
    probabilityOfSuccess: [0.82, 0.83, 0.85, 0.86, 0.87],
    investments: [100000, 110000, 120000, 130000, 140000]
  },
  rothOptimizerEnabled: {
    true: {
      probabilityOfSuccess: [0.85, 0.87, 0.89, 0.91, 0.92],
      investments: [105000, 118000, 130000, 145000, 160000]
    }
  },
  startYear: {
    2025: {
      probabilityOfSuccess: [0.80, 0.82, 0.84, 0.85, 0.86],
      investments: [95000, 105000, 115000, 125000, 135000]
    },
    2030: {
      probabilityOfSuccess: [0.82, 0.84, 0.86, 0.87, 0.88],
      investments: [100000, 110000, 120000, 130000, 140000]
    },
    2035: {
      probabilityOfSuccess: [0.84, 0.86, 0.88, 0.89, 0.90],
      investments: [105000, 115000, 125000, 135000, 145000]
    },
    2040: {
      probabilityOfSuccess: [0.86, 0.88, 0.90, 0.91, 0.92],
      investments: [110000, 120000, 130000, 140000, 150000]
    }
  },
  duration: {
    5: {
      probabilityOfSuccess: [0.88, 0.89, 0.90, 0.91, 0.92],
      investments: [105000, 115000, 125000, 135000, 145000]
    },
    10: {
      probabilityOfSuccess: [0.85, 0.86, 0.87, 0.88, 0.89],
      investments: [102000, 112000, 122000, 132000, 142000]
    },
    15: {
      probabilityOfSuccess: [0.82, 0.83, 0.84, 0.85, 0.86],
      investments: [100000, 110000, 120000, 130000, 140000]
    },
    20: {
      probabilityOfSuccess: [0.79, 0.80, 0.81, 0.82, 0.83],
      investments: [98000, 108000, 118000, 128000, 138000]
    }
  },
  initialIncomeAmount: {
    50000: {
      probabilityOfSuccess: [0.75, 0.76, 0.77, 0.78, 0.79],
      investments: [90000, 95000, 100000, 105000, 110000]
    },
    75000: {
      probabilityOfSuccess: [0.80, 0.81, 0.82, 0.83, 0.84],
      investments: [95000, 102000, 110000, 118000, 125000]
    },
    100000: {
      probabilityOfSuccess: [0.84, 0.85, 0.86, 0.87, 0.88],
      investments: [100000, 110000, 120000, 130000, 140000]
    },
    125000: {
      probabilityOfSuccess: [0.87, 0.88, 0.89, 0.90, 0.91],
      investments: [110000, 122000, 135000, 148000, 160000]
    }
  },
  initialExpenseAmount: {
    30000: {
      probabilityOfSuccess: [0.90, 0.91, 0.92, 0.93, 0.94],
      investments: [110000, 125000, 140000, 155000, 170000]
    },
    50000: {
      probabilityOfSuccess: [0.85, 0.86, 0.87, 0.88, 0.89],
      investments: [105000, 115000, 125000, 135000, 145000]
    },
    70000: {
      probabilityOfSuccess: [0.80, 0.81, 0.82, 0.83, 0.84],
      investments: [100000, 108000, 115000, 122000, 130000]
    },
    90000: {
      probabilityOfSuccess: [0.75, 0.76, 0.77, 0.78, 0.79],
      investments: [95000, 100000, 105000, 110000, 115000]
    }
  },
  stockAllocation: {
    20: {
      probabilityOfSuccess: [0.78, 0.79, 0.80, 0.81, 0.82],
      investments: [95000, 100000, 105000, 110000, 115000]
    },
    40: {
      probabilityOfSuccess: [0.82, 0.83, 0.84, 0.85, 0.86],
      investments: [100000, 108000, 115000, 122000, 130000]
    },
    60: {
      probabilityOfSuccess: [0.85, 0.86, 0.87, 0.88, 0.89],
      investments: [105000, 115000, 125000, 135000, 145000]
    },
    80: {
      probabilityOfSuccess: [0.86, 0.87, 0.88, 0.89, 0.90],
      investments: [108000, 120000, 132000, 144000, 155000]
    }
  }
};

// Sample data
// const probabilityData = mockSimulationResult.probabilityOverTime.map((prob, index) => ({
//   year: 2025 + index,
//   success: prob * 100  // Convert to percentage
// }));

// Helper function to transform range data into chart format
const transformRangeData = (rangeData: number[][][], years: number[]) => {
  return rangeData.map((yearData, index) => {
    const [p10_90, p20_80, p30_70, p40_60] = yearData;
    return {
      year: years[index],
      p10: p10_90[0],
      p90: p10_90[1],
      p20: p20_80[0],
      p80: p20_80[1],
      p30: p30_70[0],
      p70: p30_70[1],
      p40: p40_60[0],
      p60: p40_60[1],
      median: (p40_60[0] + p40_60[1]) / 2
    };
  });
};

// LineChartGraph
const LineChartGraph = ({ data }: { data: any[] }) => (
  <LineChart width={700} height={400} data={data.length ? data : []}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="year">
      <Label value="Year" offset={-5} position="insideBottom" />
    </XAxis>
    <YAxis domain={[0, 100]}>
      <Label
        value="Probability of Success (%)"
        angle={-90}
        position="insideLeft"
        style={{ textAnchor: "middle" }}
      />
    </YAxis>
    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
    <Line 
      type="monotone" 
      dataKey="success" 
      stroke="#8884d8"
      strokeWidth={3}
      dot={{ fill: "#8884d8" }}
    />
  </LineChart>
);

// Update the StackedBarChart component
const StackedBarChart = ({ 
  useMedian = true, 
  customData = null,
  investmentOrder = [], 
  incomeOrder = [], 
  expensesOrder = [],
  medianInvestments = [],
  avgInvestments = [],
  medianIncome = [],
  avgIncome = [],
  medianExpenses = [],
  avgExpenses = [],
  aggregationThreshold = 5000,
  categoryFilter = null
}: { 
  useMedian?: boolean, 
  customData?: any,
  investmentOrder?: string[], 
  incomeOrder?: string[], 
  expensesOrder?: string[],
  medianInvestments?: number[][],
  avgInvestments?: number[][],
  medianIncome?: number[][],
  avgIncome?: number[][],
  medianExpenses?: number[][],
  avgExpenses?: number[][],
  aggregationThreshold?: number,
  categoryFilter?: 'investments' | 'income' | 'expenses' | null
}) => {
  // Transform the data based on selected metric (median or average)
  const getStackedData = () => {
    // Determine the number of years from the available data
    const currentYear = new Date().getFullYear();
    
    // Check available data lengths to determine how many years to display
    const investmentsYears = useMedian ? medianInvestments.length : avgInvestments.length;
    const incomeYears = useMedian ? medianIncome.length : avgIncome.length;
    const expensesYears = useMedian ? medianExpenses.length : avgExpenses.length;
    
    // Find the maximum number of years available in any dataset
    let numYears = Math.max(investmentsYears, incomeYears, expensesYears);
    
    // If we don't have any real data, fallback to mock data length or default 5
    if (numYears === 0) {
      numYears = mockSimulationResult.medianInvestmentsOverTime.length || 5;
    }
    
    console.log(`Displaying ${numYears} years of data`);
    
    // Generate the years array dynamically
    const years = Array.from({ length: numYears }, (_, i) => currentYear + i);
    
    // If custom data is provided (for a specific parameter value), use it
    if (customData) {
      const values = useMedian ? 
        customData.medianInvestmentsOverTime :
        customData.avgInvestmentsOverTime;

      return years.map((year, index) => ({
        year,
        // Tax-Advantaged Accounts (40% of investment amounts)
        "401k": values[index] * 0.25,
        "RothIRA": values[index] * 0.15,
        
        // Taxable Accounts (60% of investment amounts)
        "Brokerage": values[index] * 0.6,
        
        // Use the standard values for income and expenses as customData doesn't have detailed breakdown
        "Job": mockSimulationResult.medianIncomeOverTime[index][0],
        "Pension": mockSimulationResult.medianIncomeOverTime[index][1],
        "Housing": mockSimulationResult.medianExpensesOverTime[index][0],
        "Food": mockSimulationResult.medianExpensesOverTime[index][1],
        "Other": 0  // For values below threshold
      }));
    }
    
    // Check if we have real data
    const hasRealInvestments = medianInvestments.length > 0 || avgInvestments.length > 0;
    const hasRealIncome = medianIncome.length > 0 || avgIncome.length > 0;
    const hasRealExpenses = medianExpenses.length > 0 || avgExpenses.length > 0;
    
    // Use real data if available, fall back to mock data if not
    let investmentsData = useMedian ? 
      (medianInvestments.length > 0 ? medianInvestments : mockSimulationResult.medianInvestmentsOverTime) :
      (avgInvestments.length > 0 ? avgInvestments : mockSimulationResult.avgInvestmentsOverTime);
    
    let incomeData = useMedian ? 
      (medianIncome.length > 0 ? medianIncome : mockSimulationResult.medianIncomeOverTime) :
      (avgIncome.length > 0 ? avgIncome : mockSimulationResult.avgIncomeOverTime);
    
    let expensesData = useMedian ? 
      (medianExpenses.length > 0 ? medianExpenses : mockSimulationResult.medianExpensesOverTime) :
      (avgExpenses.length > 0 ? avgExpenses : mockSimulationResult.avgExpensesOverTime);
    
    // Create an object with all categories from the orders
    const dataPoint: any = { year: 0 };
    
    // Initialize values for all categories to zero
    investmentOrder.forEach(inv => dataPoint[inv] = 0);
    incomeOrder.forEach(inc => dataPoint[inc] = 0);
    expensesOrder.forEach(exp => dataPoint[exp] = 0);
    dataPoint["Other"] = 0;  // For values below threshold
    
    // Log data sources for debugging
    console.log("Using real investment data:", hasRealInvestments);
    console.log("Using real income data:", hasRealIncome);
    console.log("Using real expenses data:", hasRealExpenses);
    console.log("Aggregation threshold:", aggregationThreshold);
    
    // Create raw data points for each year
    const rawYearData = years.map((year, index) => {
      // Start with the year and initialize all fields to zero
      const yearData = { ...dataPoint, year };
      
      // Only process data for years we have data for
      if (index < investmentsData.length || index < incomeData.length || index < expensesData.length) {
        // Investments (use real data with real order when available)
        if (investmentOrder.length > 0) {
          if (index < investmentsData.length) {
            investmentOrder.forEach((inv, i) => {
              if (i < investmentsData[index].length) {
                yearData[inv] = investmentsData[index][i];
              }
            });
          }
        } else {
          // Fallback to mock data structure
          if (hasRealInvestments && index < investmentsData.length) {
            yearData["401k"] = investmentsData[index][0] || 0;
            yearData["RothIRA"] = investmentsData[index][1] || 0;
            yearData["Brokerage"] = investmentsData[index][2] || 0;
          } else if (index < mockSimulationResult.medianInvestmentsOverTime.length) {
            yearData["401k"] = mockSimulationResult.medianInvestmentsOverTime[index][0];
            yearData["RothIRA"] = mockSimulationResult.medianInvestmentsOverTime[index][1];
            yearData["Brokerage"] = mockSimulationResult.medianInvestmentsOverTime[index][2];
          }
        }
        
        // Income (use real data with real order when available)
        if (incomeOrder.length > 0) {
          if (index < incomeData.length) {
            incomeOrder.forEach((inc, i) => {
              if (i < incomeData[index].length) {
                yearData[inc] = incomeData[index][i];
              }
            });
          }
        } else {
          // Fallback to mock data structure
          if (hasRealIncome && index < incomeData.length) {
            yearData["Job"] = incomeData[index][0] || 0;
            yearData["Pension"] = incomeData[index][1] || 0;
          } else if (index < mockSimulationResult.medianIncomeOverTime.length) {
            yearData["Job"] = mockSimulationResult.medianIncomeOverTime[index][0];
            yearData["Pension"] = mockSimulationResult.medianIncomeOverTime[index][1];
          }
        }
        
        // Expenses (use real data with real order when available)
        if (expensesOrder.length > 0) {
          if (index < expensesData.length) {
            expensesOrder.forEach((exp, i) => {
              if (i < expensesData[index].length) {
                yearData[exp] = expensesData[index][i];
              }
            });
          }
        } else {
          // Fallback to mock data structure
          if (hasRealExpenses && index < expensesData.length) {
            yearData["Housing"] = expensesData[index][0] || 0;
            yearData["Food"] = expensesData[index][1] || 0;
          } else if (index < mockSimulationResult.medianExpensesOverTime.length) {
            yearData["Housing"] = mockSimulationResult.medianExpensesOverTime[index][0];
            yearData["Food"] = mockSimulationResult.medianExpensesOverTime[index][1];
          }
        }
      }
      
      return yearData;
    });
    
    // Apply aggregation threshold
    return applyAggregationThreshold(rawYearData, aggregationThreshold);
  };
  
  // Function to apply aggregation threshold and group small values into "Other"
  const applyAggregationThreshold = (data: any[], threshold: number) => {
    if (threshold <= 0) return data; // No aggregation if threshold is 0
    
    // Get all unique keys except 'year' and 'Other'
    const allKeys = new Set<string>();
    data.forEach(dataPoint => {
      Object.keys(dataPoint).forEach(key => {
        if (key !== 'year' && key !== 'Other') {
          allKeys.add(key);
        }
      });
    });
    
    console.log("All keys before aggregation:", Array.from(allKeys));
    
    // Create new data with aggregated values - process each data point (year) individually
    const result = data.map(dataPoint => {
      const newDataPoint: any = { year: dataPoint.year, Other: 0 };
      
      // Process each category in this year's data point
      Object.entries(dataPoint).forEach(([key, value]) => {
        if (key === 'year') {
          // Skip the year key
        } else if (key === 'Other') {
          // Keep existing Other values
          newDataPoint.Other += Number(value);
        } else {
          // Check if this value is below the threshold
          const numValue = Number(value);
          if (numValue < threshold) {
            // Add to "Other" category if below threshold
            newDataPoint.Other += numValue;
            console.log(`Year ${dataPoint.year}, Adding ${key}: ${numValue} to Other`);
          } else {
            // Keep original value if above threshold
            newDataPoint[key] = numValue;
          }
        }
      });
      
      // For debugging
      if (newDataPoint.Other > 0) {
        console.log(`Year ${dataPoint.year}, Total Other category value: ${newDataPoint.Other}`);
      }
      
      return newDataPoint;
    });
    
    // Log which categories were completely aggregated (not present in result)
    const remainingKeys = new Set<string>();
    result.forEach(dataPoint => {
      Object.keys(dataPoint).forEach(key => {
        if (key !== 'year' && key !== 'Other') {
          remainingKeys.add(key);
        }
      });
    });
    
    const fullyAggregatedKeys = Array.from(allKeys).filter(key => !remainingKeys.has(key));
    console.log("Fully aggregated categories:", fullyAggregatedKeys);
    
    // Check if there are any Other values
    const hasOtherValues = result.some(point => point.Other > 0);
    console.log("Has Other values:", hasOtherValues);
    
    return result;
  };

  // Apply category filter to data if needed
  const applyFilter = (rawData: any[]) => {
    if (!categoryFilter) return rawData; // No filter, return all data
    
    // Determine which keys to keep based on filter
    let keysToKeep: string[] = [];
    
    if (categoryFilter === 'investments') {
      keysToKeep = investmentOrder.length > 0 ? investmentOrder : ["401k", "RothIRA", "Brokerage"];
    } else if (categoryFilter === 'income') {
      keysToKeep = incomeOrder.length > 0 ? incomeOrder : ["Job", "Pension"];
    } else if (categoryFilter === 'expenses') {
      keysToKeep = expensesOrder.length > 0 ? expensesOrder : ["Housing", "Food"];
    }
    
    console.log(`Applying ${categoryFilter} filter. Keeping keys:`, keysToKeep);
    
    // Create new data with only the filtered categories
    return rawData.map(dataPoint => {
      const filteredPoint: any = { year: dataPoint.year };
      
      // Keep only the categories that match the filter
      let hasAggregatedValues = false;
      Object.entries(dataPoint).forEach(([key, value]) => {
        if (key !== 'year' && key !== 'Other' && keysToKeep.includes(key)) {
          filteredPoint[key] = value;
        } else if (key === 'Other' && dataPoint.Other > 0) {
          // Only keep "Other" if it has a positive value and we're not filtering to a single category
          if (keysToKeep.length > 1) {
            filteredPoint.Other = dataPoint.Other;
            hasAggregatedValues = true;
          }
        }
      });
      
      // Initialize Other to 0 if it doesn't exist yet but we have multiple categories
      if (!filteredPoint.Other && keysToKeep.length > 1) {
        filteredPoint.Other = 0;
      }
      
      return filteredPoint;
    });
  };

  // Get stacked data and apply filters
  const rawStackedData = getStackedData();
  const filteredData = applyFilter(rawStackedData);
  const stackedData = filteredData;
  
  console.log("Stacked bar chart data (after filtering):", stackedData);
  
  // Determine which categories to display in the chart
  const getBarSegments = () => {
    // Get all unique keys from the data, excluding 'year'
    const allKeys = new Set<string>();
    stackedData.forEach(dataPoint => {
      Object.keys(dataPoint).forEach(key => {
        if (key !== 'year') allKeys.add(key);
      });
    });
    
    console.log("All keys for bar segments:", Array.from(allKeys));
    
    // Check if we have real order data
    const hasInvestmentOrder = investmentOrder.length > 0;
    const hasIncomeOrder = incomeOrder.length > 0;
    const hasExpensesOrder = expensesOrder.length > 0;
    
    // Filter based on category filter
    let segments: string[] = [];
    
    if (!categoryFilter || categoryFilter === 'investments') {
      const investmentSegments = hasInvestmentOrder 
        ? investmentOrder.filter(key => allKeys.has(key)) 
        : ["401k", "RothIRA", "Brokerage"].filter(key => allKeys.has(key));
      segments.push(...investmentSegments);
    }
    
    if (!categoryFilter || categoryFilter === 'income') {
      const incomeSegments = hasIncomeOrder 
        ? incomeOrder.filter(key => allKeys.has(key)) 
        : ["Job", "Pension"].filter(key => allKeys.has(key));
      segments.push(...incomeSegments);
    }
    
    if (!categoryFilter || categoryFilter === 'expenses') {
      const expensesSegments = hasExpensesOrder 
        ? expensesOrder.filter(key => allKeys.has(key)) 
        : ["Housing", "Food"].filter(key => allKeys.has(key));
      segments.push(...expensesSegments);
    }
    
    // Only include "Other" if it exists in the data and has values
    const hasOtherCategory = allKeys.has("Other") && stackedData.some(d => d.Other > 0);
    if (hasOtherCategory) {
      segments.push("Other");
    }
    
    return segments;
  };
  
  // Get segments to render
  const barSegments = getBarSegments();
  
  // Create a more diverse color palette for investment categories
  const getSegmentColor = (key: string, index: number) => {
    // Default color for "Other"
    if (key === "Other") return "#666666";
    
    // Investment categories - use a more diverse color palette
    if (investmentOrder.includes(key) || ["401k", "RothIRA", "Brokerage"].includes(key)) {
      // Map specific investment types to specific colors
      if (key.includes("Cash") || key === "Cash") return "#4b3f72"; // purple
      if (key.includes("pre-tax") || key === "401k") return "#007a99"; // teal
      if (key.includes("after-tax") || key === "RothIRA") return "#2f855a"; // green
      if (key.includes("non-retirement") || key === "Brokerage") return "#805ad5"; // lavender
      if (key.includes("500")) return "#3182ce"; // blue
      if (key.includes("Bond")) return "#dd6b20"; // orange
      
      // For any other investment categories, use this extended color palette
      const investmentColors = [
        "#4b3f72", // purple
        "#007a99", // teal
        "#2f855a", // green
        "#805ad5", // lavender
        "#3182ce", // blue
        "#dd6b20", // orange
        "#b83280", // pink
        "#2c5282", // navy
        "#285e61", // dark teal
        "#702459"  // maroon
      ];
      return investmentColors[index % investmentColors.length];
    } 
    // Income categories (yellows/oranges)
    else if (incomeOrder.includes(key) || ["Job", "Pension"].includes(key)) {
      const incomeColors = ["#b7791f", "#cc3300", "#d69e2e", "#ed8936"];
      return incomeColors[index % incomeColors.length];
    } 
    // Expense categories (reds/greens)
    else if (expensesOrder.includes(key) || ["Housing", "Food"].includes(key)) {
      const expenseColors = ["#7f9c00", "#3f9142", "#38a169", "#48bb78"];
      return expenseColors[index % expenseColors.length];
    }
    
    // If category type couldn't be determined
    return `hsl(${(index * 50) % 360}, 70%, 50%)`;
  };
  
  return (
    <BarChart width={700} height={400} data={stackedData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="year" 
        tick={{ fontSize: 12 }} 
        tickFormatter={(value) => String(value)} 
        interval={Math.max(1, Math.floor(stackedData.length / 10))} // Show maximum 10 ticks for readability
      >
        <Label value="Year" offset={-5} position="insideBottom" />
      </XAxis>
      <YAxis>
        <Label
          value={`${useMedian ? 'Median' : 'Average'} Values ($)`}
          angle={-90}
          position="insideLeft"
          style={{ textAnchor: "middle" }}
        />
      </YAxis>
      <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
      <Legend />

      {/* Render all bar segments dynamically */}
      {barSegments.map((key, index) => {
        return (
          <Bar 
            key={key} 
            dataKey={key} 
            stackId="a" 
            fill={getSegmentColor(key, index)} 
            name={key === "Other" ? "Other (Below Threshold)" : key} 
          />
        );
      })}
    </BarChart>
  );
};

// Scenario Exploration Components
const ScenarioOptionSelector = ({ 
  option, 
  values,
  onChange,
  disabled = false
}: { 
  option: ScenarioParameter, 
  values: [number, number] | boolean,
  onChange: (values: [number, number] | boolean) => void,
  disabled?: boolean
}) => {
  if (option.type === 'boolean') {
    return (
      <div style={{ marginBottom: 15 }}>
        <div style={{ marginBottom: 5, fontWeight: 'bold' }}>{option.label}</div>
        <div>
          <label style={{ marginRight: 20 }}>
            <input 
              type="radio" 
              checked={values === true} 
              onChange={() => onChange(true)}
              disabled={disabled}
            /> 
            Enabled
          </label>
          <label>
            <input 
              type="radio" 
              checked={values === false} 
              onChange={() => onChange(false)}
              disabled={disabled}
            /> 
            Disabled
          </label>
        </div>
      </div>
    );
  }
  
  // Numeric option
  const numOption = option as NumericOption;
  const [start, end] = Array.isArray(values) ? values : [numOption.min, numOption.min + numOption.step];
    
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = parseInt(e.target.value);
    onChange([newStart, end]);
  };
  
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = parseInt(e.target.value);
    onChange([start, newEnd]);
  };

  return (
    <div style={{ marginBottom: 20, opacity: disabled ? 0.5 : 1 }}>
      <div style={{ marginBottom: 5, fontWeight: 'bold' }}>{option.label}</div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: 10 }}>
          <label>
            Start:
            <input 
              type="number" 
              min={numOption.min} 
              max={numOption.max} 
              step={numOption.step}
              value={start} 
              onChange={handleStartChange}
          style={{
                marginLeft: 5,
                padding: '5px',
                width: '80px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              disabled={disabled}
            />
          </label>
        </div>
        <div>
          <label>
            End:
            <input 
              type="number" 
              min={numOption.min} 
              max={numOption.max} 
              step={numOption.step}
              value={end} 
              onChange={handleEndChange}
            style={{
                marginLeft: 5,
                padding: '5px',
                width: '80px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              disabled={disabled}
            />
          </label>
          </div>
        </div>
      </div>
  );
};

// Scenario Exploration Chart - Using real API data for both probability and investments
const ScenarioExplorationChart = ({ 
  parameterKey,
  parameterValues,
  metric = 'probabilityOfSuccess',
  customData = null
}: {
  parameterKey: string,
  parameterValues: (number | boolean)[],
  metric?: 'probabilityOfSuccess' | 'investments',
  customData?: any
}) => {
  // Add a small debug log to check the data structure
  if (customData) {
    console.log(`Data structure check - metric: ${metric}`);
    
    if (metric === 'probabilityOfSuccess' && customData.probabilityOverTime) {
      console.log(`probabilityOverTime type: ${typeof customData.probabilityOverTime}`);
      if (Array.isArray(customData.probabilityOverTime)) {
        console.log(`probabilityOverTime is array with ${customData.probabilityOverTime.length} items`);
        if (customData.probabilityOverTime.length > 0) {
          console.log(`First item type: ${typeof customData.probabilityOverTime[0]}`);
          console.log(`Sample value: ${customData.probabilityOverTime[0][0]}`);
        }
      }
    }
    
    if (metric === 'investments' && customData.medianInvestmentsOverTime) {
      console.log(`medianInvestmentsOverTime type: ${typeof customData.medianInvestmentsOverTime}`);
      if (Array.isArray(customData.medianInvestmentsOverTime)) {
        console.log(`medianInvestmentsOverTime is array with ${customData.medianInvestmentsOverTime.length} items`);
        if (customData.medianInvestmentsOverTime.length > 0) {
          console.log(`First item type: ${typeof customData.medianInvestmentsOverTime[0]}`);
          console.log(`Sample value: ${customData.medianInvestmentsOverTime[0][0]}`);
        }
      }
    }
  }
  
  // Check if we have parameter data with different values
  const hasParameters = parameterKey && 
                       Array.isArray(parameterValues) && 
                       parameterValues.length > 0;
  
  // Check if the API response contains the data we need based on the metric
  const hasProbabilityData = metric === 'probabilityOfSuccess' && 
                            customData && 
                            customData.probabilityOverTime && 
                            Array.isArray(customData.probabilityOverTime) && 
                            customData.probabilityOverTime.length > 0;

  const hasInvestmentsData = metric === 'investments' && 
                           customData && 
                           customData.medianInvestmentsOverTime && 
                           Array.isArray(customData.medianInvestmentsOverTime) && 
                           customData.medianInvestmentsOverTime.length > 0;

  // Select the appropriate data based on the metric
  let metricData = [];
  if (hasProbabilityData) {
    metricData = customData.probabilityOverTime;
  } else if (hasInvestmentsData) {
    metricData = customData.medianInvestmentsOverTime;
  }
  
  // Generate years for X-axis (current year to current year + 39)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 40 }, (_, i) => currentYear + i);
  
  // Helper to get parameter display names
  const getParameterDisplayName = (paramValue: number | boolean): string => {
    // Handle special cases like roth optimizer
    if (parameterKey === 'rothConversionOpt' && paramValue === true) {
      return 'Enabled';
    }
    
    // For numeric values, format appropriately based on the parameter type
    if (typeof paramValue === 'number') {
      if (parameterKey === 'startYear' || parameterKey === 'duration') {
        return `${paramValue}`;
      } else if (parameterKey === 'initialAmount') {
        return `$${paramValue.toLocaleString()}`;
      } else if (parameterKey === 'investmentPercentage' || parameterKey.includes('Allocation')) {
        return `${paramValue}%`;
      } else {
        return `${paramValue}`;
      }
    }
    
    // Default fallback
    return paramValue.toString();
  };
  
  // Create chart data using real data if available
  const chartData = years.map((year, yearIndex) => {
    const dataPoint: any = { year };
    
    // Add real data from API if available
    if ((hasProbabilityData || hasInvestmentsData) && metricData.length > 0) {
      metricData.forEach((dataArray, index) => {
        if (index < parameterValues.length && Array.isArray(dataArray) && yearIndex < dataArray.length) {
          const paramValue = parameterValues[index];
          let rawValue = dataArray[yearIndex];
          
          // Ensure value is a number
          let value = parseFloat(rawValue);
          
          // Check if we got a valid number
          if (!isNaN(value)) {
            // Only convert probability values if they're decimal format
            if (metric === 'probabilityOfSuccess' && value <= 1) {
              value = value * 100; // Convert to percentage
            }
            
            dataPoint[`param_${paramValue}`] = value;
          } else {
            console.warn(`Invalid number at index ${yearIndex} for parameter ${paramValue}: ${rawValue}`);
            // Use a default value instead of undefined
            dataPoint[`param_${paramValue}`] = metric === 'probabilityOfSuccess' ? 0 : 0;
          }
        }
      });
    } else {
      // Use synthetic data if no real data available
      if (hasParameters) {
        parameterValues.forEach((paramValue, index) => {
          const value = metric === 'probabilityOfSuccess' 
            ? 70 + (index * 10) // Example probability percentages
            : 90000 + (index * 15000); // Example investment values
          dataPoint[`param_${paramValue}`] = value;
        });
      }
    }
    
    return dataPoint;
  });

  // Create data for the parameter vs final value chart
  const getFinalValueData = () => {
    // Create data points for each parameter value
    const finalValueData = parameterValues.map((paramValue, index) => {
      const dataPoint: any = { 
        paramValue: typeof paramValue === 'number' ? paramValue : paramValue ? 1 : 0,
        paramLabel: getParameterDisplayName(paramValue)
      };
      
      // Use the real data if available
      if ((hasProbabilityData || hasInvestmentsData) && metricData.length > 0 && 
          index < metricData.length && Array.isArray(metricData[index])) {
        
        // Get the last value in the array (final value)
        const lastIndex = metricData[index].length - 1;
        if (lastIndex >= 0) {
          let rawValue = metricData[index][lastIndex];
          let finalValue = parseFloat(rawValue);
          
          if (!isNaN(finalValue)) {
            // Convert probability to percentage if needed
            if (metric === 'probabilityOfSuccess' && finalValue <= 1) {
              finalValue = finalValue * 100;
            }
            dataPoint.finalValue = finalValue;
          } else {
            // Use a default if value is not valid
            dataPoint.finalValue = metric === 'probabilityOfSuccess' ? 0 : 0;
          }
        }
      } else {
        // Use synthetic data if no real data
        dataPoint.finalValue = metric === 'probabilityOfSuccess' 
          ? 70 + (index * 10) 
          : 90000 + (index * 15000);
      }
      
      return dataPoint;
    });
    
    // Sort by parameter value for proper line rendering
    return finalValueData.sort((a, b) => a.paramValue - b.paramValue);
  };
  
  const finalValueData = getFinalValueData();
  
  // Format values for tooltip to avoid errors
  const formatValue = (value: any) => {
    // Handle null, undefined, or non-number values
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    // Try to convert to number if it's not already
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    
    // Check if conversion was successful
    if (isNaN(numValue)) {
      return 'N/A';
    }
    
    if (metric === 'probabilityOfSuccess') {
      return `${numValue.toFixed(1)}%`;
    }
    return `$${numValue.toLocaleString()}`;
  };
  
  // Simplified colors for clarity
  const colors = ["#ff7300", "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#44A3C9"];
  
  const getYAxisLabel = () => {
    if (metric === 'probabilityOfSuccess') return "Probability of Success";
    return "Median Total Investments ($)";
  };

  return (
    <div>
      <h3 style={{ textAlign: 'center', marginBottom: 10 }}>
        {parameterKey ? `${parameterKey} Parameter Comparison Over Time` : 'Scenario Comparison Over Time'}
      </h3>
      
      {(hasProbabilityData || hasInvestmentsData) && (
        <div style={{ textAlign: 'center', marginBottom: 15, color: '#4285F4' }}>
          <small><strong>Using real {metric} data from API response</strong></small>
        </div>
      )}
      
      {/* Debug info for data problems */}
      {!hasProbabilityData && !hasInvestmentsData && customData && (
        <div style={{ textAlign: 'center', marginBottom: 15, color: '#FF5722', fontSize: '0.8rem' }}>
          <small>
            Note: No valid {metric} data found in API response. Using example data.
          </small>
        </div>
      )}
      
      {/* First Chart - Values Over Time */}
      <LineChart width={700} height={400} data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => String(value)}
          interval={Math.max(1, Math.floor(chartData.length / 10))} // Show maximum 10 ticks
        >
          <Label value="Year" offset={-5} position="insideBottom" />
        </XAxis>
        <YAxis domain={metric === 'probabilityOfSuccess' ? [0, 100] : [0, 'auto']}>
          <Label
            value={getYAxisLabel()}
            angle={-90}
            position="insideLeft"
            style={{ textAnchor: "middle" }}
          />
        </YAxis>
        <Tooltip 
          formatter={(value) => formatValue(value)} 
          labelFormatter={(value) => `Year: ${value}`}
        />
        <Legend />
        
        {/* Parameter value lines */}
        {hasParameters && parameterValues.map((paramValue, index) => (
          <Line
            key={`param_${paramValue}`}
            type="monotone"
            dataKey={`param_${paramValue}`}
            stroke={colors[index % colors.length]}
            name={`${parameterKey}: ${getParameterDisplayName(paramValue)}`}
            strokeWidth={2}
          />
        ))}
      </LineChart>
      
      {/* Second Chart - Final Values vs Parameter */}
      {hasParameters && (
        <div style={{ marginTop: 40 }}>
          <h3 style={{ textAlign: 'center', marginBottom: 10 }}>
            Final {metric === 'probabilityOfSuccess' ? 'Probability of Success' : 'Median Investment'} vs {parameterKey}
          </h3>
          
          <LineChart width={700} height={300} data={finalValueData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="paramValue"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => getParameterDisplayName(value)}
              tick={{ fontSize: 12 }}
            >
              <Label value={parameterKey} offset={-5} position="insideBottom" />
            </XAxis>
            <YAxis domain={metric === 'probabilityOfSuccess' ? [0, 100] : [0, 'auto']}>
              <Label
                value={`Final ${getYAxisLabel()}`}
                angle={-90}
                position="insideLeft"
                style={{ textAnchor: "middle" }}
              />
            </YAxis>
            <Tooltip 
              formatter={(value) => formatValue(value)}
              labelFormatter={(value) => `${parameterKey}: ${getParameterDisplayName(value)}`}
            />
            <Line
              type="monotone"
              dataKey="finalValue"
              stroke="#4285F4"
              name={`Final ${metric === 'probabilityOfSuccess' ? 'Probability' : 'Investment'}`}
              strokeWidth={3}
              dot={{ fill: '#4285F4', r: 6 }}
            />
          </LineChart>
        </div>
      )}
    </div>
  );
};

interface ToggleButtonProps {
  label: string;
  value: string;
  selected: boolean;
  onToggle: (v: string, sel: boolean) => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  label,
  value,
  selected,
  onToggle,
}: {
  label: string;
  value: string;
  selected: boolean;
  onToggle: (v: string, sel: boolean) => void;
}) => (
  <button
    onClick={() => onToggle(value, selected)}
          style={{
      padding: "12px 20px",
      fontSize: 16,
      borderRadius: 8,
      border: "none",
      backgroundColor: selected ? "#7EC995" : "#e9ecef",
      color: selected ? "white" : "#495057",
      cursor: "pointer",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      transition: "all 0.3s ease",
      fontWeight: selected ? "bold" : "normal",
      marginRight: 12,
      marginBottom: 12,
    }}
  >
    {label}
          </button>
);

// Surface Plot Chart for 2D parameter exploration
const SurfacePlotChart = ({ 
  parameterKeys = ['Parameter 1', 'Parameter 2'],
  metric = 'probabilityOfSuccess',
  customData = null,
  parameterValues
}: {
  parameterKeys: string[],
  metric?: 'probabilityOfSuccess' | 'investments',
  customData?: any,
  parameterValues: any[]
}) => {
  // Use the shared function for data generation
  // This gets final values for probability or sums all values for investments
  const { xValues, yValues, zValues } = generateSurfaceData(parameterKeys, metric, customData, parameterValues);
  
  // Helper functions
  const getZAxisTitle = () => {
    if (metric === 'probabilityOfSuccess') return "Final Probability of Success (%)";
    return "Total Final Year Investments ($)";
  };
  
  const getColorscale = () => {
    if (metric === 'probabilityOfSuccess') {
      // Red to green for probability (low to high)
      return [
        [0, 'rgb(213, 62, 79)'],     // Red (low probability)
        [0.5, 'rgb(253, 231, 37)'],  // Yellow (medium probability)
        [1, 'rgb(50, 136, 189)']     // Blue (high probability)
      ];
    } else {
      // Blue gradient for investments
      return [
        [0, 'rgb(0, 83, 117)'],      // Dark blue (low investment)
        [0.5, 'rgb(0, 155, 217)'],   // Medium blue
        [1, 'rgb(210, 243, 255)']    // Light blue (high investment)
      ];
    }
  };
  
  return (
    <div>
      <h3 style={{ textAlign: 'center', marginBottom: 10 }}>
        {`${parameterKeys[0]} vs ${parameterKeys[1]} Impact on ${metric === 'probabilityOfSuccess' ? 'Final Success Probability' : 'Total Final Year Investments'}`}
      </h3>
      
      <div style={{ textAlign: 'center', fontSize: '0.85rem', marginBottom: 15, color: '#666' }}>
        <em>Note: This chart shows {metric === 'probabilityOfSuccess' ? 'the final year\'s probability value' : 'the sum of all investment types in the final year (year 40)'} for each parameter combination</em>
      </div>
      
      <div style={{ height: 600, width: '100%' }}>
        <Plot
          data={[
            {
              type: 'surface',
              x: xValues,
              y: yValues,
              z: zValues,
              colorscale: getColorscale(),
              contours: {
                z: {
                  show: true,
                  usecolormap: true,
                  highlightcolor: "#42f462",
                  project: {z: true}
                }
              }
            }
          ]}
          layout={{
            title: `Impact of Parameters on ${metric === 'probabilityOfSuccess' ? 'Final Probability of Success' : 'Total Final Year Investments'}`,
            autosize: true,
            scene: {
              xaxis: {
                title: parameterKeys[0],
                titlefont: { color: '#7f7f7f', size: 12 }
              },
              yaxis: {
                title: parameterKeys[1],
                titlefont: { color: '#7f7f7f', size: 12 }
              },
              zaxis: {
                title: getZAxisTitle(),
                titlefont: { color: '#7f7f7f', size: 12 }
              },
              camera: {
                eye: { x: 1.25, y: 1.25, z: 1.25 }
              }
            },
            margin: {
              l: 65,
              r: 50,
              b: 65,
              t: 90,
            }
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

// Shared function to generate surface/contour plot data
const generateSurfaceData = (
  parameterKeys: string[],
  metric: 'probabilityOfSuccess' | 'investments',
  customData: any = null,
  selectedParameterValues?: any
) => {
  console.log("Generating surface data with:", {
    parameterKeys,
    metric,
    hasCustomData: !!customData,
    selectedParameterValues
  });
  
  // Check if we have real data to use
  const hasProbabilityData = metric === 'probabilityOfSuccess' && 
                           customData && 
                           customData.probabilityOverTime && 
                           Array.isArray(customData.probabilityOverTime) && 
                           customData.probabilityOverTime.length > 0;

  const hasInvestmentsData = metric === 'investments' && 
                          customData && 
                          customData.medianInvestmentsOverTime && 
                          Array.isArray(customData.medianInvestmentsOverTime) && 
                          customData.medianInvestmentsOverTime.length > 0;
  
  // Get parameter values for both axes
  let param1Values: any[] = [];
  let param2Values: any[] = [];
  
  // Try to get real parameter values first
  if (selectedParameterValues && selectedParameterValues.length >= 2) {
    const param1Generator = selectedParameterValues[0];
    const param2Generator = selectedParameterValues[1];
    
    if (Array.isArray(param1Generator)) {
      param1Values = param1Generator;
    }
    
    if (Array.isArray(param2Generator)) {
      param2Values = param2Generator;
    }
  }
  
  // Fallback to generated values if needed
  if (param1Values.length === 0) {
    if (parameterKeys[0] === 'startYear') {
      param1Values = Array.from({ length: 3 }, (_, i) => 2025 + (i * 5)); // Example: 2025, 2030, 2035
    } else if (parameterKeys[0] === 'duration') {
      param1Values = Array.from({ length: 3 }, (_, i) => 5 + (i * 10)); // Example: 5, 15, 25
    } else if (parameterKeys[0] === 'initialAmount') {
      param1Values = Array.from({ length: 3 }, (_, i) => 50000 + (i * 50000)); // Example: 50k, 100k, 150k
    } else if (parameterKeys[0] === 'investmentPercentage') {
      param1Values = Array.from({ length: 3 }, (_, i) => 50 + (i * 20)); // Example: 50%, 70%, 90%
    } else {
      param1Values = Array.from({ length: 3 }, (_, i) => i * 10); // Generic fallback
    }
  }
  
  if (param2Values.length === 0) {
    if (parameterKeys[1] === 'startYear') {
      param2Values = Array.from({ length: 3 }, (_, i) => 2025 + (i * 5)); // Example: 2025, 2030, 2035
    } else if (parameterKeys[1] === 'duration') {
      param2Values = Array.from({ length: 3 }, (_, i) => 5 + (i * 10)); // Example: 5, 15, 25
    } else if (parameterKeys[1] === 'initialAmount') {
      param2Values = Array.from({ length: 3 }, (_, i) => 50000 + (i * 50000)); // Example: 50k, 100k, 150k
    } else if (parameterKeys[1] === 'investmentPercentage') {
      param2Values = Array.from({ length: 3 }, (_, i) => 50 + (i * 20)); // Example: 50%, 70%, 90%
    } else {
      param2Values = Array.from({ length: 3 }, (_, i) => i * 10); // Generic fallback
    }
  }
  
  // Get data array based on metric
  let metricData: any[] = [];
  if (hasProbabilityData) {
    metricData = customData.probabilityOverTime;
    console.log("Using probabilityOverTime data with length:", metricData.length);
  } else if (hasInvestmentsData) {
    metricData = customData.medianInvestmentsOverTime;
    console.log("Using medianInvestmentsOverTime data with length:", metricData.length);
  }
  
  // Create Z values matrix - this will be used for both surface and contour plots
  // Each z-value represents the FINAL VALUE (last year) for a specific parameter combination
  const zValues: number[][] = [];
  
  // If we have real data, use it
  if ((hasProbabilityData || hasInvestmentsData) && metricData.length > 0) {
    console.log("Using real data for z-values. Each value is the SUM of all values in the time series.");
    console.log("Parameter 1 values:", param1Values);
    console.log("Parameter 2 values:", param2Values);
    
    // For each value of the second parameter
    for (let i = 0; i < param2Values.length; i++) {
      const row: number[] = [];
      
      // For each value of the first parameter
      for (let j = 0; j < param1Values.length; j++) {
        // Calculate the index in the metricData array
        // First parameter iterates fully before second parameter
        // This means for data in format [param1_val1+param2_val1, param1_val1+param2_val2, param1_val2+param2_val1, param1_val2+param2_val2, ...]
        const dataIndex = j * param2Values.length + i;
        
        if (dataIndex < metricData.length && Array.isArray(metricData[dataIndex])) {
          // For investments, we need to SUM the array values to get the total
          if (metric === 'investments') {
            // For investments, we need to get the last year (index 39) and sum all values in that array
            if (metricData[dataIndex].length > 39 && Array.isArray(metricData[dataIndex][39])) {
              const lastYearData = metricData[dataIndex][39]; // Get the last year (index 39)
              let sum = 0;
              let hasValidValues = false;
              
              // Sum all values in the last year array
              for (let k = 0; k < lastYearData.length; k++) {
                let rawValue = lastYearData[k];
                let value = parseFloat(rawValue);
                
                if (!isNaN(value)) {
                  sum += value;
                  hasValidValues = true;
                }
              }
              
              if (hasValidValues) {
                row.push(sum);
                console.log(`Total investment for param1=${param1Values[j]}, param2=${param2Values[i]}: ${sum} (sum of last year's values)`);
              } else {
                console.warn(`No valid values to sum for last year at [${j},${i}] (using default)`);
                row.push(100000); // Default value
              }
            } else {
              console.warn(`Missing last year data at [${j},${i}] (using default)`);
              row.push(100000); // Default value
            }
          } else {
            // For probability, we still just want the final value (last item)
            // Get the last value from the array (final year/year 40)
            const lastIndex = metricData[dataIndex].length - 1;
            if (lastIndex >= 0) {
              let rawValue = metricData[dataIndex][lastIndex];
              let value = parseFloat(rawValue);
              
              // Ensure value is a number
              if (!isNaN(value)) {
                // Convert probability to percentage if needed
                if (metric === 'probabilityOfSuccess' && value <= 1) {
                  value = value * 100;
                }
                row.push(value);
                console.log(`Final probability for param1=${param1Values[j]}, param2=${param2Values[i]}: ${value}`);
              } else {
                console.warn(`Invalid final value at [${j},${i}]: ${rawValue} (using default)`);
                // Default value
                row.push(50); // Default probability value
              }
            } else {
              console.warn(`Empty data array at [${j},${i}] (using default)`);
              row.push(50); // Default probability value
            }
          }
        } else {
          console.warn(`Missing data at index ${dataIndex} (${j},${i}) (using default)`);
          // Default value based on metric
          row.push(metric === 'probabilityOfSuccess' ? 50 : 100000);
        }
      }
      
      zValues.push(row);
    }
    
    console.log("Z-values matrix (final year values for each parameter combination):", zValues);
  } else {
    // Use synthetic data if no real data available
    console.log("Using synthetic data for visualization (no real data available)");
    
    for (let i = 0; i < param2Values.length; i++) {
      const row: number[] = [];
      for (let j = 0; j < param1Values.length; j++) {
        // Create a formula that combines both parameters to create an interesting surface
        let value = 0;
        
        if (metric === 'probabilityOfSuccess') {
          // For probability, create a peak in the middle that gradually falls off
          const xNormalized = (j - param1Values.length / 2) / (param1Values.length / 2); // -1 to 1
          const yNormalized = (i - param2Values.length / 2) / (param2Values.length / 2); // -1 to 1
          const distance = Math.sqrt(xNormalized * xNormalized + yNormalized * yNormalized);
          value = Math.max(0, Math.min(100, 90 - (distance * 40))); // 90% at center, falls off with distance
        } else {
          // For investments, create a gradually increasing surface with wave patterns
          const param1 = typeof param1Values[j] === 'number' ? param1Values[j] : j * 10000;
          const param2 = typeof param2Values[i] === 'number' ? param2Values[i] : i * 5;
          
          value = param1 * 0.5 + param2 * 8000 + 
                 Math.sin(i / 1.5) * 50000 + Math.cos(j / 1.5) * 40000;
          value = Math.max(0, value);
        }
        
        row.push(value);
      }
      zValues.push(row);
    }
  }
  
  return { xValues: param1Values, yValues: param2Values, zValues };
};

/* ---------------- MAIN COMPONENT ---------------- */
const OpenSimulation: React.FC = () => {
  // Get planId from URL params
  const { planId } = useParams();
  
  // Log the planId value from useParams at the very beginning
  console.log("planId from useParams:", planId);
  
  // State for UI
  const [activeGraph, setActiveGraph] = useState("line");
  const [donutSeries, setDonutSeries] = useState<number[]>([]);
  const [donutLabels, setDonutLabels] = useState<string[]>([]);
  
  // State for graph selection
  const [selectedGraphs, setSelectedGraphs] = useState<string[]>(["line"]);
  const [selectedShadedMetrics, setSelectedShadedMetrics] = useState<string[]>(["investments"]);
  const [useMedianValues, setUseMedianValues] = useState(true);
  
  // State for scenario exploration
  const [showScenarioExploration, setShowScenarioExploration] = useState(false);
  const [scenarioMetric, setScenarioMetric] = useState<'probabilityOfSuccess' | 'investments'>('probabilityOfSuccess');
  const [selectedNumericOptions, setSelectedNumericOptions] = useState<string[]>([]);
  const [optionValues, setOptionValues] = useState<OptionValues>({
    rothOptimizerEnabled: false,
    startYear: [2025, 2030],
    duration: [15, 20],
    initialIncomeAmount: [75000, 100000],
    initialExpenseAmount: [50000, 70000],
    stockAllocation: [40, 60],
  });
  const [rothOptimizerEnabled, setRothOptimizerEnabled] = useState(false);
  const [runScenario, setRunScenario] = useState(false);
  
  // State for event series from database
  const [eventSeries, setEventSeries] = useState<{name: string, type: string, initialAmount: number}[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  
  // State for parameter editing
  const [selectedParameter, setSelectedParameter] = useState<string | null>(null);
  // Add a new state to track multiple selected parameters
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [parameterValues, setParameterValues] = useState<{
    startYear: { min: number; max: number; step: number; };
    duration: { min: number; max: number; step: number; };
    initialAmount: { min: number; max: number; step: number; };
    investmentPercentage: { min: number; max: number; step: number; };
  }>({
    startYear: { min: 2025, max: 2035, step: 5 },
    duration: { min: 5, max: 30, step: 5 },
    initialAmount: { min: 10000, max: 100000, step: 10000 },
    investmentPercentage: { min: 20, max: 80, step: 10 }
  });
  
  // State for line chart data
  const [probabilityData, setProbabilityData] = useState<any[]>([
    { year: new Date().getFullYear(), success: 0 }, // Placeholder data until real data loads
    { year: new Date().getFullYear() + 1, success: 0 }
  ]);
  
  // State for investment data
  const [investmentData, setInvestmentData] = useState<any[]>([]);
  
  // State for income data
  const [incomeData, setIncomeData] = useState<any[]>([]);
  
  // State for expenses data
  const [expensesData, setExpensesData] = useState<any[]>([]);
  
  // State for early withdrawal tax data
  const [earlyTaxData, setEarlyTaxData] = useState<any[]>([]);
  
  // State for discretionary percentage data
  const [discretionaryPctData, setDiscretionaryPctData] = useState<any[]>([]);
  
  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  
  // Add new state variables for order data
  const [investmentOrder, setInvestmentOrder] = useState<string[]>([]);
  const [incomeOrder, setIncomeOrder] = useState<string[]>([]);
  const [expensesOrder, setExpensesOrder] = useState<string[]>([]);
  
  // Add state variables for median and average values
  const [medianInvestments, setMedianInvestments] = useState<number[][]>([]);
  const [avgInvestments, setAvgInvestments] = useState<number[][]>([]);
  const [medianIncome, setMedianIncome] = useState<number[][]>([]);
  const [avgIncome, setAvgIncome] = useState<number[][]>([]);
  const [medianExpenses, setMedianExpenses] = useState<number[][]>([]);
  const [avgExpenses, setAvgExpenses] = useState<number[][]>([]);
  
  // Add state variable for aggregation threshold
  const [aggregationThreshold, setAggregationThreshold] = useState<number>(5000);
  
  // Add in state variable definition section (near the beginning of the component)
  const [categoryFilter, setCategoryFilter] = useState<'investments' | 'income' | 'expenses' | null>(null);
  
  // In the state variable section, add a new variable to track if Roth is enabled
  const [planHasRothEnabled, setPlanHasRothEnabled] = useState<boolean>(false);
  
  // Add a new state for scenario results and loading
  const [scenarioResults, setScenarioResults] = useState<any>(null);
  const [isScenarioLoading, setIsScenarioLoading] = useState<boolean>(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);
  
  // Add state variable for simulation count
  const [simulationCount, setSimulationCount] = useState<number>(3);
  
  // Add a new state for tracking if the scenario is running
  const [isRunningScenario, setIsRunningScenario] = useState(false);
  
  // Add a state variable to store the current plan ID regardless of source
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  
  // Update the useEffect to set the currentPlanId from the URL path
  useEffect(() => {
    const path = window.location.pathname;
    const scenarioId = path.split('/').pop(); // Get the last segment of the URL path
    console.log("Current Scenario ID:", scenarioId);
    
    console.log("Plan ID:", scenarioId);
    console.log("Full URL path:", path);
    
    // Store the ID in state for later use
    if (scenarioId) {
      setCurrentPlanId(scenarioId);
      fetchEventSeries(scenarioId);
      // Add function to fetch simulation object and extract resultsId
      fetchSimulationResultId(scenarioId);
    }
  }, []);
  
  // Fetch simulation data when planId from useParams changes
  useEffect(() => {
    if (planId) {
      console.log("Loading simulation data for plan:", planId);
      setCurrentPlanId(planId);
      fetchSimulationResultId(planId);
    }
  }, [planId]);
  
  // Function to fetch simulation object and extract resultsId
  const fetchSimulationResultId = async (planId: string) => {
    try {
      // Use the new API endpoint we created
      const response = await fetch(`http://localhost:5000/api/simulations/plan/${planId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (!response.ok) {
        console.error("Server response:", response.status, response.statusText);
        throw new Error('Failed to fetch simulation data');
      }
      
      const result = await response.json();
      
      // Log the raw response for debugging
      console.log("Simulation API Response:", result);
      
      // Check if data exists and contains resultsId
      if (result.data && result.data.resultsId) {
        const resultsId = result.data.resultsId;
        console.log("Results ID:", resultsId);
        
        // Now fetch the simulation results using the resultsId
        fetchSimulationResults(resultsId);
      } else {
        console.log("No resultsId found in response", result);
      }
    } catch (error) {
      console.error("Error fetching simulation data:", error);
    }
  };
  
  // Function to fetch simulation results using resultsId
  const fetchSimulationResults = async (resultsId: string) => {
    try {
      console.log("Fetching simulation results for ID:", resultsId);
      setIsLoading(true);
      
      const response = await fetch(`http://localhost:5000/api/simulations/results/${resultsId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (!response.ok) {
        console.error("Results API response:", response.status, response.statusText);
        throw new Error('Failed to fetch simulation results');
      }
      
      const results = await response.json();
      
      // Display the full results object in console
      console.log("Simulation Results:", results);
      
      // Update probabilityData for line chart if data exists
      if (results.data && results.data.probabilityOverTime) {
        const currentYear = new Date().getFullYear();
        const probData = results.data.probabilityOverTime.map((prob: number, index: number) => ({
          year: currentYear + index,
          success: prob * 100  // Convert to percentage
        }));
        setProbabilityData(probData);
        console.log("Updated probability data:", probData);
      }
      
      // Store order of investments, income, and expenses
      if (results.data) {
        if (results.data.investmentOrder) {
          setInvestmentOrder(results.data.investmentOrder);
          console.log("Set investment order:", results.data.investmentOrder);
        }
        
        if (results.data.incomeOrder) {
          setIncomeOrder(results.data.incomeOrder);
          console.log("Set income order:", results.data.incomeOrder);
        }
        
        if (results.data.expensesOrder) {
          setExpensesOrder(results.data.expensesOrder);
          console.log("Set expenses order:", results.data.expensesOrder);
        }
        
        // Store median and average values
        if (results.data.medianInvestmentsOverTime) {
          setMedianInvestments(results.data.medianInvestmentsOverTime);
          console.log("Set median investments:", results.data.medianInvestmentsOverTime);
        }
        
        if (results.data.avgInvestmentsOverTime) {
          setAvgInvestments(results.data.avgInvestmentsOverTime);
          console.log("Set average investments:", results.data.avgInvestmentsOverTime);
        }
        
        if (results.data.medianIncomeOverTime) {
          setMedianIncome(results.data.medianIncomeOverTime);
          console.log("Set median income:", results.data.medianIncomeOverTime);
        }
        
        if (results.data.avgIncomeOverTime) {
          setAvgIncome(results.data.avgIncomeOverTime);
          console.log("Set average income:", results.data.avgIncomeOverTime);
        }
        
        if (results.data.medianExpensesOverTime) {
          setMedianExpenses(results.data.medianExpensesOverTime);
          console.log("Set median expenses:", results.data.medianExpensesOverTime);
        }
        
        if (results.data.avgExpensesOverTime) {
          setAvgExpenses(results.data.avgExpensesOverTime);
          console.log("Set average expenses:", results.data.avgExpensesOverTime);
        }
      }
      
      // Process investment range data
      if (results.data && results.data.investmentsRange) {
        const currentYear = new Date().getFullYear();
        
        // Transform the investment range data
        const transformedData = results.data.investmentsRange.map((yearRanges: any[], yearIndex: number) => {
          // Ensure we have at least 5 percentile ranges
          if (yearRanges.length < 5) {
            console.warn("Investment range data is missing some percentile ranges");
            return null;
          }
          
          // yearRanges[0] is 10-90%, yearRanges[1] is 20-80%, etc.
          // yearRanges[4] is the median (50-50%)
          return {
            year: currentYear + yearIndex,
            p10: yearRanges[0][0],
            p90: yearRanges[0][1],
            p20: yearRanges[1][0],
            p80: yearRanges[1][1],
            p30: yearRanges[2] ? yearRanges[2][0] : null,
            p70: yearRanges[2] ? yearRanges[2][1] : null,
            p40: yearRanges[3] ? yearRanges[3][0] : null,
            p60: yearRanges[3] ? yearRanges[3][1] : null,
            median: yearRanges[4][0] // Assuming the median is the same for both values in the 50-50 range
          };
        }).filter(Boolean); // Remove any null entries
        
        setInvestmentData(transformedData);
        console.log("Updated investment data:", transformedData);
      }
      
      // Process income range data
      if (results.data && results.data.incomeRange) {
        const currentYear = new Date().getFullYear();
        
        // Transform the income range data
        const transformedData = results.data.incomeRange.map((yearRanges: any[], yearIndex: number) => {
          // Ensure we have at least 5 percentile ranges
          if (yearRanges.length < 5) {
            console.warn("Income range data is missing some percentile ranges");
            return null;
          }
          
          return {
            year: currentYear + yearIndex,
            p10: yearRanges[0][0],
            p90: yearRanges[0][1],
            p20: yearRanges[1][0],
            p80: yearRanges[1][1],
            p30: yearRanges[2] ? yearRanges[2][0] : null,
            p70: yearRanges[2] ? yearRanges[2][1] : null,
            p40: yearRanges[3] ? yearRanges[3][0] : null,
            p60: yearRanges[3] ? yearRanges[3][1] : null,
            median: yearRanges[4][0] // Assuming the median is the same for both values in the 50-50 range
          };
        }).filter(Boolean); // Remove any null entries
        
        setIncomeData(transformedData);
        console.log("Updated income data:", transformedData);
      }

      // Process expenses range data
      if (results.data && results.data.expensesRange) {
        const currentYear = new Date().getFullYear();
        
        // Transform the expenses range data
        const transformedData = results.data.expensesRange.map((yearRanges: any[], yearIndex: number) => {
          // Ensure we have at least 5 percentile ranges
          if (yearRanges.length < 5) {
            console.warn("Expenses range data is missing some percentile ranges");
            return null;
          }
          
          return {
            year: currentYear + yearIndex,
            p10: yearRanges[0][0],
            p90: yearRanges[0][1],
            p20: yearRanges[1][0],
            p80: yearRanges[1][1],
            p30: yearRanges[2] ? yearRanges[2][0] : null,
            p70: yearRanges[2] ? yearRanges[2][1] : null,
            p40: yearRanges[3] ? yearRanges[3][0] : null,
            p60: yearRanges[3] ? yearRanges[3][1] : null,
            median: yearRanges[4][0] // Assuming the median is the same for both values in the 50-50 range
          };
        }).filter(Boolean); // Remove any null entries
        
        setExpensesData(transformedData);
        console.log("Updated expenses data:", transformedData);
      }

      // Process early withdrawal tax range data
      if (results.data && results.data.earlyWithdrawTaxRange) {
        const currentYear = new Date().getFullYear();
        
        // Transform the early withdrawal tax range data
        const transformedData = results.data.earlyWithdrawTaxRange.map((yearRanges: any[], yearIndex: number) => {
          // Ensure we have at least 5 percentile ranges
          if (yearRanges.length < 5) {
            console.warn("Early withdrawal tax range data is missing some percentile ranges");
            return null;
          }
          
          return {
            year: currentYear + yearIndex,
            p10: yearRanges[0][0],
            p90: yearRanges[0][1],
            p20: yearRanges[1][0],
            p80: yearRanges[1][1],
            p30: yearRanges[2] ? yearRanges[2][0] : null,
            p70: yearRanges[2] ? yearRanges[2][1] : null,
            p40: yearRanges[3] ? yearRanges[3][0] : null,
            p60: yearRanges[3] ? yearRanges[3][1] : null,
            median: yearRanges[4][0] // Assuming the median is the same for both values in the 50-50 range
          };
        }).filter(Boolean); // Remove any null entries
        
        setEarlyTaxData(transformedData);
        console.log("Updated early withdrawal tax data:", transformedData);
      }

      // Process discretionary percentage range data
      if (results.data && results.data.percentageDiscretionaryRange) {
        const currentYear = new Date().getFullYear();
        
        // Transform the discretionary percentage range data
        const transformedData = results.data.percentageDiscretionaryRange.map((yearRanges: any[], yearIndex: number) => {
          // Ensure we have at least 5 percentile ranges
          if (yearRanges.length < 5) {
            console.warn("Discretionary percentage range data is missing some percentile ranges");
            return null;
          }
          
          return {
            year: currentYear + yearIndex,
            // Convert to percentage (multiply by 100)
            p10: yearRanges[0][0] * 100,
            p90: yearRanges[0][1] * 100,
            p20: yearRanges[1][0] * 100,
            p80: yearRanges[1][1] * 100,
            p30: yearRanges[2] ? yearRanges[2][0] * 100 : null,
            p70: yearRanges[2] ? yearRanges[2][1] * 100 : null,
            p40: yearRanges[3] ? yearRanges[3][0] * 100 : null,
            p60: yearRanges[3] ? yearRanges[3][1] * 100 : null,
            median: yearRanges[4][0] * 100 // Assuming the median is the same for both values in the 50-50 range
          };
        }).filter(Boolean); // Remove any null entries
        
        setDiscretionaryPctData(transformedData);
        console.log("Updated discretionary percentage data:", transformedData);
      }
    } catch (error) {
      console.error("Error fetching simulation results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch event series from the database
  const fetchEventSeries = async (scenarioId: string) => {
    try {
      // Get the user ID from localStorage for authentication
      const userId = localStorage.getItem("userId");
      
      if (!userId) {
        console.error("No user ID found in localStorage");
        return;
      }
      
      // Request to fetch scenario details - include userId in the request
      const response = await fetch(`http://localhost:5000/api/plans/${scenarioId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (!response.ok) {
        console.error("Server response:", response.status, response.statusText);
        throw new Error('Failed to fetch scenario details');
      }
      
      const result = await response.json();
      
      // Log the raw response to debug
      console.log("API Response:", result);
      
      // Access the plan data
      const plan = result.plan || result.data;
      
      // Check if plan has Roth Conversion Optimizer enabled
      if (plan) {
        // Check for RothConversionOpt attribute
        const hasRothEnabled = plan.RothConversionOpt === true;
        console.log("Plan has Roth Conversion Optimizer enabled:", hasRothEnabled);
        setPlanHasRothEnabled(hasRothEnabled);
        
        // Initialize Roth optimizer state based on plan setting
        setRothOptimizerEnabled(hasRothEnabled);
        handleOptionChange('rothOptimizerEnabled', hasRothEnabled);
      }
      
      // Log event series names if they exist - check both result and result.data paths
      if (plan && plan.eventSeries && Array.isArray(plan.eventSeries)) {
        console.log("Event Series Names:", plan.eventSeries.map((event: any) => event.name));
        
        // Store events in state for use in the UI
        setEventSeries(plan.eventSeries.map((event: any) => ({
          name: event.name || 'Unnamed Event',
          type: event.type || 'other',
          initialAmount: event.initialAmount || 0
        })));
        
        // Log details for each event
        plan.eventSeries.forEach((event: any, index: number) => {
          console.log(`Event #${index+1}:`, {
            name: event.name,
            type: event.type,
            initialAmount: event.initialAmount,
            inflationAdjusted: event.inflationAdjusted || false
          });
        });
      } else {
        // If the structure is different, log the possible locations of event data
        console.log("No event series found at plan.eventSeries. Raw data structure:", plan);
        
        // Try alternative paths
        if (plan && plan.events) {
          console.log("Found events at plan.events:", plan.events);
          setEventSeries(plan.events.map((event: any) => ({
            name: event.name || 'Unnamed Event',
            type: event.type || 'other',
            initialAmount: event.initialAmount || 0
          })));
        }
      }
    } catch (error) {
      console.error("Error fetching event series:", error);
    }
  };

  /* ---------- labels ---------- */
  const metricLabels: Record<string, string> = {
    investments: "Total Investments",
    income: "Total Income",
    expenses: "Total Expenses",
    earlyTax: "Early Withdrawal Tax",
    discretionaryPct: "% of Discretionary Expenses",
  };

  const handleOptionChange = (optionKey: string, value: [number, number] | boolean) => {
    setOptionValues(prev => ({
      ...prev,
      [optionKey]: value
    }));
  };

  const toggleNumericOption = (optionKey: string) => {
    setSelectedNumericOptions(prev => {
      // If already selected, remove it
      if (prev.includes(optionKey)) {
        return prev.filter(key => key !== optionKey);
      }
      
      // If we already have 2 options selected and Roth optimizer is not enabled
      if (prev.length >= 2 && !rothOptimizerEnabled) {
        // Replace the first one
        const newSelection = [...prev];
        newSelection.shift();
        return [...newSelection, optionKey];
      }
      
      // Otherwise add it
      return [...prev, optionKey];
    });
  };

  const isOptionDisabled = (optionKey: string) => {
    // If Roth optimizer is enabled, all numeric options are disabled
    if (rothOptimizerEnabled && optionKey !== 'rothOptimizerEnabled') {
      return true;
    }
    
    // If this is a numeric option
    if (optionKey !== 'rothOptimizerEnabled') {
      // If it's not in the selected options and we already have 2
      if (!selectedNumericOptions.includes(optionKey) && selectedNumericOptions.length >= 2) {
        return true;
      }
    }
    
    return false;
  };

  const getSelectedParameterValues = () => {
    if (rothOptimizerEnabled) {
      return [true];
    }
    
    // For numeric parameters, get all values in the range by step
    const key = selectedNumericOptions[0];
    if (!key) return [];
    
    const option = scenarioOptions[key] as NumericOption;
    const [start, end] = optionValues[key] as [number, number];
    
    const values: number[] = [];
    for (let value = start; value <= end; value += option.step) {
      if (mockScenarioResults[key] && mockScenarioResults[key][value]) {
        values.push(value);
      }
    }
    
    return values;
  };

  const handleRothOptimizerChange = (enabled: boolean) => {
    // Only allow enabling if the plan has Roth enabled
    if (enabled && !planHasRothEnabled) {
      console.log("Cannot enable Roth Optimizer - not enabled in original plan");
      return;
    }
    
    setRothOptimizerEnabled(enabled);
    
    // If enabling Roth optimizer, clear numeric option selections
    if (enabled) {
      setSelectedNumericOptions([]);
    }
    
    handleOptionChange('rothOptimizerEnabled', enabled);
  };

  // Handle parameter value change
  const handleParameterChange = (parameter: string, field: 'min' | 'max' | 'step', value: number) => {
    setParameterValues(prev => ({
      ...prev,
      [parameter]: {
        ...prev[parameter as keyof typeof prev],
        [field]: value
      }
    }));
  };

  // Function to select a parameter
  const selectParameter = (parameter: string) => {
    // Update the legacy selectedParameter state for compatibility
    if (selectedParameter === parameter) {
      setSelectedParameter(null);
    } else {
      setSelectedParameter(parameter);
    }
    
    // Now update the array of selected parameters (up to 2)
    setSelectedParameters(prev => {
      // If already selected, remove it
      if (prev.includes(parameter)) {
        return prev.filter(p => p !== parameter);
      }
      
      // If we already have 2 options selected, replace the first one
      if (prev.length >= 2) {
        // Replace the first one
        const newSelection = [...prev];
        newSelection.shift();
        return [...newSelection, parameter];
      }
      
      // Otherwise add it
      return [...prev, parameter];
    });
    
    // Initialize with event data if available
    if (parameter === 'initialAmount') {
      const event = eventSeries.find(e => e.name === selectedEvent);
      if (event) {
        setParameterValues(prev => ({
          ...prev,
          initialAmount: {
            ...prev.initialAmount,
            min: Math.max(0, event.initialAmount * 0.5),
            max: event.initialAmount * 1.5
          }
        }));
      }
    }
  };

  // Generate parameter values based on min/max/step
  const generateParameterValues = (parameter: string | null) => {
    if (!parameter) return [];
    
    // Make sure the parameter exists in our parameterValues object
    if (!(parameter in parameterValues)) {
      console.warn(`Parameter "${parameter}" not found in parameterValues!`);
      return [];
    }
    
    const { min, max, step } = parameterValues[parameter as keyof typeof parameterValues];
    const values = [];
    
    for (let value = min; value <= max; value += step) {
      values.push(value);
    }
    
    console.log(`Generated parameter values for ${parameter}:`, values);
    return values;
  };

  // Function to run scenario with selected parameter
  const runScenarioWithParameter = async () => {
    // Check if a parameter has been selected, but skip this check if Roth optimizer is enabled
    if (selectedParameters.length === 0 && !rothOptimizerEnabled) {
      setScenarioError("Please select at least one parameter to modify first.");
      return;
    }

    // Make sure we have a valid planId
    // Use currentPlanId which may come from either useParams or URL path
    if (!currentPlanId) {
      setScenarioError("No plan ID available. Please reload the page.");
      return;
    }

    setScenarioError('');
    setIsRunningScenario(true);

    try {
      if (rothOptimizerEnabled) {
        console.log("Running scenario with Roth Conversion Optimizer enabled");
      } else {
        console.log(`Running scenario with parameters: ${selectedParameters.join(', ')}`);
      }
      console.log(`Using plan ID: ${currentPlanId}`);
      
      // Get user ID from localStorage
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setScenarioError("User ID not found. Please log in again.");
        setIsRunningScenario(false);
        return;
      }

      // Get user state tax file from localStorage or use a default
      const stateTaxFile = localStorage.getItem("stateTaxFile") || "state_tax.yaml";
      
      // Base request parameters
      const requestBody: any = {
        state_tax_file: stateTaxFile,
        username: localStorage.getItem("name") || "user",
        id: currentPlanId, // Use the current plan ID from state
        simulations: simulationCount, // Use user-specified simulation count
        algorithmType: selectedParameters.length > 1 ? "2d" : "1d", // Use 2d if we have 2 parameters
      };
      
      // If Roth optimizer is enabled, add Roth parameters
      if (rothOptimizerEnabled) {
        console.log("Setting up Roth Conversion Optimizer parameters");
        requestBody.parameters = [{
          itemType: "rothConversionOpt",
          itemId: "rothConversionOpt",
          parameterName: "enabled",
          min: 1, // true
          max: 1, // true
          step: 1
        }];
      } 
      // Otherwise, use selected parameters
      else if (selectedParameters.length > 0 && selectedEvent) {
        requestBody.parameters = [];
        
        for (const selectedParameter of selectedParameters) {
          // Determine itemType based on selectedParameter
          let itemType = "";
          let parameterName = selectedParameter;
          
          switch (selectedParameter) {
            case 'startYear':
              itemType = "start";
              break;
            case 'duration':
              itemType = "duration";
              break;
            case 'initialAmount':
              itemType = "initialAmount";
              break;
            case 'investmentPercentage':
              itemType = "percentage";
              break;
            default:
              console.error("Unknown parameter:", selectedParameter);
              setScenarioError(`Unknown parameter: ${selectedParameter}`);
              setIsRunningScenario(false);
              return;
          }
          
          const { min, max, step } = parameterValues[selectedParameter as keyof typeof parameterValues];
          
          // Find the event in the eventSeries
          const event = eventSeries.find(e => e.name === selectedEvent);
          if (!event) {
            setScenarioError(`Event not found: ${selectedEvent}`);
            setIsRunningScenario(false);
            return;
          }
          
          // Add parameter details to request
          requestBody.parameters.push({
            itemType,
            itemId: selectedEvent, // Use event name as ID
            parameterName,
            min,
            max,
            step
          });
        }
        
        console.log("Running scenario with parameters:", requestBody.parameters);
      } else if (!rothOptimizerEnabled) {
        // Only show this error if Roth optimizer is not enabled
        setScenarioError("No parameter selected for scenario exploration");
        setIsRunningScenario(false);
        return;
      }
      
      console.log('Scenario API request:', requestBody);

      const response = await fetch('http://localhost:5000/api/simulations/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Scenario API response:', data);

      // Store the results
      setScenarioResults(data.data || data);
      setRunScenario(true);
    } catch (error) {
      console.error('Error running scenario:', error);
      setScenarioError(`Failed to run scenario: ${error.message}`);
    } finally {
      setIsRunningScenario(false);
    }
  };

  const renderNormalGraphs = () => (
    <>
      {selectedGraphs.includes("line") && (
        <div style={{ marginBottom: 40 }}>
          <LineChartGraph data={probabilityData} />
        </div>
      )}

      {selectedGraphs.includes("shaded") &&
        selectedShadedMetrics.map((metric) => (
          <div key={metric} style={{ marginBottom: 40 }}>
            <h3 style={{ textAlign: "center", marginBottom: 10 }}>
              {metricLabels[metric]}
            </h3>
            <ShadedLineChart
              metric={metric}
              financialGoal={
                metric === "investments" ? mockSimulationResult.financialGoal : undefined
              }
              customData={
                metric === "investments" 
                  ? investmentData 
                  : metric === "income" 
                    ? incomeData 
                    : metric === "expenses"
                      ? expensesData
                      : metric === "earlyTax"
                        ? earlyTaxData
                        : metric === "discretionaryPct"
                          ? discretionaryPctData
                          : undefined
              }
            />
          </div>
        ))}
        
      {/* Note: The stacked bar chart is rendered in the main component return,
          not here, to avoid duplication */}
    </>
  );

  const renderScenarioExploration = () => (
    <div style={{ marginTop: 20, width: '100%' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Scenario Exploration</h2>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        maxWidth: '700px',
        margin: '0 auto',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px'
      }}>
        {/* Simulation Count Input */}
        <div style={{ marginBottom: 15 }}>
          <div style={{ marginBottom: 5, fontWeight: 'bold' }}>Number of Simulations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input 
                type="number" 
                value={simulationCount}
                min={1}
                max={10}
                step={1}
                onChange={(e) => setSimulationCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  width: '120px',
                  marginRight: '10px'
                }}
              />
              <div style={{ fontSize: '0.9em', color: '#666' }}>
                (Min: 1, Max: 10)
              </div>
            </div>
            
            <div style={{ width: '100%' }}>
              <input 
                type="range"
                min={1}
                max={10}
                step={1}
                value={simulationCount}
                onChange={(e) => setSimulationCount(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '0.8em', 
                color: '#777',
                marginTop: '2px'
              }}>
                <span>1</span>
                <span>3</span>
                <span>5</span>
                <span>7</span>
                <span>10</span>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '0.85em', 
              marginTop: '5px',
              backgroundColor: simulationCount < 3 ? '#fff3cd' :
                        simulationCount < 5 ? '#d4edda' :
                        simulationCount < 8 ? '#cce5ff' : '#e2e3e5',
              padding: '8px 12px',
              borderRadius: '4px',
              color: '#333'
            }}>
              <div style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%',
                backgroundColor: simulationCount < 3 ? '#ffc107' :
                          simulationCount < 5 ? '#28a745' :
                          simulationCount < 8 ? '#0d6efd' : '#6c757d',
                marginRight: '8px'
              }}></div>
              {simulationCount < 3 ? 
                'Quick but less accurate results' :
                simulationCount < 5 ? 
                'Good balance of speed and accuracy' :
                simulationCount < 8 ?
                'More accurate but slower processing' :
                'Maximum accuracy, longest processing time'}
            </div>
          </div>
        </div>

        {/* Roth Optimizer Option - only show if plan has it enabled */}
        {planHasRothEnabled ? (
          <div style={{ marginBottom: 15 }}>
            <div style={{ marginBottom: 5, fontWeight: 'bold' }}>Roth Conversion Optimizer</div>
            <div>
              <label style={{ marginRight: 20 }}>
                <input 
                  type="checkbox" 
                  checked={rothOptimizerEnabled} 
                  onChange={() => handleRothOptimizerChange(!rothOptimizerEnabled)}
                /> 
                Enable Roth Conversion Optimizer
              </label>
              <div style={{ fontSize: '0.9em', color: '#666', marginTop: 5 }}>
                This plan has Roth Conversion Optimizer available. You can toggle it on or off.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 15, opacity: 0.6 }}>
            <div style={{ marginBottom: 5, fontWeight: 'bold' }}>Roth Conversion Optimizer</div>
            <div>
              <label style={{ marginRight: 20 }}>
                <input 
                  type="checkbox" 
                  disabled={true}
                  checked={false}
                /> 
                Enable Roth Conversion Optimizer
              </label>
              <div style={{ fontSize: '0.9em', color: '#666', marginTop: 5 }}>
                This plan does not have Roth Conversion Optimizer enabled. You cannot modify this setting.
              </div>
            </div>
          </div>
        )}
        
        {/* Event Selection Section */}
        {eventSeries.length > 0 && (
          <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            {rothOptimizerEnabled && (
              <div style={{ 
                padding: '10px', 
                marginBottom: '15px', 
                backgroundColor: '#e6f7ef', 
                border: '1px solid #7EC995', 
                borderRadius: '5px',
                fontSize: '0.9em'
              }}>
                <strong>Note:</strong> Event parameters are locked when Roth Conversion Optimizer is enabled. 
                Disable the optimizer above to modify event parameters.
              </div>
            )}
            
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Select an Event to Modify:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
              {eventSeries.map((event, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!rothOptimizerEnabled) {
                      setSelectedEvent(event.name);
                      setSelectedParameter(null);
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: selectedEvent === event.name ? '#7EC995' : '#e9ecef',
                    color: selectedEvent === event.name ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: rothOptimizerEnabled ? 'not-allowed' : 'pointer',
                    fontWeight: selectedEvent === event.name ? 'bold' : 'normal',
                    opacity: rothOptimizerEnabled ? 0.6 : 1
                  }}
                  disabled={rothOptimizerEnabled}
                >
                  {event.name} ({event.type})
                </button>
              ))}
            </div>
            
            {selectedEvent && !rothOptimizerEnabled && (
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '15px' }}>
                  Select parameters to modify (you can select up to two):
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* START YEAR PARAMETER */}
                  <div 
                    className={`parameter-option ${selectedParameters.length === 2 && !selectedParameters.includes('startYear') ? 'disabled' : ''}`}
                    style={{
                      padding: '15px', 
                      backgroundColor: selectedParameters.includes('startYear') ? '#e6f7ef' : '#fff', 
                      border: `1px solid ${selectedParameters.includes('startYear') ? '#7EC995' : '#ddd'}`,
                      borderRadius: '8px',
                      opacity: selectedParameters.length === 2 && !selectedParameters.includes('startYear') ? 0.5 : 1,
                      pointerEvents: selectedParameters.length === 2 && !selectedParameters.includes('startYear') ? 'none' : 'auto'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <h4 style={{ margin: 0 }}>Start Year</h4>
                      <button
                        onClick={() => selectParameter('startYear')}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: selectedParameters.includes('startYear') ? '#7EC995' : '#e9ecef',
                          color: selectedParameters.includes('startYear') ? 'white' : '#333',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {selectedParameters.includes('startYear') ? 'Selected' : 'Select'}
                      </button>
                    </div>
                    
                    {selectedParameters.includes('startYear') && (
                      <div>
                        <div style={{ marginBottom: '15px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <label>Minimum Value:</label>
                            <input
                              type="number"
                              value={parameterValues.startYear.min}
                              min={2022}
                              max={2050}
                              onChange={(e) => handleParameterChange('startYear', 'min', parseInt(e.target.value) || 2022)}
                              style={{
                                width: '100px',
                                padding: '5px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <label>Maximum Value:</label>
                            <input
                              type="number"
                              value={parameterValues.startYear.max}
                              min={parameterValues.startYear.min}
                              max={2050}
                              onChange={(e) => handleParameterChange('startYear', 'max', parseInt(e.target.value) || parameterValues.startYear.min)}
                              style={{
                                width: '100px',
                                padding: '5px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label>Step:</label>
                            <input
                              type="number"
                              value={parameterValues.startYear.step}
                              min={1}
                              max={10}
                              onChange={(e) => handleParameterChange('startYear', 'step', parseInt(e.target.value) || 1)}
                              style={{
                                width: '100px',
                                padding: '5px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <p>Selected values: {generateParameterValues('startYear').join(', ')}</p>
                        </div>
                      </div>
            )}
          </div>
                  
                  {/* DURATION PARAMETER */}
                  <div 
                    className={`parameter-option ${selectedParameter && selectedParameter !== 'duration' ? 'disabled' : ''}`}
                    style={{ 
                      padding: '15px', 
                      backgroundColor: selectedParameter === 'duration' ? '#e6f7ef' : '#fff', 
                      border: `1px solid ${selectedParameter === 'duration' ? '#7EC995' : '#ddd'}`,
                      borderRadius: '8px',
                      opacity: selectedParameter && selectedParameter !== 'duration' ? 0.5 : 1,
                      pointerEvents: selectedParameter && selectedParameter !== 'duration' ? 'none' : 'auto'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <h4 style={{ margin: 0 }}>Duration (Years)</h4>
                      <button
                        onClick={() => selectParameter('duration')}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: selectedParameter === 'duration' ? '#7EC995' : '#e9ecef',
                          color: selectedParameter === 'duration' ? 'white' : '#333',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {selectedParameter === 'duration' ? 'Selected' : 'Select'}
                      </button>
                    </div>
                    
                    {selectedParameter === 'duration' && (
                      <div>
                        <div style={{ marginBottom: '15px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <label>Minimum Value:</label>
                            <input
                              type="number"
                              value={parameterValues.duration.min}
                              min={1}
                              max={40}
                              onChange={(e) => handleParameterChange('duration', 'min', parseInt(e.target.value) || 1)}
                              style={{
                                width: '100px',
                                padding: '5px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <label>Maximum Value:</label>
                            <input
                              type="number"
                              value={parameterValues.duration.max}
                              min={parameterValues.duration.min}
                              max={40}
                              onChange={(e) => handleParameterChange('duration', 'max', parseInt(e.target.value) || parameterValues.duration.min)}
                              style={{
                                width: '100px',
                                padding: '5px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label>Step:</label>
                            <input
                              type="number"
                              value={parameterValues.duration.step}
                              min={1}
                              max={10}
                              onChange={(e) => handleParameterChange('duration', 'step', parseInt(e.target.value) || 1)}
                              style={{
                                width: '100px',
                                padding: '5px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <p>Selected values: {generateParameterValues('duration').join(', ')}</p>
                        </div>
                      </div>
                    )}
      </div>

                  {/* INITIAL AMOUNT PARAMETER */}
                  <div 
                    className={`parameter-option ${selectedParameter && selectedParameter !== 'initialAmount' ? 'disabled' : ''}`}
                    style={{ 
                      padding: '15px', 
                      backgroundColor: selectedParameter === 'initialAmount' ? '#e6f7ef' : '#fff', 
                      border: `1px solid ${selectedParameter === 'initialAmount' ? '#7EC995' : '#ddd'}`,
                      borderRadius: '8px',
                      opacity: selectedParameter && selectedParameter !== 'initialAmount' ? 0.5 : 1,
                      pointerEvents: selectedParameter && selectedParameter !== 'initialAmount' ? 'none' : 'auto'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <h4 style={{ margin: 0 }}>Initial Amount ($)</h4>
                      <button
                        onClick={() => selectParameter('initialAmount')}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: selectedParameter === 'initialAmount' ? '#7EC995' : '#e9ecef',
                          color: selectedParameter === 'initialAmount' ? 'white' : '#333',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {selectedParameter === 'initialAmount' ? 'Selected' : 'Select'}
                      </button>
                    </div>
                    
                    {selectedParameter === 'initialAmount' && (
                      <div>
                        <div style={{ marginBottom: '15px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <label>Minimum Value:</label>
                            <input
                              type="number"
                              value={parameterValues.initialAmount.min}
                              min={0}
                              max={1000000}
                              onChange={(e) => handleParameterChange('initialAmount', 'min', parseInt(e.target.value) || 0)}
                              style={{
                                width: '100px',
                                padding: '5px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <label>Maximum Value:</label>
                            <input
                              type="number"
                              value={parameterValues.initialAmount.max}
                              min={parameterValues.initialAmount.min}
                              max={1000000}
                              onChange={(e) => handleParameterChange('initialAmount', 'max', parseInt(e.target.value) || parameterValues.initialAmount.min)}
                              style={{
                                width: '100px',
                                padding: '5px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label>Step:</label>
                            <input
                              type="number"
                              value={parameterValues.initialAmount.step}
                              min={1000}
                              max={50000}
                              onChange={(e) => handleParameterChange('initialAmount', 'step', parseInt(e.target.value) || 1000)}
                              style={{
                                width: '100px',
                                padding: '5px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <p>Selected values: {generateParameterValues('initialAmount').map(val => `$${val.toLocaleString()}`).join(', ')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* INVESTMENT PERCENTAGE PARAMETER - Only show for investments */}
                  {eventSeries.find(e => e.name === selectedEvent)?.type === 'invest' && (
                    <div 
                      className={`parameter-option ${selectedParameter && selectedParameter !== 'investmentPercentage' ? 'disabled' : ''}`}
                      style={{ 
                        padding: '15px', 
                        backgroundColor: selectedParameter === 'investmentPercentage' ? '#e6f7ef' : '#fff', 
                        border: `1px solid ${selectedParameter === 'investmentPercentage' ? '#7EC995' : '#ddd'}`,
                        borderRadius: '8px',
                        opacity: selectedParameter && selectedParameter !== 'investmentPercentage' ? 0.5 : 1,
                        pointerEvents: selectedParameter && selectedParameter !== 'investmentPercentage' ? 'none' : 'auto'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '10px'
                      }}>
                        <h4 style={{ margin: 0 }}>Investment Percentage (%)</h4>
                        <button
                          onClick={() => selectParameter('investmentPercentage')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: selectedParameter === 'investmentPercentage' ? '#7EC995' : '#e9ecef',
                            color: selectedParameter === 'investmentPercentage' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          {selectedParameter === 'investmentPercentage' ? 'Selected' : 'Select'}
          </button>
        </div>

                      {selectedParameter === 'investmentPercentage' && (
                        <div>
                          <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                              <label>Minimum Value:</label>
              <input
                                type="number"
                                value={parameterValues.investmentPercentage.min}
                                min={0}
                                max={100}
                                onChange={(e) => handleParameterChange('investmentPercentage', 'min', parseInt(e.target.value) || 0)}
                                style={{
                                  width: '100px',
                                  padding: '5px',
                                  borderRadius: '4px',
                                  border: '1px solid #ccc'
                                }}
                              />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                              <label>Maximum Value:</label>
              <input
                                type="number"
                                value={parameterValues.investmentPercentage.max}
                                min={parameterValues.investmentPercentage.min}
                                max={100}
                                onChange={(e) => handleParameterChange('investmentPercentage', 'max', parseInt(e.target.value) || parameterValues.investmentPercentage.min)}
                                style={{
                                  width: '100px',
                                  padding: '5px',
                                  borderRadius: '4px',
                                  border: '1px solid #ccc'
                                }}
                              />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <label>Step:</label>
              <input
                                type="number"
                                value={parameterValues.investmentPercentage.step}
                                min={1}
                                max={20}
                                onChange={(e) => handleParameterChange('investmentPercentage', 'step', parseInt(e.target.value) || 1)}
                                style={{
                                  width: '100px',
                                  padding: '5px',
                                  borderRadius: '4px',
                                  border: '1px solid #ccc'
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <p>Selected values: {generateParameterValues('investmentPercentage').map(val => `${val}%`).join(', ')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {selectedEvent && rothOptimizerEnabled && (
              <div style={{ 
                padding: '15px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '8px',
                textAlign: 'center',
                color: '#666'
              }}>
                <p style={{ margin: '0 0 10px 0' }}>
                  <i className="fas fa-lock" style={{ marginRight: '8px' }}></i>
                  Parameters are locked while Roth Conversion Optimizer is enabled
                </p>
                <p style={{ margin: 0, fontSize: '0.9em' }}>
                  Disable the Roth Conversion Optimizer above to modify event parameters
                </p>
              </div>
            )}
            
            {/* Run button */}
            <button
              onClick={runScenarioWithParameter}
              disabled={((!selectedParameter && !rothOptimizerEnabled) || isRunningScenario)}
              style={{
                padding: '10px 20px',
                backgroundColor: (!selectedParameter && !rothOptimizerEnabled) ? '#ccc' : '#4285F4',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: ((!selectedParameter && !rothOptimizerEnabled) || isRunningScenario) ? 'not-allowed' : 'pointer',
                marginTop: '15px',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              {isRunningScenario ? 'Running Scenario...' : rothOptimizerEnabled ? 'Run Scenario with Roth Optimizer' : 'Run Scenario'}
            </button>

            {/* Loading indicator */}
            {isRunningScenario && (
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <div style={{ 
                  display: 'inline-block',
                  width: '50px',
                  height: '50px',
                  border: '5px solid #f3f3f3',
                  borderTop: '5px solid #7EC995',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}></div>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
                <p style={{ marginTop: '10px' }}>Running scenario exploration...</p>
              </div>
            )}

            {/* Debug information - only shown if there's an error */}
            {scenarioError && (
              <div style={{ 
                margin: '10px 0 0 0', 
                padding: '10px', 
                backgroundColor: '#f8f9fa', 
                border: '1px dashed #ccc',
                borderRadius: '4px',
                fontSize: '0.85em',
                color: '#666',
                textAlign: 'left'
              }}>
                <div><strong>Debug Info:</strong></div>
                <div>Current Plan ID: {currentPlanId ? `"${currentPlanId}"` : 'null'}</div>
                <div>URL Plan ID: {planId ? `"${planId}"` : 'null'}</div>
                <div>Parameters: {JSON.stringify({
                  selectedParameter,
                  selectedEvent,
                  paramValues: selectedParameter ? parameterValues[selectedParameter as keyof typeof parameterValues] : null,
                })}</div>
                <div>Path: {window.location.pathname}</div>
                <div style={{ marginTop: '10px' }}>
                  <button 
                    onClick={() => {
                      const path = window.location.pathname;
                      const id = path.split('/').pop(); 
                      console.log("Manually extracted ID:", id);
                      if (id) {
                        setCurrentPlanId(id);
                        console.log("Set currentPlanId to:", id);
                      }
                    }}
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.9em',
                      backgroundColor: '#e9ecef',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Try Manual ID Extraction
                  </button>
                </div>
              </div>
            )}

            {/* Error message */}
            {scenarioError && (
              <div style={{ 
                margin: '20px 0', 
                padding: '15px', 
                backgroundColor: '#ffe0e0', 
                borderRadius: '8px',
                color: '#d32f2f',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Error</p>
                <p style={{ margin: '5px 0 0 0' }}>{scenarioError}</p>
              </div>
            )}

            {/* Scenario results */}
            {runScenario && scenarioResults && (
              <div style={{ marginTop: 20 }}>
                <h3 style={{ textAlign: 'center', marginBottom: 15 }}>Scenario Results</h3>
                {/* Debug logging */}
                {console.log("Rendering scenario results with:", {
                  parameterKey: rothOptimizerEnabled ? "rothConversionOpt" : selectedEvent || "",
                  usingRoth: rothOptimizerEnabled,
                  selectedEvent,
                  selectedParameter,
                  selectedParameters,
                  values: rothOptimizerEnabled ? [true] : 
                          selectedParameters.length > 0 ? 
                            selectedParameters.map(param => generateParameterValues(param)) : 
                            selectedParameter ? generateParameterValues(selectedParameter) : []
                })}
                
                {selectedParameters.length > 1 ? (
                  <>
                    {/* 3D Surface Plot */}
                    <SurfacePlotChart 
                      parameterKeys={selectedParameters}
                      metric={scenarioMetric}
                      customData={scenarioResults}
                      parameterValues={selectedParameters.map(param => generateParameterValues(param))}
                    />
                    
                    {/* Add 2D Contour Plot */}
                    <div style={{ marginTop: 40 }}>
                      <h3 style={{ textAlign: 'center', marginBottom: 10 }}>
                        Contour Plot: {`${selectedParameters[0]} vs ${selectedParameters[1]} Impact on ${scenarioMetric === 'probabilityOfSuccess' ? 'Final Success Probability' : 'Total Final Year Investments'}`}
                      </h3>
                      
                      <div style={{ textAlign: 'center', fontSize: '0.85rem', marginBottom: 15, color: '#666' }}>
                        <em>Note: This chart shows {scenarioMetric === 'probabilityOfSuccess' ? 'the final year\'s probability value' : 'the sum of all investment types in the final year (year 40)'} for each parameter combination</em>
                        <div style={{ marginTop: 5 }}>
                          <strong>X-axis:</strong> {selectedParameters[0]} values &nbsp;|&nbsp; 
                          <strong>Y-axis:</strong> {selectedParameters[1]} values &nbsp;|&nbsp; 
                          <strong>Color:</strong> {scenarioMetric === 'probabilityOfSuccess' ? 'Final probability of success' : 'Total final year investment (sum of all 5 investment types)'}
                        </div>
                      </div>
                      
                      <div style={{ height: 500, width: '100%' }}>
                        {(() => {
                          // Generate the data once to avoid multiple identical calls
                          const surfaceData = generateSurfaceData(
                            selectedParameters, 
                            scenarioMetric, 
                            scenarioResults,
                            selectedParameters.map(param => generateParameterValues(param))
                          );
                          
                          return (
                            <Plot
                              data={[
                                {
                                  type: 'contour',
                                  z: surfaceData.zValues,
                                  x: surfaceData.xValues,
                                  y: surfaceData.yValues,
                                  colorscale: scenarioMetric === 'probabilityOfSuccess' ? 
                                    [
                                      [0, 'rgb(213, 62, 79)'],     // Red (low probability)
                                      [0.5, 'rgb(253, 231, 37)'],  // Yellow (medium probability)
                                      [1, 'rgb(50, 136, 189)']     // Blue (high probability)
                                    ] : 
                                    [
                                      [0, 'rgb(0, 83, 117)'],      // Dark blue (low investment)
                                      [0.5, 'rgb(0, 155, 217)'],   // Medium blue
                                      [1, 'rgb(210, 243, 255)']    // Light blue (high investment)
                                    ],
                                  contours: {
                                    coloring: 'heatmap',
                                    showlabels: true,
                                    labelfont: {
                                      family: 'Raleway',
                                      size: 12,
                                      color: 'white',
                                    }
                                  },
                                  hoverinfo: 'x+y+z',
                                  ncontours: 12
                                }
                              ]}
                              layout={{
                                title: `${scenarioMetric === 'probabilityOfSuccess' ? 'Final Probability of Success (%)' : 'Total Final Year Investments ($)'} by Parameter Values`,
                                xaxis: {
                                  title: selectedParameters[0],
                                  titlefont: { color: '#7f7f7f', size: 14 }
                                },
                                yaxis: {
                                  title: selectedParameters[1],
                                  titlefont: { color: '#7f7f7f', size: 14 }
                                },
                                annotations: [{
                                  x: 0.5,
                                  y: 1.05,
                                  xref: 'paper',
                                  yref: 'paper',
                                  text: 'Darker regions represent optimal parameter combinations',
                                  showarrow: false,
                                  font: {
                                    family: 'Arial',
                                    size: 12,
                                    color: '#515151'
                                  },
                                  align: 'center',
                                }],
                                margin: {
                                  l: 65,
                                  r: 50,
                                  b: 65,
                                  t: 90,
                                }
                              }}
                              useResizeHandler={true}
                              style={{ width: '100%', height: '100%' }}
                            />
                          );
                        })()}
                      </div>
                    </div>
                  </>
                ) : (
                  // Show regular line chart for one parameter
                  <ScenarioExplorationChart
                    parameterKey={rothOptimizerEnabled ? "rothConversionOpt" : selectedParameters[0] || selectedEvent || ""}
                    parameterValues={rothOptimizerEnabled ? [true] : 
                                    selectedParameters[0] ? 
                                      generateParameterValues(selectedParameters[0]) : 
                                      selectedParameter ? generateParameterValues(selectedParameter) : []}
                    metric={scenarioMetric}
                    customData={scenarioResults}
                  />
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Metric selection */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 10, fontWeight: 'bold' }}>Select metric to display:</div>
          <label style={{ marginRight: 20 }}>
              <input
                type="radio"
              name="scenarioMetric"
              checked={scenarioMetric === 'probabilityOfSuccess'}
              onChange={() => setScenarioMetric('probabilityOfSuccess')}
            />
            Probability of Success
            </label>
            <label>
              <input
                type="radio"
              name="scenarioMetric"
              checked={scenarioMetric === 'investments'}
              onChange={() => setScenarioMetric('investments')}
            />
            Total Investments
            </label>
        </div>
      </div>
    </div>
  );

  // Define ShadedLineChart inside the component
const ShadedLineChart = ({
  metric,
  financialGoal,
    customData,
}: {
  metric: string;
  financialGoal?: number;
    customData?: any[];
}) => {
  const metricLabels: Record<string, string> = {
    investments: "Total Investments ($)",
    income: "Total Income ($)",
    expenses: "Total Expenses ($)",
    earlyTax: "Early Withdrawal Tax ($)",
    discretionaryPct: "% of Total Discretionary Expenses",
  };

    const years = [2025, 2026, 2027, 2028, 2029];

    // Use real data for all charts, mock data as fallback
    const metricDataMap: Record<string, any[]> = {
      investments: metric === 'investments' && customData && customData.length > 0 
        ? customData 
        : transformRangeData(mockSimulationResult.investmentsRange, years),
      income: metric === 'income' && incomeData && incomeData.length > 0
        ? incomeData
        : transformRangeData(mockSimulationResult.incomeRange, years),
      expenses: metric === 'expenses' && expensesData && expensesData.length > 0
        ? expensesData
        : transformRangeData(mockSimulationResult.expensesRange, years),
      earlyTax: metric === 'earlyTax' && earlyTaxData && earlyTaxData.length > 0
        ? earlyTaxData
        : transformRangeData(mockSimulationResult.earlyWithdrawTaxRange, years),
      discretionaryPct: metric === 'discretionaryPct' && discretionaryPctData && discretionaryPctData.length > 0
        ? discretionaryPctData
        : transformRangeData(mockSimulationResult.percentageDiscretionaryRange, years).map(d => ({
          ...d,
          p10: d.p10 * 100,
          p90: d.p90 * 100,
          p20: d.p20 * 100,
          p80: d.p80 * 100,
          p30: d.p30 * 100,
          p70: d.p70 * 100,
          p40: d.p40 * 100,
          p60: d.p60 * 100,
          median: d.median * 100
        }))
    };

  const rawData = metricDataMap[metric] || [];
    console.log(`Using ${customData && customData.length > 0 ? 'real' : 'mock'} data for ${metric} chart:`, rawData);

    // Build stacked "difference" fields for each band
    const selectedData = rawData.map((d) => {
      const baseData = {
    ...d,
    // p10..p90
    band10_90_bottom: d.p10,
    band10_90_top: d.p90 - d.p10,

        // p20..p80
        band20_80_bottom: d.p20,
        band20_80_top: d.p80 - d.p20,

        // p30..p70
        band30_70_bottom: d.p30,
        band30_70_top: d.p70 - d.p30,

    // p40..p60
    band40_60_bottom: d.p40,
    band40_60_top: d.p60 - d.p40,
      };

      // Add display values for tooltip
      baseData.displayValues = {
        'P10-P90': `${d.p10?.toFixed(2)} - ${d.p90?.toFixed(2)}`,
        'P20-P80': `${d.p20?.toFixed(2)} - ${d.p80?.toFixed(2)}`,
        'P30-P70': d.p30 && d.p70 ? `${d.p30.toFixed(2)} - ${d.p70.toFixed(2)}` : 'N/A',
        'P40-P60': d.p40 && d.p60 ? `${d.p40.toFixed(2)} - ${d.p60.toFixed(2)}` : 'N/A',
        'Median': d.median?.toFixed(2)
      };

      return baseData;
    });
 
  return (
    <ComposedChart width={700} height={400} data={selectedData}>
      <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year">
          <Label value="Year" offset={-5} position="insideBottom" />
        </XAxis>
        <YAxis domain={[0, 
          metric === 'investments' && customData && customData.length > 0
            ? customData.reduce((max, d) => Math.max(max, d.p90 || 0), 210000)
            : (metric === 'investments' ? 210000 : 
              (metric === 'income' ? 55000 : 'auto'))
        ]}>
          <Label
            value={metricLabels[metric]}
            angle={-90}
            position="insideLeft"
            style={{ textAnchor: "middle" }}
          />
        </YAxis>
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length > 0) {
              const data = payload[0].payload;
              return (
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}>
                  <p><strong>Year: {label}</strong></p>
                  {Object.entries(data.displayValues).map(([key, value]) => (
                    <p key={key} style={{ 
                      color: key === 'Median' ? 'red' : 'black',
                      margin: '5px 0'
                    }}>
                      {key}: {value}
                    </p>
                  ))}
                </div>
              );
            }
            return null;
          }}
        />

        {/* p10..p90 band */}
      <Area
        type="monotone"
        dataKey="band10_90_bottom"
        stackId="band10_90"
        stroke="none"
        fill="none"
      />
      <Area
        type="monotone"
        dataKey="band10_90_top"
        stackId="band10_90"
        stroke="none"
        fill="#5792c2"
          fillOpacity={0.2}
      />

        {/* p20..p80 band */}
      <Area
        type="monotone"
          dataKey="band20_80_bottom"
          stackId="band20_80"
        stroke="none"
        fill="none"
      />
      <Area
        type="monotone"
          dataKey="band20_80_top"
          stackId="band20_80"
        stroke="none"
        fill="#4682b4"
          fillOpacity={0.3}
        />

        {/* p30..p70 band */}
        <Area
          type="monotone"
          dataKey="band30_70_bottom"
          stackId="band30_70"
          stroke="none"
          fill="none"
        />
        <Area
          type="monotone"
          dataKey="band30_70_top"
          stackId="band30_70"
          stroke="none"
          fill="#034780"
          fillOpacity={0.4}
        />

        {/* p40..p60 band */}
      <Area
        type="monotone"
        dataKey="band40_60_bottom"
        stackId="band40_60"
        stroke="none"
        fill="none"
      />
      <Area
        type="monotone"
        dataKey="band40_60_top"
        stackId="band40_60"
        stroke="none"
        fill="#034780"
          fillOpacity={0.6}
      />

        {/* Median line */}
      <Line
        type="monotone"
        dataKey="median"
          stroke="red"
        strokeWidth={2}
        dot={false}
      />

        {/* Financial goal reference line */}
      {financialGoal && (
        <ReferenceLine
          y={financialGoal}
          stroke="red"
          strokeDasharray="3 3"
          label={{
              value: "Financial Goal ($200K)",
            position: "top",
            fill: "red",
          }}
        />
      )}
    </ComposedChart>
  );
};

  /* ---------- MAIN JSX ---------- */
  return (
    <div className="page-container">
      <div className="open-simulation">
        <div className="subheading">Simulation Results and Graphs</div>

        {/* Top-row buttons - simplified to just two main options */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", marginTop: "2%" }}>
          <ToggleButton
            value="graphs"
            label="View Graphs"
            selected={!showScenarioExploration}
            onToggle={() => setShowScenarioExploration(false)}
          />
          <ToggleButton
            value="scenario"
            label="Scenario Exploration"
            selected={showScenarioExploration}
            onToggle={() => setShowScenarioExploration(true)}
          />
        </div>
        
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
            <div style={{ 
              padding: '10px 20px', 
              backgroundColor: '#e9ecef', 
              borderRadius: '5px',
              color: '#495057',
              fontWeight: 'bold'
            }}>
              Loading simulation data...
            </div>
          </div>
        )}
        
        {!showScenarioExploration && (
          <div>
            <hr style={{height: "4px",backgroundColor: "#568f67", border: "none", margin: "20px 0"}} />
            
            {/* Chart Type Selection */}
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <div className="normal-text" style={{ fontWeight: 'bold', marginBottom: 10 }}>Select Chart Types:</div>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px" }}>
                <ToggleButton
                  value="line"
                  label="Line Chart"
                  selected={selectedGraphs.includes("line")}
                  onToggle={(v) =>
                    setSelectedGraphs((prev) =>
                      prev.includes(v) ? prev.filter((g) => g !== v) : [...prev, v]
                    )
                  }
                />
                <ToggleButton
                  value="shaded"
                  label="Shaded Line Chart"
                  selected={selectedGraphs.includes("shaded")}
                  onToggle={(v) =>
                    setSelectedGraphs((prev) =>
                      prev.includes(v) ? prev.filter((g) => g !== v) : [...prev, v]
                    )
                  }
                />
                <ToggleButton
                  value="stacked"
                  label="Stacked Bar Chart"
                  selected={selectedGraphs.includes("stacked")}
                  onToggle={(v) =>
                    setSelectedGraphs((prev) =>
                      prev.includes(v) ? prev.filter((g) => g !== v) : [...prev, v]
                    )
                  }
                />
        </div>
      </div>

            {selectedGraphs.includes("shaded") && (
              <div style={{ marginTop: 20 }}>
                <div className="normal-text">Select Shaded Metrics:</div>
                {Object.entries(metricLabels).map(([val, label]) => (
                  <ToggleButton
                    key={val}
                    value={val}
                    label={label}
                    selected={selectedShadedMetrics.includes(val)}
                    onToggle={(v) =>
                      setSelectedShadedMetrics((prev) =>
                        prev.includes(v) ? prev.filter((m) => m !== v) : [...prev, v]
                      )
                    }
                  />
                ))}
        </div>
            )}

            {selectedGraphs.includes("stacked") && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ marginBottom: 20, width: 700, margin: '0 auto' }}>
                  {/* Category filter controls */}
                  <div style={{ marginBottom: 15 }}>
                    <div className="normal-text" style={{ fontWeight: 'bold', marginBottom: 5 }}>Filter Categories:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <ToggleButton
                        label="All Categories"
                        value="all"
                        selected={!categoryFilter}
                        onToggle={() => setCategoryFilter(null)}
                      />
                      <ToggleButton
                        label="Investments Only"
                value="investments"
                        selected={categoryFilter === 'investments'}
                        onToggle={() => setCategoryFilter('investments')}
                      />
                      <ToggleButton
                        label="Income Only"
                value="income"
                        selected={categoryFilter === 'income'}
                        onToggle={() => setCategoryFilter('income')}
                      />
                      <ToggleButton
                        label="Expenses Only"
                value="expenses"
                        selected={categoryFilter === 'expenses'}
                        onToggle={() => setCategoryFilter('expenses')}
                      />
                    </div>
                  </div>
                  
                  {/* Median/Average toggle */}
                  <div style={{ marginBottom: 15 }}>
                    <div className="normal-text" style={{ fontWeight: 'bold', marginBottom: 5 }}>Select Values Type:</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <ToggleButton
                        label="Median Values"
                        value="median"
                        selected={useMedianValues}
                        onToggle={() => setUseMedianValues(true)}
                      />
                      <ToggleButton
                        label="Average Values"
                        value="average"
                        selected={!useMedianValues}
                        onToggle={() => setUseMedianValues(false)}
                      />
                    </div>
                  </div>
                  
                  {/* Aggregation threshold slider */}
                  <div style={{ marginTop: 15 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Aggregation Threshold: ${aggregationThreshold.toLocaleString()}</span>
              <input
                        type="range"
                        min="0"
                        max="50000"
                        step="1000"
                        value={aggregationThreshold}
                        onChange={(e) => setAggregationThreshold(Number(e.target.value))}
                        style={{ width: '60%' }}
                      />
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
                      Categories with values below this threshold will be grouped as "Other"
                    </div>
                  </div>
                </div>
                
                <StackedBarChart 
                  useMedian={useMedianValues} 
                  investmentOrder={investmentOrder}
                  incomeOrder={incomeOrder}
                  expensesOrder={expensesOrder}
                  medianInvestments={medianInvestments}
                  avgInvestments={avgInvestments}
                  medianIncome={medianIncome}
                  avgIncome={avgIncome}
                  medianExpenses={medianExpenses}
                  avgExpenses={avgExpenses}
                  aggregationThreshold={aggregationThreshold}
                  categoryFilter={categoryFilter}
                />
          </div>
        )}
            <hr style={{height: "4px",backgroundColor: "#568f67", border: "none", margin: "20px 0"}} />
          
            {/* Graphs display */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {renderNormalGraphs()}
            </div>
          </div>
        )}

        {/* Show scenario exploration if selected */}
        {showScenarioExploration && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {renderScenarioExploration()}
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenSimulation;
