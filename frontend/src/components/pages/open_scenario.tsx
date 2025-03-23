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
    userFraction?: number;
    socialSecurity?: boolean;
    discretionary?: boolean;
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
          <div className="normal-text">Title: {scenario.name}</div>
          <div className = "normal-text"> Financial Goal: {scenario.financialGoal}</div>
        </div>
        <div className="right-container">
          <div className="normal-text"> Plan Type: {scenario.maritalStatus}</div>
          <div className="normal-text"> Date Created: {scenario.createdAt}</div>
        </div>
      </div>
      <hr/>
      <div className="normal-text" style={{fontWeight:"bold"}}> Basic Information:</div>
      <div className="normal-text">Current Age: {scenario.currentAge} </div>
      <div className="normal-text">Birth Year: {scenario.birthYears} </div>
      <div className="normal-text">
        Life Expectancy:{" "}
        {scenario.lifeExpectancy[0]?.type === "fixed"
          ? `${scenario.lifeExpectancy[0]?.value} years`
          : "Sampled from a normal distribution"}
      </div>
      <div className="normal-text">Spouse's Current Age: </div>
      <div className="normal-text">Spouse's Birth Year: {scenario.Spousebirthyear}</div>
      <div className="normal-text">Would you like to specify a life expectancy or sample it from a normal distribution?: </div>
      <hr/>
      <div className="normal-text" style={{ fontWeight: "bold" }}>Investments:</div>
      {scenario.investments.length === 0 ? (
        <div className="normal-text">No investments added</div>
      ) : (
        scenario.investments.map((inv, index) => (
          <div key={inv.id} style={{ marginBottom: "1rem" }}>
            <div className="normal-text">{index + 1}. {inv.investmentName}</div>
            <div className="normal-text" style={{ marginLeft: "5%" }}>
              <div>Description: {inv.briefDescription}</div>
              <div>Type: {inv.investmentType}</div>
              <div>Current Value: ${inv.value}</div>
              <div>Tax Status: {inv.taxStatus}</div>
              <div>Account Type: {inv.accountType}</div>

              <div style={{ marginTop: "0.5rem" }}>
                Annual Return:
                {inv.annualReturnType === "fixed" && (
                  <div>Fixed: {inv.annualReturnFixed}%</div>
                )}
                {inv.annualReturnType === "normal" && (
                  <div>Mean: {inv.annualReturnMean}%, Stdev: {inv.annualReturnStdev}%</div>
                )}
                {inv.annualReturnType === "markov" && (
                  <div>Drift: {inv.annualReturnDrift}, Volatility: {inv.annualReturnVolatility}</div>
                )}
              </div>

              <div style={{ marginTop: "0.5rem" }}>
                Annual Income:
                {inv.annualIncomeType === "fixed" && (
                  <div>Fixed: {inv.annualIncomeFixed}%</div>
                )}
                {inv.annualIncomeType === "normal" && (
                  <div>Mean: {inv.annualIncomeMean}%, Stdev: {inv.annualIncomeStdev}%</div>
                )}
                {inv.annualIncomeType === "markov" && (
                  <div>Drift: {inv.annualIncomeDrift}, Volatility: {inv.annualIncomeVolatility}</div>
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
            <div className="normal-text">{index + 1}. {event.name}</div>
            <div className="normal-text" style={{ marginLeft: "5%" }}>
              <div>Description: {event.description}</div>
              <div>Type: {event.type}</div>
              <div>Start Year: {event.startYear}</div>
              <div>Duration (years): {event.durationYears}</div>
              {event.initialAmount !== undefined && <div>Initial Amount: ${event.initialAmount}</div>}
              {event.changeAmtOrPct !== undefined && <div>Annual Change: {event.changeAmtOrPct}</div>}
              {event.changeDistribution && (
                <div>
                  Change Distribution:
                  <ul>
                    <li>Type: {event.changeDistribution.type}</li>
                    {event.changeDistribution.mean !== undefined && <li>Mean: {event.changeDistribution.mean}</li>}
                    {event.changeDistribution.stdev !== undefined && <li>Stdev: {event.changeDistribution.stdev}</li>}
                    {event.changeDistribution.value !== undefined && <li>Value: {event.changeDistribution.value}</li>}
                  </ul>
                </div>
              )}
              {event.inflationAdjusted !== undefined && (
                <div>Inflation Adjusted: {event.inflationAdjusted ? "Yes" : "No"}</div>
              )}
              
              {event.assetAllocation && (
                <div>
                  Asset Allocation:
                  <ul>
                    {Object.entries(event.assetAllocation).map(([key, value]) => (
                      <li key={key}>{key}: {value}%</li>
                    ))}
                  </ul>
                </div>
              )}
              {event.glidePath !== undefined && <div>Glide Path: {event.glidePath ? "Enabled" : "Disabled"}</div>}
              {event.assetAllocation2 && (
                <div>
                  Asset Allocation 2:
                  <ul>
                    {Object.entries(event.assetAllocation2).map(([key, value]) => (
                      <li key={key}>{key}: {value}%</li>
                    ))}
                  </ul>
                </div>
              )}
              {event.maxCash !== undefined && <div>Max Cash: ${event.maxCash}</div>}
            </div>
          </div>
        ))
      )}

    </div>
  </div>
  );
};
export default OpenScenario;

