import React, { useState } from "react";
import "../css_files/page_style.css";
import "../css_files/collapsible.css";

const CreatePlan = () => {
  const defaultFormData = {
    planName: "",
    planType: "",
    currentAge: "",
    birthYear: "",
    spouseAge: "",
    spouseBirthYear: "",
    lifeExpectancyRadio: "",
    lifeExpectancyYears: "",
  
    rothConversion: "",
    rothStartYear: "",
    rothEndYear: "",
  
    financialGoal: "",
    investments: [
      {
        id: 1,
        isExpanded: false,
        investmentType: "",
        investmentName: "",
        investmentDescription: "",
        annualReturnType: "",
        annualReturnFixed: "",
        annualReturnMean: "",
        annualReturnStdev: "",
        annualReturnDrift: "",
        annualReturnVolatility: "",
        annualIncomeType: "",
        annualIncomeFixed: "",
        annualIncomeMean: "",
        annualIncomeStdev: "",
        annualIncomeDrift: "",
        annualIncomeVolatility: "",
        taxability: "",
        taxFile: null,
        accountType: "",
      },
    ],
    lifeEvents: [
      {
        id: 1,
        isExpanded: false,
        lifeEventType: "",
        eventName: "",
        eventDescription: "",
        startType: "",
        startYear: "",
        startMean: "",
        startStdev: "",
        startEvent: "",
        startEndEvent: "",
        duration: "",
        annualChangeType: "",
        annualChangeFixed: "",
        annualChangeMean: "",
        annualChangeStdev: "",
        inflationType: "",
        inflationFixed: "",
        inflationMean: "",
        inflationStdev: "",
      },
    ],
  };
  const [formData, setFormData] = useState(defaultFormData);

  
  // -----------------------------------------------------BASIC INFO STUFF   -----------------------------------------------------//
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // -----------------------------------------------------INVESTMENT STUFF  -----------------------------------------------------//
  // Toggle expand/collapse
  const toggleInvestment = (index) => {
    setFormData((prevData) => {
      const newInvestments = [...prevData.investments];
      newInvestments[index].isExpanded = !newInvestments[index].isExpanded;
      return {
        ...prevData,
        investments: newInvestments,
      };
    });
  };

  //Add a new investment
  const handleAddInvestment = () => {
    setFormData((prevData) => ({
      ...prevData,
      investments: [
        ...prevData.investments,
        {
          id: prevData.investments.length + 1,
          isExpanded: false,
          investmentType: "",
          investmentName: "",
          investmentDescription: "",
          annualReturnType: "",
          annualReturnFixed: "",
          annualReturnMean: "",
          annualReturnStdev: "",
          annualReturnDrift: "",
          annualReturnVolatility: "",
          annualIncomeType: "",
          annualIncomeFixed: "",
          annualIncomeMean: "",
          annualIncomeStdev: "",
          annualIncomeDrift: "",
          annualIncomeVolatility: "",
          taxability: "",
          taxFile: null,
          accountType: "",
        },
      ],
    }));
  };

  // Delete an investment
  const handleDeleteInvestment = (id) => {
    setFormData((prevData) => ({
      ...prevData,
      investments: prevData.investments.filter((inv) => inv.id !== id),
    }));
  };

  // Update fields within an investment
  const handleInvestmentChange = (index, e) => {
    const { name, value, type, files } = e.target;
    setFormData((prevData) => {
      const newInvestments = [...prevData.investments];
      // If it's a file input, store the file object
      newInvestments[index][name] = type === "file" ? files[0] : value;
      return {
        ...prevData,
        investments: newInvestments,
      };
    });
  };

  // ----------------------------------------------------- LIFE EVENT STUFF -----------------------------------------------------//
 
  const toggleLifeEvents = (index) => {
    setFormData((prevData) => {
      const newLifeEvents = [...prevData.lifeEvents];
      newLifeEvents[index].isExpanded = !newLifeEvents[index].isExpanded;
      return {
        ...prevData,
        lifeEvents: newLifeEvents,
      };
    });
  };

  // Add a new life event
  const handleAddLifeEvents = () => {
    setFormData((prevData) => ({
      ...prevData,
      lifeEvents: [
        ...prevData.lifeEvents,
        {
          id: prevData.lifeEvents.length + 1,
          isExpanded: false,
          lifeEventType: "",
          eventName: "",
          eventDescription: "",
          startType: "",
          startYear: "",
          startMean: "",
          startStdev: "",
          startEvent: "",
          startEndEvent: "",
          duration: "",
          annualChangeType: "",
          annualChangeFixed: "",
          annualChangeMean: "",
          annualChangeStdev: "",
          inflationType: "",
          inflationFixed: "",
          inflationMean: "",
          inflationStdev: "",
        },
      ],
    }));
  };

  // Delete a life event
  const handleDeleteLifeEvents = (id) => {
    setFormData((prevData) => ({
      ...prevData,
      lifeEvents: prevData.lifeEvents.filter((ev) => ev.id !== id),
    }));
  };

  // Update fields within a life event
  const handleLifeEventChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newLifeEvents = [...prevData.lifeEvents];
      newLifeEvents[index][name] = value;
      return {
        ...prevData,
        lifeEvents: newLifeEvents,
      };
    });
  };

  const transformFormData = (formData) => {
    return {
      userId: localStorage.getItem("userId") || "",
      name: formData.planName,
      maritalStatus: formData.planType === "joint" ? "couple" : "individual",
      currentAge:
        formData.planType === "joint"
          ? [parseInt(formData.currentAge), parseInt(formData.spouseAge || "0")]
          : [parseInt(formData.currentAge)],
      birthYears:
        formData.planType === "joint"
          ? [parseInt(formData.birthYear), parseInt(formData.spouseBirthYear || "0")]
          : [parseInt(formData.birthYear)],
      spousebirthyear:
        formData.planType === "joint"
          ? [{ type: "fixed", value: parseInt(formData.spouseBirthYear || "0") }]
          : [{ type: "fixed", value: 0 }],
  
      lifeExpectancy: [
        formData.lifeExpectancyRadio === "yes"
          ? { type: "fixed", value: parseInt(formData.lifeExpectancyYears) }
          : { type: "normal", mean: 90, stdev: 10 },
      ],
      financialGoal: parseFloat(formData.financialGoal || 0),
      RothConversionOpt: formData.rothConversion === "yes",
      RothConversionStart: parseInt(formData.rothStartYear || "0"),
      RothConversionEnd: parseInt(formData.rothEndYear || "0"),
  
      investments: formData.investments.map((inv) => ({
        id: inv.id.toString(),
        investmentType: inv.investmentType,
        investmentName: inv.investmentName || "",
        investmentDescription: inv.investmentDescription || "",
        annualReturnType: inv.annualReturnType || undefined,
        annualReturnFixed: parseFloat(inv.annualReturnFixed) || undefined,
        annualReturnMean: parseFloat(inv.annualReturnMean) || undefined,
        annualReturnStdev: parseFloat(inv.annualReturnStdev) || undefined,
        annualReturnDrift: parseFloat(inv.annualReturnDrift) || undefined,
        annualReturnVolatility: parseFloat(inv.annualReturnVolatility) || undefined,
        annualIncomeType: inv.annualIncomeType || undefined,
        annualIncomeFixed: parseFloat(inv.annualIncomeFixed) || undefined,
        annualIncomeMean: parseFloat(inv.annualIncomeMean) || undefined,
        annualIncomeStdev: parseFloat(inv.annualIncomeStdev) || undefined,
        annualIncomeDrift: parseFloat(inv.annualIncomeDrift) || undefined,
        annualIncomeVolatility: parseFloat(inv.annualIncomeVolatility) || undefined,
        taxability: inv.taxability || undefined,
        taxFile: inv.taxFile?.name || undefined,
        accountType: inv.accountType,
        taxStatus: inv.accountType,
        value: 0,
      })),
  
      eventSeries: formData.lifeEvents.map((event) => ({
        id: event.id.toString(),
        lifeEventType: event.lifeEventType,
        name: event.eventName,
        description: event.eventDescription,
        startType: event.startType,
        startYear: parseInt(event.startYear || "0"),
        startMean: parseFloat(event.startMean || "0"),
        startStdev: parseFloat(event.startStdev || "0"),
        startEvent: event.startEvent || undefined,
        startEndEvent: event.startEndEvent || undefined,
        durationYears: parseInt(event.duration || "0"),
  
        annualChangeType: event.annualChangeType || undefined,
        annualChangeFixed: parseFloat(event.annualChangeFixed || "0"),
        annualChangeMean: parseFloat(event.annualChangeMean || "0"),
        annualChangeStdev: parseFloat(event.annualChangeStdev || "0"),
  
        inflationType: event.inflationType || undefined,
        inflationFixed: parseFloat(event.inflationFixed || "0"),
        inflationMean: parseFloat(event.inflationMean || "0"),
        inflationStdev: parseFloat(event.inflationStdev || "0"),
  
        inflationAdjusted: ["income", "expense"].includes(event.lifeEventType)
          ? true
          : undefined,
        userFraction: ["income", "expense"].includes(event.lifeEventType) ? 1 : undefined,
        socialSecurity: event.lifeEventType === "income" ? false : undefined,
        discretionary: event.lifeEventType === "expense" ? true : undefined,
  
        assetAllocation:
          ["invest", "rebalance"].includes(event.lifeEventType) && event.lifeEventType !== ""
            ? { sampleAsset: 100 }
            : undefined,
        glidePath: event.lifeEventType === "invest" ? true : undefined,
        assetAllocation2: event.lifeEventType === "invest" ? { sampleAsset: 100 } : undefined,
        maxCash: event.lifeEventType === "invest" ? 10000 : undefined,
      })),
  
      investmentTypes: [],
      inflationAssumption: { type: "fixed", value: 0.02 },
      afterTaxContributionLimit: 6500,
      spendingStrategy: [],
      expenseWithdrawalStrategy: [],
      RMDStrategy: [],
      RothConversionStrategy: [],
      residenceState: "NY",
      sharedUsersId: [],
      sharedUserPerms: [],
      version: 1,
    };
  };
  
  
  const handleSubmit = async () => {
    const payload = transformFormData(formData); 
    try {
      const res = await fetch("http://localhost:5000/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        throw new Error("Failed to save plan");
      }
  
      const result = await res.json();
      console.log("Plan saved:", result);
      alert("Plan saved successfully!");
      setFormData(JSON.parse(JSON.stringify(defaultFormData)));
    } catch (error) {
      console.error("Error submitting plan:", error);
      alert("There was an error. Check the console for details.");
    }
  };
  
  

  // ----------------------------------------------------- HTML STUFF -----------------------------------------------------//
  return (
    <div className="page-container">
      {/* ------------------ Header ------------------ */}
      <div className="header">
        <div>Create Plan</div>
        <div style={{display:"flex", justifyContent:"center", alignItems:"center" ,position: "absolute", right: "40px"}}>
          <div>user</div>
          <img src="/images/user.png" height={80} width={90} />
        </div>
      </div>

      {/* ------------------------------------------Basic Information------------------------------------------ */}
      <div className="subheading">Basic Information</div>
      <div className="question">
        {/* Plan Name */}
        <div className="normal-text">Name Your Plan*</div>
        <input
          className="input-boxes"
          type="text"
          name="planName"
          value={formData.planName}
          onChange={handleChange}
        />

        {/* Plan Type */}
        <div className="normal-text">Plan Type*</div>
        <div className="checkbox-group normal-text">
          <label>
            <input
              type="radio"
              name="planType"
              value="individual"
              checked={formData.planType === "individual"}
              onChange={handleChange}
            />
            Individual Plan
          </label>
          <label>
            <input
              type="radio"
              name="planType"
              value="joint"
              checked={formData.planType === "joint"}
              onChange={handleChange}
            />
            Joint Plan
          </label>
        </div>

        {/* Current Age & Birth Year */}
        <div className="split-container">
          <div className="left-side">
            <div className="normal-text">Current Age*</div>
            <input
              className="input-boxes"
              type="text"
              name="currentAge"
              value={formData.currentAge}
              onChange={handleChange}
            />
          </div>
          <div className="right-side">
            <div className="normal-text">What Year Were You Born*</div>
            <input
              className="input-boxes"
              type="text"
              name="birthYear"
              value={formData.birthYear}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Spouse's Age & Birth Year (only for joint plan) */}
        {formData.planType === "joint" && (
          <div className="split-container">
            <div className="left-side">
              <div className="normal-text">Spouse's Current Age*</div>
              <input
                className="input-boxes"
                type="text"
                name="spouseAge"
                value={formData.spouseAge || ""}
                onChange={handleChange}
              />
            </div>
            <div className="right-side">
              <div className="normal-text">Spouse's Birth Year*</div>
              <input
                className="input-boxes"
                type="text"
                name="spouseBirthYear"
                value={formData.spouseBirthYear || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {/* Life Expectancy Radio */}
        <div className="normal-text">
          Would you like to specify a life expectancy or sample it from a normal
          distribution?
        </div>
        <div className="split-container">
          <div className="left-side">
            <label className="normal-text">
              <input
                type="radio"
                name="lifeExpectancyRadio"
                value="yes"
                checked={formData.lifeExpectancyRadio === "yes"}
                onChange={handleChange}
              />
              Yes
            </label>
            <label className="normal-text">
              <input
                type="radio"
                name="lifeExpectancyRadio"
                value="no"
                checked={formData.lifeExpectancyRadio === "no"}
                onChange={handleChange}
              />
              No, Use a Sample
            </label>
          </div>
          {/* If yes, show numeric input */}
          <div className="right-side">
            {formData.lifeExpectancyRadio === "yes" && (
              <input
                className="input-boxes"
                type="text"
                name="lifeExpectancyYears"
                placeholder="Enter Life Expectancy in Years"
                value={formData.lifeExpectancyYears}
                onChange={handleChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------Investments & Savings------------------------------------------ */}
      <div className="subheading">Investments & Savings</div>
      <div className="normal-text">What is your financial goal?*</div>
      <input
        className="input-boxes"
        type="text"
        name="financialGoal"  
        value={formData.financialGoal}  
        onChange={handleChange}  
      />
      {formData.investments.map((investment, index) => (
        <div
          key={investment.id}
          className={`collapse-container ${investment.isExpanded ? "expanded" : ""}`}
        >
          {/* Collapsible Header */}
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
              {/* Investment Type */}
              <div className="split-container">
                <div className="left-side">
                  <div className="normal-text">Select Investment Type*</div>
                  <select
                    className="collapse-options"
                    name="investmentType"
                    value={investment.investmentType}
                    onChange={(e) => handleInvestmentChange(index, e)}
                  >
                    <option value="">--Select--</option>
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
                  {/* Name */}
                  <div className="normal-text">Name of Investment*</div>
                  <input
                    className="input-boxes"
                    type="text"
                    name="investmentName"
                    value={investment.investmentName}
                    onChange={(e) => handleInvestmentChange(index, e)}
                  />
                  {/* Description */}
                  <div className="normal-text">Brief Description of Investment*</div>
                  <textarea
                    className="input-boxes textarea-box"
                    rows="4"
                    name="investmentDescription"
                    value={investment.investmentDescription}
                    onChange={(e) => handleInvestmentChange(index, e)}
                  ></textarea>
                </div>
              </div>

              {/* Annual Return */}
              <div className="normal-text">
                How would you like to express the investment's annual return?*
              </div>
              <div className="split-container">
                <div className="left-side">
                  {/* Radio set: "fixed", "normal", "markov" */}
                  <label className="normal-text">
                    <input
                      type="radio"
                      name="annualReturnType"
                      value="fixed"
                      checked={investment.annualReturnType === "fixed"}
                      onChange={(e) => handleInvestmentChange(index, e)}
                    />
                    Fixed Amount / Percentage
                  </label>
                  <label className="normal-text">
                    <input
                      type="radio"
                      name="annualReturnType"
                      value="normal"
                      checked={investment.annualReturnType === "normal"}
                      onChange={(e) => handleInvestmentChange(index, e)}
                    />
                    Normal Distribution Percentage
                  </label>
                  <label className="normal-text">
                    <input
                      type="radio"
                      name="annualReturnType"
                      value="markov"
                      checked={investment.annualReturnType === "markov"}
                      onChange={(e) => handleInvestmentChange(index, e)}
                    />
                    Markov Process (GBM)
                  </label>
                </div>
                <div className="right-side">
                  {/* If fixed */}
                  {investment.annualReturnType === "fixed" && (
                    <>
                      <div className="normal-text">Fixed Return (Amount or %)</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="annualReturnFixed"
                        placeholder="Enter fixed return..."
                        value={investment.annualReturnFixed}
                        onChange={(e) => handleInvestmentChange(index, e)}
                      />
                    </>
                  )}
                  {/* If normal */}
                  {investment.annualReturnType === "normal" && (
                    <>
                      <div>Mean (%)</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="annualReturnMean"
                        placeholder="Enter mean..."
                        value={investment.annualReturnMean}
                        onChange={(e) => handleInvestmentChange(index, e)}
                      />
                      <div>Standard Deviation (%)</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="annualReturnStdev"
                        placeholder="Enter standard deviation..."
                        value={investment.annualReturnStdev}
                        onChange={(e) => handleInvestmentChange(index, e)}
                      />
                    </>
                  )}
                  {/* If markov */}
                  {investment.annualReturnType === "markov" && (
                    <>
                      <div>Drift (μ)</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="annualReturnDrift"
                        placeholder="Enter drift value..."
                        value={investment.annualReturnDrift}
                        onChange={(e) => handleInvestmentChange(index, e)}
                      />
                      <div>Volatility (σ)</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="annualReturnVolatility"
                        placeholder="Enter volatility..."
                        value={investment.annualReturnVolatility}
                        onChange={(e) => handleInvestmentChange(index, e)}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Annual Income */}
              <br />
              <div className="normal-text">
                What is the expected annual income from dividends or interest?*
              </div>
              <div className="split-container">
                <div className="left-side">
                  <label className="normal-text">
                    <input
                      type="radio"
                      name="annualIncomeType"
                      value="fixed"
                      checked={investment.annualIncomeType === "fixed"}
                      onChange={(e) => handleInvestmentChange(index, e)}
                    />
                    Fixed Amount / Percentage
                  </label>
                  <label className="normal-text">
                    <input
                      type="radio"
                      name="annualIncomeType"
                      value="normal"
                      checked={investment.annualIncomeType === "normal"}
                      onChange={(e) => handleInvestmentChange(index, e)}
                    />
                    Normal Distribution Percentage
                  </label>
                  <label className="normal-text">
                    <input
                      type="radio"
                      name="annualIncomeType"
                      value="markov"
                      checked={investment.annualIncomeType === "markov"}
                      onChange={(e) => handleInvestmentChange(index, e)}
                    />
                    Markov Process (GBM)
                  </label>
                </div>
                <div className="right-side">
                  {/* If fixed */}
                  {investment.annualIncomeType === "fixed" && (
                    <>
                      <div className="normal-text">Fixed Return (Amount or %)</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="annualIncomeFixed"
                        placeholder="Enter fixed return..."
                        value={investment.annualIncomeFixed}
                        onChange={(e) => handleInvestmentChange(index, e)}
                      />
                    </>
                  )}
                  {/* If normal */}
                  {investment.annualIncomeType === "normal" && (
                    <>
                      <div>Mean (%)</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="annualIncomeMean"
                        placeholder="Enter mean..."
                        value={investment.annualIncomeMean}
                        onChange={(e) => handleInvestmentChange(index, e)}
                      />
                      <div>Standard Deviation (%)</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="annualIncomeStdev"
                        placeholder="Enter standard deviation..."
                        value={investment.annualIncomeStdev}
                        onChange={(e) => handleInvestmentChange(index, e)}
                      />
                    </>
                  )}
                  {/* If markov */}
                  {investment.annualIncomeType === "markov" && (
                    <>
                      <div>Drift (μ)</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="annualIncomeDrift"
                        placeholder="Enter drift value..."
                        value={investment.annualIncomeDrift}
                        onChange={(e) => handleInvestmentChange(index, e)}
                      />
                      <div>Volatility (σ)</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="annualIncomeVolatility"
                        placeholder="Enter volatility..."
                        value={investment.annualIncomeVolatility}
                        onChange={(e) => handleInvestmentChange(index, e)}
                      />
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
                    name="taxability"
                    value="taxable"
                    checked={investment.taxability === "taxable"}
                    onChange={(e) => handleInvestmentChange(index, e)}
                  />
                  Taxable
                </label>
                <label className="normal-text">
                  <input
                    type="radio"
                    name="taxability"
                    value="tax-exempt"
                    checked={investment.taxability === "tax-exempt"}
                    onChange={(e) => handleInvestmentChange(index, e)}
                  />
                  Tax-Exempt
                </label>
              </div>

              {/* If taxable, show file input */}
              {investment.taxability === "taxable" && (
                <div>
                  <div className="normal-text"> Upload State Tax File</div>
                  <div style={{ color: "red" }}>
                    (If no file is uploaded, taxes will not be simulated)
                  </div>
                  <input
                    style={{ margin: "1%", fontSize: "16px" }}
                    type="file"
                    name="taxFile"
                    onChange={(e) => handleInvestmentChange(index, e)}
                  />
                  {investment.taxFile && <p>Selected File: {investment.taxFile.name}</p>}
                </div>
              )}

              {/* Account Type */}
              <div className="normal-text">
                What type of account is this investment stored in?*
              </div>
              <select
                className="collapse-options"
                name="accountType"
                value={investment.accountType}
                onChange={(e) => handleInvestmentChange(index, e)}
              >
                <option value="">--Select--</option>
                <option value="non-retirement">Non-Retirement</option>
                <option value="pre-tax">Pre-Tax Retirement</option>
                <option value="after-tax">After-Tax Retirement</option>
              </select>
              <button className="page-buttons" style={{ marginLeft: "85%" }}>
                SAVE
              </button>
            </>
          )}
        </div>
      ))}
      <button className="page-buttons" onClick={handleAddInvestment}>
        ADD
      </button>

      {/* ------------------------------------------Life Events------------------------------------------ */}
      <div className="subheading">Life Events</div>
      {formData.lifeEvents.map((lifeEvent, index) => (
        <div
          key={lifeEvent.id}
          className={`collapse-container ${lifeEvent.isExpanded ? "expanded" : ""}`}
        >
          {/* Collapsible Header */}
          <div className="collapse-heading">
            <div className="collapsed-text">Life Event {lifeEvent.id}</div>
            <button className="collapse-button" onClick={() => toggleLifeEvents(index)}>
              {lifeEvent.isExpanded ? "−" : "+"}
            </button>
            <button
              className="delete-button"
              onClick={() => handleDeleteLifeEvents(lifeEvent.id)}
            >
              x
            </button>
          </div>

          {/* Expanded Content */}
          {lifeEvent.isExpanded && (
            <>
              <div className="split-container">
                <div className="left-side">
                  <div className="normal-text">Select Life Event Type*</div>
                  <select
                    className="collapse-options"
                    name="lifeEventType"
                    value={lifeEvent.lifeEventType}
                    onChange={(e) => handleLifeEventChange(index, e)}
                  >
                    <option value="">--Select--</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="invest">Invest</option>
                    <option value="rebalance">Rebalance</option>
                  </select>
                </div>
                <div className="right-side">
                  <div className="normal-text">Name of Life Event*</div>
                  <input
                    className="input-boxes"
                    type="text"
                    name="eventName"
                    value={lifeEvent.eventName}
                    onChange={(e) => handleLifeEventChange(index, e)}
                  />
                  <div className="normal-text">Brief Description of Life Event*</div>
                  <textarea
                    className="input-boxes textarea-box"
                    rows="4"
                    name="eventDescription"
                    value={lifeEvent.eventDescription}
                    onChange={(e) => handleLifeEventChange(index, e)}
                  ></textarea>
                </div>
              </div>

              {/* Start Date */}
              <div className="normal-text">
                How would you like to express the start date of this event? (select 1)*
              </div>
              <div className="split-container">
                <div className="left-side">
                  <label className="normal-text">
                    <input
                      type="radio"
                      name="startType"
                      value="startingYear"
                      checked={lifeEvent.startType === "startingYear"}
                      onChange={(e) => handleLifeEventChange(index, e)}
                    />
                    Start Year
                  </label>
                  <label className="normal-text">
                    <input
                      type="radio"
                      name="startType"
                      value="normal"
                      checked={lifeEvent.startType === "normal"}
                      onChange={(e) => handleLifeEventChange(index, e)}
                    />
                    Normal Distribution Percentage
                  </label>
                  <label className="normal-text">
                    <input
                      type="radio"
                      name="startType"
                      value="startEvent"
                      checked={lifeEvent.startType === "startEvent"}
                      onChange={(e) => handleLifeEventChange(index, e)}
                    />
                    Start at the Same Time as
                  </label>
                  <label className="normal-text">
                    <input
                      type="radio"
                      name="startType"
                      value="startEndEvent"
                      checked={lifeEvent.startType === "startEndEvent"}
                      onChange={(e) => handleLifeEventChange(index, e)}
                    />
                    Start at the End of
                  </label>
                </div>
                <div className="right-side">
                  {/* If "startingYear" */}
                  {lifeEvent.startType === "startingYear" && (
                    <>
                      <div className="normal-text">Starting Year</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="startYear"
                        placeholder="Enter Starting Year"
                        value={lifeEvent.startYear}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      />
                    </>
                  )}
                  {/* If "startEvent" */}
                  {lifeEvent.startType === "startEvent" && (
                    <>
                      <div className="normal-text">Select Event to Match Start</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="startEvent"
                        placeholder="Which event?"
                        value={lifeEvent.startEvent}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      />
                    </>
                  )}
                  {/* If "startEndEvent" */}
                  {lifeEvent.startType === "startEndEvent" && (
                    <>
                      <div className="normal-text">Select Event to Match End</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="startEndEvent"
                        placeholder="Which event?"
                        value={lifeEvent.startEndEvent}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      />
                    </>
                  )}
                  {/* If "normal" */}
                  {lifeEvent.startType === "normal" && (
                    <>
                      <div>Mean (%)</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="startMean"
                        placeholder="Enter mean..."
                        value={lifeEvent.startMean}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      />
                      <div>Standard Deviation (%)</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="startStdev"
                        placeholder="Enter standard deviation..."
                        value={lifeEvent.startStdev}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Duration */}
              <br />
              <div className="normal-text">What is the duration of this life event?*</div>
              <input
                className="input-boxes"
                type="text"
                name="duration"
                placeholder="Enter Duration in Years"
                value={lifeEvent.duration}
                onChange={(e) => handleLifeEventChange(index, e)}
              />

              {/* Annual Change */}
              <div className="normal-text">
                What is the expected annual change? (select 1)*
              </div>
              <div className="split-container">
                <div className="left-side">
                  <label className="normal-text">
                    <input
                      type="radio"
                      name="annualChangeType"
                      value="fixed"
                      checked={lifeEvent.annualChangeType === "fixed"}
                      onChange={(e) => handleLifeEventChange(index, e)}
                    />
                    Fixed Amount / Percentage
                  </label>
                  <label className="normal-text">
                    <input
                      type="radio"
                      name="annualChangeType"
                      value="normal"
                      checked={lifeEvent.annualChangeType === "normal"}
                      onChange={(e) => handleLifeEventChange(index, e)}
                    />
                    Normal Distribution Percentage
                  </label>
                </div>
                <div className="right-side">
                  {lifeEvent.annualChangeType === "fixed" && (
                    <>
                      <div className="normal-text">Fixed Return (Amount or %)</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="annualChangeFixed"
                        placeholder="Enter fixed return..."
                        value={lifeEvent.annualChangeFixed}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      />
                    </>
                  )}
                  {lifeEvent.annualChangeType === "normal" && (
                    <>
                      <div>Mean (%)</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="annualChangeMean"
                        placeholder="Enter mean..."
                        value={lifeEvent.annualChangeMean}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      />
                      <div>Standard Deviation (%)</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="annualChangeStdev"
                        placeholder="Enter standard deviation..."
                        value={lifeEvent.annualChangeStdev}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Inflation */}
              <div className="normal-text">
                How would you like to adjust for inflation? (select 1)*
              </div>
              <div className="split-container">
                <div className="left-side">
                  <label className="normal-text">
                    <input
                      type="radio"
                      name="inflationType"
                      value="fixed"
                      checked={lifeEvent.inflationType === "fixed"}
                      onChange={(e) => handleLifeEventChange(index, e)}
                    />
                    Fixed Amount / Percentage
                  </label>
                  <label className="normal-text">
                    <input
                      type="radio"
                      name="inflationType"
                      value="normal"
                      checked={lifeEvent.inflationType === "normal"}
                      onChange={(e) => handleLifeEventChange(index, e)}
                    />
                    Normal Distribution Percentage
                  </label>
                </div>
                <div className="right-side">
                  {lifeEvent.inflationType === "fixed" && (
                    <>
                      <div className="normal-text">Fixed Return (Amount or %)</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="inflationFixed"
                        placeholder="Enter fixed return..."
                        value={lifeEvent.inflationFixed}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      />
                    </>
                  )}
                  {lifeEvent.inflationType === "normal" && (
                    <>
                      <div>Mean (%)</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="inflationMean"
                        placeholder="Enter mean..."
                        value={lifeEvent.inflationMean}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      />
                      <div>Standard Deviation (%)</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="inflationStdev"
                        placeholder="Enter standard deviation..."
                        value={lifeEvent.inflationStdev}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Save button for each life event*/}
              <button className="page-buttons" style={{ marginLeft: "85%" }}>
                SAVE
              </button>
            </>
          )}
        </div>
      ))}
      <button className="page-buttons" onClick={handleAddLifeEvents}>
        ADD
      </button>

      {/* ------------------------------------------Roth Conversion Optimization------------------------------------------ */}
      <div className="subheading">Optimization</div>
      <div className="question">
        <div className="normal-text">
          Would you like to apply a Roth Conversion Optimization?
        </div>
        <div className="split-container">
          <div className="left-side">
            <label className="normal-text">
              <input
                type="radio"
                name="rothConversion"
                value="yes"
                checked={formData.rothConversion === "yes"}
                onChange={handleChange}
              />
              Yes
            </label>
            <label className="normal-text">
              <input
                type="radio"
                name="rothConversion"
                value="no"
                checked={formData.rothConversion === "no"}
                onChange={handleChange}
              />
              No
            </label>
          </div>
          <div className="right-side">
            {formData.rothConversion === "yes" && (
              <>
                <input
                  className="input-boxes"
                  type="text"
                  name="rothStartYear"
                  placeholder="Enter Start Year"
                  value={formData.rothStartYear}
                  onChange={handleChange}
                />
                <input
                  className="input-boxes"
                  type="text"
                  name="rothEndYear"
                  placeholder="Enter End Year"
                  value={formData.rothEndYear}
                  onChange={handleChange}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Final Save Button */}
      <button className="page-buttons" onClick={handleSubmit}>
        SAVE
      </button>
    </div>
  );
};

export default CreatePlan;
