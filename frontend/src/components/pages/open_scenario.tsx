import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
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

const OpenScenario = () => {
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


  const capitalizeWords = (str: any) => {
    if (typeof str !== "string") str = String(str);
    return str.replace(/\b\w/g, (char: string) => char.toUpperCase());
  };

  if (!scenario) return <div className="page-container">Scenario not found</div>;

  return (
    <div className="page-container">
      <div className="header">
        <div>Scenarios</div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            right: "40px",
          }}
        >
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
            <div className="normal-text">
              Date Created: {dateCreated || "N/A"}</div>

          </div>
        </div>

        <hr />
        <div className="normal-text" style={{ fontWeight: "bold" }}>Basic Information:</div>
        <div className="normal-text">
          Birth Year:{" "}
          <span className="value-text">{scenario.birthYears.join(", ")}</span>
        </div>
        <div className="normal-text">
          Life Expectancy:{" "}
          {scenario.lifeExpectancy[0]?.type === "fixed" ? (
            <span className="value-text">{scenario.lifeExpectancy[0]?.value} years</span>
          ) : (
            <span className="value-text">Sampled from a normal distribution</span>
          )}
        </div>
        {scenario.maritalStatus === "couple" && scenario.birthYears[1] && (
        <div className="normal-text">
          Spouse's Birth Year:{" "}
          <span className="value-text">{scenario.birthYears[1]}</span>
        </div>
        )}

        <div className="normal-text">
          Residential State:{" "}
          <span className="value-text">{capitalizeWords(scenario.residenceState) || "N/A"}</span>
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
                  {index + 1}. Investment Name: {capitalizeWords(inv.name || "Unnamed")}
                </div>
                <div className="normal-text" style={{ marginLeft: "5%" }}>
                  {inv.description && (
                    <div>
                      Brief Description:{" "}
                      <span className="value-text">{capitalizeWords(inv.description)}</span>
                    </div>
                  )}
                  <div>
                    Investment Type:{" "}
                    <span className="value-text">{capitalizeWords(meta?.investmentType || "N/A")}</span>
                  </div>
                  <div>
                    Current Value:{" "}
                    <span className="value-text">${meta?.value || 0}</span>
                  </div>
                  <div>
                    Tax Status:{" "}
                    <span className="value-text">{capitalizeWords(meta?.taxStatus || "N/A")}</span>
                  </div>

                  {/* Return & Income Distribution */}
                  <div style={{ marginTop: "1rem" }}>
                    <div>
                      Annual Return Type: <span className="value-text">{inv.returnDistribution?.type}</span>
                    </div>
                    {inv.returnDistribution?.value !== undefined && (
                      <div>
                        Annual Return Value: <span className="value-text">{inv.returnDistribution.value}</span>
                      </div>
                    )}
                    {inv.returnDistribution?.mean !== undefined && (
                      <div>
                        Annual Return Mean: <span className="value-text">{inv.returnDistribution.mean}</span>
                      </div>
                    )}
                    {inv.returnDistribution?.stdev !== undefined && (
                      <div>
                        Annual Return Stdev: <span className="value-text">{inv.returnDistribution.stdev}</span>
                      </div>
                    )}

                    <div style={{ marginTop: "0.5rem" }}>
                      Annual Income Type: <span className="value-text">{inv.incomeDistribution?.type}</span>
                    </div>
                    {inv.incomeDistribution?.value !== undefined && (
                      <div>
                        Annual Income Value: <span className="value-text">{inv.incomeDistribution.value}</span>
                      </div>
                    )}
                    {inv.incomeDistribution?.mean !== undefined && (
                      <div>
                        Annual Income Mean: <span className="value-text">{inv.incomeDistribution.mean}</span>
                      </div>
                    )}
                    {inv.incomeDistribution?.stdev !== undefined && (
                      <div>
                        Annual Income Stdev: <span className="value-text">{inv.incomeDistribution.stdev}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
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

                {/* Description */}
                <div>
                  Description:{" "}
                  <span className="value-text">{capitalizeWords(event.description)}</span>
                </div>

                {/* Type */}
                <div>
                  Type: <span className="value-text">{capitalizeWords(event.type)}</span>
                </div>

                {/* Show Initial Amount if it's an income or export-type event */}
                {(event.type === "income" || event.type === "export") && (
                  <div>
                    Initial Amount:{" "}
                    <span className="value-text">${event.initialAmount}</span>
                  </div>
                )}

                {/* Change Amount/Percentage */}
                {event.changeAmtOrPct && (
                  <div>
                    Change is an:{" "}
                    <span className="value-text">{capitalizeWords(event.changeAmtOrPct)}</span>
                  </div>
                )}

                {/* Start Year */}
                <div style={{ marginTop: "0.5rem" }}>
                  Start Year Type: <span className="value-text">{event.start?.type}</span>
                  {event.start?.value !== undefined && (
                    <div>
                      Start Year: <span className="value-text">{event.start.value}</span>
                    </div>
                  )}
                  {event.start?.mean !== undefined && (
                    <div>
                      Mean: <span className="value-text">{event.start.mean}</span>
                    </div>
                  )}
                  {event.start?.stdev !== undefined && (
                    <div>
                      Stdev: <span className="value-text">{event.start.stdev}</span>
                    </div>
                  )}
                </div>

                {/* Duration */}
                {event.duration && (
                  <div style={{ marginTop: "0.5rem" }}>
                    Duration Type: <span className="value-text">{event.duration.type}</span>
                    {event.duration.value !== undefined && (
                      <div>
                        Duration (Years):{" "}
                        <span className="value-text">{event.duration.value} Years</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Change Distribution */}
                {event.changeDistribution && (
                  <div style={{ marginTop: "0.5rem" }}>
                    Change Distribution Type:{" "}
                    <span className="value-text">{event.changeDistribution.type}</span>
                    {event.changeDistribution.value !== undefined && (
                      <div>
                        Value: <span className="value-text">{event.changeDistribution.value}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Inflation Adjusted */}
                {event.inflationAdjusted !== undefined && (
                  <div style={{ marginTop: "0.5rem" }}>
                    Inflation Adjusted:{" "}
                    <span className="value-text">{event.inflationAdjusted ? "Yes" : "No"}</span>
                  </div>
                )}

                {/* User Fraction */}
                {event.userFraction !== undefined && (
                  <div>
                    User Fraction: <span className="value-text">{event.userFraction}</span>
                  </div>
                )}

                {/* Social Security */}
                {event.socialSecurity !== undefined && (
                  <div>
                    Social Security:{" "}
                    <span className="value-text">{event.socialSecurity ? "Yes" : "No"}</span>
                  </div>
                )}

                {/* Discretionary */}
                {event.discretionary !== undefined && (
                  <div>
                    Discretionary:{" "}
                    <span className="value-text">{event.discretionary ? "Yes" : "No"}</span>
                  </div>
                )}

                {/* Scenario-level inflation assumption info */}
                <div className="normal-text" style={{ marginTop: "0.5rem" }}>
                  Inflation Assumption:{" "}
                  <span className="value-text">
                    {capitalizeWords(scenario.inflationAssumption.type)}
                  </span>
                </div>
                {scenario.inflationAssumption.type === "fixed" ? (
                  <div className="normal-text">
                    Inflation (Fixed):{" "}
                    <span className="value-text">{scenario.inflationAssumption.value}%</span>
                  </div>
                ) : scenario.inflationAssumption.type === "normal" ? (
                  <>
                    <div className="normal-text">
                      Inflation (Normal - Mean):{" "}
                      <span className="value-text">{scenario.inflationAssumption.mean}%</span>
                    </div>
                    <div className="normal-text">
                      Inflation (Normal - Std Dev):{" "}
                      <span className="value-text">{scenario.inflationAssumption.stdev}%</span>
                    </div>
                  </>
                ) : (
                  <div className="normal-text">
                    Inflation Type:{" "}
                    <span className="value-text">{capitalizeWords(scenario.inflationType)}</span>
                  </div>
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
