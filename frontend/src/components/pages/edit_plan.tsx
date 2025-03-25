import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import "../css_files/page_style.css";

// Interfaces (same as before)
interface ScenarioData {
id: string;
planId?: string;
name: string;
maritalStatus: "individual" | "couple";
birthYears: number[];
spousebirthyear: number[];
lifeExpectancy: {
    type: string;
    value?: number;
    mean?: number;
    stdev?: number;
}[];
financialGoal: number;
RothConversionOpt: boolean;
RothConversionStart: number;
RothConversionEnd: number;
investments: any[];
investmentTypes?: string[];
eventSeries: any[];
version: number;
inflationAssumption: {
    type: string;
    value: number;
    mean?: number;
    stdev?: number;
};
inflationType: string;
inflationFixed: number;
inflationAmtorPct: string;
inflationMean: number;
inflationStdev: number;
afterTaxContributionLimit: number;
spendingStrategy: any[];
expenseWithdrawalStrategy: any[];
RMDStrategy: any[];
RothConversionStrategy: any[];
residenceState: string;
sharedUsersId: any[];
sharedUserPerms: any[];
createdAt?: string;
}

interface Distribution {
type: string;
value?: number;
mean?: number;
stdev?: number;
}

interface InvestmentTypeData {
_id: string;
name: string;
description: string;
returnAmtOrPct: string;
returnDistribution: Distribution;
incomeAmtOrPct: string;
incomeDistribution: Distribution;
expenseRatio: number;
taxability: boolean;
}

const EditPlan = () => {
    const { id } = useParams();
    const [scenario, setScenario] = useState<ScenarioData | null>(null);
    const [investmentDetails, setInvestmentDetails] = useState<InvestmentTypeData[]>([]);
    const location = useLocation();
    const dateCreated = (location.state as any)?.dateCreated;

    useEffect(() => {
    const fetchScenario = async () => {
        if (!id) return;
        try {
        const response = await fetch(`http://localhost:5000/api/plans/${id}`);
        if (!response.ok) throw new Error("Failed to fetch scenario");
        const result = await response.json();
        setScenario(result.data);
        } catch (error) {
        console.error("Error loading scenario:", error);
        }
    };
    fetchScenario();
    }, [id]);

    useEffect(() => {
    const fetchInvestmentDetails = async () => {
        if (!scenario || !scenario.investmentTypes?.length) return;
        try {
        const promises = scenario.investmentTypes.map((typeId) =>
            fetch(`http://localhost:5000/api/investment-types/${typeId}`).then((res) => res.json())
        );
        const results = await Promise.all(promises);
        setInvestmentDetails(results);
        } catch (error) {
        console.error("Failed to load investment types:", error);
        }
    };
    fetchInvestmentDetails();
    }, [scenario]);

    const handleInputChange = (field: keyof ScenarioData, value: any) => {
    setScenario((prev) => prev ? { ...prev, [field]: value } : prev);
    };

    const handleSave = async () => {
        if (!id || !scenario) return;
        try {
            // Merge updated return/income distribution into scenario.investments
            const updatedInvestments = scenario.investments.map((inv, i) => ({
            ...inv,
            returnDistribution: investmentDetails[i]?.returnDistribution,
            incomeDistribution: investmentDetails[i]?.incomeDistribution,
            }));
        
            // Final updated scenario payload
            const updatedScenario = {
            ...scenario,
            investments: updatedInvestments,
            };
        
            const response = await fetch(`http://localhost:5000/api/plans/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedScenario),
            });
        
            if (!response.ok) throw new Error("Failed to update scenario");
            alert("Scenario updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to update scenario");
        }
        };
        

    if (!scenario) return <div className="page-container">Scenario not found</div>;

    return (
    <div className="page-container">
        <div className="header">
        <div>Scenarios</div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "absolute", right: "40px" }}>
            <div>user</div>
            <img src="/images/user.png" height={80} width={90} />
        </div>
        </div>

        <div className="scenario-container" style={{ width: "70%", height: "auto" }}>
        <div className="split-container">
            <div className="left-container">
            <div className="normal-text">
                Title: <input type="text" value={scenario.name} onChange={(e) => handleInputChange("name", e.target.value)} />
            </div>
            <div className="normal-text">
                Financial Goal: <input type="number" value={scenario.financialGoal} onChange={(e) => handleInputChange("financialGoal", parseInt(e.target.value))} />
            </div>
            </div>
            <div className="right-container">
            <div className="normal-text">
                Plan Type: {scenario.maritalStatus === "couple" ? "Couple" : "Individual"} Plan
            </div>
            <div className="normal-text">
                Date Created: {dateCreated || "N/A"}
            </div>
            </div>
        </div>

        <hr />
        <div className="normal-text" style={{ fontWeight: "bold" }}>Basic Information:</div>
        <div className="normal-text">
            Birth Year: <input type="number" value={scenario.birthYears[0]} onChange={(e) => handleInputChange("birthYears", [parseInt(e.target.value), scenario.birthYears[1]])} />
        </div>
        {scenario.maritalStatus === "couple" && scenario.birthYears[1] && (
            <div className="normal-text">
            Spouse's Birth Year: <input type="number" value={scenario.birthYears[1]} onChange={(e) => handleInputChange("birthYears", [scenario.birthYears[0], parseInt(e.target.value)])} />
            </div>
        )}
        <div className="normal-text">
            Residential State: <input type="text" value={scenario.residenceState} onChange={(e) => handleInputChange("residenceState", e.target.value)} />
        </div>
        <hr/>
        <div className="normal-text" style={{ fontWeight: "bold" }}>Investments:</div>
        {investmentDetails.length === 0 ? (
        <div className="normal-text">No detailed investment data available.</div>
        ) : (
        investmentDetails.map((inv, index) => {
            const meta = scenario.investments[index];
            return (
            <div key={inv._id} style={{ marginBottom: "1rem" }}>
                <div className="normal-text" style={{ fontWeight: "bold" }}>
                {index + 1}. Investment Name: <input type="text" value={inv.name} onChange={(e) => {
                    const updated = [...investmentDetails];
                    updated[index].name = e.target.value;
                    setInvestmentDetails(updated);
                }} />
                </div>
                <div className="normal-text" style={{ marginLeft: "5%" }}>
                <div>
                    Brief Description: <input type="text" value={inv.description} onChange={(e) => {
                    const updated = [...investmentDetails];
                    updated[index].description = e.target.value;
                    setInvestmentDetails(updated);
                    }} />
                </div>
                <div>
                    Investment Type: <input type="text" value={meta?.investmentType} onChange={(e) => {
                    const updated = [...scenario.investments];
                    updated[index].investmentType = e.target.value;
                    handleInputChange("investments", updated);
                    }} />
                </div>
                <div>
                    Current Value: <input type="number" value={meta?.value || 0} onChange={(e) => {
                    const updated = [...scenario.investments];
                    updated[index].value = parseFloat(e.target.value);
                    handleInputChange("investments", updated);
                    }} />
                </div>
                <div>
                    Tax Status: <input type="text" value={meta?.taxStatus || ""} onChange={(e) => {
                    const updated = [...scenario.investments];
                    updated[index].taxStatus = e.target.value;
                    handleInputChange("investments", updated);
                    }} />
                </div>

                <div style={{ marginTop: "1rem" }}>
                    <div>
                    Annual Return Type: <input type="text" value={inv.returnDistribution?.type} onChange={(e) => {
                        const updated = [...investmentDetails];
                        updated[index].returnDistribution.type = e.target.value;
                        setInvestmentDetails(updated);
                    }} />
                    </div>
                    <div>
                    Annual Return Value: <input type="number" value={inv.returnDistribution?.value || 0} onChange={(e) => {
                        const updated = [...investmentDetails];
                        updated[index].returnDistribution.value = parseFloat(e.target.value);
                        setInvestmentDetails(updated);
                    }} />
                    </div>
                    <div>
                    Annual Return Mean: <input type="number" value={inv.returnDistribution?.mean || 0} onChange={(e) => {
                        const updated = [...investmentDetails];
                        updated[index].returnDistribution.mean = parseFloat(e.target.value);
                        setInvestmentDetails(updated);
                    }} />
                    </div>
                    <div>
                    Annual Return Stdev: <input type="number" value={inv.returnDistribution?.stdev || 0} onChange={(e) => {
                        const updated = [...investmentDetails];
                        updated[index].returnDistribution.stdev = parseFloat(e.target.value);
                        setInvestmentDetails(updated);
                    }} />
                    </div>

                    <div style={{ marginTop: "0.5rem" }}>
                    Annual Income Type: <input type="text" value={inv.incomeDistribution?.type} onChange={(e) => {
                        const updated = [...investmentDetails];
                        updated[index].incomeDistribution.type = e.target.value;
                        setInvestmentDetails(updated);
                    }} />
                    </div>
                    <div>
                    Annual Income Value: <input type="number" value={inv.incomeDistribution?.value || 0} onChange={(e) => {
                        const updated = [...investmentDetails];
                        updated[index].incomeDistribution.value = parseFloat(e.target.value);
                        setInvestmentDetails(updated);
                    }} />
                    </div>
                    <div>
                    Annual Income Mean: <input type="number" value={inv.incomeDistribution?.mean || 0} onChange={(e) => {
                        const updated = [...investmentDetails];
                        updated[index].incomeDistribution.mean = parseFloat(e.target.value);
                        setInvestmentDetails(updated);
                    }} />
                    </div>
                    <div>
                    Annual Income Stdev: <input type="number" value={inv.incomeDistribution?.stdev || 0} onChange={(e) => {
                        const updated = [...investmentDetails];
                        updated[index].incomeDistribution.stdev = parseFloat(e.target.value);
                        setInvestmentDetails(updated);
                    }} />
                    </div>
                    
                </div>
                </div>
            </div>
            
            );
        })
        
    )}
    <hr/>
    <div className="normal-text" style={{ fontWeight: "bold" }}>Life Events:</div>
        {scenario.eventSeries.length === 0 ? (
        <div className="normal-text">No life events added.</div>
        ) : (
        scenario.eventSeries.map((event, index) => (
            <div key={index} style={{ marginBottom: "1rem" }}>
            <div className="normal-text" style={{ fontWeight: "bold" }}>
                {index + 1}. Life Event Name: <input type="text" value={event.name} onChange={(e) => {
                const updated = [...scenario.eventSeries];
                updated[index].name = e.target.value;
                handleInputChange("eventSeries", updated);
                }} />
            </div>
            <div className="normal-text" style={{ marginLeft: "5%" }}>
                <div>
                Description: <input type="text" value={event.description} onChange={(e) => {
                    const updated = [...scenario.eventSeries];
                    updated[index].description = e.target.value;
                    handleInputChange("eventSeries", updated);
                }} />
                </div>

                <div>
                Type: <input type="text" value={event.type} onChange={(e) => {
                    const updated = [...scenario.eventSeries];
                    updated[index].type = e.target.value;
                    handleInputChange("eventSeries", updated);
                }} />
                </div>

                {(event.type === "income" || event.type === "export") && (
                <div>
                    Initial Amount: <input type="number" value={event.initialAmount || 0} onChange={(e) => {
                    const updated = [...scenario.eventSeries];
                    updated[index].initialAmount = parseFloat(e.target.value);
                    handleInputChange("eventSeries", updated);
                    }} />
                </div>
                )}

                {event.changeAmtOrPct && (
                <div>
                    Change is an: <input type="text" value={event.changeAmtOrPct} onChange={(e) => {
                    const updated = [...scenario.eventSeries];
                    updated[index].changeAmtOrPct = e.target.value;
                    handleInputChange("eventSeries", updated);
                    }} />
                </div>
                )}

                <div style={{ marginTop: "0.5rem" }}>
                Start Year Type: <input type="text" value={event.start?.type || ""} onChange={(e) => {
                    const updated = [...scenario.eventSeries];
                    updated[index].start.type = e.target.value;
                    handleInputChange("eventSeries", updated);
                }} />
                <div>
                    Start Year: <input type="number" value={event.start?.value || 0} onChange={(e) => {
                    const updated = [...scenario.eventSeries];
                    updated[index].start.value = parseInt(e.target.value);
                    handleInputChange("eventSeries", updated);
                    }} />
                </div>
                <div>
                    Mean: <input type="number" value={event.start?.mean || 0} onChange={(e) => {
                    const updated = [...scenario.eventSeries];
                    updated[index].start.mean = parseFloat(e.target.value);
                    handleInputChange("eventSeries", updated);
                    }} />
                </div>
                <div>
                    Stdev: <input type="number" value={event.start?.stdev || 0} onChange={(e) => {
                    const updated = [...scenario.eventSeries];
                    updated[index].start.stdev = parseFloat(e.target.value);
                    handleInputChange("eventSeries", updated);
                    }} />
                </div>
                </div>

                {event.duration && (
                <div style={{ marginTop: "0.5rem" }}>
                    Duration Type: <input type="text" value={event.duration.type} onChange={(e) => {
                    const updated = [...scenario.eventSeries];
                    updated[index].duration.type = e.target.value;
                    handleInputChange("eventSeries", updated);
                    }} />
                    <div>
                    Duration (Years): <input type="number" value={event.duration.value || 0} onChange={(e) => {
                        const updated = [...scenario.eventSeries];
                        updated[index].duration.value = parseInt(e.target.value);
                        handleInputChange("eventSeries", updated);
                    }} />
                    </div>
                </div>
                )}

                {event.changeDistribution && (
                <div style={{ marginTop: "0.5rem" }}>
                    Change Distribution Type: <input type="text" value={event.changeDistribution.type} onChange={(e) => {
                    const updated = [...scenario.eventSeries];
                    updated[index].changeDistribution.type = e.target.value;
                    handleInputChange("eventSeries", updated);
                    }} />
                    <div>
                    Value: <input type="number" value={event.changeDistribution.value || 0} onChange={(e) => {
                        const updated = [...scenario.eventSeries];
                        updated[index].changeDistribution.value = parseFloat(e.target.value);
                        handleInputChange("eventSeries", updated);
                    }} />
                    </div>
                </div>
                )}

                <div style={{ marginTop: "0.5rem" }}>
                Inflation Adjusted: <input type="checkbox" checked={event.inflationAdjusted || false} onChange={(e) => {
                    const updated = [...scenario.eventSeries];
                    updated[index].inflationAdjusted = e.target.checked;
                    handleInputChange("eventSeries", updated);
                }} />
                </div>

                <div>
                User Fraction: <input type="number" value={event.userFraction || 0} onChange={(e) => {
                    const updated = [...scenario.eventSeries];
                    updated[index].userFraction = parseFloat(e.target.value);
                    handleInputChange("eventSeries", updated);
                }} />
                </div>

                <div>
                Social Security: <input type="checkbox" checked={event.socialSecurity || false} onChange={(e) => {
                    const updated = [...scenario.eventSeries];
                    updated[index].socialSecurity = e.target.checked;
                    handleInputChange("eventSeries", updated);
                }} />
                </div>

                <div>
                Discretionary: <input type="checkbox" checked={event.discretionary || false} onChange={(e) => {
                    const updated = [...scenario.eventSeries];
                    updated[index].discretionary = e.target.checked;
                    handleInputChange("eventSeries", updated);
                }} />
                </div>
            </div>
        </div>
        ))
    )}

    <button className="page-buttons" onClick={handleSave}>Save</button>
    </div>
    </div>
    
    );
};

export default EditPlan;