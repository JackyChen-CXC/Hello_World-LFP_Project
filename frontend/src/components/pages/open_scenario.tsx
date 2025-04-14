import { useEffect, useState } from "react";
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

  //used ChatGPT to help fetch investment Type lists
  useEffect(() => {
    const fetchInvestmentDetails = async () => {
      if (!scenario || !scenario.investments?.length) return;
  
      try {
        const uniqueTypeIds = Array.from(
          new Set(scenario.investments.map((inv) => inv.investmentType))
        );
  
        const promises = uniqueTypeIds.map((typeId) =>
          fetch(`http://localhost:5000/api/investment-types/id/${typeId}`).then((res) =>
            res.json()
          )
        );
  
        const results = await Promise.all(promises);
  
        // Map results by _id for quick lookup
        const investmentMap: Record<string, InvestmentTypeData> = {};
        results.forEach((item) => {
          investmentMap[item._id] = item;
        });
  
        setInvestmentDetails(Object.values(investmentMap));
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

  const DistributionDisplay = ({ label, distribution }: { label: string, distribution: Distribution }) => (
    <>
      <div className="scenario-info-container">
        <div>{label} Type:</div>
        <div>{capitalizeWords(distribution.type)}</div>
      </div>
      {distribution.value !== undefined && (
        <div className="scenario-info-container">
          <div>{label} Value:</div>
          <div>{distribution.value}</div>
        </div>
      )}
      {distribution.mean !== undefined && (
        <div className="scenario-info-container">
          <div>{label} Mean:</div>
          <div>{distribution.mean}</div>
        </div>
      )}
      {distribution.stdev !== undefined && (
        <div className="scenario-info-container">
          <div>{label} Stdev:</div>
          <div>{distribution.stdev}</div>
        </div>
      )}
    </>
  );
  

  
  if (!scenario) return <div className="page-container">Scenario not found</div>;

  {/**-----------------------------------HTML------------------------------------------------------ */}
  const username = localStorage.getItem("name");
  const name = localStorage.getItem("given_name");
  const picture = localStorage.getItem("picture")
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
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "absolute", right: "40px" }}>
        {username ? (
            <>
              <div style={{ margin: 20 }}>{username}</div>
              <img src={picture} height={60} width={60} alt="User" 
              style={{ cursor: "pointer",borderRadius: "50%" }} 
              className="transparent-hover"
               />
            </>
          ) : (
            <div>Guest</div>
          )}
        </div>
        </div>
      </div>

      {/**-----------------------------------Title------------------------------------------------------ */}
      <div className="scenario-container" style={{ width: "70%", height: "auto" }}>
        <div className="split-container">
          <div className="left-container">
            <div className="normal-text" style={{ fontWeight: "bold" }}>Title: {capitalizeWords(scenario.name)}</div>
            <div className="normal-text" style={{ fontWeight: "bold" }}>Financial Goal: ${scenario.financialGoal}</div>
          </div>
          <div className="right-container">
            <div className="normal-text" style={{ fontWeight: "bold" }}>Plan Type: {capitalizeWords(scenario.maritalStatus)} Plan</div>
            <div className="normal-text" style={{ fontWeight: "bold" }}>
              Date Created: {dateCreated || "N/A"}</div>

          </div>
        </div>

        <hr />
        {/**-----------------------------------Basic Info------------------------------------------------------ */}
        <div className="normal-text" style={{ fontWeight: "bold" }}>Basic Information:</div>

        <div className="scenario-info-container">
          <div>Birth Year:</div>
          <div>{scenario.birthYears[0]}</div>
        </div>
        
        <div className="scenario-info-container">
          Life Expectancy:
          {scenario.lifeExpectancy[0]?.type === "fixed" ? (
            <div>{scenario.lifeExpectancy[0]?.value} Years</div>
          ) : (
            <div >Sampled from a normal distribution</div>
          )}
        </div>
        
        {scenario.maritalStatus === "couple" && scenario.birthYears[1] && (
          <>
          <div className="scenario-info-container">
            Spouse's Birth Year:
            <div >{scenario.birthYears[1]}</div>
          </div>
          <div className="scenario-info-container">
            Spouse's Life Expectancy:
          <div >{scenario.lifeExpectancy[1]?.value} Years</div>
        </div>
          </>
        )}

        <div className="scenario-info-container">
          Residential State:{" "}
          <div >{capitalizeWords(scenario.residenceState) || "N/A"}</div>
        </div>
        <hr/>
        {/**-----------------------------------Investment Types------------------------------------------------------ */}
        <div className="normal-text" style={{ fontWeight: "bold" }}>Investment Types:</div>
        {scenario.investments.length === 0 ? (
          <div className="normal-text">No investment type data available.</div>
        ) : (
          scenario.investments.map((meta, index) => {
            const inv = investmentDetails.find(
              (item) => item._id === meta.investmentType
            );

            return (
              <div key={meta.investmentType + index} style={{ marginBottom: "1rem" }}>
                <div className="normal-text" style={{ fontWeight: "bold" }}>
                  {index + 1}. {capitalizeWords(inv?.name || "Unnamed")}
                </div>

                <div className="normal-text" style={{ marginLeft: "5%" }}>
                  {inv?.description && (
                    <div className="scenario-info-container" >
                      Brief Description:
                      <div style={{ width: "400px", textAlign: "right", wordWrap: "break-word" }}>
                        <div>{capitalizeWords(inv.description)}</div>
                      </div>
                    </div>
                  )}

                  {/* Return & Income Distribution */}
                  {inv?.returnDistribution && (
                    <DistributionDisplay
                      label="Annual Return"
                      distribution={inv.returnDistribution}
                    />
                  )}

                  {inv?.incomeDistribution && (
                    <DistributionDisplay
                      label="Annual Income"
                      distribution={inv.incomeDistribution}
                    />
                  )}
                  {inv && (
                    <div className="scenario-info-container">
                      Taxability:
                      <div>{inv.taxability ? "True" : "False"}</div>
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
        <hr />

        {/**-----------------------------------Investments------------------------------------------------------ */}
        <div className="normal-text" style={{ fontWeight: "bold" }}>Investments:</div>
        {scenario.investments.length === 0 ? (
          <div className="normal-text">No investment data available.</div>
        ) : (
          scenario.investments.map((meta, index) => {
            const inv = investmentDetails.find(
              (item) => item._id === meta.investmentType
            );

            return (
              <div key={meta.investmentType + index} style={{ marginBottom: "1rem" }}>
                <div className="normal-text" style={{ fontWeight: "bold" }}>
                  {index + 1}. {capitalizeWords(meta?.id || "Unnamed")}
                </div>

                <div className="scenario-info-container">
                  Investment Type:
                  <div>{capitalizeWords(inv?.name || "N/A")}</div>
                </div>

                <div className="scenario-info-container">
                  Current Value:
                  <div>${meta?.value || 0}</div>
                </div>

                <div className="scenario-info-container">
                  Tax Status:
                  <div>{capitalizeWords(meta?.taxStatus || "N/A")}</div>
                </div>
              </div>
            );
          })
        )}
        <hr />

        {/**-----------------------------------Event Seriess------------------------------------------------------ */}
        <div className="normal-text" style={{ fontWeight: "bold" }}>Event Seriess:</div>
        {scenario.eventSeries.length === 0 ? (
        <div className="normal-text">No Event Seriess added.</div>
        ) : (
          scenario.eventSeries.map((event, index) => (
            <div key={index} style={{ marginBottom: "1rem" }}>
              <div className="normal-text" style={{ fontWeight: "bold" }}>
                {index + 1}.{capitalizeWords(event.name)}
              </div>
              <div className="normal-text" style={{ marginLeft: "5%" }}>

                <div className="scenario-info-container">
                  Brief Description:{" "}
                  <div >{capitalizeWords(event.description)}</div>
                </div>

                <div className="scenario-info-container">
                  Type: <div >{capitalizeWords(event.type)}</div>
                </div>

                {(event.type === "income" || event.type === "export") && (
                  <div className="scenario-info-container">
                    Initial Amount:{" "}
                    <div >${event.initialAmount}</div>
                  </div>
                )}

                {/**not done, missing change amount */}
                {event.changeAmtOrPct && (
                  <div className="scenario-info-container">
                    Annual Change is Expressed As a:{" "}
                    <div >{capitalizeWords(event.changeAmtOrPct)}</div>
                  </div>
                )}
                <>
                  <div className="scenario-info-container">
                    <div>Start Year Type:</div>
                    <div>{capitalizeWords(event.start?.type)}</div>
                  </div>

                  {event.start?.value !== undefined && (
                    <div className="scenario-info-container">
                      <div>Start Year:</div>
                      <div>{event.start.value}</div>
                    </div>
                  )}

                  {event.start?.mean !== undefined && (
                    <div className="scenario-info-container">
                      <div>Mean:</div>
                      <div>{event.start.mean}</div>
                    </div>
                  )}

                  {event.start?.stdev !== undefined && (
                    <div className="scenario-info-container">
                      <div>Stdev:</div>
                      <div>{event.start.stdev}</div>
                    </div>
                  )}
                </>

                {event.duration && (
                <>
                  <div className="scenario-info-container">
                    <div>Duration Type:</div>
                    <div>{capitalizeWords(event.duration.type)}</div>
                  </div>

                  {event.duration.value !== undefined && (
                    <div className="scenario-info-container">
                      <div>Duration (Years):</div>
                      <div>{event.duration.value} Years</div>
                    </div>
                  )}
                </>
              )}

              {event.changeDistribution && (
                <>
                  <div className="scenario-info-container">
                    <div>Change Distribution Type:</div>
                    <div>{capitalizeWords(event.changeDistribution.type)}</div>
                  </div>

                  {event.changeDistribution.value !== undefined && (
                    <div className="scenario-info-container">
                      <div>Value:</div>
                      <div>{event.changeDistribution.value}</div>
                    </div>
                  )}
                </>
              )}

                {event.inflationAdjusted !== undefined && (
                  <div className="scenario-info-container">
                    Inflation Adjusted:{" "}
                    <div >{event.inflationAdjusted ? "Yes" : "No"}</div>
                  </div>
                )}

                {event.userFraction !== undefined && (
                  <div className="scenario-info-container">
                    User Fraction: <div >{event.userFraction}</div>
                  </div>
                )}

                {event.socialSecurity !== undefined && (
                  <div className="scenario-info-container">
                    Social Security:{" "}
                    <div >{event.socialSecurity ? "Yes" : "No"}</div>
                  </div>
                )}

                {event.discretionary !== undefined && (
                  <div className="scenario-info-container">
                    Discretionary:{" "}
                    <div >{event.discretionary ? "Yes" : "No"}</div>
                  </div>
                )}

                <>
                <div className="scenario-info-container" style={{ marginTop: "0.5rem" }}>
                  <div>Inflation Assumption:</div>
                  <div>{capitalizeWords(scenario.inflationAssumption.type)}</div>
                </div>

                {scenario.inflationAssumption.type === "fixed" ? (
                  <div className="scenario-info-container">
                    <div>Inflation (Fixed):</div>
                    <div>{scenario.inflationAssumption.value}%</div>
                  </div>
                ) : scenario.inflationAssumption.type === "normal" ? (
                  <>
                    <div className="scenario-info-container">
                      <div>Inflation (Normal - Mean):</div>
                      <div>{scenario.inflationAssumption.mean}%</div>
                    </div>
                    <div className="scenario-info-container">
                      <div>Inflation (Normal - Std Dev):</div>
                      <div>{scenario.inflationAssumption.stdev}%</div>
                    </div>
                  </>
                ) : (
                  <div className="scenario-info-container">
                    <div>Inflation Type:</div>
                    <div>{capitalizeWords(scenario.inflationType)}</div>
                  </div>
                )}
              </>
                

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OpenScenario;
