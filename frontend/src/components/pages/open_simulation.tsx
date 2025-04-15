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
      { year: 2025, p10: 400, p25: 400, p40: 400, median: 400, p60: 400, p75: 400, p90: 400 },
      { year: 2030, p10: 385, p25: 390, p40: 395, median: 390, p60: 405, p75: 410, p90: 420 },
      { year: 2035, p10: 375, p25: 380, p40: 390, median: 380, p60: 400, p75: 410, p90: 425 },
      { year: 2040, p10: 370, p25: 375, p40: 387, median: 390, p60: 410, p75: 420, p90: 435 },
      { year: 2045, p10: 365, p25: 370, p40: 385, median: 400, p60: 420, p75: 430, p90: 445 },
      { year: 2050, p10: 360, p25: 368, p40: 383, median: 410, p60: 430, p75: 440, p90: 455 },
      { year: 2055, p10: 355, p25: 365, p40: 382, median: 420, p60: 440, p75: 450, p90: 465 },
      { year: 2060, p10: 350, p25: 363, p40: 380, median: 425, p60: 445, p75: 455, p90: 470 },
      { year: 2065, p10: 345, p25: 360, p40: 378, median: 430, p60: 450, p75: 460, p90: 475 },
      { year: 2070, p10: 340, p25: 358, p40: 376, median: 432, p60: 455, p75: 465, p90: 480 },
      { year: 2075, p10: 335, p25: 355, p40: 375, median: 435, p60: 460, p75: 470, p90: 485 },
    ],
    
    income: [
      { year: 2025, p10: 58, p25: 58, p40: 58, median: 58, p60: 58, p75: 58, p90: 58 },
      { year: 2030, p10: 50, p25: 52, p40: 54, median: 54, p60: 55, p75: 58, p90: 60 },
      { year: 2035, p10: 50, p25: 52, p40: 54, median: 55, p60: 57, p75: 60, p90: 64 },
      { year: 2040, p10: 46, p25: 48, p40: 50, median: 52, p60: 55, p75: 57, p90: 59 },
      { year: 2045, p10: 44, p25: 46, p40: 48, median: 50, p60: 56, p75: 59, p90: 61 },
      { year: 2050, p10: 42, p25: 44, p40: 46, median: 52, p60: 58, p75: 60, p90: 63 },
      { year: 2055, p10: 40, p25: 42, p40: 44, median: 54, p60: 60, p75: 62, p90: 65 },
      { year: 2060, p10: 38, p25: 40, p40: 42, median: 55, p60: 61, p75: 63, p90: 66 },
      { year: 2065, p10: 36, p25: 38, p40: 40, median: 56, p60: 62, p75: 64, p90: 67 },
      { year: 2070, p10: 34, p25: 36, p40: 38, median: 57, p60: 63, p75: 65, p90: 68 },
      { year: 2075, p10: 32, p25: 34, p40: 36, median: 58, p60: 64, p75: 66, p90: 70 },
    ],
    
  
    expenses: [
      { year: 2025, p10: 34, p25: 34, p40: 34, median: 34, p60: 34, p75: 34, p90: 34 },
      { year: 2030, p10: 31, p25: 32, p40: 33, median: 36, p60: 39, p75: 41, p90: 43 },
      { year: 2035, p10: 30, p25: 31, p40: 32, median: 38, p60: 41, p75: 43, p90: 45 },
      { year: 2040, p10: 29, p25: 30, p40: 31, median: 39, p60: 42, p75: 44, p90: 46 },
      { year: 2045, p10: 28, p25: 29, p40: 30, median: 40, p60: 43, p75: 45, p90: 47 },
      { year: 2050, p10: 27, p25: 28, p40: 29, median: 41, p60: 44, p75: 46, p90: 48 },
      { year: 2055, p10: 26, p25: 27, p40: 28, median: 42, p60: 45, p75: 47, p90: 49 },
      { year: 2060, p10: 25, p25: 26, p40: 27, median: 43, p60: 46, p75: 48, p90: 50 },
      { year: 2065, p10: 24, p25: 25, p40: 26, median: 44, p60: 47, p75: 49, p90: 51 },
      { year: 2070, p10: 23, p25: 24, p40: 25, median: 45, p60: 48, p75: 50, p90: 52 },
      { year: 2075, p10: 22, p25: 23, p40: 24, median: 46, p60: 49, p75: 51, p90: 53 },
    ],
    
  
    earlyTax: [
      { year: 2025, p10: 7.5, p25: 7.5, p40: 7.5, median: 7.5, p60: 7.5, p75: 7.5, p90: 7.5 },
      { year: 2030, p10: 7, p25: 7.2, p40: 7.5, median: 8.2, p60: 8.9, p75: 9.2, p90: 9.5 },
      { year: 2035, p10: 6.8, p25: 7.1, p40: 7.4, median: 8.8, p60: 9.5, p75: 9.9, p90: 10.3 },
      { year: 2040, p10: 6.7, p25: 7.1, p40: 7.5, median: 9.2, p60: 10, p75: 10.4, p90: 10.8 },
      { year: 2045, p10: 6.6, p25: 7.2, p40: 7.6, median: 9.6, p60: 10.4, p75: 10.9, p90: 11.3 },
      { year: 2050, p10: 6.5, p25: 7.2, p40: 7.7, median: 10, p60: 10.8, p75: 11.3, p90: 11.8 },
      { year: 2055, p10: 6.5, p25: 7.3, p40: 7.8, median: 10.3, p60: 11.2, p75: 11.7, p90: 12.2 },
      { year: 2060, p10: 6.6, p25: 7.4, p40: 7.9, median: 10.6, p60: 11.5, p75: 12, p90: 12.5 },
      { year: 2065, p10: 6.7, p25: 7.5, p40: 8, median: 10.8, p60: 11.8, p75: 12.3, p90: 12.8 },
      { year: 2070, p10: 6.8, p25: 7.6, p40: 8.1, median: 11, p60: 12, p75: 12.5, p90: 13 },
      { year: 2075, p10: 6.9, p25: 7.7, p40: 8.2, median: 11.2, p60: 12.2, p75: 12.7, p90: 13.2 },
    ],
  
    discretionaryPct: [
      { year: 2025, p10: 29, p25: 29, p40: 29, median: 29, p60: 29, p75: 29, p90: 29 },
      { year: 2030, p10: 25, p25: 26, p40: 27, median: 26, p60: 30, p75: 32, p90: 34 },
      { year: 2035, p10: 23, p25: 25, p40: 26, median: 25, p60: 30, p75: 32, p90: 35 },
      { year: 2040, p10: 22, p25: 24, p40: 25, median: 26, p60: 31, p75: 33, p90: 36 },
      { year: 2045, p10: 21, p25: 23, p40: 24, median: 27, p60: 32, p75: 34, p90: 37 },
      { year: 2050, p10: 20, p25: 22, p40: 23, median: 28, p60: 33, p75: 35, p90: 38 },
      { year: 2055, p10: 19, p25: 21, p40: 22, median: 29, p60: 34, p75: 36, p90: 39 },
      { year: 2060, p10: 18, p25: 20, p40: 21, median: 30, p60: 35, p75: 37, p90: 40 },
      { year: 2065, p10: 17, p25: 19, p40: 20, median: 31, p60: 36, p75: 38, p90: 41 },
      { year: 2070, p10: 16, p25: 18, p40: 19, median: 32, p60: 37, p75: 39, p90: 42 },
      { year: 2075, p10: 15, p25: 17, p40: 18, median: 33, p60: 38, p75: 40, p90: 43 },
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
        fill="#5792c2"
        fillOpacity={0.5}
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
        fillOpacity={0.5}
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
        fill="#034780"
        fillOpacity={0.5}
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
