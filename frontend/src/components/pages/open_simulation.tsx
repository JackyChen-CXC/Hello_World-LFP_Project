import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Legend,
  Line,
  LineChart,
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
  { year: 2025, low: 65, mid: 85, high: 95 },
  { year: 2030, low: 63, mid: 82, high: 93 },
  { year: 2035, low: 60, mid: 79, high: 91 },
  { year: 2040, low: 58, mid: 76, high: 89 },
  { year: 2045, low: 55, mid: 74, high: 87 },
  { year: 2050, low: 53, mid: 72, high: 85 },
];

const stackedBarData = [
  { year: 2025, principal: 300, interest: 80 },
  { year: 2030, principal: 330, interest: 100 },
  { year: 2035, principal: 360, interest: 120 },
  { year: 2040, principal: 390, interest: 140 },
  { year: 2045, principal: 420, interest: 160 },
  { year: 2050, principal: 450, interest: 180 },
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

const ShadedLineChart = ({ metric }: { metric: string }) => {
  const metricLabels: Record<string, string> = {
    investments: "Total Investments ($)",
    income: "Total Income ($)",
    expenses: "Total Expenses ($)",
    earlyTax: "Early Withdrawal Tax ($)",
    discretionaryPct: "% of Total Discretionary Expenses",
  };

  const metricKeyMap: Record<string, { low: string; mid: string; high: string }> = {
    investments: { low: "low", mid: "mid", high: "high" },
    income: { low: "low", mid: "mid", high: "high" },
    expenses: { low: "low", mid: "mid", high: "high" },
    earlyTax: { low: "low", mid: "mid", high: "high" },
    discretionaryPct: { low: "low", mid: "mid", high: "high" },
  };

  // Dummy datasets for different metrics (replace with real ones later)
  const metricDataMap: Record<string, any[]> = {
    investments: [
      { year: 2025, low: 300, mid: 400, high: 500 },
      { year: 2030, low: 320, mid: 430, high: 540 },
      { year: 2035, low: 340, mid: 460, high: 580 },
      { year: 2040, low: 360, mid: 490, high: 620 },
      { year: 2045, low: 380, mid: 520, high: 660 },
    ],
    income: [
      { year: 2025, low: 40, mid: 60, high: 80 },
      { year: 2030, low: 35, mid: 55, high: 75 },
      { year: 2035, low: 30, mid: 50, high: 70 },
      { year: 2040, low: 28, mid: 48, high: 68 },
      { year: 2045, low: 26, mid: 46, high: 66 },
    ],
    expenses: [
      { year: 2025, low: 25, mid: 35, high: 45 },
      { year: 2030, low: 30, mid: 40, high: 50 },
      { year: 2035, low: 35, mid: 45, high: 55 },
      { year: 2040, low: 38, mid: 48, high: 58 },
      { year: 2045, low: 40, mid: 50, high: 60 },
    ],
    earlyTax: [
      { year: 2025, low: 5, mid: 8, high: 11 },
      { year: 2030, low: 6, mid: 9, high: 12 },
      { year: 2035, low: 7, mid: 10, high: 13 },
      { year: 2040, low: 8, mid: 11, high: 14 },
      { year: 2045, low: 9, mid: 12, high: 15 },
    ],
    discretionaryPct: [
      { year: 2025, low: 20, mid: 30, high: 40 },
      { year: 2030, low: 18, mid: 28, high: 38 },
      { year: 2035, low: 16, mid: 26, high: 36 },
      { year: 2040, low: 14, mid: 24, high: 34 },
      { year: 2045, low: 12, mid: 22, high: 32 },
    ],
  };

  const selectedData = metricDataMap[metric];
  const { mid } = metricKeyMap[metric];

  return (
    <AreaChart width={600} height={300} data={selectedData}>
      <defs>
        <linearGradient id="colorMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="year">
        <Label value="Year" offset={-5} position="insideBottom" />
      </XAxis>
      <YAxis>
        <Label
          value={metricLabels[metric]}
          angle={-90}
          position="insideLeft"
          style={{ textAnchor: "middle" }}
        />
      </YAxis>
      <Tooltip />
      <Area
        type="monotone"
        dataKey={mid}
        stroke="#82ca9d"
        fillOpacity={1}
        fill="url(#colorMid)"
      />
    </AreaChart>
  );
};


const StackedBarChart = () => (
  <BarChart width={600} height={300} data={stackedBarData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="year">
      <Label value="Year" offset={-5} position="insideBottom" />
    </XAxis>
    <YAxis>
      <Label
        value="Portfolio Value ($ Thousands)"
        angle={-90}
        position="insideLeft"
        style={{ textAnchor: "middle" }}
      />
    </YAxis>
    <Tooltip />
    <Legend />
    <Bar dataKey="principal" stackId="a" fill="#8884d8" />
    <Bar dataKey="interest" stackId="a" fill="#82ca9d" />
  </BarChart>
);

const OpenSimulation = () => {
  const { id } = useParams();
  const [simulationNum, setSimulationNum] = useState("");
  const [lineChartMetric, setLineChartMetric] = useState("investments");
  const [graph, setGraph] = useState("line");

  const renderGraph = () => {
    if (graph === "line") return <LineChartGraph />;
    if (graph === "shaded") return <ShadedLineChart metric={lineChartMetric}/>;
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
