import { useState } from "react";
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
  XAxis, YAxis
} from "recharts";
import "../css_files/page_style.css";

//used ChatGPT to help generate some graphs with recharts
// Simulated probability of retirement success over years
const probabilityData = [
  { year: 2025, success: 85 },
  { year: 2030, success: 82 },
  { year: 2035, success: 79 },
  { year: 2040, success: 76 },
  { year: 2045, success: 74 },
  { year: 2050, success: 72 },
];

// Simulated probability range for future success
const shadedData = [
  { year: 2025, low: 65, mid: 85, high: 95 },
  { year: 2030, low: 63, mid: 82, high: 93 },
  { year: 2035, low: 60, mid: 79, high: 91 },
  { year: 2040, low: 58, mid: 76, high: 89 },
  { year: 2045, low: 55, mid: 74, high: 87 },
  { year: 2050, low: 53, mid: 72, high: 85 },
];

// Simulated average values of portfolio components
const stackedBarData = [
  { year: 2025, principal: 300, interest: 80 },
  { year: 2030, principal: 330, interest: 100 },
  { year: 2035, principal: 360, interest: 120 },
  { year: 2040, principal: 390, interest: 140 },
  { year: 2045, principal: 420, interest: 160 },
  { year: 2050, principal: 450, interest: 180 },
];

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


const ShadedLineChart = () => (
  <AreaChart width={600} height={300} data={shadedData}>
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
        value="Probability Range (%)"
        angle={-90}
        position="insideLeft"
        style={{ textAnchor: "middle" }}
      />
    </YAxis>
    <Tooltip />
    <Area type="monotone" dataKey="mid" stroke="#82ca9d" fillOpacity={1} fill="url(#colorMid)" />
  </AreaChart>
);

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
  const [simulationNum, setSimulationNum] = useState("");
  const [graph, setGraph] = useState("line");

  const renderGraph = () => {
    if (graph === "line") return <LineChartGraph />;
    if (graph === "shaded") return <ShadedLineChart />;
    if (graph === "stacked") return <StackedBarChart />;
  };
  const username = localStorage.getItem("name");
  const name = localStorage.getItem("given_name");
  const picture = localStorage.getItem("picture")
  return (
    <div className="page-container">
      <div className="header" style={{ marginBottom: "5%" }}>
        <div>Simulate</div>
        <div style={{
          display: "flex", justifyContent: "center",
          alignItems: "center", position: "absolute", right: "40px"
        }}>
         <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "absolute", right: "40px" }}>
        {username ? (
            <>
              <div style={{ margin: 20 }}>{username}</div>
              <img src={picture} height={60} width={60} alt="User" 
              style={{ cursor: "pointer",borderRadius: "50%" }} 
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
        <div className="split-container">
          <div className="left-side">
            <div className="normal-text"> Number of Simulations:</div>
            <input
              className="input-boxes"
              style={{ width: "200px" }}
              type="number"
              name="simulationNum"
              value={simulationNum}
              onChange={(e) => setSimulationNum(e.target.value)}
            />

            <button className="page-buttons" style={{marginLeft:"0px", width:"200px"}}> Run Simulation</button>
          </div>
        </div>

        {/**
         * 
        <div style={{ marginBottom: "20px" }}>
          <button style={{marginTop:"2%"}} onClick={() => setGraph("line")}>Line Chart</button>
          <button style={{marginTop:"2%"}} onClick={() => setGraph("shaded")}>Shaded Line Chart</button>
          <button style={{marginTop:"2%"}} onClick={() => setGraph("stacked")}>Stacked Bar Chart</button>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          {renderGraph()}
        </div>
         */}
      </div>
    </div>
  );
};

export default OpenSimulation;
