import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../css_files/page_style.css';

interface ScenarioData {
  id: string;
  title: string;
  planType: string;
  financialGoal: string;
  dateCreated: string;
  description: string;
}

const Dashboard: FC = () => {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<ScenarioData[]>([]);

  const username = localStorage.getItem("name");
  const givenName = localStorage.getItem("given_name");
  const picture = localStorage.getItem("picture");

  useEffect(() => {
    const fetchScenarios = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.warn("No userId found in localStorage");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/plans/all", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) throw new Error("Failed to fetch plans");

        const result = await response.json();
        const data = result.data;
        const formatted = data.map((item: any, index: number) => ({
          id: item._id || index,
          title: item.name || "Untitled Plan",
          planType: item.maritalStatus === "couple" ? "Joint" : "Individual",
          financialGoal: item.financialGoal?.toString() || "N/A",
          dateCreated: new Date(item.createdAt || Date.now()).toLocaleDateString(),
          description: item.description || "No description provided.",
        }));

        setScenarios(formatted);
      } catch (error) {
        console.error("Error loading scenarios:", error);
      }
    };

    fetchScenarios();
  }, []);

  return (
    <div className="page-container">
      <div className="header">
        <div>Dashboard</div>
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
                src={picture || ""}
                height={60}
                width={60}
                alt="User"
                style={{ cursor: "pointer", borderRadius: "50%" }}
                className="transparent-hover"
                onClick={() => navigate("/profile")}
              />
            </>
          ) : (
            <div>Guest</div>
          )}
        </div>
      </div>

      <div className="welcome-message">
        {username ? (
          <p>
            Welcome Back, <strong>{givenName}!</strong>
          </p>
        ) : (
          <p>
            <strong>Login to start!</strong>
          </p>
        )}
      </div>

      <div className="create-plan-btn-container">
        <button className="create-plan-btn" onClick={() => navigate("/create-plan")}>
          + Create New Plan
        </button>
      </div>

      {/* Recent Scenarios Section */}
      <div className="recent-scenarios">
        <h2>Recent Scenario(s) &amp; Simulation(s):</h2>
        {scenarios.length > 0 ? (
          scenarios.map((scenario) => (
            <div key={scenario.id} className="scenario-details">
              <p>
                <strong>Title:</strong> {scenario.title}
              </p>
              <p>
                <strong>Plan Type:</strong> {scenario.planType}
              </p>
              <p>
                <strong>Date Created:</strong> {scenario.dateCreated}
              </p>
              <p>
                <strong>Final Goal:</strong> ${scenario.financialGoal}
              </p>
              <p>
                <strong>Description:</strong> {scenario.description}
              </p>
            </div>
          ))
        ) : (
          <p>No scenarios found.</p>
        )}

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
