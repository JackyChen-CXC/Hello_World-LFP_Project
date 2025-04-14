import yaml from 'js-yaml';
import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css_files/page_style.css";


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
    <div className="scenario-container" style={{borderRadius:"15px"}} onClick={() => navigate(`/scenario/${scenario.id}`, {
      state: { dateCreated: scenario.dateCreated }
    })}>
    
      <div className="normal-text">Title: {scenario.title}</div>
      <div className="normal-text">Plan Type: {scenario.planType}</div>
      <div className="normal-text">Financial Goal: ${scenario.financialGoal}</div>
      <div className="normal-text">Date Created: {scenario.dateCreated}</div>
      <div style={{ display: "flex", marginLeft: "160px", marginTop: "80px" }}>
      <img
          src="/images/edit.png"
          height={50}
          width={50}
          alt="Edit"
          style={{ cursor: "pointer" }}
          onClick={async (e) => {
            e.stopPropagation();
            try {
              const response = await fetch(`http://localhost:5000/api/plans/${scenario.id}`);
              if (!response.ok) throw new Error("Failed to fetch plan details");
              
              const planData = await response.json(); // shape { data: {...actualPlanObject...} }
              
              navigate("/create-plan", {
                state: {
                  formData: planData.data, // <-- pass planData.data instead
                  isEditing: true,
                  planId: scenario.id
                }
              });
            } catch (err) {
              console.error("Failed to load plan for editing", err);
              alert("Could not load the plan for editing.");
            }
          }}
          
          
        />

        <img src="/images/share.png" height={50} width={50} alt="Share" />
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
          alt="Trash"
        />
        <img 
          src="/images/export.png" 
          height={50} 
          width={50} 
          onClick={ async (e) => {
            e.stopPropagation(); // Prevent navigating to scenario details
            try {
              const userId = localStorage.getItem("userId") || "";
              const response = await fetch(`http://localhost:5000/api/export`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId: userId,
                  data: scenario,
                }),
              });
              const data = await response.json();
              
              if (data.status === "SUCCESS") {
                // Create a Blob with the YAML content
                const blob = new Blob([data.data], { type: 'text/yaml' });
                
                // Create a link element and trigger download
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${scenario.id || 'scenario'}.yaml`;
                
                // Append to body, click, and remove
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up the URL object
                URL.revokeObjectURL(link.href);
              } else {
                // Handle export error
                alert('Failed to export scenario: ' + data.message);
              }
            } catch (error) {
              console.error('Error exporting Financial Plan:', error);
              alert('An error occurred while exporting the scenario');
            }
          }}
          style={{ cursor: "pointer" }}
          alt="Export"
        />
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

  // Handle the file selection (Import)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userId = localStorage.getItem("userId") || "";
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
  const username = localStorage.getItem("name");
  const name = localStorage.getItem("given_name");
  const picture = localStorage.getItem("picture")
  return (
    <div className="page-container">
      <div className="header">
        <div>Scenarios</div>
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
