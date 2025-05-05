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

// Simulation result data
const mockSimulationResult = {
  _id: "sim-001",
  simulationId: "sim-001",
  inflationAssumption: {
    mean: 0.02,
    stdDev: 0.005,
    type: "normal",
  },
  probabilityOverTime: [0.8, 0.82, 0.85, 0.86, 0.88],
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

// Mock data for scenario exploration
const mockScenarioExplorationData = {
  // Parameter definitions
  scenarioParameters: {
    RothConversionOpt: {
      type: "boolean",
      description: "Enable Roth Conversion Optimization",
      values: [false, true]
    },
    retirementStart: {
      type: "numeric",
      description: "Retirement Start Year",
      min: 55,
      max: 70,
      step: 5,
      values: [55, 60, 65, 70]
    },
    salaryInitialAmount: {
      type: "numeric",
      description: "Initial Salary Amount",
      min: 50000,
      max: 200000,
      step: 50000,
      values: [50000, 100000, 150000, 200000]
    },
    stockBondAllocation: {
      type: "numeric",
      description: "Stock Allocation (%)",
      min: 20,
      max: 80,
      step: 20,
      values: [20, 40, 60, 80]
    }
  },
  
  
  parameterResults: {
    
    probabilityOverTime: {
      // Retirement start year
      retirementStart: {
        55: [0.65, 0.68, 0.70, 0.72, 0.75],
        60: [0.75, 0.78, 0.80, 0.82, 0.85],
        65: [0.85, 0.86, 0.88, 0.89, 0.90],
        70: [0.92, 0.93, 0.94, 0.95, 0.96]
      },
      // Initial salary amount
      salaryInitialAmount: {
        50000: [0.72, 0.74, 0.75, 0.76, 0.78],
        100000: [0.80, 0.82, 0.83, 0.84, 0.85],
        150000: [0.87, 0.88, 0.89, 0.90, 0.91],
        200000: [0.92, 0.93, 0.94, 0.95, 0.96]
      },
      // Stock allocation percentage
      stockBondAllocation: {
        20: [0.82, 0.81, 0.80, 0.79, 0.78],
        40: [0.84, 0.84, 0.85, 0.86, 0.87],
        60: [0.86, 0.87, 0.88, 0.88, 0.89],
        80: [0.84, 0.85, 0.86, 0.86, 0.87]
      },
      // Roth conversion optimization
      RothConversionOpt: {
        false: [0.82, 0.83, 0.84, 0.85, 0.86],
        true: [0.86, 0.87, 0.88, 0.89, 0.90]
      }
    },
    
    // Median investments by year for each parameter value
    medianInvestmentsOverTime: {
      // Retirement start year
      retirementStart: {
        55: [80000, 90000, 100000, 110000, 120000],
        60: [90000, 110000, 130000, 150000, 170000],
        65: [100000, 130000, 160000, 190000, 220000],
        70: [110000, 150000, 190000, 230000, 270000]
      },
      // Initial salary amount
      salaryInitialAmount: {
        50000: [70000, 80000, 90000, 100000, 110000],
        100000: [100000, 120000, 140000, 160000, 180000],
        150000: [130000, 160000, 190000, 220000, 250000],
        200000: [160000, 200000, 240000, 280000, 320000]
      },
      // Stock allocation percentage
      stockBondAllocation: {
        20: [85000, 90000, 95000, 100000, 105000],
        40: [90000, 105000, 120000, 135000, 150000],
        60: [100000, 125000, 150000, 175000, 200000],
        80: [110000, 145000, 180000, 215000, 250000]
      },
      // Roth conversion optimization
      RothConversionOpt: {
        false: [90000, 105000, 120000, 135000, 150000],
        true: [100000, 125000, 150000, 175000, 200000]
      }
    },
    
    // Average investments by year for each parameter value
    avgInvestmentsOverTime: {
      // Retirement start year
      retirementStart: {
        55: [85000, 95000, 105000, 115000, 125000],
        60: [95000, 115000, 135000, 155000, 175000],
        65: [105000, 135000, 165000, 195000, 225000],
        70: [115000, 155000, 195000, 235000, 275000]
      },
      // Initial salary amount
      salaryInitialAmount: {
        50000: [75000, 85000, 95000, 105000, 115000],
        100000: [105000, 125000, 145000, 165000, 185000],
        150000: [135000, 165000, 195000, 225000, 255000],
        200000: [165000, 205000, 245000, 285000, 325000]
      },
      // Stock allocation percentage
      stockBondAllocation: {
        20: [90000, 95000, 100000, 105000, 110000],
        40: [95000, 110000, 125000, 140000, 155000],
        60: [105000, 130000, 155000, 180000, 205000],
        80: [115000, 150000, 185000, 220000, 255000]
      },
      // Roth conversion optimization
      RothConversionOpt: {
        false: [95000, 110000, 125000, 140000, 155000],
        true: [105000, 130000, 155000, 180000, 205000]
      }
    },
    
    // Discretionary expense percentage by year for each parameter value
    discretionaryExpensePctOverTime: {
      // Retirement start year
      retirementStart: {
        55: [0.70, 0.72, 0.75, 0.78, 0.80],
        60: [0.80, 0.82, 0.85, 0.87, 0.90],
        65: [0.90, 0.91, 0.92, 0.93, 0.95],
        70: [0.95, 0.96, 0.97, 0.98, 0.99]
      },
      // Initial salary amount
      salaryInitialAmount: {
        50000: [0.60, 0.65, 0.70, 0.75, 0.80],
        100000: [0.75, 0.80, 0.85, 0.90, 0.95],
        150000: [0.85, 0.87, 0.90, 0.92, 0.95],
        200000: [0.90, 0.92, 0.94, 0.96, 0.98]
      },
      // Stock allocation percentage
      stockBondAllocation: {
        20: [0.85, 0.86, 0.87, 0.88, 0.89],
        40: [0.80, 0.83, 0.86, 0.89, 0.92],
        60: [0.75, 0.80, 0.85, 0.90, 0.95],
        80: [0.70, 0.78, 0.86, 0.94, 0.96]
      },
      // Roth conversion optimization
      RothConversionOpt: {
        false: [0.80, 0.82, 0.84, 0.86, 0.88],
        true: [0.85, 0.87, 0.89, 0.91, 0.93]
      }
    }
  },
  
  // Final values as function of parameter value
  finalValues: {
    retirementStart: {
      probabilityOfSuccess: [0.75, 0.85, 0.90, 0.96],
      medianInvestments: [120000, 170000, 220000, 270000],
      avgInvestments: [125000, 175000, 225000, 275000],
      discretionaryExpensePct: [0.80, 0.90, 0.95, 0.99]
    },
    salaryInitialAmount: {
      probabilityOfSuccess: [0.78, 0.85, 0.91, 0.96],
      medianInvestments: [110000, 180000, 250000, 320000],
      avgInvestments: [115000, 185000, 255000, 325000],
      discretionaryExpensePct: [0.80, 0.95, 0.95, 0.98]
    },
    stockBondAllocation: {
      probabilityOfSuccess: [0.78, 0.87, 0.89, 0.87],
      medianInvestments: [105000, 150000, 200000, 250000],
      avgInvestments: [110000, 155000, 205000, 255000],
      discretionaryExpensePct: [0.89, 0.92, 0.95, 0.96]
    },
    RothConversionOpt: {
      probabilityOfSuccess: [0.86, 0.90],
      medianInvestments: [150000, 200000],
      avgInvestments: [155000, 205000],
      discretionaryExpensePct: [0.88, 0.93]
    }
  }
};

// Sample data
const probabilityData = mockSimulationResult.probabilityOverTime.map((prob, index) => ({
  year: 2025 + index,
  success: prob * 100  // Convert to percentage
}));

const shadedData = [
  { year: 2025, low: 65, mid: 85, high: 95, median: 48.5 },
  { year: 2030, low: 63, mid: 82, high: 93, median: 51.5 },
  { year: 2035, low: 60, mid: 79, high: 91, median: 53.5 },
  { year: 2040, low: 58, mid: 76, high: 89, median: 56.0 },
  { year: 2045, low: 55, mid: 74, high: 87, median: 58.0 },
  { year: 2050, low: 53, mid: 72, high: 85, median: 60.0 },
];

const stackedBarData = [
  {
    year: 2025,
    RothIRA: 120,
    Brokerage: 100,
    "401k": 150,
    Job: 80,
    Pension: 50,
    Rental: 20,
    Housing: 60,
    Food: 40,
    Travel: 30,
    Taxes: 50,
  },
  {
    year: 2030,
    RothIRA: 130,
    Brokerage: 110,
    "401k": 160,
    Job: 75,
    Pension: 55,
    Rental: 25,
    Housing: 65,
    Food: 45,
    Travel: 35,
    Taxes: 55,
  },
  {
    year: 2035,
    RothIRA: 140,
    Brokerage: 120,
    "401k": 170,
    Job: 70,
    Pension: 60,
    Rental: 30,
    Housing: 70,
    Food: 50,
    Travel: 40,
    Taxes: 60,
  },
];

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

// Charts
const LineChartGraph = () => (
  <LineChart width={700} height={400} data={probabilityData}>
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

const ShadedLineChart = ({
  metric,
  financialGoal,
}: {
  metric: string;
  financialGoal?: number;
}) => {
  const metricLabels: Record<string, string> = {
    investments: "Total Investments ($)",
    income: "Total Income ($)",
    expenses: "Total Expenses ($)",
    earlyTax: "Early Withdrawal Tax ($)",
    discretionaryPct: "% of Total Discretionary Expenses",
  };

  const years = [2025, 2026, 2027, 2028, 2029];
  
  const metricDataMap: Record<string, any[]> = {
    investments: transformRangeData(mockSimulationResult.investmentsRange, years),
    income: transformRangeData(mockSimulationResult.incomeRange, years),
    expenses: transformRangeData(mockSimulationResult.expensesRange, years),
    earlyTax: transformRangeData(mockSimulationResult.earlyWithdrawTaxRange, years),
    discretionaryPct: transformRangeData(mockSimulationResult.percentageDiscretionaryRange, years).map(d => ({
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
      'P10-P90': `${d.p10} - ${d.p90}`,
      'P20-P80': `${d.p20} - ${d.p80}`,
      'P30-P70': `${d.p30} - ${d.p70}`,
      'P40-P60': `${d.p40} - ${d.p60}`,
      'Median': d.median
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
        metric === 'investments' ? 210000 : 
        (metric === 'income' ? 55000 : 'auto')
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

const StackedBarChart = ({ useMedian = true, customData = null }: { useMedian?: boolean, customData?: any }) => {
  // Transform the data based on selected metric (median or average)
  const getStackedData = () => {
    const years = [2025, 2026, 2027, 2028, 2029];
    
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
    
    // Otherwise use the standard simulation results
    const values = useMedian ? 
      mockSimulationResult.medianInvestmentsOverTime :
      mockSimulationResult.avgInvestmentsOverTime;

    return years.map((year, index) => ({
      year,
      // Tax-Advantaged Accounts
      "401k": values[index][0],
      "RothIRA": values[index][1],
      
      // Taxable Accounts
      "Brokerage": values[index][2],
      
      // Income Sources
      "Job": mockSimulationResult.medianIncomeOverTime[index][0],
      "Pension": mockSimulationResult.medianIncomeOverTime[index][1],
      
      // Expenses
      "Housing": mockSimulationResult.medianExpensesOverTime[index][0],
      "Food": mockSimulationResult.medianExpensesOverTime[index][1],
      "Other": 0  // For values below threshold
    }));
  };

  return (
    <BarChart width={700} height={400} data={getStackedData()}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="year">
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
    <Tooltip />
    <Legend />

      {/* Tax-Advantaged Accounts */}
      <Bar dataKey="401k" stackId="a" fill="#4b3f72" name="401(k)" />      
      <Bar dataKey="RothIRA" stackId="a" fill="#007a99" name="Roth IRA" /> 

      {/* Taxable Accounts */}
      <Bar dataKey="Brokerage" stackId="a" fill="#2f855a" name="Brokerage" /> 

      {/* Income Sources */}
      <Bar dataKey="Job" stackId="a" fill="#b7791f" name="Employment" /> 
      <Bar dataKey="Pension" stackId="a" fill="#cc3300" name="Pension" /> 

      {/* Expenses */}
      <Bar dataKey="Housing" stackId="a" fill="#7f9c00" name="Housing" />
      <Bar dataKey="Food" stackId="a" fill="#3f9142" name="Food" />
      <Bar dataKey="Other" stackId="a" fill="#666666" name="Other" />
  </BarChart>
);
};

// Multi-line chart for scenario exploration
const ScenarioMultiLineChart = ({ 
  paramName,
  metric,
  useMedian = true
}: { 
  paramName: string,
  metric: string,
  useMedian?: boolean 
}) => {
  const years = [2025, 2026, 2027, 2028, 2029];
  const paramValues = mockScenarioExplorationData.scenarioParameters[paramName]?.values || [];
  
  // Get data for the selected metric and parameter
  let dataByParamValue = {};
  
  if (metric === "probability") {
    dataByParamValue = mockScenarioExplorationData.parameterResults.probabilityOverTime[paramName];
  } else if (metric === "investments") {
    dataByParamValue = useMedian 
      ? mockScenarioExplorationData.parameterResults.medianInvestmentsOverTime[paramName]
      : mockScenarioExplorationData.parameterResults.avgInvestmentsOverTime[paramName];
  } else if (metric === "discretionaryPct") {
    dataByParamValue = mockScenarioExplorationData.parameterResults.discretionaryExpensePctOverTime[paramName];
  }
  
  // Transform data for recharts
  const chartData = years.map((year, yearIndex) => {
    const dataPoint: any = { year };
    
    // Add a data point for each parameter value
    paramValues.forEach(paramValue => {
      const values = dataByParamValue[paramValue];
      if (values && values[yearIndex] !== undefined) {
        // Format the value based on the metric
        if (metric === "probability" || metric === "discretionaryPct") {
          dataPoint[`param_${paramValue}`] = values[yearIndex] * 100; // Convert to percentage
        } else {
          dataPoint[`param_${paramValue}`] = values[yearIndex];
        }
      }
    });
    
    return dataPoint;
  });
  
  // Get appropriate label for Y-axis
  const getYAxisLabel = () => {
    if (metric === "probability") return "Probability of Success (%)";
    if (metric === "investments") return `${useMedian ? 'Median' : 'Average'} Total Investments ($)`;
    if (metric === "discretionaryPct") return "Discretionary Expenses (%)";
    return "";
  };
  
  // Define colors for lines
  const colors = ["#8884d8", "#82ca9d", "#ff7300", "#0088FE", "#00C49F"];
  
  return (
    <LineChart width={700} height={400} data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="year">
        <Label value="Year" offset={-5} position="insideBottom" />
      </XAxis>
      <YAxis>
        <Label
          value={getYAxisLabel()}
          angle={-90}
          position="insideLeft"
          style={{ textAnchor: "middle" }}
        />
      </YAxis>
      <Tooltip formatter={(value, name) => {
        const paramValue = name.replace('param_', '');
        return [
          typeof value === 'number' ? 
            (metric === "probability" || metric === "discretionaryPct" ? 
              `${value.toFixed(1)}%` : 
              `$${value.toLocaleString()}`) 
            : value,
          `${mockScenarioExplorationData.scenarioParameters[paramName].description}: ${
            paramName === 'RothConversionOpt' ? 
              (paramValue === 'true' ? 'Enabled' : 'Disabled') : 
              paramValue
          }`
        ];
      }} />
      <Legend formatter={(value) => {
        const paramValue = value.replace('param_', '');
        return `${paramName === 'RothConversionOpt' ? (paramValue === 'true' ? 'Enabled' : 'Disabled') : paramValue}`;
      }} />
      
      {paramValues.map((value, index) => (
        <Line
          key={value}
          type="monotone"
          dataKey={`param_${value}`}
          stroke={colors[index % colors.length]}
          activeDot={{ r: 8 }}
          name={`param_${value}`}
        />
      ))}
    </LineChart>
  );
};

// Parameter value chart - shows final values vs parameter values
const ParameterValueChart = ({ 
  paramName, 
  metric,
  useMedian = true 
}: { 
  paramName: string, 
  metric: string,
  useMedian?: boolean
}) => {
  if (!mockScenarioExplorationData.finalValues[paramName]) {
    return <div>No data available for {paramName}</div>;
  }
  
  let values;
  if (metric === "probability") {
    values = mockScenarioExplorationData.finalValues[paramName].probabilityOfSuccess;
  } else if (metric === "investments") {
    values = useMedian
      ? mockScenarioExplorationData.finalValues[paramName].medianInvestments
      : mockScenarioExplorationData.finalValues[paramName].avgInvestments;
  } else if (metric === "discretionaryPct") {
    values = mockScenarioExplorationData.finalValues[paramName].discretionaryExpensePct;
  }
  
  const paramValues = mockScenarioExplorationData.scenarioParameters[paramName]?.values || [];
  
  // Transform data for recharts
  const chartData = paramValues.map((paramValue, index) => {
    let value = values[index];
    
    // Format values based on metric
    if (metric === "probability" || metric === "discretionaryPct") {
      value = value * 100; // Convert to percentage
    }
    
    return {
      paramValue: paramName === 'RothConversionOpt' 
        ? (paramValue ? 'Enabled' : 'Disabled') 
        : paramValue,
      value
    };
  });
  
  // Get appropriate label for Y-axis
  const getYAxisLabel = () => {
    if (metric === "probability") return "Final Probability of Success (%)";
    if (metric === "investments") return `Final ${useMedian ? 'Median' : 'Average'} Investments ($)`;
    if (metric === "discretionaryPct") return "Final Discretionary Expenses (%)";
    return "";
  };
  
  // Get appropriate label for X-axis
  const getXAxisLabel = () => {
    return mockScenarioExplorationData.scenarioParameters[paramName]?.description || paramName;
  };
  
  return (
    <LineChart width={700} height={400} data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="paramValue">
        <Label value={getXAxisLabel()} offset={-5} position="insideBottom" />
      </XAxis>
      <YAxis>
        <Label
          value={getYAxisLabel()}
          angle={-90}
          position="insideLeft"
          style={{ textAnchor: "middle" }}
        />
      </YAxis>
      <Tooltip formatter={(value) => {
        return metric === "probability" || metric === "discretionaryPct" 
          ? `${value.toFixed(1)}%` 
          : `$${value.toLocaleString()}`;
      }} />
      <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
    </LineChart>
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

/* ---------------- MAIN COMPONENT ---------------- */
const OpenSimulation: React.FC = () => {

  const [selectedGraphs, setSelectedGraphs] = useState<string[]>(["line"]);
  const [selectedShadedMetrics, setSelectedShadedMetrics] = useState<string[]>([
    "investments",
  ]);
  const [useMedianValues, setUseMedianValues] = useState(true);

  const [showScenario, setShowScenario] = useState(false);
  const [scenarioView, setScenarioView] = useState<"multiLine" | "parameterValue">(
    "multiLine"
  );
  const [scenarioParam, setScenarioParam] = useState("retirementStart");
  const [scenarioMetric, setScenarioMetric] = useState("probability");
  const [scenarioUseMedian, setScenarioUseMedian] = useState(true);

  const paramValues =
    mockScenarioExplorationData.scenarioParameters[scenarioParam]?.values || [];
  const [selectedParamValue, setSelectedParamValue] = useState(paramValues[0]);

  useEffect(() => {
    if (paramValues.length) setSelectedParamValue(paramValues[0]);
  }, [scenarioParam]);

  /* ---------- labels ---------- */
  const metricLabels: Record<string, string> = {
    investments: "Total Investments",
    income: "Total Income",
    expenses: "Total Expenses",
    earlyTax: "Early Withdrawal Tax",
    discretionaryPct: "% of Discretionary Expenses",
  };

  const renderScenarioPanel = () => (
    <div style={{ marginTop: 20 }}>
      {/* view‑type radios */}
      <div style={{ marginBottom: 20 }}>
        <div className="normal-text">Select View Type:</div>
        <label style={{ marginRight: 20 }}>
          <input
            type="radio"
            name="scenarioView"
            value="multiLine"
            checked={scenarioView === "multiLine"}
            onChange={() => setScenarioView("multiLine")}
          />
          Multiple Lines Over Time
        </label>
        <label>
          <input
            type="radio"
            name="scenarioView"
            value="parameterValue"
            checked={scenarioView === "parameterValue"}
            onChange={() => setScenarioView("parameterValue")}
          />
          Parameter Value Chart
        </label>
      </div>

      {/* scenario parameter radios */}
      <div style={{ marginBottom: 20 }}>
        <div className="normal-text">Select Scenario Parameter:</div>
        {Object.entries(mockScenarioExplorationData.scenarioParameters).map(
          ([key, obj]: any) => (
            <label key={key} style={{ marginRight: 20 }}>
              <input
                type="radio"
                name="scenarioParam"
                value={key}
                checked={scenarioParam === key}
                onChange={() => setScenarioParam(key)}
              />
              {obj.description}
            </label>
          )
        )}
      </div>

      {/* scenario metric radios */}
      <div style={{ marginBottom: 20 }}>
        <div className="normal-text">Select Metric to Display:</div>
        <label style={{ marginRight: 20 }}>
          <input
            type="radio"
            name="scenarioMetric"
            value="probability"
            checked={scenarioMetric === "probability"}
            onChange={() => setScenarioMetric("probability")}
          />
          Probability of Success
        </label>
        <label style={{ marginRight: 20 }}>
          <input
            type="radio"
            name="scenarioMetric"
            value="investments"
            checked={scenarioMetric === "investments"}
            onChange={() => setScenarioMetric("investments")}
          />
          Total Investments
        </label>
        <label>
          <input
            type="radio"
            name="scenarioMetric"
            value="discretionaryPct"
            checked={scenarioMetric === "discretionaryPct"}
            onChange={() => setScenarioMetric("discretionaryPct")}
          />
          % of Discretionary Expenses
        </label>
      </div>

      {/* median / average radios (only for investments) */}
      {scenarioMetric === "investments" && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ marginRight: 20 }}>
            <input
              type="radio"
              name="scenarioValueType"
              checked={scenarioUseMedian}
              onChange={() => setScenarioUseMedian(true)}
            />
            Median Values
          </label>
          <label>
            <input
              type="radio"
              name="scenarioValueType"
              checked={!scenarioUseMedian}
              onChange={() => setScenarioUseMedian(false)}
            />
            Average Values
          </label>
        </div>
      )}

      {/* parameter value radios */}
      <div style={{ marginBottom: 20 }}>
        <div className="normal-text">Select Parameter Value:</div>
        {paramValues.map((pv: any) => (
          <label key={pv.toString()} style={{ marginRight: 15 }}>
            <input
              type="radio"
              name="paramValue"
              value={pv.toString()}
              checked={selectedParamValue === pv}
              onChange={() => setSelectedParamValue(pv)}
            />
            {scenarioParam === "RothConversionOpt" ? (pv ? "Enabled" : "Disabled") : pv}
          </label>
        ))}
      </div>

      {/* chart */}
      {scenarioView === "multiLine" ? (
        <ScenarioMultiLineChart
          paramName={scenarioParam}
          metric={scenarioMetric}
          useMedian={scenarioUseMedian}
        />
      ) : (
        <ParameterValueChart
          paramName={scenarioParam}
          metric={scenarioMetric}
          useMedian={scenarioUseMedian}
        />
      )}
    </div>
  );

  /* ---------- MAIN JSX ---------- */
  return (
    <div className="page-container">
      <div className="open-simulation">
        <div className="subheading">Simulation Results and Graphs</div>

        {/* top‑row buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", marginTop: "2%" }}>
          {[
            ["line", "Line Chart"],
            ["shaded", "Shaded Line Chart"],
            ["stacked", "Stacked Bar Chart"],
          ].map(([val, label]) => (
            <ToggleButton
              key={val}
              value={val}
              label={label}
              selected={selectedGraphs.includes(val)}
              onToggle={(v) => {
                setShowScenario(false);
                setSelectedGraphs((prev) =>
                  prev.includes(v) ? prev.filter((g) => g !== v) : [...prev, v]
                );
              }}
            />
          ))}
          
          {/* scenario exploration button */}
          <ToggleButton
            value="scenario"
            label="Scenario Exploration"
            selected={showScenario}
            onToggle={() => {
              setShowScenario(!showScenario);
              if (!showScenario) {
                setSelectedGraphs([]);
              }
            }}

          />
        </div>
        
        <div
          style={{
            backgroundColor: "#e2ece5",
            width: "80%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {!showScenario && selectedGraphs.includes("line") && (
            <>
              <div style={{ marginTop: 20, marginBottom: 10 }}>
                <h3 style={{ textAlign: "center" }}>Probability of Success</h3>
              </div>
              <div style={{ marginBottom: 40 }}>
                <LineChartGraph />
              </div>
            </>
          )}

          {!showScenario && selectedGraphs.includes("shaded") && (
            <>
              <div style={{ marginTop: 20 }}>
                <div className="normal-text" style={{ textAlign: "center" }}>
                  Select Shaded Metrics:
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    marginTop: 10,
                  }}
                >
                  {Object.entries(metricLabels).map(([val, label]) => (
                    <ToggleButton
                      key={val}
                      value={val}
                      label={label}
                      selected={selectedShadedMetrics.includes(val)}
                      onToggle={(v) =>
                        setSelectedShadedMetrics((prev) =>
                          prev.includes(v)
                            ? prev.filter((m) => m !== v)
                            : [...prev, v]
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              {selectedShadedMetrics.map((metric) => (
                <div key={metric} style={{ marginBottom: 40 }}>
                  <h3 style={{ textAlign: "center", marginTop: 30, marginBottom: 10 }}>
                    {metricLabels[metric]}
                  </h3>
                  <ShadedLineChart
                    metric={metric}
                    financialGoal={
                      metric === "investments" ? mockSimulationResult.financialGoal : undefined
                    }
                  />
                </div>
              ))}
            </>
          )}

          {!showScenario && selectedGraphs.includes("stacked") && (
            <>
              <div style={{ margin: "20px 0" }}>
                <div className="normal-text">Select Stacked Bar Chart Metrics:</div>
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
              <StackedBarChart useMedian={useMedianValues} />
            </>
          )}
        </div>


        {/* graphs */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {showScenario && renderScenarioPanel()}
        </div>
      </div>
    </div>
  );
};

export default OpenSimulation;
