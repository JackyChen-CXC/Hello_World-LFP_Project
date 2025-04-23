import { useState } from "react";
import { useParams } from "react-router-dom";
import React from "react";
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

const StackedBarChart = ({ useMedian = true }) => {
  // Transform the data based on selected metric (median or average)
  const getStackedData = () => {
    const years = [2025, 2026, 2027, 2028, 2029];
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

const OpenSimulation = () => {
  const { id } = useParams();
  const [lineChartMetric, setLineChartMetric] = useState("investments");
  const [graph, setGraph] = useState("line");
  const [useMedianValues, setUseMedianValues] = useState(true);

  const renderGraph = () => {
    if (graph === "line") return <LineChartGraph />;
    if (graph === "shaded") return (
      <ShadedLineChart
        metric={lineChartMetric}
        financialGoal={lineChartMetric === 'investments' ? mockSimulationResult.financialGoal : undefined}
      />
    );
    if (graph === "stacked") return <StackedBarChart useMedian={useMedianValues} />;
  };

  const username = localStorage.getItem("name");
  const picture = localStorage.getItem("picture");

  return (
    <div className="page-container">
      <div className="header" style={{ marginBottom: "5%" }}>
        <div>Simulate</div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            right: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              right: "40px",
            }}
          >
            {username ? (
              <>
                <div style={{ margin: 20 }}>{username}</div>
                <img
                  src={picture}
                  height={60}
                  width={60}
                  alt="User"
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                  className="transparent-hover"
                />
              </>
            ) : (
              <div>Guest</div>
            )}
          </div>
        </div>
      </div>

      <div className="open-simulation">
        <div className="subheading">Simulation Results and Graphs</div>

        <div style={{ marginBottom: "20px" }}>
          <button style={{ marginTop: "2%" }} onClick={() => setGraph("line")}>
            Line Chart
          </button>
          <button style={{ marginTop: "2%" }} onClick={() => setGraph("shaded")}>
            Shaded Line Chart
          </button>
          <button style={{ marginTop: "2%" }} onClick={() => setGraph("stacked")}>
            Stacked Bar Chart
          </button>
        </div>

        {graph === "stacked" && (
          <div style={{ marginBottom: "20px" }}>
            <label style={{ marginRight: "20px" }}>
              <input
                type="radio"
                name="valueType"
                checked={useMedianValues}
                onChange={() => setUseMedianValues(true)}
              />
              Median Values
            </label>
            <label>
              <input
                type="radio"
                name="valueType"
                checked={!useMedianValues}
                onChange={() => setUseMedianValues(false)}
              />
              Average Values
            </label>
          </div>
        )}

        {graph === "shaded" && (
          <div style={{ marginTop: "20px" }}>
            <div className="normal-text">Select Metric to Display:</div>
            <label>
              <input
                type="radio"
                name="lineMetric"
                value="investments"
                checked={lineChartMetric === "investments"}
                onChange={(e) => setLineChartMetric(e.target.value)}
              />
              Total Investments
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="lineMetric"
                value="income"
                checked={lineChartMetric === "income"}
                onChange={(e) => setLineChartMetric(e.target.value)}
              />
              Total Income
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="lineMetric"
                value="expenses"
                checked={lineChartMetric === "expenses"}
                onChange={(e) => setLineChartMetric(e.target.value)}
              />
              Total Expenses
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="lineMetric"
                value="earlyTax"
                checked={lineChartMetric === "earlyTax"}
                onChange={(e) => setLineChartMetric(e.target.value)}
              />
              Early Withdrawal Tax
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="lineMetric"
                value="discretionaryPct"
                checked={lineChartMetric === "discretionaryPct"}
                onChange={(e) => setLineChartMetric(e.target.value)}
              />
              % of Total Discretionary Expenses
            </label>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center" }}>{renderGraph()}</div>
      </div>
    </div>
  );
};

export default OpenSimulation;
