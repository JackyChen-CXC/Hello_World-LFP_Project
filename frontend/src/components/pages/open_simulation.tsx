import { useState } from "react";
import { useParams } from "react-router-dom";
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

// Sample data
const probabilityData = [
  { year: 2025, success: 85 },
  { year: 2030, success: 82 },
  { year: 2035, success: 79 },
  { year: 2040, success: 76 },
  { year: 2045, success: 74 },
  { year: 2050, success: 72 },
];

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


// Charts
const LineChartGraph = () => (
  <LineChart width={600} height={300} data={probabilityData}>
    <CartesianGrid stroke="#ccc" />
    <XAxis dataKey="year">
      <Label value="Year" offset={-5} position="insideBottom" />
    </XAxis>
    <YAxis>
      <Label
        value="Probability of Success (%)"
        angle={-90}
        position="insideLeft"
        style={{ textAnchor: "middle" }}
      />
    </YAxis>
    <Tooltip />
    <Line type="monotone" dataKey="success" stroke="#8884d8" strokeWidth={3} />
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

  const metricDataMap: Record<string, any[]> = {
    
    investments: [
      { year: 2025, p10: 300, p25: 340, p40: 370, median: 400, p60: 430, p75: 460, p90: 500 },
      { year: 2030, p10: 320, p25: 360, p40: 390, median: 420, p60: 450, p75: 480, p90: 520 },
      { year: 2035, p10: 340, p25: 380, p40: 410, median: 440, p60: 470, p75: 500, p90: 540 },
      { year: 2040, p10: 360, p25: 400, p40: 430, median: 460, p60: 490, p75: 520, p90: 560 },
      { year: 2045, p10: 380, p25: 420, p40: 450, median: 480, p60: 510, p75: 540, p90: 580 },
      { year: 2050, p10: 390, p25: 440, p40: 470, median: 500, p60: 530, p75: 560, p90: 600 },
      { year: 2055, p10: 400, p25: 450, p40: 480, median: 510, p60: 540, p75: 570, p90: 610 },
      { year: 2060, p10: 410, p25: 460, p40: 490, median: 520, p60: 550, p75: 580, p90: 620 },
      { year: 2065, p10: 420, p25: 470, p40: 500, median: 530, p60: 560, p75: 590, p90: 630 },
      { year: 2070, p10: 430, p25: 480, p40: 510, median: 540, p60: 570, p75: 600, p90: 640 },
      { year: 2075, p10: 440, p25: 490, p40: 520, median: 550, p60: 580, p75: 610, p90: 650 },
    ],
  
    income: [
      { year: 2025, p10: 30, p25: 40, p40: 50, median: 58, p60: 65, p75: 70, p90: 80 },
      { year: 2030, p10: 28, p25: 38, p40: 48, median: 56, p60: 63, p75: 68, p90: 78 },
      { year: 2035, p10: 26, p25: 36, p40: 46, median: 54, p60: 61, p75: 66, p90: 76 },
      { year: 2040, p10: 24, p25: 34, p40: 44, median: 52, p60: 59, p75: 64, p90: 74 },
      { year: 2045, p10: 22, p25: 32, p40: 42, median: 50, p60: 57, p75: 62, p90: 72 },
      { year: 2050, p10: 20, p25: 30, p40: 40, median: 48, p60: 55, p75: 60, p90: 70 },
      { year: 2055, p10: 18, p25: 28, p40: 38, median: 46, p60: 53, p75: 58, p90: 68 },
      { year: 2060, p10: 16, p25: 26, p40: 36, median: 44, p60: 51, p75: 56, p90: 66 },
      { year: 2065, p10: 14, p25: 24, p40: 34, median: 42, p60: 49, p75: 54, p90: 64 },
      { year: 2070, p10: 12, p25: 22, p40: 32, median: 40, p60: 47, p75: 52, p90: 62 },
      { year: 2075, p10: 10, p25: 20, p40: 30, median: 38, p60: 45, p75: 50, p90: 60 },
    ],
  
    expenses: [
      { year: 2025, p10: 20, p25: 27, p40: 31, median: 34, p60: 38, p75: 42, p90: 45 },
      { year: 2030, p10: 22, p25: 29, p40: 33, median: 36, p60: 40, p75: 44, p90: 47 },
      { year: 2035, p10: 24, p25: 31, p40: 35, median: 38, p60: 42, p75: 46, p90: 49 },
      { year: 2040, p10: 26, p25: 33, p40: 37, median: 40, p60: 44, p75: 48, p90: 51 },
      { year: 2045, p10: 28, p25: 35, p40: 39, median: 42, p60: 46, p75: 50, p90: 53 },
      { year: 2050, p10: 30, p25: 37, p40: 41, median: 44, p60: 48, p75: 52, p90: 55 },
      { year: 2055, p10: 32, p25: 39, p40: 43, median: 46, p60: 50, p75: 54, p90: 57 },
      { year: 2060, p10: 34, p25: 41, p40: 45, median: 48, p60: 52, p75: 56, p90: 59 },
      { year: 2065, p10: 36, p25: 43, p40: 47, median: 50, p60: 54, p75: 58, p90: 61 },
      { year: 2070, p10: 38, p25: 45, p40: 49, median: 52, p60: 56, p75: 60, p90: 63 },
      { year: 2075, p10: 40, p25: 47, p40: 51, median: 54, p60: 58, p75: 62, p90: 65 },
    ],
  
    earlyTax: [
      { year: 2025, p10: 4, p25: 6, p40: 7, median: 7.5, p60: 8.5, p75: 9.5, p90: 11 },
      { year: 2030, p10: 4.5, p25: 6.5, p40: 7.5, median: 8, p60: 9, p75: 10, p90: 11.5 },
      { year: 2035, p10: 5, p25: 7, p40: 8, median: 8.5, p60: 9.5, p75: 10.5, p90: 12 },
      { year: 2040, p10: 5.5, p25: 7.5, p40: 8.5, median: 9, p60: 10, p75: 11, p90: 12.5 },
      { year: 2045, p10: 6, p25: 8, p40: 9, median: 9.5, p60: 10.5, p75: 11.5, p90: 13 },
      { year: 2050, p10: 6.5, p25: 8.5, p40: 9.5, median: 10, p60: 11, p75: 12, p90: 13.5 },
      { year: 2055, p10: 7, p25: 9, p40: 10, median: 10.5, p60: 11.5, p75: 12.5, p90: 14 },
      { year: 2060, p10: 7.5, p25: 9.5, p40: 10.5, median: 11, p60: 12, p75: 13, p90: 14.5 },
      { year: 2065, p10: 8, p25: 10, p40: 11, median: 11.5, p60: 12.5, p75: 13.5, p90: 15 },
      { year: 2070, p10: 8.5, p25: 10.5, p40: 11.5, median: 12, p60: 13, p75: 14, p90: 15.5 },
      { year: 2075, p10: 9, p25: 11, p40: 12, median: 12.5, p60: 13.5, p75: 14.5, p90: 16 },
    ],
  
    discretionaryPct: [
      { year: 2025, p10: 10, p25: 20, p40: 26, median: 29, p60: 32, p75: 35, p90: 40 },
      { year: 2030, p10: 9, p25: 19, p40: 25, median: 28, p60: 31, p75: 34, p90: 39 },
      { year: 2035, p10: 8, p25: 18, p40: 24, median: 27, p60: 30, p75: 33, p90: 38 },
      { year: 2040, p10: 7, p25: 17, p40: 23, median: 26, p60: 29, p75: 32, p90: 37 },
      { year: 2045, p10: 6, p25: 16, p40: 22, median: 25, p60: 28, p75: 31, p90: 36 },
      { year: 2050, p10: 5, p25: 15, p40: 21, median: 24, p60: 27, p75: 30, p90: 35 },
      { year: 2055, p10: 4, p25: 14, p40: 20, median: 23, p60: 26, p75: 29, p90: 34 },
      { year: 2060, p10: 3, p25: 13, p40: 19, median: 22, p60: 25, p75: 28, p90: 33 },
      { year: 2065, p10: 2, p25: 12, p40: 18, median: 21, p60: 24, p75: 27, p90: 32 },
      { year: 2070, p10: 1, p25: 11, p40: 17, median: 20, p60: 23, p75: 26, p90: 31 },
      { year: 2075, p10: 0, p25: 10, p40: 16, median: 19, p60: 22, p75: 25, p90: 30 },
    ],
  };
    

  const rawData = metricDataMap[metric] || [];

  // Build stacked “difference” fields for each band
  const selectedData = rawData.map((d) => ({
    ...d,
    // p10..p90
    band10_90_bottom: d.p10,
    band10_90_top: d.p90 - d.p10,

    // p25..p75
    band25_75_bottom: d.p25,
    band25_75_top: d.p75 - d.p25,

    // p40..p60
    band40_60_bottom: d.p40,
    band40_60_top: d.p60 - d.p40,
  }));
 
  return (
    <ComposedChart width={700} height={400} data={selectedData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="year" />
      <YAxis />
      <Tooltip />

      {/* 
        1) The widest band: p10..p90
           We do two Areas with the same stackId="band10_90".
           First one is "bottom" line only (fill="none"),
           second is the difference (p90 - p10). 
      */}
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
        fill="#4682b4"
        fillOpacity={0.1}
      />

      {/*
        2) Middle band: p25..p75
      */}
      <Area
        type="monotone"
        dataKey="band25_75_bottom"
        stackId="band25_75"
        stroke="none"
        fill="none"
      />
      <Area
        type="monotone"
        dataKey="band25_75_top"
        stackId="band25_75"
        stroke="none"
        fill="#4682b4"
        fillOpacity={0.2}
      />

      {/*
        3) Inner band: p40..p60
      */}
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
        fill="#4682b4"
        fillOpacity={0.3}
      />

      {/* Median line on top */}
      <Line
        type="monotone"
        dataKey="median"
        stroke="#000"
        strokeWidth={2}
        dot={false}
      />

      {/* Optional: Draw financial goal as a reference line */}
      {financialGoal && (
        <ReferenceLine
          y={financialGoal}
          stroke="red"
          strokeDasharray="3 3"
          label={{
            value: "Financial Goal",
            position: "top",
            fill: "red",
          }}
        />
      )}
    </ComposedChart>
  );
};


const StackedBarChart = () => (
  <BarChart width={700} height={400} data={stackedBarData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="year">
      <Label value="Year" offset={-5} position="insideBottom" />
    </XAxis>
    <YAxis>
      <Label
        value="Total Breakdown ($ Thousands)"
        angle={-90}
        position="insideLeft"
        style={{ textAnchor: "middle" }}
      />
    </YAxis>
    <Tooltip />
    <Legend />

    {/* Investments */}
    <Bar dataKey="RothIRA" stackId="a" fill="#4b3f72" />      
    <Bar dataKey="Brokerage" stackId="a" fill="#007a99" /> 
    <Bar dataKey="401k" stackId="a" fill="#2f855a" /> 

    {/* Income */}
    <Bar dataKey="Job" stackId="a" fill="#b7791f" /> 
    <Bar dataKey="Pension" stackId="a" fill="#cc3300" /> 
    <Bar dataKey="Rental" stackId="a" fill="#e69500" /> 

    {/* Expenses */}
    <Bar dataKey="Housing" stackId="a" fill="#7f9c00" />
    <Bar dataKey="Food" stackId="a" fill="#3f9142" />
    <Bar dataKey="Travel" stackId="a" fill="#1d4ed8" />
    {/* Taxes */}
    <Bar dataKey="Taxes" stackId="a" fill="#990000" />

  </BarChart>
);


const OpenSimulation = () => {
  const { id } = useParams();
  const [simulationNum, setSimulationNum] = useState("");
  const [lineChartMetric, setLineChartMetric] = useState("investments");
  const [graph, setGraph] = useState("line");

  const renderGraph = () => {
    if (graph === "line") return <LineChartGraph />;
    if (graph === "shaded") return (
      <ShadedLineChart
        metric={lineChartMetric}
        financialGoal={lineChartMetric === "investments" ? 500 : undefined}
      />
    );
    if (graph === "stacked") return <StackedBarChart />;
  };

  const username = localStorage.getItem("name");
  const picture = localStorage.getItem("picture");

  const handleRunSimulation = async () => {
    if (!id || !simulationNum) {
      alert("Please enter the number of simulations.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id,
          simulations: parseInt(simulationNum),
        }),
      });

      const result = await response.json();

      if (result.status === "OK") {
        alert("Simulation started successfully!");
        console.log("Simulation ID:", result.simulationId);
      } else {
        alert("Simulation failed: " + result.message);
      }
    } catch (error) {
      console.error("Error starting simulation:", error);
      alert("An error occurred while starting the simulation.");
    }
  };

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
        <div className="normal-text">How Many Simulations Would You Like To Run?</div>
        <input
          className="input-boxes"
          type="number"
          name="simulationNum"
          value={simulationNum}
          onChange={(e) => setSimulationNum(e.target.value)}
        />

        <button
          className="page-buttons"
          style={{ marginLeft: "0px", width: "200px" }}
          onClick={handleRunSimulation}
        >
          Run Simulation
        </button>

        {/**
         * Toggle chart view buttons and display chart
         */}
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
