import React, { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../css_files/page_style.css";

interface ScenarioData {
  id: string;
  planId: string;
  name: string;
  maritalStatus: "individual" | "couple";
  currentAge: number[];
  birthYears: number[];
  spouseAge: number;
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

  investments: {
    id: string;
    investmentType: string;
    value: number;
    taxStatus: string;
  }[];

  eventSeries: {
    name: string;
    description: string;
    startYear: number;
    durationYears: number;
    type: string;
    initialAmount?: number;
    changeAmtOrPct?: number;
    changeDistribution?: {
      type: string;
      mean?: number;
      stdev?: number;
      value?: number;
    };
    inflationAdjusted?: boolean;
    assetAllocation?: any;
    glidePath?: boolean;
    assetAllocation2?: any;
    maxCash?: number;
  }[];

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
        setScenario({
          id: result.data._id,
          name: result.data.name,
          maritalStatus: result.data.maritalStatus,
          currentAge:result.data.currentAge,
          birthYears: result.data.birthYears,
          spouseAge: result.data.spouseAge,
          spousebirthyear: result.data.spousebirthyear,
          lifeExpectancy: result.data.lifeExpectancy,
          financialGoal: result.data.financialGoal,
          RothConversionOpt: result.data.RothConversionOpt,
          RothConversionStart: result.data.RothConversionStart,
          RothConversionEnd: result.data.RothConversionEnd,
          investments: result.data.investments,
          eventSeries: result.data.eventSeries,
          version: result.data.version,
          inflationAssumption: result.data.inflationAssumption,
          afterTaxContributionLimit: result.data.afterTaxContributionLimit,
          spendingStrategy: result.data.spendingStrategy,
          expenseWithdrawalStrategy: result.data.expenseWithdrawalStrategy,
          RMDStrategy: result.data.RMDStrategy,
          RothConversionStrategy: result.data.RothConversionStrategy,
          residenceState: result.data.residenceState,
          sharedUsersId: result.data.sharedUsersId,
          sharedUserPerms: result.data.sharedUserPerms,
          createdAt: result.data.createdAt,
        });
      } catch (error) {
        console.error("Error loading scenario:", error);
      }
    };

    fetchScenario();
  }, [id]);

  const capitalizeWords = (str: any) => {
    if (typeof str !== "string") str = String(str); // Convert numbers/null/undefined safely
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };  

  if (!scenario) return <div className="page-container">Scenario not found</div>;

  return (
  <div className="page-container">
    <div className="header" >
      <div>Scenarios</div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "absolute", right: "40px" }}>
        <div>user</div>
        <img src="/images/user.png" height={80} width={90} />
      </div>
    </div>
    <div className="scenario-container" style={{width:"70%", height:"auto"}}> 
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
      <hr/>
      <div className="normal-text" style={{fontWeight:"bold"}}>Basic Information:</div>
      <div className="normal-text">Current Age: <span className="value-text">{scenario.currentAge.join(", ")}</span></div>
      <div className="normal-text">Birth Year: <span className="value-text">{scenario.birthYears.join(", ")}</span></div>
      <div className="normal-text">
        Life Expectancy: {scenario.lifeExpectancy[0]?.type === "fixed"
          ? <span className="value-text">{scenario.lifeExpectancy[0]?.value} years</span>
          : <span className="value-text">Sampled from a normal distribution</span>}
      </div>
      <div className="normal-text">
        Spouse's Current Age:{" "}
        <span className="value-text">
          {scenario.spouseAge !== undefined ? scenario.spouseAge : "N/A"}
        </span>
      </div>

      <div className="normal-text">
        Spouse's Birth Year:{" "}
        <span className="value-text">
          {Array.isArray(scenario.spousebirthyear)
            ? scenario.spousebirthyear.map((entry) => entry.value).join(", ")
            : "N/A"}
        </span>
      </div>
      <hr/>
      {/**investments */}
      <div className="normal-text" style={{ fontWeight: "bold" }}>Investments:</div>
      {scenario.investments.length === 0 ? (
        <div className="normal-text">No investments added</div>
      ) : (
        scenario.investments.map((inv, index) => (
          <div key={inv.id} style={{ marginBottom: "1rem" }}>
            <div className="normal-text" style={{fontWeight:"bold"}}>{index + 1}. Investment Name: {inv.investmentName}</div>
            <div className="normal-text" style={{ marginLeft: "5%" }}>
              <div>Brief Description of Investment: <span className="value-text">{capitalizeWords(inv.investmentDescription)}</span></div>
              <div>Investment Type: <span className="value-text">{capitalizeWords(inv.investmentType)}</span></div>
              <div>Current Value: <span className="value-text">${inv.value}</span></div>
              <div>Account Type: <span className="value-text">{capitalizeWords(inv.accountType)}</span></div>
              <div>Tax Status: <span className="value-text">{inv.taxability}</span></div>
              {/* Annual Return Info */}
              <div>
                Annual Return Type: <span className="value-text">{capitalizeWords(inv.annualReturnType)}</span>
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
              </div>

              {/* Annual Income Info */}
              <div>
                Annual Income Type: <span className="value-text">{capitalizeWords(inv.annualIncomeType)}</span>
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
          </div>
        ))
      )}

      <hr/>
      <div className="normal-text" style={{ fontWeight: "bold" }}>Life Events:</div>
      {scenario.eventSeries.length === 0 ? (
        <div className="normal-text">No life events added.</div>
      ) : (
        scenario.eventSeries.map((event, index) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <div className="normal-text" style={{ fontWeight: "bold" }}> {index + 1}. Life Event Name: {capitalizeWords(event.name)}</div> 
            <div className="normal-text" style={{ marginLeft: "5%" }}>
              <div>Brief Description: <span className="value-text">{capitalizeWords(event.description)}</span></div>
              <div>Life Event Type: <span className="value-text">{capitalizeWords(event.lifeEventType)}</span></div>

              {/* Start Info */}
              <div>
                Start Type: <span className="value-text">{capitalizeWords(event.startType)}</span>
                {event.startType === "startingYear" && (
                  <div>Start Year: <span className="value-text">{event.startYear}</span></div>
                )}
                {event.startType === "normal" && (
                  <>
                    <div>Mean: <span className="value-text">{event.startMean}</span></div>
                    <div>Stdev: <span className="value-text">{event.startStdev}</span></div>
                  </>
                )}
                {event.startType === "startEvent" && (
                  <div>Starts when this event starts: <span className="value-text">{event.startEvent}</span></div>
                )}
                {event.startType === "startEndEvent" && (
                  <div>Starts when this event ends: <span className="value-text">{event.startEndEvent}</span></div>
                )}
              </div>

              <div>Duration (years): <span className="value-text">{event.durationYears}</span></div>

              {/* Annual Change Info */}
              <div>
                Annual Change Type: <span className="value-text">{event.annualChangeType}</span>
                {event.annualChangeType === "fixed" && (
                  <div>Fixed Change: <span className="value-text">{event.annualChangeFixed}%</span></div>
                )}
                {event.annualChangeType === "normal" && (
                  <>
                    <div>Mean Change: <span className="value-text">{event.annualChangeMean}</span></div>
                    <div>Stdev Change: <span className="value-text">{event.annualChangeStdev}</span></div>
                  </>
                )}
              </div>

              {/* Inflation Info */}
              <div>
                Inflation Type: <span className="value-text">{capitalizeWords(event.inflationType)}</span>
                {event.inflationType === "fixed" && (
                  <div>Fixed Inflation: <span className="value-text">{event.inflationFixed}%</span></div>
                )}
                {event.inflationType === "normal" && (
                  <>
                    <div>Mean Inflation: <span className="value-text">{event.inflationMean}</span></div>
                    <div>Stdev Inflation: <span className="value-text">{event.inflationStdev}</span></div>
                  </>
                )}
              </div>

              {/* Other optional flags */}
              {event.inflationAdjusted !== undefined && (
                <div>Inflation Adjusted: <span className="value-text">{event.inflationAdjusted ? "Yes" : "No"}</span></div>
              )}

              {/* Investment-Specific Fields */}
              {event.assetAllocation && (
                <div>
                  Asset Allocation:
                  <ul>
                    {Object.entries(event.assetAllocation).map(([key, value]) => (
                      <li key={key}><span className="value-text">{key}: {value}%</span></li>
                    ))}
                  </ul>
                </div>
              )}
              {event.glidePath !== undefined && (
                <div>Glide Path: <span className="value-text">{event.glidePath ? "Enabled" : "Disabled"}</span></div>
              )}
              {event.assetAllocation2 && (
                <div>
                  Asset Allocation 2:
                  <ul>
                    {Object.entries(event.assetAllocation2).map(([key, value]) => (
                      <li key={key}><span className="value-text">{key}: {value}%</span></li>
                    ))}
                  </ul>
                </div>
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
