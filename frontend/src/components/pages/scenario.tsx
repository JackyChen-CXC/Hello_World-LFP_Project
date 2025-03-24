import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css_files/page_style.css";
import yaml from 'js-yaml';

// Define the shape of a scenario
interface ScenarioData {
  id: string;
  title: string;
  planType: string;
  financialGoal: string;
  dateCreated: string;
}

const ScenarioItem: FC<{ scenario: ScenarioData; onDelete: (id: string) => void }> = ({ scenario, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="scenario-container" onClick={() => navigate(`/scenario/${scenario.id}`)}>
      <div className="normal-text">Title: {scenario.title}</div>
      <div className="normal-text">Plan Type: {scenario.planType}</div>
      <div className="normal-text">Financial Goal: ${scenario.financialGoal}</div>
      <div className="normal-text">Date Created: {scenario.dateCreated}</div>
      <div style={{ display: "flex", marginLeft: "250px", marginTop: "100px" }}>
        <img src="/images/edit.png" height={50} width={50} />
        <img src="/images/share.png" height={50} width={50} />
        <img
          src="/images/trash.png"
          height={50}
          width={50}
          onClick={(e) => {
            e.stopPropagation();
            const confirmed = window.confirm("Are you sure you want to delete this scenario?");
            if (confirmed) {
              onDelete(scenario.id);
            }
          }}
          style={{ cursor: "pointer" }}
        />
        <img src="/images/export.png" height={50} width={50} />
      </div>
    </div>
  );
};

const Scenario: FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioData[]>([]);
  const [file, setFile] = useState<File | null>(null); // State to hold the selected file
  const navigate = useNavigate();

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

  const handleDeleteScenario = async (id: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/deleteplan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete scenario");
      }

      setScenarios((prevScenarios) => prevScenarios.filter((sc) => sc.id !== id));
    } catch (error) {
      console.error("Error deleting scenario:", error);
    }
  };

  // Handle the file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.warn("No userId found in localStorage");
      return;
    }
    const selectedFile = e.target.files?.[0];
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileExtension === 'yaml' || fileExtension === 'yml') {
      setFile(selectedFile);
      // You can parse and process the YAML file here
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const yamlContent = event.target?.result as string;
          const parsedYaml = yaml.load(yamlContent) as { [key: string]: any };
          
          console.log("Selected YAML file:", parsedYaml);

          const response = await fetch("http://localhost:5000/api/importplan", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: userId, data : parsedYaml }),
          });
          if (!response.ok) {
            throw new Error("Failed to upload YAML data.");
          }
          const responseData = await response.json();
          console.log("Response from server:", responseData);
  
        } catch (error) {
          console.error("Error parsing YAML:", error);
          alert("Error parsing the YAML file, something is wrong with the file.");
        }
      };

      reader.readAsText(selectedFile);

    } else {
      alert("Please select a valid YAML file.");
    }
  };

  return (
    <div className="page-container">
      <div className="header">
        <div>Scenarios</div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "absolute", right: "40px" }}>
          <div>user</div>
          <img src="/images/user.png" height={80} width={90} />
        </div>
      </div>
      <button
        className="page-buttons"
        style={{ marginTop: "5%", marginLeft: "70%", width: "200px" }}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        Import Plan
      </button>

      {/* Hidden file input */}
      <input
        id="file-input"
        type="file"
        accept=".yaml, .yml"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div className="scenario-grid">
        {scenarios.map((scenario) => (
          <ScenarioItem key={scenario.id} scenario={scenario} onDelete={handleDeleteScenario} />
        ))}
      </div>
    </div>
  );
};

export default Scenario;
