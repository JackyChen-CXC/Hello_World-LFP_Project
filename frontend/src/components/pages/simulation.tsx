import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../css_files/page_style.css';

interface ScenarioData {
  id: string;
  title: string;
  planType: string;
  financialGoal: string;
  dateCreated: string;
}
const SimulationItem: FC<{ scenario: ScenarioData; onDelete: (id: string) => void }> = ({ scenario, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="simulation-container" onClick={() => navigate(`/simulation/${scenario.id}`)}>
      <div className="normal-text">{scenario.title}</div>
      <div className="normal-text">Date Created: {scenario.dateCreated}</div>
    </div>
  );
};

const Simulation = () => {
  const [scenarios, setScenarios] = useState<ScenarioData[]>([]);
  const [showPlans, setShowPlans] = useState(false);

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
        }));

        setScenarios(formatted);
      } catch (error) {
        console.error("Error loading scenarios:", error);
      }
    };

    fetchScenarios();
  }, []);
  const username = localStorage.getItem("name");
  const name = localStorage.getItem("given_name");
  const picture = localStorage.getItem("picture")
  const navigate = useNavigate()
  return (
    <div className="page-container">
      <div className="header">
        <div>Simulate</div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "absolute", right: "40px" }}>
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

      <div className="subheading" style={{ marginBottom: "-50px" }}>Monte Carlo Simulation:</div>
      <p className="normal-text" style={{ width: "70%" }}>
        A Monte Carlo Simulation is a statistical method used to model uncertainty and
        predict possible future outcomes. It runs thousands of simulations using different
        randomized market conditions, such as investment returns, inflation rates, and
        economic fluctuations, to estimate your financial future.
      </p>

      <div >
        {scenarios.map((scenario) => (
          <SimulationItem key={scenario.id} scenario={scenario}/>
        ))}
      </div>

    </div>
  );
};

export default Simulation;
