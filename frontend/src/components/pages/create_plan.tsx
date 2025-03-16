import React, { useState } from "react";
import '../css_files/page_style.css';
import '../css_files/collapsible.css';

const CreatePlan = () => {
  const [investments, setInvestments] = useState([{ id: 1, isExpanded: false }]); // Investment list
  const [selectedAnnualReturn, setSelectedAnnualReturn] = useState("");
  const [selectedAnnualIncome, setSelectedAnnualIncome] = useState("");
  const [selectedTaxability, setSelectedTaxability] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [selectedLifeExpectancy, setSelectedLifeExpectancy] = useState(""); 

  const returnOptions = [
    { value: "fixed", label: "Fixed Amount / Percentage" },
    { value: "normal", label: "Normal Distribution Percentage" },
    { value: "markov", label: "Markov Process (GBM)" },
  ];

  // Handle File Upload
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Toggle individual investment expansion
  const toggleInvestment = (index) => {
    setInvestments(investments.map((inv, i) =>
      i === index ? { ...inv, isExpanded: !inv.isExpanded } : inv
    ));
  };

  // Add a new investment section
  const handleAddInvestment = () => {
    setInvestments([...investments, { id: investments.length + 1, isExpanded: false }]);
  };

  const handleDeleteInvestment = (id) => {
    setInvestments(investments.filter((investment) => investment.id !== id));
  };

  return (
    <div className="page-container">
      <div className="header">
        <div>Create Plan</div>
        <div>user</div>
      </div>

      {/* ------------------------------------------Basic Information------------------------------------------ */}
      <div className="subheading">Basic Information</div>
      <div className="question"> 
        <div className="normal-text">Name Your Plan*</div>
        <input className="input-boxes" type="text" />

        <div className="normal-text">Plan Type*</div>
        <div className="checkbox-group normal-text">
          <label>
            <input type="radio" name="planType" value="individual" />
            Individual Plan
          </label>
          <label>
            <input type="radio" name="planType" value="joint" />
            Joint Plan
          </label>
        </div>

        <div className="split-container">
          <div className="left-side">
            <div className="normal-text">Current Age*</div>
            <input className="input-boxes" type="text" />
          </div>
          <div className="right-side">
            <div className="normal-text">What Year Were You Born*</div>
            <input className="input-boxes" type="text" />
          </div>
        </div>

        <div className="normal-text">Would you like to specify a life expectancy or sample it from a normal distribution?</div>
        <div className="split-container">
          <div className="left-side">
            <label className="normal-text">
              <input type="radio" name="lifeExpectancy" value="yes" 
                checked={selectedLifeExpectancy === "yes"} 
                onChange={() => setSelectedLifeExpectancy("yes")}
              />
              Yes
            </label>
            <label className="normal-text">
              <input type="radio" name="lifeExpectancy" value="no" 
                checked={selectedLifeExpectancy === "no"} 
                onChange={() => setSelectedLifeExpectancy("no")}
              />
              No, Use a Sample
            </label>
          </div>
          <div className="right-side">
            {selectedLifeExpectancy === "yes" && (
              <input className="input-boxes" type="text" placeholder="Enter Life Expectancy in Years" />
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------Investments & Savings------------------------------------------ */}
      <div className="subheading">Investments & Savings</div>
      {investments.map((investment, index) => (
        <div key={investment.id} className={`collapse-container ${investment.isExpanded ? "expanded" : ""}`}>
          <div className="collapse-heading">
            <div className="collapsed-text">Investment {investment.id}</div>
            <button className="collapse-button" onClick={() => toggleInvestment(index)}>
              {investment.isExpanded ? "−" : "+"}
            </button>
            <button className="delete-button" onClick={() => handleDeleteInvestment(investment.id)}>
              x
            </button>
          </div>

          {investment.isExpanded && (
            <>
              <div className="split-container">
                <div className="left-side">
                  <div className="normal-text">Select Investment Type*</div>
                  <select className="collapse-options" name={`investmentType-${investment.id}`}>
                    <option value="domestic-stocks">Domestic Stocks</option>
                    <option value="foreign-stocks">Foreign Stocks</option>
                    <option value="bonds">Bonds</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="cash-other">Cash & Other</option>
                    <option value="investments">Investments</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="right-side"> 
                  <div className="normal-text"> Name of Investment*</div>
                  <input className="input-boxes" type="text" />
                  <div className="normal-text"> Brief Description of Investment*</div>
                  <textarea className="input-boxes textarea-box" rows="4"></textarea>
                </div>
              </div>

              {/* Annual Return Section */}
              <div className="normal-text">How would you like to express the investment's annual return?*</div>
              <div className="split-container">
                <div className="left-side">
                  {returnOptions.map((option) => (
                    <label key={option.value} className="normal-text">
                      <input
                        type="radio"
                        name={`annualReturn-${investment.id}`}
                        value={option.value}
                        checked={selectedAnnualReturn === option.value}
                        onChange={() => setSelectedAnnualReturn(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                <div className="right-side">
                  {selectedAnnualReturn === "fixed" && (
                    <>
                      <div className="normal-text">Fixed Return (Amount or %)</div>
                      <input className="input-boxes" type="text" placeholder="Enter fixed return..." />
                    </>
                  )}
                  {selectedAnnualReturn === "normal" && (
                    <>
                      <div>Mean (%)</div>
                      <input className="input-boxes" type="text" placeholder="Enter mean..." />

                      <div>Standard Deviation (%)</div>
                      <input className="input-boxes" type="text" placeholder="Enter standard deviation..." />
                    </>
                  )}
                  {selectedAnnualReturn === "markov" && (
                    <>
                      <div>Drift (μ)</div>
                      <input className="input-boxes" type="text" placeholder="Enter drift value..." />

                      <div>Volatility (σ)</div>
                      <input className="input-boxes" type="text" placeholder="Enter volatility..." />
                    </>
                  )}
                </div>
              </div>
              <br/>

              {/* Annual Income Section */}
              <div className="normal-text">What is the expected annual income from dividends or interest?*</div>
              <div className="split-container">
                <div className="left-side">
                  {returnOptions.map((option) => (
                    <label key={option.value} className="normal-text">
                      <input
                        type="radio"
                        name="annualIncome"
                        value={option.value}
                        checked={selectedAnnualIncome === option.value}
                        onChange={() => setSelectedAnnualIncome(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                <div className="right-side">
                  {selectedAnnualIncome === "fixed" && (
                    <>
                      <div className="normal-text">Fixed Return (Amount or %)</div>
                      <input className="input-boxes" type="text" placeholder="Enter fixed return..." />
                    </>
                  )}
                  {selectedAnnualIncome === "normal" && (
                    <>
                      <div>Mean (%)</div>
                      <input className="input-boxes" type="text" placeholder="Enter mean..." />
      
                      <div>Standard Deviation (%)</div>
                      <input className="input-boxes" type="text" placeholder="Enter standard deviation..." />
                    </>
                  )}
                  {selectedAnnualIncome === "markov" && (
                    <>
                      <div>Drift (μ)</div>
                      <input className="input-boxes" type="text" placeholder="Enter drift value..." />
      
                      <div>Volatility (σ)</div>
                      <input className="input-boxes" type="text" placeholder="Enter volatility..." />
                    </>
                  )}
                </div>
              </div>

              {/* Taxability Section */}
              <div className="normal-text">Is this investment taxable?*</div>
              <div className="checkbox-group">
                <label className="normal-text">
                  <input
                    type="radio"
                    name={`taxability-${investment.id}`}
                    value="taxable"
                    checked={selectedTaxability === "taxable"}
                    onChange={() => setSelectedTaxability("taxable")}
                  />
                  Taxable
                </label>
                <label className="normal-text">
                  <input
                    type="radio"
                    name={`taxability-${investment.id}`}
                    value="tax-exempt"
                    checked={selectedTaxability === "tax-exempt"}
                    onChange={() => setSelectedTaxability("tax-exempt")}
                  />
                  Tax-Exempt
                </label>
              </div>

              {selectedTaxability === "taxable" && (
                <div>
                  <div className="normal-text"> Upload State Tax File</div>
                  <div style={{ color: "red" }}> (If no file is uploaded, taxes will not be simulated)</div>
                  <input style={{ margin: "1%", fontSize: "16px" }} type="file" onChange={handleFileChange} />
                  {selectedFile && <p>Selected File: {selectedFile.name}</p>}
                </div>
              )}

              <div className="normal-text">What type of account is this investment stored in?*</div>
              <select className="collapse-options" name={`accountType-${investment.id}`}>
                <option value="non-retirement">Non-Retirement</option>
                <option value="pre-tax">Pre-Tax Retirement</option>
                <option value="after-tax">After-Tax Retirement</option>
              </select>
            </>
          )}
        </div>
      ))}

      {/* ➕ ADD Investment Button */}
      <button className="page-buttons" onClick={handleAddInvestment}> ADD</button>

      {/* ------------------------------------------Life Events------------------------------------------ */}
      <div className="subheading">Life Events</div>

      {/* ------------------------------------------Roth Conversion Optimization------------------------------------------ */}
      <div className="subheading">Optimization</div>
      <div className="question">
        <div className="normal-text">Would you like to apply a Roth Conversion Optimization?</div>
      </div>
    </div>
  );
};

export default CreatePlan;
