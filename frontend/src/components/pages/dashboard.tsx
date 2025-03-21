import React from "react";
import { useNavigate } from "react-router-dom";
import '../css_files/page_style.css';

const Dashboard = () => {
  const navigate = useNavigate()
  return (
  <div className="page-container">
    <div className="header">
        <div>Dashboard</div>
        <div style={{display:"flex", justifyContent:"center", alignItems:"center",  position: "absolute", right: "40px"}}>
          <div>user</div>
          <img src="/images/user.png" height={80} width={90} />
        </div>
      </div>
      <div className="welcome-message">
        <p>Welcome Back, <strong>User!</strong></p>
      </div>
      <div className="stats-container">
        <div className="stat-box">
          <h3>Monthly Spending</h3>
          <p>$0</p>
        </div>
        <div className="stat-box">
          <h3>Retirement Age Target</h3>
          <p>0</p>
        </div>
        <div className="stat-box">
          <h3>Investment Growth</h3>
          <p>0%</p>
        </div>
        <div className="stat-box">
          <h3>Net Worth</h3>
          <p>$0</p>
        </div>
      </div>
      <div className="create-plan-btn-container">
        <button className="create-plan-btn"
        onClick={() => navigate("/create-plan")}
        >+ Create New Plan</button>
        
      </div>
      <div className="recent-simulation">
        <h4>Recent Simulation: 02/14/24</h4>
        <p>You’re On The Right Track!</p>
      </div>

      {/* Chart Section */}
      <div className="chart-container">
        <h4>Projected Investment Growth Over Time</h4>
        <img
          src="/images/placeholder-chart.png"
          alt="Projected Investment Growth"
          className="chart-image"
        />
      </div>
    </div>



  );
};
export default Dashboard;

