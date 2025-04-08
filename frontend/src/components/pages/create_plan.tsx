import React, { useEffect, useState } from "react";
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
    lifeExpectancyMean: "",
    lifeExpectancyStd: "",
    spouseLifeExpectancyRadio: "",
    spouseLifeExpectancyYears: "",
    spouseLifeExpectancyMean: "",
    spouseLifeExpectancyStd: "",
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
        returnAmtOrPct: "", // "amount" | "percent"
        returnDistribution: "", // fixed, normal, uniform,
        annualReturnFixed: "",
        annualReturnMean: "",
        annualReturnStdev: "",
        annualReturnLower: "",
        annualReturnUpper: "",
        incomeAmtOrPct: "", // "amount" | "percent"
        incomeDistribution: "", // fixed, normal, uniform
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

  // -----------------------------------------------------INVESTMENT TRANSFORMATION STUFF  -----------------------------------------------------//
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
          returnDistribution: "",
          annualReturnFixed: "",
          annualReturnMean: "",
          annualReturnStdev: "",
          annualReturnLower: "",
          annualReturnUpper: "",
          incomeDistribution: "",
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
  const handleDeleteInvestment = async (id) => {
    const investmentToDelete = formData.investments.find((inv) => inv.id === id);
    const { createdTypeId } = investmentToDelete || {};
  
    // Filter out the investment and reassign IDs
    const updatedInvestments = formData.investments
      .filter((inv) => inv.id !== id)
      .map((inv, i) => ({ ...inv, id: i + 1 }));
  
    setFormData((prevData) => ({
      ...prevData,
      investments: updatedInvestments,
    }));
  
    // Check if we should delete the associated investmentType
    if (createdTypeId) {
      const stillUsed = updatedInvestments.some(
        (inv) => inv.createdTypeId === createdTypeId
      );
  
      if (!stillUsed) {
        try {
          const res = await fetch(`http://localhost:5000/api/investment-types/${createdTypeId}`, {
            method: "DELETE",
          });
  
          if (res.ok) {
            console.log(`Deleted unused investment type with id ${createdTypeId}`);
          } else {
            const err = await res.json();
            console.error("Failed to delete investment type:", err);
          }
        } catch (error) {
          console.error("Error deleting investment type:", error);
        }
      }
    }
  };
  
  // Update fields within an investment
  const handleInvestmentChange = (index, e) => {
    const { name, value, type, files } = e.target;
  
    if (name === "investmentType") {
      const chosenType = existingInvestmentTypes.find(t => t._id === value);
      const newInvestments = [...formData.investments];
    
      newInvestments[index] = {
        ...newInvestments[index],
        // store the chosen \_id in investmentType
        investmentType: value,          
        isCreatingNewType: false,
        // set the investmentName to the existing type’s name if found
        investmentName: chosenType ? chosenType.name : "", 
      };
    
      setFormData((prevData) => ({
        ...prevData,
        investments: newInvestments,
      }));
    
      // Optionally fetch the details if you need them
      fetch(`http://localhost:5000/api/investment-types/id/${value}`)
        .then((res) => {
          if (!res.ok) throw new Error("Investment type not found");
          return res.json();
        })
        .then((data) => {
          console.log("Fetched investment type data:", data);
        })
        .catch((err) => {
          console.error("Failed to fetch investment type data:", err);
        });
    
      return;
    }
    
  
    // Default field updates
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


  // ----------------------------------------------------- LIFE EVENT TRANSFORMATION STUFF -----------------------------------------------------//
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
    const cleanName = name.replace(/-\d+$/, "");
    const [parentKey, childKey] = cleanName.split(".");
  
    if (childKey) {
      newLifeEvents[index][parentKey] = {
        ...(newLifeEvents[index][parentKey] || {}),
        [childKey]: value,
      };
    } else {
      newLifeEvents[index][cleanName] = type === "checkbox" ? checked : value;
    }
  
    setFormData((prevData) => ({
      ...prevData,
      lifeEvents: newLifeEvents,
    }));
  };
  

useEffect(() => {
  const discretionaryEvents = formData.lifeEvents.filter(
    (event) => event.type === "expense" && event.expenseSource === "Discretionary"
  );

  setSpendingOrder((prev) => {
    const updated = [...prev];
    while (updated.length < discretionaryEvents.length) updated.push("");
    while (updated.length > discretionaryEvents.length) updated.pop();
    return updated;
  });
}, [formData.lifeEvents]);


// ----------------------------------------------------- RMD & Expense WITHDRAWALTRANSFORMATION STUFF -----------------------------------------------------//
const [rmdOrder, setRmdOrder] = useState([]);
const [rothOrder, setRothOrder] = useState([]);
const [expenseOrder, setExpenseOrder] = useState([]);
const [spendingOrder, setSpendingOrder] = useState([]);

const handleRMDOrderChange = (index, value) => {
  setRmdOrder((prev) => {
    const updated = [...prev];
    updated[index] = value;
    return updated;
  });
};
const handleRothOrderChange = (index, value) => {
  setRothOrder((prev) => {
    const updated = [...prev];
    updated[index] = value;
    return updated;
  });
};

const handleExpenseOrderChange = (index, value) => {
  setExpenseOrder((prev) => {
    const updated = [...prev];
    updated[index] = value;
    return updated;
  });
};

const handleSpendingOrderChange = (index, value) => {
  setSpendingOrder((prev) => {
    const updated = [...prev];
    updated[index] = value;
    return updated;
  });
};


// ----------------------------------------------------- TRANSFORM -----------------------------------------------------//

const transformFormData = (formData, rmdOrder, expenseOrder, spendingOrder, rothOrder) => {
  const isJoint = formData.planType === "joint";

  return {
    userId: localStorage.getItem("userId") || "",
    name: formData.planName,
    maritalStatus: isJoint ? "couple" : "individual",
    birthYears: isJoint
      ? [parseInt(formData.birthYear), parseInt(formData.spouseBirthYear || "0")]
      : [parseInt(formData.birthYear)],

    // -- Life Expectancy Array
    lifeExpectancy: isJoint
      ? [
          // USER
          formData.lifeExpectancyRadio === "yes"
            ? { type: "fixed", value: parseInt(formData.lifeExpectancyYears) }
            : { type: "normal", mean: parseInt(formData.lifeExpectancyMean), stdev: parseInt(formData.lifeExpectancyStd) },

          // SPOUSE
          formData.spouseLifeExpectancyRadio === "yes"
            ? { type: "fixed", value: parseInt(formData.spouseLifeExpectancyYears) }
            : { type: "normal", mean: parseInt(formData.spouseLifeExpectancyMean), stdev: parseInt(formData.spouseLifeExpectancyStd) },
        ]
      : [
          // SINGLE PLAN
          formData.lifeExpectancyRadio === "yes"
            ? { type: "fixed", value: parseInt(formData.lifeExpectancyYears) }
            : { type: "normal", mean: parseInt(formData.lifeExpectancyMean), stdev: parseInt(formData.lifeExpectancyStd) },
        ],

    // -- Example inflation assumption
    inflationAssumption: (() => {
      const firstEvent = formData.lifeEvents?.[0];
      // If user never sets it, default to { type: "fixed", value: 0 }
      const changeDist = firstEvent?.changeDistribution || { type: "fixed", value: 0 };

      if (changeDist.type === "normal") {
        return {
          type: "normal",
          mean: parseFloat(changeDist.mean || "0"),
          stdev: parseFloat(changeDist.stdev || "0"),
        };
      }
      // default "fixed"
      return { type: "fixed", value: parseFloat(changeDist.value || "0") };
    })(),

    RMDStrategy: rmdOrder,
    expenseWithdrawalStrategy: expenseOrder,
    spendingStrategy: spendingOrder,
    RothConversionStrategy: rothOrder,

    financialGoal: parseFloat(formData.financialGoal || "0"),
    RothConversionOpt: formData.rothConversion === "yes",
    RothConversionStart: parseInt(formData.rothStartYear || "0"),
    RothConversionEnd: parseInt(formData.rothEndYear || "0"),

    // ---------- INVESTMENTS ----------
    investments: formData.investments.map((inv) => {
      // Build the subdocument for returnDistribution
      const returnDistribution = (() => {
        const type = inv.returnDistribution || "fixed";
        if (type === "normal") {
          return {
            type: "normal",
            mean: parseFloat(inv.annualReturnMean || "0"),
            stdev: parseFloat(inv.annualReturnStdev || "0"),
          };
        }
        // default "fixed"
        return {
          type: "fixed",
          value: parseFloat(inv.annualReturnFixed || "0"),
        };
      })();

      // Build the subdocument for incomeDistribution
      const incomeDistribution = (() => {
        const type = inv.incomeDistribution || "fixed";
        if (type === "normal") {
          return {
            type: "normal",
            mean: parseFloat(inv.annualIncomeMean || "0"),
            stdev: parseFloat(inv.annualIncomeStdev || "0"),
          };
        }
        // default "fixed"
        return {
          type: "fixed",
          value: parseFloat(inv.annualIncomeFixed || "0"),
        };
      })();

      return {
        id: inv.investmentName || "", 
        investmentName: inv.investmentName || "",
        investmentDescription: inv.investmentDescription || "",
        investmentType: inv.investmentType || "",
        value: parseFloat(inv.investmentValue || "0"),

        taxStatus: inv.accountType || "non-retirement",

        returnAmtOrPct: inv.returnAmtOrPct || "percent",
        returnDistribution,

        incomeAmtOrPct: inv.incomeAmtOrPct || "percent",
        incomeDistribution,

        taxability: inv.taxability === "taxable",
      };
    }),

    // ---------- LIFE EVENTS ----------
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

        // Start subdocument
        start: (() => {
          const t = event.startType || "fixed";
          if (t === "normal") {
            return {
              type: "normal",
              mean: parseFloat(event.startMean || "0"),
              stdev: parseFloat(event.startStdev || "0"),
            };
          }
          if (t === "uniform") {
            return {
              type: "uniform",
              lower: parseFloat(event.startMin || "0"),
              upper: parseFloat(event.startMax || "0"),
            };
          }
          if (t === "startWith" || t === "startEndEvent") {
            return { type: t, eventSeries: event.startEvent || "" };
          }
          return { type: "fixed", value: parseInt(event.start || "0") };
        })(),

        duration: {
          type: "fixed",
          value: parseInt(event.duration || "0"),
        },

        ...(isIncome || isExpense
          ? {
              initialAmount: parseFloat(event.initialAmount || "0"),
              changeAmtOrPct: event.annualChangeAmtOrPct || "amount",
              changeDistribution: (() => {
                const t = event.changeDistribution?.type || "fixed";
                if (t === "normal") {
                  return {
                    type: "normal",
                    mean: parseFloat(event.changeDistribution?.mean || "0"),
                    stdev: parseFloat(event.changeDistribution?.stdev || "0"),
                  };
                }
                // default "fixed"
                return {
                  type: "fixed",
                  value: parseFloat(event.changeDistribution?.value || "0"),
                };
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

const [existingInvestmentTypes, setExistingInvestmentTypes] = useState([]);

useEffect(() => {
  const fetchInvestmentTypes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/investment-types/all");
      if (!res.ok) throw new Error("Failed to fetch investment types");
      const data = await res.json();
      setExistingInvestmentTypes(data);
      console.log("Fetched investment types:", data);


    } catch (error) {
      console.error("Error fetching investment types:", error);
    }
  };

  fetchInvestmentTypes();
}, []);

useEffect(() => {
  const preTaxInvestments = formData.investments.filter(inv => inv.accountType === "pre-tax");
  const allInvestments = formData.investments;

  setRmdOrder((prev) => {
    const updated = [...prev];
    while (updated.length < preTaxInvestments.length) updated.push("");
    while (updated.length > preTaxInvestments.length) updated.pop();
    return updated;
  });

  setExpenseOrder((prev) => {
    const updated = [...prev];
    while (updated.length < allInvestments.length) updated.push("");
    while (updated.length > allInvestments.length) updated.pop();
    return updated;
  });

  setRothOrder((prev) => {
    const updated = [...prev];
    while (updated.length < preTaxInvestments.length) updated.push("");
    while (updated.length > preTaxInvestments.length) updated.pop();
    return updated;
  });
}, [formData.investments]);


function buildDistribution(distType, mean, stdev, fixedValue) {
  if (distType === "normal") {
    return {
      type: "normal",
      mean: parseFloat(mean || "0"),
      stdev: parseFloat(stdev || "0"),
    };
  }
  // default = "fixed"
  return {
    type: "fixed",
    value: parseFloat(fixedValue || "0"),
  };
}


const handleCreateInvestmentTypeClick = async (index) => {
  try {
    const inv = formData.investments[index];

    const returnDistObj = buildDistribution(
      inv.returnDistribution,
      inv.annualReturnMean,
      inv.annualReturnStdev,
      inv.annualReturnFixed
    );

    const incomeDistObj = buildDistribution(
      inv.incomeDistribution,
      inv.annualIncomeMean,
      inv.annualIncomeStdev,
      inv.annualIncomeFixed
    );

    const isTaxable = inv.taxability === "taxable";

    const invTypePayload = {
      name: inv.investmentName || inv.investmentType || "Untitled",
      description: inv.investmentDescription || "",
      taxability: isTaxable,
      expenseRatio: 0,
      returnAmtOrPct: inv.returnAmtOrPct,
      returnDistribution: returnDistObj,
      incomeAmtOrPct: inv.incomeAmtOrPct,
      incomeDistribution: incomeDistObj,
    };

    const findRes = await fetch("http://localhost:5000/api/investment-types/find", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invTypePayload),
    });

    const found = await findRes.json();
    let finalType = found;

    if (!findRes.ok || !found?._id) {
      const createRes = await fetch("http://localhost:5000/api/investment-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invTypePayload),
      });
      if (!createRes.ok) throw new Error("Failed to create investment type");

      finalType = await createRes.json();

      setExistingInvestmentTypes((prev) => [...prev, finalType]);
    } else {
      setExistingInvestmentTypes((prev) => {
        if (!prev.find((t) => t._id === found._id)) {
          return [...prev, found];
        }
        return prev;
      });
    }

    setFormData((prevData) => {
      const newInvestments = [...prevData.investments];
      newInvestments[index] = {
        ...newInvestments[index],
        createdTypeId: finalType._id,
        investmentType: finalType._id,
        investmentName: finalType.name,
      };
      return {
        ...prevData,
        investments: newInvestments,
      };
    });

    alert(`Investment Type '${finalType.name}' created or found!`);
  } catch (error) {
    console.error("Error creating/finding investment type:", error);
    alert("Error creating/finding investment type");
  }
};

const handleSubmit = async () => {
  try {
    const transformedData = transformFormData(formData, rmdOrder, expenseOrder, spendingOrder, rothOrder);
    const updatedInvestments = formData.investments.map((inv, idx) => {
      const finalTypeId = inv.createdTypeId || inv.investmentType;
      if (!finalTypeId) {
        alert(`Investment #${idx + 1} has no type. Please pick or create a type.`);
        throw new Error("No investment type selected/created");
      }

      return {
        id: inv.investmentName || "Unnamed",
        investmentType: finalTypeId,
        value: parseFloat(inv.investmentValue || "0"),
        taxStatus: inv.accountType || "non-retirement",
      };
    });

    // Find all used investment type IDs from formData
    const usedTypeIds = new Set(
      formData.investments.map((inv) => String(inv.createdTypeId || inv.investmentType))
    );
    
    const usedInvestmentTypes = existingInvestmentTypes.filter((type) =>
      usedTypeIds.has(String(type._id))
    );
    
    const finalPayload = {
      ...transformedData,
      investmentTypes: usedInvestmentTypes, 
      RMDStrategy: rmdOrder.filter(id => id !== ""),
      expenseWithdrawalStrategy: expenseOrder.filter(id => id !== ""),
      RothConversionStrategy: rothOrder.filter(id => id !== ""),
      spendingStrategy: spendingOrder.filter(id => id !== "")

    };
    

    const planRes = await fetch("http://localhost:5000/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalPayload),
    });

    if (!planRes.ok) {
      throw new Error("Failed to save plan");
    }

    alert("Plan created successfully!");
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
  
  type RadioGroupProps = {
    label?: string;
    name: string;
    selectedValue: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    options: { label: string; value: string }[];
  };
  
  const RadioGroup: React.FC<RadioGroupProps> = ({ label, name, selectedValue, onChange, options }) => (
    <div className="checkbox-group normal-text">
      {label && <div className="normal-text">{label}</div>}
      {options.map((option) => (
        <label className="normal-text" key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={onChange}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
  
  
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
        <RadioGroup
          name="planType"
          selectedValue={formData.planType}
          onChange={handleChange}
          options={[
            { label: "Individual Plan", value: "individual" },
            { label: "Joint Plan", value: "joint" },
          ]}
        />

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
            <RadioGroup
              name="lifeExpectancyRadio"
              selectedValue={formData.lifeExpectancyRadio}
              onChange={handleChange}
              options={[
                { label: "Yes", value: "yes" },
                { label: "No, Use a Sample", value: "no" },
              ]}
            />
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
            {formData.lifeExpectancyRadio === "no" && (
              <>
              <div className="normal-text">Mean</div>
                <input
                  className="input-boxes"
                  type="text"
                  name="lifeExpectancyMean"
                  placeholder="Enter mean..."
                  value={formData.lifeExpectancyMean}
                  onChange={handleChange}
                />
                <div className="normal-text">Standard Deviation</div>
                <input
                  className="input-boxes"
                  type="text"
                  name="lifeExpectancyStd"
                  placeholder="Enter standard deviation..."
                  value={formData.lifeExpectancyStd}
                  onChange={handleChange}
                />
              </>
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
                <RadioGroup
                  name="spouseLifeExpectancyRadio"
                  selectedValue={formData.spouseLifeExpectancyRadio}
                  onChange={handleChange}
                  options={[
                    { label: "Yes", value: "yes" },
                    { label: "No, Use a Sample", value: "no" },
                  ]}
                />
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
              {formData.lifeExpectancyRadio === "no" && (
              <>
              <div className="normal-text">Mean</div>
                <input
                  className="input-boxes"
                  type="text"
                  name="spouseLifeExpectancyMean"
                  placeholder="Enter mean..."
                  value={formData.spouseLifeExpectancyMean}
                  onChange={handleChange}
                />
                <div className="normal-text">Standard Deviation</div>
                <input
                  className="input-boxes"
                  type="text"
                  name="spouseLifeExpectancyStd"
                  placeholder="Enter standard deviation..."
                  value={formData.spouseLifeExpectancyStd}
                  onChange={handleChange}
                />
              </>
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
            {/* Choose between new or existing type */}
            <div className="split-container">
              <div className="left-side">
                <div className="normal-text">Create New Investment Type Name</div>
                <input
                  className="input-boxes"
                  type="text"
                  name="investmentName"
                  value={investment.investmentName}
                  onChange={(e) => handleInvestmentChange(index, e)}
                  onFocus={() => {
                    const updated = [...formData.investments];
                    updated[index].isCreatingNewType = true;
                    updated[index].investmentType = "";
                    setFormData((prev) => ({ ...prev, investments: updated }));
                  }}
                />

              </div>
              <div className="right-side">
                <div className="normal-text">Select Existing Investment Type</div>
                <select
                  className="collapse-options"
                  name="investmentType"
                  value={investment.investmentType}
                  onChange={(e) => handleInvestmentChange(index, e)}
                  disabled={investment.investmentName}
                >
                  <option value="">--Select--</option>
                  {existingInvestmentTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Only show this stuff if they're creating a new type */}
            {investment.isCreatingNewType && (
              <div className="investment-type-container">
                <div className="normal-text">Brief Description of Investment*</div>
                <textarea
                  className="input-boxes textarea-box"
                  rows="4"
                  name="investmentDescription"
                  value={investment.investmentDescription}
                  onChange={(e) => handleInvestmentChange(index, e)}
                ></textarea>
                <div className="normal-text">How would you like to express the investment's annual return?*</div>
                <div className="split-container">
                  <div className="left-side">
                    <RadioGroup
                      name={`returnDistribution-${index}`}
                      selectedValue={investment.returnDistribution}
                      onChange={(e) => handleInvestmentChange(index, e)}
                      options={[
                        { label: "Fixed Amount / Percentage", value: "fixed" },
                        { label: "Normal Distribution Percentage", value: "normal" },
                      ]}
                    />
                  </div>
                  <div className="right-side">
                    {investment.returnDistribution === "fixed" && (
                      <>
                        <RadioGroup
                          name={`returnAmtOrPct-${index}`}
                          selectedValue={investment.returnAmtOrPct}
                          onChange={(e) => handleInvestmentChange(index, e)}
                          options={[
                            { label: "Fixed Amount", value: "amount" },
                            { label: "Percentage", value: "percent" },
                          ]}
                        />
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

                    {investment.returnDistribution === "normal" && (
                      <>
                        <RadioGroup
                          name={`returnAmtOrPct-${index}`}
                          selectedValue={investment.returnAmtOrPct}
                          onChange={(e) => handleInvestmentChange(index, e)}
                          options={[
                            { label: "Fixed Amount", value: "amount" },
                            { label: "Percentage", value: "percent" },
                          ]}
                        />
                        <input
                          className="input-boxes"
                          type="text"
                          name="annualReturnMean"
                          placeholder="Enter mean..."
                          value={investment.annualReturnMean}
                          onChange={(e) => handleInvestmentChange(index, e)}
                        />
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
                  </div>
                </div>

                <br />
                <div className="normal-text">Expected annual income from dividends or interest?*</div>
                <div className="split-container">
                  <div className="left-side">
                    <RadioGroup
                      name={`incomeDistribution-${index}`}
                      selectedValue={investment.incomeDistribution}
                      onChange={(e) => handleInvestmentChange(index, e)}
                      options={[
                        { label: "Fixed Amount / Percentage", value: "fixed" },
                        { label: "Normal Distribution Percentage", value: "normal" },
                      ]}
                    />
                  </div>
                  <div className="right-side">
                    {investment.incomeDistribution === "fixed" && (
                      <>
                        <RadioGroup
                          name={`incomeAmtOrPct-${index}`}
                          selectedValue={investment.incomeAmtOrPct}
                          onChange={(e) => handleInvestmentChange(index, e)}
                          options={[
                            { label: "Fixed Amount", value: "amount" },
                            { label: "Percentage", value: "percent" },
                          ]}
                        />
                        <input
                          className="input-boxes"
                          type="text"
                          name="annualIncomeFixed"
                          placeholder="Enter fixed income..."
                          value={investment.annualIncomeFixed}
                          onChange={(e) => handleInvestmentChange(index, e)}
                        />
                      </>
                    )}
                    {investment.incomeDistribution === "normal" && (
                      <>
                        <RadioGroup
                          name={`incomeAmtOrPct-${index}`}
                          selectedValue={investment.incomeAmtOrPct}
                          onChange={(e) => handleInvestmentChange(index, e)}
                          options={[
                            { label: "Fixed Amount", value: "amount" },
                            { label: "Percentage", value: "percent" },
                          ]}
                        />
                        <input
                          className="input-boxes"
                          type="text"
                          name="annualIncomeMean"
                          placeholder="Enter mean..."
                          value={investment.annualIncomeMean}
                          onChange={(e) => handleInvestmentChange(index, e)}
                        />
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
                  </div>
                </div>
                {/* Taxability & Account Type */}
                <div className="normal-text">Is this investment taxable?*</div>
                  <label className="normal-text">
                  <RadioGroup
                    name={`taxability-${index}`}
                    selectedValue={investment.taxability}
                    onChange={(e) => handleInvestmentChange(index, e)}
                    options={[
                      { label: "Taxable", value: "taxable" },
                      { label: "Tax-Exempt", value: "tax-exempt" },
                    ]}
                  />
                  </label>

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

                <button
                  className="page-buttons"
                  style={{ width: "400px", justifyContent: "center", marginLeft: "50%" }}
                  onClick={() => handleCreateInvestmentTypeClick(index)}
                >
                  Create Investment Type
                </button>

              </div>
            )}

            {/* Value + account type (these apply to both) */}
            <div className="normal-text">What is the current value of this investment?*</div>
            <input
              className="input-boxes"
              type="text"
              name="investmentValue"
              value={investment.investmentValue}
              onChange={(e) => handleInvestmentChange(index, e)}
            />

            <div className="normal-text">Account Type*</div>
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

      {/* ------------------------------------------Life Events------------------------------------------ */}
      <div className="subheading">Event Series</div>
      {formData.lifeEvents.map((lifeEvent, index) => (
        <div
          key={lifeEvent.id}
          className={`collapse-container ${lifeEvent.isExpanded ? "expanded" : ""}`}
        >
          {/* Used ChatGPT to help create dynampic Collapsible Header */}
          <div className="collapse-heading">
            <div className="collapsed-text">Event Series {lifeEvent.id}</div>
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
                  <div className="normal-text">Select Event Series Type*</div>
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
                  <div className="normal-text">Name of Event Series*</div>
                  <input
                    className="input-boxes"
                    type="text"
                    name="eventName"
                    value={lifeEvent.eventName}
                    onChange={(e) => handleLifeEventChange(index, e)}
                  />
                  <div className="normal-text">Brief Description of Event Series*</div>
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
              <div className="normal-text">What is the duration of this Event Series?*</div>
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
{/**----------------------------------- STRATEGY ORDERING-------------------------------------------- */}
      <div className="normal-text" style={{ marginTop: "20px" }}>
      How do you want to order your RMD strategy 
      </div>
      <div className="collapse-container">
        {formData.investments.filter(inv => inv.accountType === "pre-tax").length === 0 ? (
          <div className="normal-text">There are no pre-tax investments in this plan.</div>
        ) : (
          rmdOrder.map((selectedId, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <div className="normal-text">RMD Priority #{index + 1}</div>
              <select
                className="collapse-options"
                value={selectedId}
                onChange={(e) => handleRMDOrderChange(index, e.target.value)}
              >
                <option value="">--Select Investment--</option>
                {formData.investments
                  .filter(
                    (inv) =>
                      inv.accountType === "pre-tax" &&
                      (!rmdOrder.includes(inv.id) || inv.id === selectedId)
                  )
                  .map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.investmentName || "Unnamed Investment"}
                    </option>
                  ))}
              </select>
            </div>
          ))
        )}
      </div>

      <div className="normal-text" style={{ marginTop: "20px" }}>
        How do you want to order your Expense Withdrawal Strategy 
      </div>
      <div className="collapse-container">
        {formData.investments.filter(inv => inv.investmentName).length === 0 ? (
          <div className="normal-text">There are no named investments in this plan.</div>
        ) : (
          expenseOrder.map((selectedId, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <div className="normal-text">Expense Withdrawal Priority #{index + 1}</div>
              <select
                className="collapse-options"
                value={selectedId}
                onChange={(e) => handleExpenseOrderChange(index, e.target.value)}
              >
                <option value="">--Select Investment--</option>
                {formData.investments
                  .filter(
                    (inv) =>
                      inv.investmentName && // only include named investments
                      (!expenseOrder.includes(inv.id) || inv.id === selectedId)
                  )
                  .map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.investmentName}
                    </option>
                  ))}
              </select>
            </div>
          ))
        )}
      </div>


      <div className="normal-text" style={{ marginTop: "20px" }}>
        Spending Strategy (discretionary events )
      </div>
      <div className="collapse-container">
        {formData.lifeEvents.filter((e) => e.type === "expense" && e.expenseSource === "Discretionary").length === 0 ? (
          <div className="normal-text">No discretionary expenses in current plan.</div>
        ) : (
          spendingOrder.map((selectedId, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <div className="normal-text">Spending Strategy Priority #{index + 1}</div>
              <select
                className="collapse-options"
                value={selectedId}
                onChange={(e) => handleSpendingOrderChange(index, e.target.value)}
              >
                <option value="">--Select Expense Event--</option>
                {formData.lifeEvents
                  .filter(
                    (event) =>
                      event.type === "expense" &&
                      event.expenseSource === "Discretionary" &&
                      (!spendingOrder.includes(event.id) || event.id === selectedId)
                  )
                  .map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.eventName}
                    </option>
                  ))}
              </select>
            </div>
          ))
        )}
      </div>


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
        How would you like to order your Roth Conversion Strategy
        </div>

        <div className="collapse-container">
          {formData.investments.filter((inv) => inv.accountType === "pre-tax").length === 0 ? (
            <div className="normal-text">No pre-tax investments in current plan.</div>
          ) : (
            rothOrder.map((selectedId, index) => (
              <div key={index} style={{ marginBottom: "10px" }}>
                <div className="normal-text">Roth Conversion Priority #{index + 1}</div>
                <select
                  className="collapse-options"
                  value={selectedId}
                  onChange={(e) => handleRothOrderChange(index, e.target.value)}
                >
                  <option value="">--Select Pre-Tax Investment--</option>
                  {formData.investments
                    .filter(
                      (inv) =>
                        inv.accountType === "pre-tax" &&
                        (!rothOrder.includes(inv.id) || inv.id === selectedId)
                    )
                    .map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.investmentName || "Unnamed Investment"}
                      </option>
                    ))}
                </select>
              </div>
            ))
          )}
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
