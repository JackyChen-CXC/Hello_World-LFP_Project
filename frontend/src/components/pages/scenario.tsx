import React, { FC, useState } from "react";
import "../css_files/page_style.css";

//Define the shape of a scenario
interface ScenarioData {
  id: number;
  title: string;
  planType: string;
  financialGoal: string;
  dateCreated: string;
}

//Component for a single scenario item
const ScenarioItem: FC<{ scenario: ScenarioData }> = ({ scenario }) => {
  return (
    <div className="scenario-container">
      <div className="normal-text">Title: {scenario.title}</div>
      <div className="normal-text">Plan Type: {scenario.planType}</div>
      <div className="normal-text">Financial Goal: {scenario.financialGoal}</div>
      <div className="normal-text">Date Created: {scenario.dateCreated}</div>
      <div style={{ display: "flex", marginLeft: "250px", marginTop: "60px" }}>
        <img src="/images/edit.png" height={50} width={50} />
        <img src="/images/share.png" height={50} width={50} />
        <img src="/images/trash.png" height={50} width={50} />
        <img src="/images/export.png" height={50} width={50} />
      </div>
    </div>
  );
};

//temporary data will delete later
const Scenario: FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioData[]>([
    {
      id: 1,
      title: "Retirement Plan",
      planType: "401K",
      financialGoal: "$1M",
      dateCreated: "2025-03-20",
    },
    {
      id: 2,
      title: "College Fund",
      planType: "529",
      financialGoal: "$100K",
      dateCreated: "2025-03-21",
    },
    {
      id: 3,
      title: "College Fund",
      planType: "529",
      financialGoal: "$100K",
      dateCreated: "2025-03-21",
    },
    {
      id: 4,
      title: "College Fund",
      planType: "529",
      financialGoal: "$100K",
      dateCreated: "2025-03-21",
    },
  ]);

  return (
    <div className="page-container">
      <div className="header">
        <div>Scenarios</div>
        <div style={{display:"flex", justifyContent:"center", alignItems:"center",position: "absolute", right: "40px"}}>
          <div>user</div>
          <img src="/images/user.png" height={80} width={90} />
        </div>
      </div>
      <div className="scenario-grid">
        {scenarios.map((scenario) => (
          <ScenarioItem key={scenario.id} scenario={scenario} />
        ))}
      </div>
    </div>
  );
};

export default Scenario;
