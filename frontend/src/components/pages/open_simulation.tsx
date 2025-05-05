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

// Scenario Exploration Chart
const ScenarioExplorationChart = ({ 
  parameterKey,
  parameterValues,
  metric = 'probabilityOfSuccess'
}: {
  parameterKey: string,
  parameterValues: (number | boolean)[],
  metric?: 'probabilityOfSuccess' | 'investments'
}) => {
  const years = [2025, 2026, 2027, 2028, 2029];
  
  // Get baseline data
  const baselineData = mockScenarioResults.baseline[metric];
  
  // Transform data for chart
  const chartData = years.map((year, yearIndex) => {
    const dataPoint: any = { year };
    
    // Add baseline
    dataPoint.baseline = baselineData[yearIndex];
    
    // Add data for each parameter value
    if (parameterKey === 'rothOptimizerEnabled' && parameterValues.includes(true)) {
      dataPoint.rothOptimizer = mockScenarioResults.rothOptimizerEnabled.true[metric][yearIndex];
    } else if (parameterKey !== 'rothOptimizerEnabled') {
      // For numeric parameters
      parameterValues.forEach(value => {
        if (typeof value === 'number' && mockScenarioResults[parameterKey] && mockScenarioResults[parameterKey][value]) {
          dataPoint[`value_${value}`] = mockScenarioResults[parameterKey][value][metric][yearIndex];
        }
      });
    }
    
    return dataPoint;
  });
  
  const formatValue = (value: number) => {
    if (metric === 'probabilityOfSuccess') {
      return `${(value * 100).toFixed(1)}%`;
    }
    return `$${value.toLocaleString()}`;
  };
  
  const colors = ["#8884d8", "#82ca9d", "#ff7300", "#0088FE", "#00C49F", "#FFBB28"];
  
  const getYAxisLabel = () => {
    if (metric === 'probabilityOfSuccess') return "Probability of Success";
    return "Total Investments ($)";
  };

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
      <Tooltip formatter={(value) => formatValue(value as number)} />
      <Legend />
      
      {/* Baseline */}
      <Line
        type="monotone"
        dataKey="baseline"
        stroke="#8884d8"
        name="Baseline"
        strokeDasharray="5 5"
      />
      
      {/* Roth Optimizer */}
      {parameterKey === 'rothOptimizerEnabled' && parameterValues.includes(true) && (
        <Line
          type="monotone"
          dataKey="rothOptimizer"
          stroke="#82ca9d"
          name="Roth Optimizer Enabled"
        />
      )}
      
      {/* Numeric parameter values */}
      {parameterKey !== 'rothOptimizerEnabled' && parameterValues.map((value, index) => {
        if (typeof value === 'number' && mockScenarioResults[parameterKey] && mockScenarioResults[parameterKey][value]) {
          return (
            <Line
              key={`${parameterKey}_${value}`}
              type="monotone"
              dataKey={`value_${value}`}
              stroke={colors[(index + 1) % colors.length]}
              name={`${scenarioOptions[parameterKey].label}: ${value}`}
            />
          );
        }
        return null;
      })}
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
  
  // New state for parameter editing
  const [selectedParameter, setSelectedParameter] = useState<string | null>(null);
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
  
  // Get planId from URL params
  const { planId } = useParams();
  
  useEffect(() => {
    const path = window.location.pathname;
    const scenarioId = path.split('/').pop(); // Get the last segment of the URL path
    console.log("Current Scenario ID:", scenarioId);
    
    console.log("Plan ID:", scenarioId);
    console.log("Full URL path:", path);
    
    // Fetch scenario details to get event series
    if (scenarioId) {
      fetchEventSeries(scenarioId);
      // Add function to fetch simulation object and extract resultsId
      fetchSimulationResultId(scenarioId);
    }
  }, []);
  
  // Fetch simulation data when planId changes
  useEffect(() => {
    if (planId) {
      console.log("Loading simulation data for plan:", planId);
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
      
      // Log event series names if they exist - check both result and result.data paths
      const plan = result.plan || result.data;
      
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
    // If already selected, unselect it
    if (selectedParameter === parameter) {
      setSelectedParameter(null);
      return;
    }
    
    // Select the new parameter
    setSelectedParameter(parameter);
    
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
  const generateParameterValues = (parameter: string) => {
    if (!selectedParameter || selectedParameter !== parameter) return [];
    
    const { min, max, step } = parameterValues[parameter as keyof typeof parameterValues];
    const values = [];
    
    for (let value = min; value <= max; value += step) {
      values.push(value);
    }
    
    return values;
  };

  // Function to run scenario with selected parameter
  const runScenarioWithParameter = () => {
    if (!selectedParameter) return;
    
    console.log("Running scenario with parameter:", {
      parameter: selectedParameter,
      event: selectedEvent,
      values: generateParameterValues(selectedParameter)
    });
    
    setRunScenario(true);
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

      {selectedGraphs.includes("stacked") && (
        <div style={{ marginBottom: 40 }}>
          <StackedBarChart useMedian={useMedianValues} />
        </div>
      )}
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
        {/* Roth Optimizer Option */}
        <ScenarioOptionSelector
          option={scenarioOptions.rothOptimizerEnabled}
          values={optionValues.rothOptimizerEnabled as boolean}
          onChange={(value) => handleRothOptimizerChange(value as boolean)}
        />
        
        {/* Event Selection Section */}
        {eventSeries.length > 0 && (
          <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Select an Event to Modify:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
              {eventSeries.map((event, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedEvent(event.name);
                    setSelectedParameter(null);
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: selectedEvent === event.name ? '#7EC995' : '#e9ecef',
                    color: selectedEvent === event.name ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: selectedEvent === event.name ? 'bold' : 'normal'
                  }}
                >
                  {event.name} ({event.type})
                </button>
              ))}
            </div>
            
            {selectedEvent && (
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '15px' }}>
                  Select one parameter to modify (you can only select one at a time):
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* START YEAR PARAMETER */}
                  <div 
                    className={`parameter-option ${selectedParameter && selectedParameter !== 'startYear' ? 'disabled' : ''}`}
            style={{
                      padding: '15px', 
                      backgroundColor: selectedParameter === 'startYear' ? '#e6f7ef' : '#fff', 
                      border: `1px solid ${selectedParameter === 'startYear' ? '#7EC995' : '#ddd'}`,
                      borderRadius: '8px',
                      opacity: selectedParameter && selectedParameter !== 'startYear' ? 0.5 : 1,
                      pointerEvents: selectedParameter && selectedParameter !== 'startYear' ? 'none' : 'auto'
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
                          backgroundColor: selectedParameter === 'startYear' ? '#7EC995' : '#e9ecef',
                          color: selectedParameter === 'startYear' ? 'white' : '#333',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {selectedParameter === 'startYear' ? 'Selected' : 'Select'}
                      </button>
                    </div>
                    
                    {selectedParameter === 'startYear' && (
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
            
            <button
              onClick={runScenarioWithParameter}
              style={{
                padding: '12px 24px',
                backgroundColor: '#7EC995',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                marginTop: '20px',
                display: 'block',
                margin: '20px auto 0'
              }}
              disabled={!selectedEvent || !selectedParameter}
            >
              Run Scenario With Selected Parameters
            </button>
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
        
        {/* Scenario results */}
        {runScenario && (
          <div style={{ marginTop: 20 }}>
            <h3 style={{ textAlign: 'center', marginBottom: 15 }}>Scenario Results</h3>
            <ScenarioExplorationChart
              parameterKey={selectedEvent}
              parameterValues={[2021, 2022, 2023, 2024, 2025]} // Sample values, replace with actual parameter values
              metric={scenarioMetric}
            />
          </div>
        )}
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
              onToggle={(v) =>
                setSelectedGraphs((prev) =>
                  prev.includes(v) ? prev.filter((g) => g !== v) : [...prev, v]
                )
              }
            />
          ))}
          
          {/* Scenario exploration button */}
          <ToggleButton
            value="scenario"
            label="Scenario Exploration"
            selected={showScenarioExploration}
            onToggle={() => setShowScenarioExploration(!showScenarioExploration)}
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
            )}
            <hr style={{height: "4px",backgroundColor: "#568f67", border: "none", margin: "20px 0"}} />
          </div>
        )}

        {/* graphs */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {showScenarioExploration ? renderScenarioExploration() : renderNormalGraphs()}
        </div>
      </div>
    </div>
  );
};

export default OpenSimulation;
