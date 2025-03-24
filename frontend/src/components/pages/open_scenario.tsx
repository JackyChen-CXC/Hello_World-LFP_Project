import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../css_files/page_style.css";

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
  eventSeries: any[];
  version: number;
  inflationAssumption: {
    type: string;
    value: number;
  };
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

const OpenScenario = () => {
  const { id } = useParams();
  const [scenario, setScenario] = useState<ScenarioData | null>(null);

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

  const capitalizeWords = (str: any) => {
    if (typeof str !== "string") str = String(str);
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
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
            <div className="normal-text">Title: {capitalizeWords(scenario.name)}</div>
            <div className="normal-text">Financial Goal: {scenario.financialGoal}</div>
          </div>
          <div className="right-container">
            <div className="normal-text">Plan Type: {capitalizeWords(scenario.maritalStatus)} Plan</div>
            <div className="normal-text">Date Created: {scenario.createdAt}</div>
          </div>
        </div>

        <hr />
        <div className="normal-text" style={{ fontWeight: "bold" }}>Basic Information:</div>
        <div className="normal-text">Birth Year: <span className="value-text">{scenario.birthYears.join(", ")}</span></div>
        <div className="normal-text">
          Life Expectancy:{" "}
          {scenario.lifeExpectancy[0]?.type === "fixed"
            ? <span className="value-text">{scenario.lifeExpectancy[0]?.value} years</span>
            : <span className="value-text">Sampled from a normal distribution</span>}
        </div>
        <div className="normal-text">
          Spouse's Birth Year:{" "}
          <span className="value-text">
            {Array.isArray(scenario.spousebirthyear)
              ? scenario.spousebirthyear.join(", ")
              : "N/A"}
          </span>
        </div>

        <div className="normal-text">
          Inflation Assumption: <span className="value-text">{capitalizeWords(scenario.inflationAssumption.type)} ({scenario.inflationAssumption.value})</span>
        </div>

        <hr />
        <div className="normal-text" style={{ fontWeight: "bold" }}>Investments:</div>
        {scenario.investments.length === 0 ? (
          <div className="normal-text">No investments added</div>
        ) : (
          scenario.investments.map((inv, index) => (
            <div key={inv.id} style={{ marginBottom: "1rem" }}>
              <div className="normal-text" style={{ fontWeight: "bold" }}>{index + 1}. Investment Name: {capitalizeWords(inv.investmentName)}</div>
              <div className="normal-text" style={{ marginLeft: "5%" }}>
                {inv.investmentDescription && (
                  <div>Brief Description: <span className="value-text">{capitalizeWords(inv.investmentDescription)}</span></div>
                )}
                <div>Investment Type: <span className="value-text">{capitalizeWords(inv.investmentType)}</span></div>
                <div>Current Value: <span className="value-text">${inv.value}</span></div>
                <div>Tax Status: <span className="value-text">{inv.taxStatus}</span></div>

                <div style={{ marginTop: "0.5rem" }}>Annual Return Type: <span className="value-text">{capitalizeWords(inv.annualReturnType)}</span></div>
                {inv.annualReturnType === "fixed" && (
                  <div>Fixed Return: <span className="value-text">{inv.annualReturnFixed}%</span></div>
                )}
                {inv.annualReturnType === "normal" && (
                  <>
                    <div>Mean Return: <span className="value-text">{inv.annualReturnMean}%</span></div>
                    <div>Standard Deviation: <span className="value-text">{inv.annualReturnStdev}%</span></div>
                  </>
                )}
                {inv.annualReturnType === "markov" && (
                  <>
                    <div>Drift (μ): <span className="value-text">{inv.annualReturnDrift}</span></div>
                    <div>Volatility (σ): <span className="value-text">{inv.annualReturnVolatility}</span></div>
                  </>
                )}

                <div style={{ marginTop: "0.5rem" }}>Annual Income Type: <span className="value-text">{capitalizeWords(inv.annualIncomeType)}</span></div>
                {inv.annualIncomeType === "fixed" && (
                  <div>Fixed Income: <span className="value-text">{inv.annualIncomeFixed}%</span></div>
                )}
                {inv.annualIncomeType === "normal" && (
                  <>
                    <div>Mean Income: <span className="value-text">{inv.annualIncomeMean}%</span></div>
                    <div>Standard Deviation: <span className="value-text">{inv.annualIncomeStdev}%</span></div>
                  </>
                )}
                {inv.annualIncomeType === "markov" && (
                  <>
                    <div>Drift (μ): <span className="value-text">{inv.annualIncomeDrift}</span></div>
                    <div>Volatility (σ): <span className="value-text">{inv.annualIncomeVolatility}</span></div>
                  </>
                )}
              </div>
            </div>
          ))
        )}

        <hr />
        <div className="normal-text" style={{ fontWeight: "bold" }}>Life Events:</div>
        {scenario.eventSeries.length === 0 ? (
          <div className="normal-text">No life events added.</div>
        ) : (
          scenario.eventSeries.map((event, index) => (
            <div key={index} style={{ marginBottom: "1rem" }}>
              <div className="normal-text" style={{ fontWeight: "bold" }}>
                {index + 1}. Life Event Name: {capitalizeWords(event.name)}
              </div>
              <div className="normal-text" style={{ marginLeft: "5%" }}>
                <div>Description: <span className="value-text">{capitalizeWords(event.description)}</span></div>
                <div>Type: <span className="value-text">{capitalizeWords(event.type)}</span></div>

                {/* Start Year */}
                <div>
                  Start Year Type: <span className="value-text">{event.startYear?.type}</span>
                  {event.startYear?.value !== undefined && (
                    <div>Start Year: <span className="value-text">{event.startYear.value}</span></div>
                  )}
                  {event.startYear?.mean !== undefined && (
                    <div>Mean: <span className="value-text">{event.startYear.mean}</span></div>
                  )}
                  {event.startYear?.stdev !== undefined && (
                    <div>Stdev: <span className="value-text">{event.startYear.stdev}</span></div>
                  )}
                </div>

                {/* Duration */}
                {event.durationYears && (
                  <div>
                    Duration Type: <span className="value-text">{event.durationYears.type}</span>
                    {event.durationYears.value !== undefined && (
                      <div>Duration (Years): <span className="value-text">{event.durationYears.value}</span></div>
                    )}
                  </div>
                )}

                {/* Change Distribution */}
                {event.changeDistribution && (
                  <div>
                    Change Distribution Type: <span className="value-text">{event.changeDistribution.type}</span>
                    {event.changeDistribution.value !== undefined && (
                      <div>Value: <span className="value-text">{event.changeDistribution.value}</span></div>
                    )}
                  </div>
                )}

                {/* Inflation */}
                {event.inflationAdjusted !== undefined && (
                  <div>Inflation Adjusted: <span className="value-text">{event.inflationAdjusted ? "Yes" : "No"}</span></div>
                )}
                {event.maxCash !== undefined && (
                  <div>Max Cash: <span className="value-text">${event.maxCash}</span></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OpenScenario;
