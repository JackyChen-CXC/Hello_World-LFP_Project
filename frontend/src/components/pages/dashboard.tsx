import React from "react";
import { useNavigate } from "react-router-dom";
import '../css_files/page_style.css';

const Dashboard = () => {
  const navigate = useNavigate()
  const username = localStorage.getItem("name");
  const name = localStorage.getItem("given_name");
  const picture = localStorage.getItem("picture")
  return (
  <div className="page-container">
    <div className="header">
      <div>Dashboard</div>
        <div style={{display:"flex", justifyContent:"center", alignItems:"center",  position: "absolute", right: "40px"}}>
          {username ? (
            <>
              <div style={{ margin: 20 }}>{username}</div>
              <img src={picture} height={60} width={60} alt="User" 
              style={{ cursor: "pointer",borderRadius: "50%" }} 
              className="transparent-hover"
              onClick={() => navigate("/profile")} />
            </>
          ) : (
            <div>Guest</div>
          )}
        </div>
      </div>
      <div className="welcome-message">
      { username ? (
        <p>Welcome Back, <strong>{name}!</strong></p>
      ) : (
        <p> <strong>Login to start!</strong></p>
      )}
      </div>
      <div className="create-plan-btn-container">
        <button className="create-plan-btn"
        onClick={() => navigate("/create-plan")}
        >+ Create New Plan</button>
      </div>

      {/* Recent Scenario(s) & Simulation(s) */}
      <div className="recent-scenarios">
        <h2>Recent Scenario(s) & Simulation(s):</h2>
        
        <div className="scenario-details">
          <p><strong>Title:</strong> 40 Year Retirement Plan</p>
          <p><strong>Plan Type:</strong> Individual Plan</p>
          <p><strong>Date Created:</strong> 02/14/24</p>
          <p><strong>Final Goal:</strong> $1,000,000</p>
          <p>
            <strong>Description:</strong> This plan is designed to accumulate 
            $1,000,000 over 40 years to fund retirement. The strategy balances 
            growth and stability by investing in a mix of equities and bonds. 
            The expected average annual...
          </p>
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
      
    </div>



  );
};
export default Dashboard;

