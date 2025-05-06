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
  isShared?: boolean;
  sharedAcess?: "view" | "edit"
}

const ScenarioItem: FC<{ scenario: ScenarioData; onDelete: (id: string) => void ;refresh: ()=> void}> = ({ scenario, onDelete,refresh }) => {
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
        {(scenario.sharedAccess !== "view") && (
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
                
                const planData = await response.json(); 
                
                navigate("/create-plan", {
                  state: {
                    formData: planData.data, 
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
        )}

        <img 
          src="/images/share.png" 
          height={50} 
          width={50} 
          alt="Share"
          style={{ cursor: "pointer" }}
          onClick={async (e) => {
            e.stopPropagation();
            
            try {
              // First, check if this plan is already shared with anyone
              const sharedUsersResponse = await fetch(`http://localhost:5000/api/users/shared-with/${scenario.id}`);
              const sharedUsersResult = await sharedUsersResponse.json();
              const sharedUsers = sharedUsersResult.data || [];
              
              if (sharedUsers.length > 0) {
                // If the plan is already shared, ask if the user wants to share with more people or stop sharing
                const userList = sharedUsers.map(user => `- ${user.email || user.username}`).join('\n');
                const actionChoice = window.confirm(
                  `This plan is currently shared with:\n${userList}\n\nClick OK to share with another user or Cancel to manage sharing.`
                );
                
                if (actionChoice) {
                  // Share with another user
                  shareWithNewUser();
                
                } else {
                    const userList = sharedUsers.map(user => `- ${user.email || user.username}`).join('\n');
                    const manageAction = prompt(
                      `This plan is currently shared with:\n${userList}\n\nEnter:\n1 to delete a user\n2 to manage view/edit access.`
                    );

                    if (manageAction === "1") {
                      const emailToRemove = prompt(
                        `Enter the email of the user you want to stop sharing with:\n${userList}`
                      );
                      if (!emailToRemove) return;

                      const stopSharingResponse = await fetch(`http://localhost:5000/api/users/stop-sharing`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          email: emailToRemove,
                          planId: scenario.id
                        }),
                      });

                      if (stopSharingResponse.ok) {
                        alert(`Plan is no longer shared with ${emailToRemove}`);
                      } else {
                        alert("Failed to stop sharing.");
                      }
                    } else if (manageAction === "2") {
                      
                      const accessLevel = prompt(
                        `Set access level for all shared users:\nType "edit" for edit access or "view" for view-only access.`
                      );
                    
                      
                      if (accessLevel === "edit" || accessLevel === "view") {
                        try {
                          for (const user of sharedUsers) {
                            const email = user.email;
                      
                            const response = await fetch(`http://localhost:5000/api/users/update-access`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                email: email,
                                planId: scenario.id,
                                accessLevel: accessLevel
                              }),
                            });
                      
                            if (!response.ok) {
                              throw new Error(`Failed to update access for ${email}`);
                            }
                          }
                      
                          alert(`Access level for all shared users set to "${accessLevel}"`);
                          refresh(); 
                        } catch (err) {
                          console.error("Error updating access levels:", err);
                          alert("There was a problem setting access levels. Please try again.");
                        }
                      
                      
                      } else {
                        alert("Invalid input. Please type either 'edit' or 'view'.");
                      }
                    }
                }
              } else {
                // If the plan is not shared, directly ask for a user to share with
                shareWithNewUser();
              }
            } catch (error) {
              console.error("Error managing plan sharing:", error);
              // Fall back to just sharing with a new user
              shareWithNewUser();
            }
            
            // Helper function to share with a new user
            async function shareWithNewUser() {
              // Prompt user to enter an email address to share with
              const email = prompt("Enter email address to share with:");
              if (!email) return;
              
              // Check if user is trying to share with themselves
              const currentUserEmail = localStorage.getItem("username");
              if (email.toLowerCase() === currentUserEmail?.toLowerCase()) {
                alert("You cannot share a plan with yourself.");
                return;
              }
              
              console.log(`Sharing plan "${scenario.title}" (ID: ${scenario.id}) with user ${email}`);
              
              try {
                // Update the user's sharedPlans array with this plan ID
                const response = await fetch(`http://localhost:5000/api/users/share-plan`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    email: email,
                    planId: scenario.id
                  }),
                });
                
                if (response.ok) {
                  console.log(`Successfully shared plan with user ${email}`);
                  alert(`Plan shared with user ${email}`);
                } else {
                  throw new Error("Failed to share plan");
                }
              } catch (error) {
                console.error("Error sharing plan:", error);
                alert("Failed to share plan. Please try again.");
              }
            }
          }}
        />
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
  const [file, setFile] = useState<File | null>(null);
  const [planId, setPlanId] = useState<string>('');
  const [actionMode, setActionMode] = useState<'view' | 'edit'>('view');
  const navigate = useNavigate();

  const fetchScenarios = async () => {
    const userId = localStorage.getItem("userId");
  
    if (!userId) {
      console.warn("No userId found in localStorage");
      return;
    }
  
    try {
      // Fetch owned plans
      const response = await fetch("http://localhost:5000/api/plans/all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
  
      if (!response.ok) throw new Error("Failed to fetch owned plans");
  
      const result = await response.json();
      const ownedPlans = result.data || [];
      
      // Fetch user's shared plans
      const sharedResponse = await fetch(`http://localhost:5000/api/users/shared-plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      
      let sharedPlans = [];
      if (sharedResponse.ok) {
        const sharedResult = await sharedResponse.json();
        sharedPlans = sharedResult.data || [];
      }
      
      // Combine owned and shared plans
      const allPlans = [...ownedPlans, ...sharedPlans];
      
      // Format all plans for display
      const formatted = allPlans.map((item: any, index: number) => ({
        id: item._id || index,
        title: (item.name || "Untitled Plan") + (item.isShared ? " (Shared)" : ""),
        planType: item.maritalStatus === "couple" ? "Joint" : "Individual",
        financialGoal: item.financialGoal?.toString() || "N/A",
        dateCreated: new Date(item.createdAt || Date.now()).toLocaleDateString(),
        isShared: !!item.isShared,
        sharedAccess: item.sharedUserPerms?.[0] || undefined
      }));
  
      setScenarios(formatted);
    } catch (error) {
      console.error("Error loading scenarios:", error);
    }
  };
  useEffect(() => {
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
          await fetchScenarios();
  
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

  const handlePlanAction = async () => {
    if (!planId.trim()) {
      alert('Please enter a valid plan ID');
      return;
    }

    try {
      // Fetch the plan details first regardless of mode
      const response = await fetch(`http://localhost:5000/api/plans/${planId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch plan details");
      }
      
      const planData = await response.json();
      const plan = planData.data;
      
      // Log the plan name to console
      console.log(`Plan ID: ${planId}, Name: ${plan.name}`);
      
      if (actionMode === 'edit') {
        // Navigate to edit page
        navigate("/create-plan", {
          state: {
            formData: plan,
            isEditing: true,
            planId: planId
          }
        });
      } else {
        // View mode - navigate to the scenario page
        navigate(`/scenario/${planId}`);
      }
    } catch (error) {
      console.error(`Error ${actionMode === 'edit' ? 'editing' : 'viewing'} plan:`, error);
      alert(`Failed to ${actionMode} plan. Please check the plan ID and try again.`);
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
                style={{ cursor: "pointer", borderRadius: "50%" }} 
                className="transparent-hover"
                onClick={() => navigate("/profile")} />
            </>
          ) : (
            <div>Guest</div>
          )}
        </div>
      </div>

      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <button
          className="page-buttons"
          style={{ width: '200px' }}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          Import Plan
        </button>
      </div>

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
          <ScenarioItem key={scenario.id} scenario={scenario} onDelete={handleDeleteScenario} refresh={fetchScenarios} />
        ))}
      </div>
    </div>
  );
};

export default Scenario;
