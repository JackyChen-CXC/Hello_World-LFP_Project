// Here's the entire final code (CreatePlan.jsx). It includes the full UI from your original snippet plus the fixed code for strategies.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css_files/collapsible.css";
import "../css_files/page_style.css";


const CreatePlan = () => {
  const defaultFormData = {
    planName: "",
    planType: "",
    birthYear: "",
    residentState:"",
    spouseBirthYear: "",
    lifeExpectancyRadio: "",
    lifeExpectancyYears: "",
    spouselifeExpectancyRadio: "",
    spouselifeExpectancyYears: "",
    inflationAssumptionType: "", // fixed, normal, uniform
    inflationAssumptionFixed: "",
    inflationAssumptionMean: "",
    inflationAssumptionStdev: "",
    inflationAssumptionLower: "",
    inflationAssumptionUpper: "",
    afterTaxContributionLimit: "",
    spendingStrategy: "",
    expenseWithdrawalStrategy: "",
    rmdStrategy: "",
    rothConversion: "",
    rothStartYear: "",
    rothEndYear: "",
    rothconversionstrategy: "",
    financialGoal: "",
    investments: [
      {
        id: 1,
        isExpanded: false,
        investmentType: "",
        investmentName: "",
        investmentValue:"",
        investmentDescription: "",
        annualReturnAmtOrPct: "", // "amount" | "percent"
        annualReturnType: "", // fixed, normal, uniform,
        annualReturnFixed: "",
        annualReturnMean: "",
        annualReturnStdev: "",
        annualReturnLower: "",
        annualReturnUpper: "",
        annualIncomeAmtOrPct: "", // "amount" | "percent"
        annualIncomeType: "", // fixed, normal, uniform
        annualIncomeFixed: "",
        annualIncomeMean: "",
        annualIncomeStdev: "",
        annualIncomeLower: "",
        annualIncomeUpper: "",
        taxability: "",
        taxFile: null,
        accountType: "", // "non-retirement", "pre-tax", or "after-tax"
      },
    ],
    lifeEvents: [
      {
        id: 1,
        isExpanded: false,
        type: "",
        eventName: "",
        eventDescription: "",
        startType: "", // fixed, normal, uniform, startWith, Endwhen
        start: "",
        startMean: "",
        startStdev: "",
        startMax: "",
        startMin: "",
        startLower: "",
        startUpper: "",
        startEvent: "",
        startEndEvent: "",
        durationType: "", // fixed, normal, uniform
        durationYear: "",
        durationMean: "",
        durationStdev: "",
        durationLower: "",
        durationUpper: "",
        annualChangeAmtOrPct: "", // "amount" | "percent"
        annualChangeType: "", // fixed, normal, uniform
        annualChangeFixed: "",
        annualChangeMean: "",
        annualChangeStdev: "",
        annualChangeLower: "",
        annualChangeUpper: "",
        inflationAdjusted: "",
        userFraction: "",
        changeDistribution: { type: "", value: "", mean: "", stdev: "" },
        assetAllocation: { Stocks: "", Bonds: "", Cash: "" },
        assetAllocation2: { Stocks: "", Bonds: "" },
        glidePath: false,
        maxCash: ""

        // delete
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
          investmentValue:"",
          investmentDescription: "",
          annualReturnType: "",
          annualReturnFixed: "",
          annualReturnMean: "",
          annualReturnStdev: "",
          annualReturnLower: "",
          annualReturnUpper: "",
          annualIncomeType: "",
          annualIncomeFixed: "",
          annualIncomeMean: "",
          annualIncomeStdev: "",
          annualIncomeLower: "",
          annualIncomeUpper: "",
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
  
    if (name === "investmentType") {
      // Immediate state update so the dropdown reflects the user's selection
      const newInvestments = [...formData.investments];
      newInvestments[index] = {
        ...newInvestments[index],
        investmentType: value,
      };
      setFormData((prevData) => ({
        ...prevData,
        investments: newInvestments,
      }));
    
      // Optional: fetch additional data about the investment type
      fetch(`http://localhost:5000/api/investment-types/${value}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched investment type data:", data);
          // You could populate more fields here if needed
        })
        .catch((err) => {
          console.error("Failed to fetch investment type data:", err);
        });
    
      return;
    }
    
  
  
    const newInvestments = [...formData.investments];
    const nameWithoutIndex = name.replace(/-\d+$/, ""); 
    newInvestments[index][nameWithoutIndex] = type === "file" ? files[0] : value;
  
    setFormData((prevData) => ({
      ...prevData,
      investments: newInvestments,
    }));
  };
  
  

  //upload state tax file to backend
  const upload_state_tax_file = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
  
    // Validate file type
    const allowedTypes = ['.yaml', '.yml'];
    const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedTypes.includes(fileExt)) {
      alert('Only YAML files are allowed');
      return;
    }
  
    const formData = new FormData();
    formData.append("taxFile", file);
  
    try {
      const response = await fetch("/api/upload-state-tax", {
        method: "POST",
        body: formData,
      });
  
      const result = await response.json();
      
      if (response.ok) {
        console.log("File uploaded successfully", result);
      } else {
        console.error("Upload failed:", result.error);
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
    } finally {
      e.target.value = '';
    }
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
          type: "",
          eventName: "",
          eventDescription: "",
          startType: "",
          start: "",
          startMean: "",
          startStdev: "",
          startMax: "",
          startMin: "",
          startLower: "",
          startUpper: "",
          startEvent: "",
          startEndEvent: "",
          duration: "",
          annualChangeAmtOrPct: "", // "amount" | "percent"
          annualChangeType: "",
          annualChangeFixed: "",
          annualChangeMean: "",
          annualChangeStdev: "",
          annualChangeLower: "",
          annualChangeUpper: "",
          inflationAdjusted: "",
          userFraction: "",
          assetAllocation: { Stocks: "", Bonds: "", Cash: "" },
          assetAllocation2: { Stocks: "", Bonds: "" },
          glidePath: false,
          maxCash: ""
          // delete
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

  const handleLifeEventChange = (index, e) => {
    const { name, value, type, checked } = e.target;
  
    const newLifeEvents = [...formData.lifeEvents];
  
    // Remove the "-0", "-1", etc. suffix from names like "changeDistribution.type-0"
    const cleanName = name.replace(/-\d+$/, "");
    const [parentKey, childKey] = cleanName.split(".");
  
    if (childKey) {
      // It's a nested field like "changeDistribution.type"
      newLifeEvents[index][parentKey] = {
        ...(newLifeEvents[index][parentKey] || {}),
        [childKey]: value,
      };
    } else {
      // Simple top-level field (e.g. "annualChangeType")
      newLifeEvents[index][cleanName] = type === "checkbox" ? checked : value;
    }
  
    setFormData((prevData) => ({
      ...prevData,
      lifeEvents: newLifeEvents,
    }));
  };
  
  
  const transformFormData = (formData) => {
    const isJoint = formData.planType === "joint";
  
    return {
      userId: localStorage.getItem("userId") || "",
      name: formData.planName,
      maritalStatus: isJoint ? "couple" : "individual",
      birthYears: isJoint
        ? [parseInt(formData.birthYear), parseInt(formData.spouseBirthYear || "0")]
        : [parseInt(formData.birthYear)],
      lifeExpectancy: isJoint
        ? [
            formData.lifeExpectancyRadio === "yes"
              ? { type: "fixed", value: parseInt(formData.lifeExpectancyYears) }
              : { type: "normal", mean: 90, stdev: 10 },
            formData.spouseLifeExpectancyRadio === "yes"
              ? { type: "fixed", value: parseInt(formData.spouseLifeExpectancyYears) }
              : { type: "normal", mean: 90, stdev: 10 },
          ]
        : [
            formData.lifeExpectancyRadio === "yes"
              ? { type: "fixed", value: parseInt(formData.lifeExpectancyYears) }
              : { type: "normal", mean: 90, stdev: 10 },
          ],
  
          inflationAssumption: (() => {
            const firstEvent = formData.lifeEvents?.[0];
            const changeDist = firstEvent?.changeDistribution || { type: "fixed", value: 0 };
          
            const type = changeDist.type || "fixed";
          
            if (type === "fixed") {
              return { type, value: parseFloat(changeDist.value || "0") };
            }
            if (type === "normal") {
              return {
                type,
                mean: parseFloat(changeDist.mean || "0"),
                stdev: parseFloat(changeDist.stdev || "0"),
              };
            }
          
            return { type: "fixed", value: 0 };
          })(),
          
  
      spendingStrategy: formData.spendingStrategy?.split(",").map((id) => id.trim()) || [],
      expenseWithdrawalStrategy: formData.expenseWithdrawalStrategy?.split(",").map((id) => id.trim()) || [],
      RMDStrategy: formData.rmdStrategy?.split(",").map((id) => id.trim()) || [],
      RothConversionStrategy: formData.rothconversionstrategy?.split(",").map((id) => id.trim()) || [],
  
      financialGoal: parseFloat(formData.financialGoal || "0"),
      RothConversionOpt: formData.rothConversion === "yes",
      RothConversionStart: parseInt(formData.rothStartYear || "0"),
      RothConversionEnd: parseInt(formData.rothEndYear || "0"),
  
      investments: formData.investments.map((inv) => {
        const returnDistribution = (() => {
          const type = inv.annualReturnType || "fixed";
          if (type === "fixed") return { type, value: parseFloat(inv.annualReturnFixed || "0") };
          if (type === "normal") return {
            type,
            mean: parseFloat(inv.annualReturnMean || "0"),
            stdev: parseFloat(inv.annualReturnStdev || "0"),
          };
          if (type === "markov") return {
            type,
            mean: parseFloat(inv.annualReturnDrift || "0"),
            stdev: parseFloat(inv.annualReturnVolatility || "0"),
          };
          return { type: "fixed", value: 0 };
        })();
  
        const incomeDistribution = (() => {
          const type = inv.annualIncomeType || "fixed";
          if (type === "fixed") return { type, value: parseFloat(inv.annualIncomeFixed || "0") };
          if (type === "normal") return {
            type,
            mean: parseFloat(inv.annualIncomeMean || "0"),
            stdev: parseFloat(inv.annualIncomeStdev || "0"),
          };
          if (type === "markov") return {
            type,
            mean: parseFloat(inv.annualIncomeDrift || "0"),
            stdev: parseFloat(inv.annualIncomeVolatility || "0"),
          };
          return { type: "fixed", value: 0 };
        })();
  
        return {
          id: inv.id.toString(),
          investmentName: inv.investmentName || "",
          investmentDescription: inv.investmentDescription || "", 
          investmentType: inv.investmentType || "",
          value: parseFloat(inv.investmentValue || "0"),
          taxStatus: inv.accountType || "non-retirement",
          returnAmtOrPct: inv.annualReturnAmtOrPct || "percent",
          returnDistribution,
          incomeAmtOrPct: inv.annualIncomeAmtOrPct || "percent",
          incomeDistribution,
          taxability: inv.taxability === "taxable",
        };
      }),
  
      eventSeries: formData.lifeEvents.map((event) => {
        const isIncome = event.type === "income";
        const isExpense = event.type === "expense";
        const isInvest = event.type === "invest";
        const isRebalance = event.type === "rebalance";
  
        return {
          id: event.id.toString(),
          type: event.type || "",
          name: event.eventName || "",
          description: event.eventDescription || "",
  
          startYear: (() => {
            const type = event.startType || "fixed";
            if (type === "fixed" || type === "startingYear") return { type: "fixed", value: parseInt(event.start || "0") };
            if (type === "normal") return { type: "normal", mean: parseFloat(event.startMean || "0"), stdev: parseFloat(event.startStdev || "0") };
            if (type === "uniform") return { type: "uniform", lower: parseFloat(event.startMin || "0"), upper: parseFloat(event.startMax || "0") };
            if (type === "startWith" || type === "startEndEvent") return { type, eventSeries: event.startEvent || "" };
            return { type: "fixed", value: 0 };
          })(),
  
          durationYears: {
            type: "fixed",
            value: parseInt(event.duration || "0"),
          },
  
          ...(isIncome || isExpense
            ? {
                initialAmount: parseFloat(event.initialAmount || "0"),
                changeAmtOrPct: event.annualChangeAmtOrPct || "amount",
                changeDistribution: (() => {
                  const type = event.changeDistribution?.type || "fixed";
                
                  if (type === "fixed") {
                    return { type, value: parseFloat(event.changeDistribution?.value || "0") };
                  }
                  if (type === "normal") {
                    return {
                      type,
                      mean: parseFloat(event.changeDistribution?.mean || "0"),
                      stdev: parseFloat(event.changeDistribution?.stdev || "0"),
                    };
                  }
                  return { type: "fixed", value: 0 };
                })(),
                
                inflationAdjusted: true,
                userFraction: parseFloat(event.userPct || "1"),
                socialSecurity: isIncome && event.incomeSource === "socialSecurity",
                discretionary: isExpense && event.expenseSource === "Discretionary",
                inflationType: event.inflationType || "fixed",
                inflationAmtOrPct: event.inflationAmtOrPct || "amount",
                ...(event.inflationType === "fixed"
                  ? { inflationFixed: parseFloat(event.inflationFixed || "0") }
                  : {}),
                ...(event.inflationType === "normal"
                  ? {
                      inflationMean: parseFloat(event.inflationMean || "0"),
                      inflationStdev: parseFloat(event.inflationStdev || "0"),
                    }
                  : {}),
              }
            : {}),
  
          ...(isInvest || isRebalance
            ? {
                assetAllocation: event.assetAllocation || { stocks: 100 },
                glidePath: isInvest ? event.glidePath || false : undefined,
                assetAllocation2: isInvest ? event.assetAllocation2 || { bonds: 100 } : undefined,
                maxCash: isInvest ? parseFloat(event.maxCash || "0") : undefined,
              }
            : {}),
        };
      }),
  
      investmentTypes: [],
      afterTaxContributionLimit: 6500,
      residenceState: "NY",
      sharedUsersId: [],
      sharedUserPerms: [],
      version: 1,
    };
  };
  

  const handleSubmit = async () => {
    const payload = transformFormData(formData);
  
    try {
      const planRes = await fetch("http://localhost:5000/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!planRes.ok) {
        throw new Error("Failed to save plan");
      }
      const createdPlan = await planRes.json(); 
  
      for (const inv of payload.investments) {
        const isTaxable = (inv.taxability === "taxable");
  
        const invTypePayload = {
          planId: createdPlan._id, 
  
          name: inv.investmentName || inv.investmentType || "Untitled", 
          taxability: isTaxable,  
          expenseRatio: 0,       
  
          returnAmtOrPct: inv.returnAmtOrPct,
          returnDistribution: inv.returnDistribution,
          incomeAmtOrPct: inv.incomeAmtOrPct,
          incomeDistribution: inv.incomeDistribution,
        };
  
        const invTypeRes = await fetch("http://localhost:5000/api/investment-types", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invTypePayload),
        });
        if (!invTypeRes.ok) {
          console.error("Failed to create investment type for:", invTypePayload);
        } else {
          const newInvType = await invTypeRes.json();
          console.log("Created investment type:", newInvType);
        }
      }
  
      // 3) Show success
      alert("Plan + InvestmentTypes created successfully!");
      setFormData(JSON.parse(JSON.stringify(defaultFormData)));
  
    } catch (error) {
      console.error("Error submitting plan:", error);
      alert("There was an error. Check the console for details.");
    }
  };
  

  const username = localStorage.getItem("name");
  const name = localStorage.getItem("given_name");
  const picture = localStorage.getItem("picture")
  const navigate = useNavigate()

  const handleAssetAllocationInputChange = (index, e, key) => {
    const { name, value } = e.target;
    const cleanName = name.includes(".") ? name.split(".")[1] : name;
  
    setFormData(prev => {
      const updatedLifeEvents = [...prev.lifeEvents];
      updatedLifeEvents[index] = {
        ...updatedLifeEvents[index],
        [key]: {
          ...updatedLifeEvents[index][key],
          [cleanName]: value
        }
      };
  
      return {
        ...prev,
        lifeEvents: updatedLifeEvents
      };
    });
  };
  
  
  // ----------------------------------------------------- HTML STUFF -----------------------------------------------------//
  return (
    <div className="page-container">
      {/* ------------------ Header ------------------ */}
      <div className="header">
        <div>Create Plan</div>
        <div style={{display:"flex", justifyContent:"center", alignItems:"center" ,position: "absolute", right: "40px"}}>
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
        <div className="normal-text">What Year Were You Born*</div>
        <input
          className="input-boxes"
          type="text"
          name="birthYear"
          value={formData.birthYear}
          onChange={handleChange}
        />

        {/* Life Expectancy Radio */}
        <div className="normal-text">
          Would you like to specify a life expectancy or sample it from a normal distribution?
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

        {/* Spouse's Age & Birth Year (only for joint plan) */}
        {formData.planType === "joint" && (
          <div>
            <div className="normal-text">Spouse's Birth Year*</div>
            <input
              className="input-boxes"
              type="text"
              name="spouseBirthYear"
              value={formData.spouseBirthYear || ""}
              onChange={handleChange}
            />
            {/* Life Expectancy Radio */}
            <div className="normal-text">
              Would you like to specify a life expectancy for your spouse or sample it from a normal distribution?
            </div>
            <div className="split-container">
              <div className="left-side">
                <label className="normal-text">
                  <input
                    type="radio"
                    name="spouseLifeExpectancyRadio"
                    value="yes"
                    checked={formData.spouseLifeExpectancyRadio === "yes"}
                    onChange={handleChange}
                  />
                  Yes
                </label>
                <label className="normal-text">
                  <input
                    type="radio"
                    name="spouseLifeExpectancyRadio"
                    value="no"
                    checked={formData.spouseLifeExpectancyRadio === "no"}
                    onChange={handleChange}
                  />
                  No, Use a Sample
                </label>
              </div>
              {/* If yes, show numeric input */}
              <div className="right-side">
              {formData.spouseLifeExpectancyRadio === "yes" && (
                <input
                  className="input-boxes"
                  type="text"
                  name="spouseLifeExpectancyYears"
                  placeholder="Enter Life Expectancy in Years"
                  value={formData.spouseLifeExpectancyYears}
                  onChange={handleChange}
                />
              )}

              </div>
            </div>
          </div>
          
        )}

        <div className="normal-text ">What state are you in?*</div>
        <input
          className="input-boxes"
          type="text"
          name="residentState"
          value={formData.residentState}
          placeholder="Enter 2 Letter State Acronym"
          onChange={handleChange}
        />

        
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
        {/* Used ChatGPT to help create dynampic Collapsible Header */}
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
            {/* Investment Type, Name, Description */}
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
                <div className="normal-text">Name of Investment*</div>
                <input
                  className="input-boxes"
                  type="text"
                  name="investmentName"
                  value={investment.investmentName}
                  onChange={(e) => handleInvestmentChange(index, e)}
                />
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

            {/* Investment Value */}
            <div className="normal-text">What is the current value of the investment?*</div>
            <input
              className="input-boxes"
              type="text"
              name="investmentValue"
              value={investment.investmentValue}
              onChange={(e) => handleInvestmentChange(index, e)}
            />
            {/**Used ChatGPT to figure out how to dynamically create question forms based on other question form responses */}
            {/* Annual Return Section */}
            <div className="normal-text">How would you like to express the investment's annual return?*</div>
            <div className="split-container">
              <div className="left-side">
                <label className="normal-text">
                  <input
                    type="radio"
                    name={`annualReturnType-${index}`}
                    value="fixed"
                    checked={investment.annualReturnType === "fixed"}
                    onChange={(e) => handleInvestmentChange(index, e)}
                  />
                  Fixed Amount / Percentage
                </label>
                <label className="normal-text">
                  <input
                    type="radio"
                    name={`annualReturnType-${index}`}
                    value="normal"
                    checked={investment.annualReturnType === "normal"}
                    onChange={(e) => handleInvestmentChange(index, e)}
                  />
                  Normal Distribution Percentage
                </label>
                <label className="normal-text">
                  <input
                    type="radio"
                    name={`annualReturnType-${index}`}
                    value="markov"
                    checked={investment.annualReturnType === "markov"}
                    onChange={(e) => handleInvestmentChange(index, e)}
                  />
                  Markov Process (GBM)
                </label>
              </div>
              <div className="right-side">
                {/* Fixed Return */}
                {investment.annualReturnType === "fixed" && (
                  <>
                    <div className="checkbox-group">
                      <label className="normal-text">
                        <input
                          type="radio"
                          name={`annualReturnAmtOrPct-${index}`}
                          value="amount"
                          checked={investment.annualReturnAmtOrPct === "amount"}
                          onChange={(e) => handleInvestmentChange(index, e)}
                        />
                        Fixed Amount
                      </label>
                      <label className="normal-text">
                        <input
                          type="radio"
                          name={`annualReturnAmtOrPct-${index}`}
                          value="percent"
                          checked={investment.annualReturnAmtOrPct === "percent"}
                          onChange={(e) => handleInvestmentChange(index, e)}
                        />
                        Percentage
                      </label>
                    </div>
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

                {/* Normal Return */}
                {investment.annualReturnType === "normal" && (
                  <>
                    <div className="checkbox-group">
                      <label className="normal-text">
                        <input
                          type="radio"
                          name={`annualReturnAmtOrPct-${index}`}
                          value="amount"
                          checked={investment.annualReturnAmtOrPct === "amount"}
                          onChange={(e) => handleInvestmentChange(index, e)}
                        />
                        Fixed Amount
                      </label>
                      <label className="normal-text">
                        <input
                          type="radio"
                          name={`annualReturnAmtOrPct-${index}`}
                          value="percent"
                          checked={investment.annualReturnAmtOrPct === "percent"}
                          onChange={(e) => handleInvestmentChange(index, e)}
                        />
                        Percentage
                      </label>
                    </div>
                    <div className="normal-text">Mean</div>
                    <input
                      className="input-boxes"
                      type="text"
                      name="annualReturnMean"
                      placeholder="Enter mean..."
                      value={investment.annualReturnMean}
                      onChange={(e) => handleInvestmentChange(index, e)}
                    />
                    <div className="normal-text">Standard Deviation</div>
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


                {/* Markov Return */}
                {investment.annualReturnType === "markov" && (
                  <>
                    <div>Drift (μ)</div>
                    <input
                      className="input-boxes"
                      type="text"
                      name="annualReturnDrift"
                      value={investment.annualReturnDrift || ""}
                      onChange={(e) => handleInvestmentChange(index, e)}
                    />
                    <div>Volatility (σ)</div>
                    <input
                      className="input-boxes"
                      type="text"
                      name="annualReturnVolatility"
                      value={investment.annualReturnVolatility || ""}
                      onChange={(e) => handleInvestmentChange(index, e)}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Annual Income Section */}
            <br />
            <div className="normal-text">What is the expected annual income from dividends or interest?*</div>
            <div className="split-container">
              <div className="left-side">
                <label className="normal-text">
                  <input
                    type="radio"
                    name={`annualIncomeType-${index}`}
                    value="fixed"
                    checked={investment.annualIncomeType === "fixed"}
                    onChange={(e) => handleInvestmentChange(index, e)}
                  />
                  Fixed Amount / Percentage
                </label>
                <label className="normal-text">
                  <input
                    type="radio"
                    name={`annualIncomeType-${index}`}
                    value="normal"
                    checked={investment.annualIncomeType === "normal"}
                    onChange={(e) => handleInvestmentChange(index, e)}
                  />
                  Normal Distribution Percentage
                </label>
                <label className="normal-text">
                  <input
                    type="radio"
                    name={`annualIncomeType-${index}`}
                    value="markov"
                    checked={investment.annualIncomeType === "markov"}
                    onChange={(e) => handleInvestmentChange(index, e)}
                  />
                  Markov Process (GBM)
                </label>
              </div>
              <div className="right-side">
                {/* Fixed Income */}
                <div className="right-side">
                {investment.annualIncomeType === "fixed" && (
                  <>
                    <div className="checkbox-group">
                      <label className="normal-text">
                        <input
                          type="radio"
                          name={`annualIncomeAmtOrPct-${index}`}
                          value="amount"
                          checked={investment.annualIncomeAmtOrPct === "amount"}
                          onChange={(e) => handleInvestmentChange(index, e)}
                        />
                        Fixed Amount
                      </label>
                      <label className="normal-text">
                        <input
                          type="radio"
                          name={`annualIncomeAmtOrPct-${index}`}
                          value="percent"
                          checked={investment.annualIncomeAmtOrPct === "percent"}
                          onChange={(e) => handleInvestmentChange(index, e)}
                        />
                        Percentage
                      </label>
                    </div>
                    <input
                      className="input-boxes"
                      type="text"
                      name={`annualIncomeFixed-${index}`}
                      placeholder="Enter fixed income..."
                      value={investment.annualIncomeFixed}
                      onChange={(e) => handleInvestmentChange(index, e)}
                    />
                  </>
                )}
              </div>


              {/* Normal Income */}
              {investment.annualIncomeType === "normal" && (
                <>
                  <div className="checkbox-group">
                    <label className="normal-text">
                      <input
                        type="radio"
                        name={`annualIncomeAmtOrPct-${index}`}
                        value="amount"
                        checked={investment.annualIncomeAmtOrPct === "amount"}
                        onChange={(e) => handleInvestmentChange(index, e)}
                      />
                      Fixed Amount
                    </label>
                    <label className="normal-text">
                      <input
                        type="radio"
                        name={`annualIncomeAmtOrPct-${index}`}
                        value="percent"
                        checked={investment.annualIncomeAmtOrPct === "percent"}
                        onChange={(e) => handleInvestmentChange(index, e)}
                      />
                      Percentage
                    </label>
                  </div>
                  <div className="normal-text">Mean</div>
                  <input
                    className="input-boxes"
                    type="text"
                    name="annualIncomeMean"
                    placeholder="Enter mean..."
                    value={investment.annualIncomeMean}
                    onChange={(e) => handleInvestmentChange(index, e)}
                  />
                  <div className="normal-text">Standard Deviation</div>
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


                {/* Markov Income */}
                {investment.annualIncomeType === "markov" && (
                  <>
                    <div>Drift (μ)</div>
                    <input
                      className="input-boxes"
                      type="text"
                      name="annualIncomeDrift"
                      value={investment.annualIncomeDrift || ""}
                      onChange={(e) => handleInvestmentChange(index, e)}
                    />
                    <div>Volatility (σ)</div>
                    <input
                      className="input-boxes"
                      type="text"
                      name="annualIncomeVolatility"
                      value={investment.annualIncomeVolatility || ""}
                      onChange={(e) => handleInvestmentChange(index, e)}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Taxability & Account Type */}
            <div className="normal-text">Is this investment taxable?*</div>
            <div className="checkbox-group">
              <label className="normal-text">
                <input
                  type="radio"
                  name={`taxability-${index}`}
                  value="taxable"
                  checked={investment.taxability === "taxable"}
                  onChange={(e) => handleInvestmentChange(index, e)}
                />
                Taxable
              </label>
              <label className="normal-text">
                <input
                  type="radio"
                  name={`taxability-${index}`}
                  value="tax-exempt"
                  checked={investment.taxability === "tax-exempt"}
                  onChange={(e) => handleInvestmentChange(index, e)}
                />
                Tax-Exempt
              </label>
            </div>

            {investment.taxability === "taxable" && (
              <div>
                <div className="normal-text">Upload State Tax File</div>
                <div style={{ color: "red" }}>
                  (If no file is uploaded, taxes will not be simulated)
                </div>
                <input
                  style={{ margin: "1%", fontSize: "16px" }}
                  type="file"
                  name="taxFile"
                  //call the function to upload the state tax
                  onChange={(e) => {
                    handleInvestmentChange(index, e);
                    upload_state_tax_file(e); }}
                />
                {investment.taxFile && <p>Selected File: {investment.taxFile.name}</p>}
              </div>
            )}

            <div className="normal-text">What type of account is this investment stored in?*</div>
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

          </>
        )}
      </div>
    ))}

    <button className="page-buttons" onClick={handleAddInvestment}>
      ADD
    </button>

    <div className="normal-text" style={{ marginTop: "20px" }}>
      How do you want to order your RMD strategy (pre-tax investment IDs comma-separated)
    </div>
    <input
      className="input-boxes"
      type="text"
      name="rmdStrategy"
      value={formData.rmdStrategy}
      onChange={handleChange}
    />

    <div className="normal-text" style={{ marginTop: "20px" }}>
      How do you want to order your Expense Withdrawal Strategy (investment IDs comma-separated)
    </div>
    <input
      className="input-boxes"
      type="text"
      name="expenseWithdrawalStrategy"
      value={formData.expenseWithdrawalStrategy}
      onChange={handleChange}
    />


      {/* ------------------------------------------Life Events------------------------------------------ */}
      <div className="subheading">Life Events</div>
      {formData.lifeEvents.map((lifeEvent, index) => (
        <div
          key={lifeEvent.id}
          className={`collapse-container ${lifeEvent.isExpanded ? "expanded" : ""}`}
        >
          {/* Used ChatGPT to help create dynampic Collapsible Header */}
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
                  {/* Common Select Field */}
                  <div className="normal-text">Select Life Event Type*</div>
                  <select
                    className="collapse-options"
                    name="type"
                    value={lifeEvent.type}
                    onChange={(e) => handleLifeEventChange(index, e)}
                  >
                    <option value="">--Select--</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="invest">Invest</option>
                    <option value="rebalance">Rebalance</option>
                  </select>

                  {/* Type-Specific Inputs */}
                  {lifeEvent.type === "income" && (
                  <>
                    <label>
                      Income Source:
                      <select
                        name="incomeSource"
                        value={lifeEvent.incomeSource || ""}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      >
                        <option value="">--Select--</option>
                        <option value="socialSecurity">Social Security</option>
                        <option value="wages">Wages</option>
                      </select>
                    </label>
                  </>
                )}
                  {/**Used ChatGPT to help with the styling and html aesthetics of the expenses part */}
                  {lifeEvent.type === "expense" && (
                    <>
                      <>
                        <label>
                          Type of Expense:
                          <select
                            name="expenseSource"
                            value={lifeEvent.expenseSource || ""}
                            onChange={(e) => handleLifeEventChange(index, e)}
                          >
                            <option value="">--Select--</option>
                            <option value="Discretionary">Discretionary</option>
                            <option value="nonDiscretionary">Non-Discretionary</option>
                          </select>
                        </label>
                      </>
                    </>
                  )}

                  {lifeEvent.type === "invest" && (
                    <>
                      {/* Asset Allocation */}
                      <div >Asset Allocation:</div>
                      <div className="split-container">
                        <div className="left-side">
                          <label >Stocks:</label>
                          <input
                            className="small-input-boxes"
                            type="number"
                            name="Stocks"
                            value={lifeEvent.assetAllocation?.Stocks || ""}
                            onChange={(e) => handleAssetAllocationInputChange(index, e, "assetAllocation")}
                          />
                          <label >Bonds:</label>
                          <input
                            className="small-input-boxes"
                            type="number"
                            name="Bonds"
                            value={lifeEvent.assetAllocation?.Bonds || ""}
                            onChange={(e) => handleAssetAllocationInputChange(index, e, "assetAllocation")}
                          />
                        </div>

                        {/* Glide Path */}
                        <div className="right-side">
                          <label>Glide Path:</label>
                          <input
                            type="checkbox"
                            name="glidePath"
                            checked={lifeEvent.glidePath || false}
                            onChange={(e) =>
                              handleLifeEventChange(index, {
                                target: { name: "glidePath", value: e.target.checked },
                              })
                            }
                          />
                        </div>
                      </div>

                      {/* Asset Allocation 2 */}
                      <div  style={{ marginTop: "15px" }}>Asset Allocation 2:</div>
                      <div className="split-container">
                        <div className="left-side">
                          <label >Stocks:</label>
                          <input
                            className="small-input-boxes"
                            type="number"
                            name="Stocks"
                            value={lifeEvent.assetAllocation2?.Stocks || ""}
                            onChange={(e) => handleAssetAllocationInputChange(index, e, "assetAllocation2")}
                          />
                          <label >Bonds:</label>
                          <input
                            className="small-input-boxes"
                            type="number"
                            name="Bonds"
                            value={lifeEvent.assetAllocation2?.Bonds || ""}
                            onChange={(e) => handleAssetAllocationInputChange(index, e, "assetAllocation2")}
                          />
                        </div>

                        <div className="right-side">
                          <label >Max Cash:</label>
                          <input
                            className="small-input-boxes"
                            type="number"
                            name="maxCash"
                            value={lifeEvent.maxCash || ""}
                            onChange={(e) => handleLifeEventChange(index, e)}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {lifeEvent.type === "rebalance" && (
                    <>
                      <div >Asset Allocation:</div>
                      <div className="split-container">
                        <div className="left-side">
                          <label >Stocks:</label>
                          <input
                            className="small-input-boxes"
                            type="number"
                            name="Stocks"
                            value={lifeEvent.assetAllocation?.Stocks || ""}
                            onChange={(e) => handleAssetAllocationInputChange(index, e, "assetAllocation")}
                          />

                          <label className="normal-text">Bonds:</label>
                          <input
                            className="small-input-boxes"
                            type="number"
                            name="Bonds"
                            value={lifeEvent.assetAllocation?.Bonds || ""}
                            onChange={(e) => handleAssetAllocationInputChange(index, e, "assetAllocation")}
                          />

                          <label className="normal-text">Cash:</label>
                          <input
                            className="small-input-boxes"
                            type="number"
                            name="Cash"
                            value={lifeEvent.assetAllocation?.Cash || ""}
                            onChange={(e) => handleAssetAllocationInputChange(index, e, "assetAllocation")}
                          />
                        </div>
                      </div>
                    </>
                  )}


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

              {(lifeEvent.type === "income" || lifeEvent.type === "expense") && (
              <>
                {/* Initial Amount */}
                <div className="normal-text">What is the initial amount for this event?*</div>
                <input
                  className="input-boxes"
                  type="text"
                  name="initialAmount"
                  placeholder="Enter initial amount..."
                  value={lifeEvent.initialAmount || ""}
                  onChange={(e) => handleLifeEventChange(index, e)}
                />

                {/* Expected Annual Change */}
                <div className="normal-text">How should the annual change be expressed?*</div>
                <div className="split-container">
                  <div className="left-side">
                    <label className="normal-text">
                      <input
                        type="radio"
                        name={`annualChangeType-${index}`}

                        value="fixed"
                        checked={lifeEvent.annualChangeType === "fixed"}
                        onChange={(e) => handleLifeEventChange(index, {
                          target: { name: "annualChangeType", value: e.target.value }
                        })}
                      />
                      Fixed Amount / Percentage
                    </label>
                    <label className="normal-text">
                      <input
                        type="radio"
                        name={`annualChangeType-${index}`}
                        value="normal"
                        checked={lifeEvent.annualChangeType === "normal"}
                        onChange={(e) => handleLifeEventChange(index, {
                          target: { name: "annualChangeType", value: e.target.value }
                        })}
                      />
                      Normal Distribution
                    </label>
                    <label className="normal-text">
                      <input
                        type="radio"
                        name={`annualChangeType-${index}`}
                        value="uniform"
                        checked={lifeEvent.annualChangeType === "uniform"}
                        onChange={(e) => handleLifeEventChange(index, {
                          target: { name: "annualChangeType", value: e.target.value }
                        })}
                      />
                      Uniform Distribution
                    </label>
                  </div>

                  <div className="right-side">
                    {/* Fixed Amount or Percentage */}
                    {lifeEvent.annualChangeType === "fixed" && (
                      <>
                        <div className="checkbox-group">
                          <label className="normal-text">
                            <input
                              type="radio"
                              name={`annualChangeAmtOrPct-${index}`}
                              value="amount"
                              checked={lifeEvent.annualChangeAmtOrPct === "amount"}
                              onChange={(e) => handleLifeEventChange(index, {
                                target: { name: "annualChangeAmtOrPct", value: e.target.value }
                              })}
                            />
                            Fixed Amount
                          </label>
                          <label className="normal-text">
                            <input
                              type="radio"
                              name={`annualChangeAmtOrPct-${index}`}
                              value="percent"
                              checked={lifeEvent.annualChangeAmtOrPct === "percent"}
                              onChange={(e) => handleLifeEventChange(index, {
                                target: { name: "annualChangeAmtOrPct", value: e.target.value }
                              })}
                            />
                            Percentage
                          </label>
                        </div>
                        <input
                          className="input-boxes"
                          type="text"
                          name="annualChangeFixed"
                          placeholder="Enter fixed change amount or %"
                          value={lifeEvent.annualChangeFixed || ""}
                          onChange={(e) => handleLifeEventChange(index, e)}
                        />
                      </>
                    )}

                    {/* Normal Distribution */}
                    {lifeEvent.annualChangeType === "normal" && (
                      <>
                        <div className="normal-text">Mean</div>
                        <input
                          className="input-boxes"
                          type="text"
                          name="annualChangeMean"
                          placeholder="Enter mean..."
                          value={lifeEvent.annualChangeMean || ""}
                          onChange={(e) => handleLifeEventChange(index, e)}
                        />
                        <div className="normal-text">Standard Deviation</div>
                        <input
                          className="input-boxes"
                          type="text"
                          name="annualChangeStdev"
                          placeholder="Enter standard deviation..."
                          value={lifeEvent.annualChangeStdev || ""}
                          onChange={(e) => handleLifeEventChange(index, e)}
                        />
                      </>
                    )}

                    {/* Uniform Distribution */}
                    {lifeEvent.annualChangeType === "uniform" && (
                      <>
                        <div className="normal-text">Min</div>
                        <input
                          className="input-boxes"
                          type="text"
                          name="annualChangeMin"
                          placeholder="Enter minimum value..."
                          value={lifeEvent.annualChangeMin || ""}
                          onChange={(e) => handleLifeEventChange(index, e)}
                        />
                        <div className="normal-text">Max</div>
                        <input
                          className="input-boxes"
                          type="text"
                          name="annualChangeMax"
                          placeholder="Enter maximum value..."
                          value={lifeEvent.annualChangeMax || ""}
                          onChange={(e) => handleLifeEventChange(index, e)}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Spousal Percentage */}
                {formData.planType === "joint" && (
                  <>
                    <div className="normal-text">Percentage Applied to User</div>
                    <input
                      className="input-boxes"
                      type="text"
                      name="userPct"
                      placeholder="e.g. 50"
                      value={lifeEvent.userPct || ""}
                      onChange={(e) => handleLifeEventChange(index, e)}
                    />
                  </>
                )}
              </>
            )}

              {/* Start Date */}
              <div className="normal-text">
                How would you like to express the start date of this event? (select 1)*
              </div>
              <div className="split-container">
                <div className="left-side">
                  <label className="normal-text">
                    <input
                      type="radio"
                      name={`startType-${index}`}
                      value="startingYear"
                      checked={lifeEvent.startType === "startingYear"}
                      onChange={(e) => handleLifeEventChange(index, e)}
                    />
                    Start Year
                  </label>
                  <label className="normal-text">
                    <input
                      type="radio"
                      name={`startType-${index}`}
                      value="normal"
                      checked={lifeEvent.startType === "normal"}
                      onChange={(e) => handleLifeEventChange(index, e)}
                    />
                    Normal Distribution Percentage
                  </label>
                  <label className="normal-text">
                    <input
                      type="radio"
                      name={`startType-${index}`}
                      value="uniform"
                      checked={lifeEvent.startType === "uniform"}
                      onChange={(e) => handleLifeEventChange(index, e)}
                    />
                    Uniform Distribution Percentage
                  </label>
                  <label className="normal-text">
                    <input
                      type="radio"
                      name={`startType-${index}`}
                      value="startEvent"
                      checked={lifeEvent.startType === "startEvent"}
                      onChange={(e) => handleLifeEventChange(index, e)}
                    />
                    Start at the Same Time as
                  </label>
                  <label className="normal-text">
                    <input
                      type="radio"
                      name={`startType-${index}`}
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
                        name="start"
                        placeholder="Enter Starting Year"
                        value={lifeEvent.start}
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
                      <div className="normal-text">Mean (%)</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="startMean"
                        placeholder="Enter mean..."
                        value={lifeEvent.startMean}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      />
                      <div className="normal-text">Standard Deviation (%)</div>
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
                  {/* If "uniform" */}
                  {lifeEvent.startType === "uniform" && (
                    <>
                      <div className="normal-text">Max Value</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="startMax"
                        placeholder="Enter maximum  value..."
                        value={lifeEvent.startMax}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      />
                      <div className="normal-text">Min</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="startMin"
                        placeholder="Enter minimum value..."
                        value={lifeEvent.startMin}
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


              {/* Inflation */}
              <div className="normal-text">
                How would you like to adjust for inflation? (select 1)*
              </div>

              <div className="split-container">
                <div className="left-side">
                  <label className="normal-text">
                    <input
                      type="radio"
                      name={`changeDistribution.type-${index}`}
                      value="fixed"
                      checked={lifeEvent.changeDistribution?.type === "fixed"}
                      onChange={(e) => handleLifeEventChange(index, e)}
                    />
                    Fixed Percentage
                  </label>
                  <label className="normal-text">
                    <input
                      type="radio"
                      name={`changeDistribution.type-${index}`}
                      value="normal"
                      checked={lifeEvent.changeDistribution?.type === "normal"}
                      onChange={(e) => handleLifeEventChange(index, e)}
                    />
                    Normal Distribution Percentage
                  </label>
                </div>

                <div className="right-side">
                  {lifeEvent.changeDistribution?.type === "fixed" && (
                    <>
                      <div className="normal-text">Fixed Value (%)</div>
                      <input
                        className="input-boxes"
                        type="number"
                        name="changeDistribution.value"
                        value={lifeEvent.changeDistribution?.value || ""}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      />
                    </>
                  )}

                  {lifeEvent.changeDistribution?.type === "normal" && (
                    <>
                      <div className="normal-text">Mean (%)</div>
                      <input
                        className="input-boxes"
                        type="number"
                        name="changeDistribution.mean"
                        value={lifeEvent.changeDistribution?.mean || ""}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      />
                      <div className="normal-text">Standard Deviation (%)</div>
                      <input
                        className="input-boxes"
                        type="number"
                        name="changeDistribution.stdev"
                        value={lifeEvent.changeDistribution?.stdev || ""}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      />
                    </>
                  )}
                </div>
              </div>

            </>
          )}
        </div>
      ))}
      <button className="page-buttons" onClick={handleAddLifeEvents}>
        ADD
      </button>
      <div className="normal-text" style={{ marginTop: "20px" }}>
        Spending Strategy (investment IDs comma-separated)
      </div>
      <input
        className="input-boxes"
        type="text"
        name="spendingStrategy"
        value={formData.spendingStrategy}
        onChange={handleChange}
      />

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
        <div className="normal-text" style={{ marginTop: "20px" }}>
        How would you like to order your Roth Conversion Strategy (pre-tax investment IDs comma-separated)
        </div>
        <input
          className="input-boxes"
          type="text"
          name="rothconversionstrategy"
          value={formData.rothconversionstrategy}
          onChange={handleChange}
        />
        </div>

      {/* Final Save Button */}
      <button className="page-buttons" onClick={handleSubmit}>
        SAVE
      </button>
    </div>
  );
};

export default CreatePlan;
