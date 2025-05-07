import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
        investmentTypeName: "",
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
        startWith: "",
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
        selectedInvestments: [],
        allocationMode: "",
        fixedAllocation: {},
        glideInitial: {},
        glideFinal: {},
        glidePath: false,
        assetAllocation: {},
        assetAllocation2: {},
        maxCash: "",
      },
    ],
  };
  const location = useLocation();
  
  const isEditMode = location.state?.isEditing || false;
  const editingPlanId = location.state?.planId || null;

  function initializeFormData(incoming) {
    if (!incoming) return defaultFormData;
    const mapped = JSON.parse(JSON.stringify(defaultFormData));

    // ----------------- Map Top-Level Fields ----------------- //
    mapped.planName = incoming.name || "";
    mapped.planType = incoming.maritalStatus === "couple" ? "joint" : "individual";

    const firstBirth = incoming.birthYears?.[0] ?? null;
    const secondBirth = incoming.birthYears?.[1] ?? null;
    mapped.birthYear = firstBirth != null ? String(firstBirth) : "";
    mapped.spouseBirthYear = secondBirth != null ? String(secondBirth) : "";

    mapped.financialGoal = incoming.financialGoal != null
      ? String(incoming.financialGoal)
      : "";

    mapped.residentState = incoming.residenceState || mapped.residentState;
    if (incoming.afterTaxContributionLimit != null) {
      mapped.afterTaxContributionLimit = String(incoming.afterTaxContributionLimit);
    }

    // -------------- Life Expectancy Mapping -------------- //
    const userLE = incoming.lifeExpectancy?.[0] || null;
    if (userLE) {
      if (userLE.type === "fixed") {
        mapped.lifeExpectancyRadio = "yes";
        mapped.lifeExpectancyYears = String(userLE.value || "");
      } else {
        mapped.lifeExpectancyRadio = "no";
        mapped.lifeExpectancyMean = String(userLE.mean || "");
        mapped.lifeExpectancyStd = String(userLE.stdev || "");
      }
    }

    const spouseLE = incoming.lifeExpectancy?.[1] || null;
    if (mapped.planType === "joint" && spouseLE) {
      if (spouseLE.type === "fixed") {
        mapped.spouseLifeExpectancyRadio = "yes";
        mapped.spouseLifeExpectancyYears = String(spouseLE.value || "");
      } else {
        mapped.spouseLifeExpectancyRadio = "no";
        mapped.spouseLifeExpectancyMean = String(spouseLE.mean || "");
        mapped.spouseLifeExpectancyStd = String(spouseLE.stdev || "");
      }
    }

   // -------------- Inflation Assumption -------------- //
    const inf = incoming.inflationAssumption;
    if (inf) {
      if (inf.type === "fixed") {
        mapped.inflationAssumptionType = "fixed";
        mapped.inflationAssumptionFixed = String(inf.value || "");
      } else if (inf.type === "normal") {
        mapped.inflationAssumptionType = "normal";
        mapped.inflationAssumptionMean = String(inf.mean || "");
        mapped.inflationAssumptionStdev = String(inf.stdev || "");
      } else if (inf.type === "uniform") {
        mapped.inflationAssumptionType = "uniform";
        mapped.inflationAssumptionLower = String(inf.lower || "");
        mapped.inflationAssumptionUpper = String(inf.upper || "");
      }
    }



    // -------------- Strategy Arrays -------------- //
    mapped.spendingStrategy = incoming.spendingStrategy?.map(String) || [];
    mapped.expenseWithdrawalStrategy = incoming.expenseWithdrawalStrategy?.map(String) || [];
    mapped.rmdStrategy = incoming.RMDStrategy?.map(String) || [];
    mapped.rothConversion = incoming.RothConversionOpt ? "yes" : "no";
    mapped.rothStartYear = String(incoming.RothConversionStart || "");
    mapped.rothEndYear = String(incoming.RothConversionEnd || "");
    mapped.rothStartYear = incoming.RothConversionStart
      ? String(incoming.RothConversionStart)
      : "";
    mapped.rothEndYear = incoming.RothConversionEnd
      ? String(incoming.RothConversionEnd)
      : "";
    mapped.rothconversionstrategy = incoming.RothConversionStrategy?.map(String) || [];

    // -------------- Investments -------------- //
    const processedTypeIds = new Set<string>();

    mapped.investments = (incoming.investments || []).map((inv, i) => {
      const baseInv = JSON.parse(JSON.stringify(defaultFormData.investments[0]));
      const investmentTypeId = inv.investmentType || "";
      let foundTypeName = "";
      const investmentTypeName = inv.investmentType || "";

      if (investmentTypeId && Array.isArray(incoming.investmentTypes)) {
        const foundTypeObj = incoming.investmentTypes.find((t) => {
          const rawId = typeof t._id === "object" && t._id.$oid ? t._id.$oid : t._id;
          return rawId === investmentTypeId;
        });
        if (foundTypeObj) {
          foundTypeName = foundTypeObj.name;
        }
      }

      let finalTypeName = "";
      if (!processedTypeIds.has(investmentTypeId)) {
        finalTypeName = foundTypeName;
        processedTypeIds.add(investmentTypeId);
      } 
      return {
        ...baseInv,
        id: i + 1,
        isExpanded: false,
        investmentName: inv.id || "",
        investmentValue: String(inv.value || ""),
        accountType: inv.taxStatus || "non-retirement",
        investmentType: "", 
        investmentTypeName,

        returnAmtOrPct: inv.returnAmtOrPct || "percent",
        returnDistribution: inv.returnDistribution?.type || "fixed",
        annualReturnFixed: inv.returnDistribution?.value
          ? String(inv.returnDistribution.value)
          : "",
        annualReturnMean: inv.returnDistribution?.mean
          ? String(inv.returnDistribution.mean)
          : "",
        annualReturnStdev: inv.returnDistribution?.stdev
          ? String(inv.returnDistribution.stdev)
          : "",

        incomeAmtOrPct: inv.incomeAmtOrPct || "percent",
        incomeDistribution: inv.incomeDistribution?.type || "fixed",
        annualIncomeFixed: inv.incomeDistribution?.value
          ? String(inv.incomeDistribution.value)
          : "",
        annualIncomeMean: inv.incomeDistribution?.mean
          ? String(inv.incomeDistribution.mean)
          : "",
        annualIncomeStdev: inv.incomeDistribution?.stdev
          ? String(inv.incomeDistribution.stdev)
          : "",
        taxability: inv.taxability ? (inv.taxability ? "taxable" : "tax-exempt") : "taxable",
      };
    });
    mapped._initialInvestmentTypes = incoming.investmentTypes || [];

    // -------------- Life Events (eventSeries) -------------- //
    mapped.lifeEvents = (incoming.eventSeries || []).map((ev, i) => {
      const base = JSON.parse(JSON.stringify(defaultFormData.lifeEvents[0]));
      const out = {
        ...base,
        id: i + 1,
        isExpanded: false,
        type: ev.type || "",
        eventName: ev.name || "",
        eventDescription: ev.description || "",
        initialAmount: ev.initialAmount != null ? String(ev.initialAmount) : "",
      };
    
      // Set income or expense source based on flags
      if (ev.type === "income") {
        out.incomeSource = ev.socialSecurity ? "socialSecurity" : "wages";
      }
    
      if (ev.type === "expense") {
        out.expenseSource = ev.discretionary ? "Discretionary" : "nonDiscretionary";
      }
      if (ev.type === "investment") {
        out.glidePath = ev.glidePath ?? false;
        out.assetAllocation = ev.assetAllocation || { Stocks: "", Bonds: "", Cash: "" };
        out.assetAllocation2 = ev.assetAllocation2 || { Stocks: "", Bonds: "" };
      }
    
      // Start distribution
      if (ev.start) {
        if (ev.start.type === "fixed") {
          out.startType = "startingYear";
          out.start = String(ev.start.value || "");
        } else if (ev.start.type === "normal") {
          out.startType = "normal";
          out.startMean = String(ev.start.mean || "");
          out.startStdev = String(ev.start.stdev || "");
        } else if (ev.start.type === "uniform") {
          out.startType = "uniform";
          out.startMin = String(ev.start.lower || "");
          out.startMax = String(ev.start.upper || "");
        } else if (ev.start.type === "startWith" || ev.start.type === "startEndEvent") {
          out.startType = ev.start.type;
          out.startWith = ev.start.eventSeries || "";
        }
      }
    
      // Duration distribution
      if (ev.duration) {
        if (ev.duration.type === "fixed") {
          out.durationType = "fixed";
          out.durationYear = String(ev.duration.value || "");
        } else if (ev.duration.type === "normal") {
          out.durationType = "normal";
          out.durationMean = String(ev.duration.mean || "");
          out.durationStdev = String(ev.duration.stdev || "");
        } else if (ev.duration.type === "uniform") {
          out.durationType = "uniform";
          out.durationLower = String(ev.duration.lower || "");
          out.durationUpper = String(ev.duration.upper || "");
        }
      }
    
      // Annual change distribution
      if (typeof ev.changeAmtOrPct === "string") {
        out.annualChangeAmtOrPct = ev.changeAmtOrPct;
      }
      if (ev.changeDistribution?.type) {
        out.annualChangeType = ev.changeDistribution.type;
        if (ev.changeDistribution.type === "fixed") {
          out.annualChangeFixed = ev.changeDistribution.value
            ? String(ev.changeDistribution.value)
            : "";
        } else if (ev.changeDistribution.type === "normal") {
          out.annualChangeMean = ev.changeDistribution.mean
            ? String(ev.changeDistribution.mean)
            : "";
          out.annualChangeStdev = ev.changeDistribution.stdev
            ? String(ev.changeDistribution.stdev)
            : "";
        }
      }
    
      // Inflation-adjusted
      if (typeof ev.inflationAdjusted === "boolean") {
        out.inflationAdjusted = ev.inflationAdjusted ? "yes" : "no";
      }
    
      // Inflation config (if separate per event)
      if (ev.inflationAssumptionType) {
        out.inflationAssumptionType = ev.inflationAssumptionType;
      }
      if (ev.inflationAssumptionMean != null) {
        out.inflationAssumptionMean = String(ev.inflationAssumptionMean);
      }
      if (ev.inflationAssumptionStdev != null) {
        out.inflationAssumptionStdev = String(ev.inflationAssumptionStdev);
      }
      if (ev.inflationAssumptionFixed != null) {
        out.inflationAssumptionFixed = String(ev.inflationAssumptionFixed);
      }
      if (ev.inflationAmtOrPct) {
        out.inflationAmtOrPct = ev.inflationAmtOrPct;
      }
    
      if (ev.userFraction !== undefined && ev.userFraction !== null) {
        out.userFraction = String(ev.userFraction);
      }
    
      // Asset allocation
      if (ev.assetAllocation) {
        out.assetAllocation = { ...ev.assetAllocation };
      }
      if (ev.assetAllocation2) {
        out.assetAllocation2 = { ...ev.assetAllocation2 };
      }
      if (ev.glidePath != null) {
        out.glidePath = !!ev.glidePath;
      }
      if (ev.maxCash != null) {
        out.maxCash = String(ev.maxCash);
      }
    
      return out;
    });
    

    return mapped;
  }

  
  const [formData, setFormData] = useState(() => {
    const init = initializeFormData(location.state?.formData);
    delete init._initialInvestmentTypes;
    return init;
  });
  
  

  // -----------------------------------------------------BASIC INFO STUFF   -----------------------------------------------------//
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const US_STATE_ABBREVIATIONS: string[] = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];
  

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
          investmentTypeName: "",
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
        // set the investmentTypeName to the existing type's name if found
        investmentTypeName: chosenType ? chosenType.name : "", 
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
  interface UploadedFile {
    id: string;
    name: string;
    url: string;
  }
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userId = localStorage.getItem("userId") || "";

  // Function to fetch files uploaded by the user
  const fetchUploadedFiles = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:5000/api/user-files?userId=${userId}`);
      const result = await response.json();
      if (response.ok) {
        setUploadedFiles(result.data);
      } else {
        console.error("Failed to fetch user files:", result.error);
      }
    } catch (error) {
      console.error("Error fetching user files:", error);
    }
  };

  useEffect(() => {
    fetchUploadedFiles();
  }, []);
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate that only YAML files are allowed
    const allowedTypes = [".yaml"];
    const fileExt = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      alert("Only YAML files can be uploaded");
      return;
    }
    setSelectedFile(file);
  };
  const handleChooseFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const uploadUserFile = async () => {
    if (!selectedFile || !userId) {
      alert("Missing file or user ID");
      return;
    }
    
    const formData = new FormData();
    // Important: append userId first
    formData.append("userId", userId);
    formData.append("userFile", selectedFile);
    
    try {
      const response = await fetch("http://localhost:5000/api/upload-user-file", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        console.log("File uploaded successfully", result);
        alert("File uploaded successfully");
        setSelectedFile(null);
        // Reset file input using the ref
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        fetchUploadedFiles();
      } else {
        console.error("Upload failed:", result.error);
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
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
          eventTypeName: "",
          startType: "",
          start: "",
          startMean: "",
          startStdev: "",
          startMax: "",
          startMin: "",
          startLower: "",
          startUpper: "",
          startWith: "",
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
  
    if (childKey !== undefined) {
      newLifeEvents[index][parentKey] = {
        ...(newLifeEvents[index][parentKey] || {}),
        [childKey]: value,
      };
    } else {
      newLifeEvents[index][cleanName] = type === "checkbox" ? checked : value;
    }

    if (
      [
        "annualChangeType",
        "annualChangeFixed",
        "annualChangeMean",
        "annualChangeStdev",
        "annualChangeMin",
        "annualChangeMax",
      ].includes(cleanName)
    ) {
      const event = newLifeEvents[index];
      const updatedChangeDist = { ...event.changeDistribution };
  
      if (cleanName === "annualChangeType") {
        updatedChangeDist.type = value;
      } else if (cleanName === "annualChangeFixed") {
        updatedChangeDist.value = value;
      } else if (cleanName === "annualChangeMean") {
        updatedChangeDist.mean = value;
      } else if (cleanName === "annualChangeStdev") {
        updatedChangeDist.stdev = value;
      } else if (cleanName === "annualChangeMin") {
        updatedChangeDist.lower = value;
      } else if (cleanName === "annualChangeMax") {
        updatedChangeDist.upper = value;
      }
  
      newLifeEvents[index].changeDistribution = updatedChangeDist;
    }

    if (
      [
        "inflationAssumptionType",
        "inflationAssumptionFixed",
        "inflationAssumptionMean",
        "inflationAssumptionStdev",
        "inflationAssumptionLower",
        "inflationAssumptionUpper",
      ].includes(cleanName)
    ) {
      const event = newLifeEvents[index];
  
      if (cleanName === "inflationAssumptionType") {
        event.inflationAssumptionType = value;
      } else if (cleanName === "inflationAssumptionFixed") {
        event.inflationAssumptionFixed = value;
      } else if (cleanName === "inflationAssumptionMean") {
        event.inflationAssumptionMean = value;
      } else if (cleanName === "inflationAssumptionStdev") {
        event.inflationAssumptionStdev = value;
      } else if (cleanName === "inflationAssumptionLower") {
        event.inflationAssumptionLower = value;
      } else if (cleanName === "inflationAssumptionUpper") {
        event.inflationAssumptionUpper = value;
      }
  
      newLifeEvents[index] = event;
    }

    if (["startWith", "startEndEvent"].includes(cleanName)) {
      newLifeEvents[index][cleanName] = value;
    }
    console.log("Submitting life events:", formData.lifeEvents);

  
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
          formData.lifeExpectancyRadio === "yes"
            ? { type: "fixed", value: parseInt(formData.lifeExpectancyYears) }
            : { type: "normal", mean: parseInt(formData.lifeExpectancyMean), stdev: parseInt(formData.lifeExpectancyStd) },

          formData.spouseLifeExpectancyRadio === "yes"
            ? { type: "fixed", value: parseInt(formData.spouseLifeExpectancyYears) }
            : { type: "normal", mean: parseInt(formData.spouseLifeExpectancyMean), stdev: parseInt(formData.spouseLifeExpectancyStd) },
        ]
      : [
          formData.lifeExpectancyRadio === "yes"
            ? { type: "fixed", value: parseInt(formData.lifeExpectancyYears) }
            : { type: "normal", mean: parseInt(formData.lifeExpectancyMean), stdev: parseInt(formData.lifeExpectancyStd) },
        ],
        inflationAssumption: (() => {
          const type = formData.inflationAssumptionType;
        
          if (type === "normal") {
            return {
              type: "normal",
              mean: parseFloat(formData.inflationAssumptionMean || "0"),
              stdev: parseFloat(formData.inflationAssumptionStdev || "0"),
            };
          } else if (type === "uniform") {
            return {
              type: "uniform",
              lower: parseFloat(formData.inflationAssumptionLower || "0"),
              upper: parseFloat(formData.inflationAssumptionUpper || "0"),
            };
          } else {
            return {
              type: "fixed",
              value: parseFloat(formData.inflationAssumptionFixed || "0"),
            };
          }
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
        investmentTypeName: inv.investmentTypeName || "",
        investmentDescription: inv.investmentDescription || "",
        investmentType: inv.investmentTypeName|| "",
        value: inv.investmentValue !== undefined && inv.investmentValue !== ""
          ? parseFloat(inv.investmentValue)
          : 0,


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
            return { type: t, eventSeries: event.startWith || "" };
          }
          return { type: "fixed", value: parseInt(event.start || "0") };
        })(),

        duration: (() => {
          const type = event.durationType || "fixed";
          if (type === "normal") {
            return {
              type: "normal",
              mean: parseFloat(event.durationMean || "0"),
              stdev: parseFloat(event.durationStdev || "0"),
            };
          } else if (type === "uniform") {
            return {
              type: "uniform",
              lower: parseFloat(event.durationLower || "0"),
              upper: parseFloat(event.durationUpper || "0"),
            };
          }
          // default = "fixed"
          return {
            type: "fixed",
            value: parseInt(event.durationYear || "0"),
          };
        })(),
        

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
                } else if (t === "uniform") {
                  return {
                    type: "uniform",
                    lower: parseFloat(event.changeDistribution?.lower || "0"),
                    upper: parseFloat(event.changeDistribution?.upper || "0"),
                  };
                }
                return {
                  type: "fixed",
                  value: parseFloat(event.changeDistribution?.value || "0"),
                };
              })(),
              
              inflationAdjusted: true,
              userFraction: parseFloat(event.userFraction || "1"),
              socialSecurity: isIncome && event.incomeSource === "socialSecurity",
              discretionary: isExpense && event.expenseSource === "Discretionary",
              inflationAssumptionType: event.inflationAssumptionType || "fixed",
              inflationAmtOrPct: event.inflationAmtOrPct || "amount",
              ...(event.inflationAssumptionType === "fixed"
                ? { inflationAssumptionFixed: parseFloat(event.inflationAssumptionFixed || "0") }
                : {}),
              ...(event.inflationAssumptionType === "normal"
                ? {
                    inflationAssumptionMean: parseFloat(event.inflationAssumptionMean || "0"),
                    inflationAssumptionStdev: parseFloat(event.inflationAssumptionStdev || "0"),
                  }
                : {}),
              ...(event.inflationAssumptionType === "uniform"
                ? {
                    inflationAssumptionLower: parseFloat(event.inflationAssumptionLower || "0"),
                    inflationAssumptionUpper: parseFloat(event.inflationAssumptionUpper || "0"),
                  }
                : {}),
            }
          : {}),

          ...(isInvest || isRebalance
            ? {
              assetAllocation:
                isInvest && event.allocationMode === "glide"
                  ? event.glideInitial || {}
                  : isInvest
                    ? event.fixedAllocation || {}
                    : {
                        ...(event.primaryInvestment
                          ? { [event.primaryInvestment]: parseFloat(event.assetAllocation?.[event.primaryInvestment] || "0") }
                          : {}),
                        ...(event.secondaryInvestment
                          ? { [event.secondaryInvestment]: parseFloat(event.assetAllocation?.[event.secondaryInvestment] || "0") }
                          : {}),
                      },
        
              glidePath: isInvest ? event.allocationMode === "glide" : undefined,
        
              assetAllocation2:
                isInvest && event.allocationMode === "glide"
                  ? event.glideFinal || {}
                  : undefined,
        
              selectedInvestments:
                isInvest
                  ? event.selectedInvestments || []
                  : [event.primaryInvestment, event.secondaryInvestment].filter(Boolean),
        
              ...(isInvest && event.maxCash !== undefined
                ? { maxCash: parseFloat(event.maxCash || "0") }
                : {}),
            }
          : {}),
          
      };
    }),

    investmentTypes: [],
    afterTaxContributionLimit: 6500,
    residenceState: formData.residentState || "",
    sharedUsersId: [],
    sharedUserPerms: [],
    version: 1,
  };
};

const [existingInvestmentTypes, setExistingInvestmentTypes] = useState([]);

useEffect(() => {
  const preTax = formData.investments.filter((i) => i.accountType === "pre-tax");
  const allInv = formData.investments;

  // RMD order ­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­
  setRmdOrder((prev) => {
    if (prev.length === preTax.length) return prev;      // nothing to do
    const next = [...prev];
    while (next.length < preTax.length) next.push("");
    while (next.length > preTax.length) next.pop();
    return next;
  });

  // Expense order ­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­
  setExpenseOrder((prev) => {
    if (prev.length === allInv.length) return prev;
    const next = [...prev];
    while (next.length < allInv.length) next.push("");
    while (next.length > allInv.length) next.pop();
    return next;
  });
}, [formData.investments]);

// Sync strategy dropdowns with saved data on edit mode
useEffect(() => {
  if (!isEditMode || !formData?.lifeEvents) return;

  const updatedEvents = formData.lifeEvents.map((ev) => {
  const updatedEvent = { ...ev };

  // Investment event setup
  if (ev.type === "invest") {
    const isGlide = ev.glidePath === true;
    updatedEvent.allocationMode = isGlide ? "glide" : "fixed";
    updatedEvent.selectedInvestments = ev.selectedInvestments || [];
    updatedEvent.glideInitial = isGlide ? ev.assetAllocation || {} : {};
    updatedEvent.glideFinal = isGlide ? ev.assetAllocation2 || {} : {};
    updatedEvent.fixedAllocation = isGlide ? {} : ev.assetAllocation || {};
    updatedEvent.maxCash = ev.maxCash || "";
  }

  // Rebalance event setup
  if (ev.type === "rebalance") {
    const keys = Object.keys(ev.assetAllocation || {});
    const [primaryInvestment, secondaryInvestment] = keys;
    const primaryAccountType =
      formData.investments.find((inv) => inv.investmentName === primaryInvestment)?.accountType || "";

    updatedEvent.primaryInvestment = primaryInvestment;
    updatedEvent.secondaryInvestment = secondaryInvestment;
    updatedEvent.primaryAccountType = primaryAccountType;
    updatedEvent.assetAllocation = ev.assetAllocation || {};
  }

  // Change Distribution (apply to all)
  updatedEvent.changeAmtOrPct = ev.changeAmtOrPct || "amount";
  updatedEvent.changeDistribution = ev.changeDistribution || { type: "fixed", value: 0 };

  return updatedEvent;
  });

  setFormData((prev) => ({
    ...prev,
    lifeEvents: updatedEvents,
  }));
  
}, [isEditMode]);

useEffect(() => {
  if (!isEditMode || !formData) return;

  const typeIdsInPlan = formData.investments.map(inv => inv.investmentType);
  const missingTypes = typeIdsInPlan.filter(
    id => !existingInvestmentTypes.some(type => type._id === id)
  );

  if (missingTypes.length > 0) {
    Promise.all(
      missingTypes.map(id =>
        fetch(`/api/investmenttypes/${id}`).then(res => res.json())
      )
    ).then(fetchedTypes => {
      setExistingInvestmentTypes(prev => [...prev, ...fetchedTypes]);
    });
  }
}, [isEditMode, formData, existingInvestmentTypes]);

const [localInvestmentTypes, setLocalInvestmentTypes] = useState(() =>
  initializeFormData(location.state?.formData)._initialInvestmentTypes || []
);

useEffect(() => {
  const allTypes = [...existingInvestmentTypes, ...localInvestmentTypes];
  if (!isEditMode || !formData.investments.length || allTypes.length === 0)
    return;

  const updated = formData.investments.map(inv => {
    const match = allTypes.find(t => t.name === inv.investmentTypeName);
    return {
      ...inv,
      investmentType: match?._id || inv.investmentType,
    };
  });


  const changed = updated.some(
    (inv, i) => inv.investmentType !== formData.investments[i].investmentType
  );
  if (changed) {
    setFormData(prev => ({ ...prev, investments: updated }));
  }
}, [
  isEditMode,
  formData.investments,          
  existingInvestmentTypes,
  localInvestmentTypes,
]);


useEffect(() => {
  if (!isEditMode || !formData?.investments?.length) return;

  const allInvestmentNames = formData.investments
    .map(inv => inv.investmentName)
    .filter(Boolean);
  const rawOrder = formData.expenseWithdrawalStrategy || [];

  // Keep only valid, unique names
  const filtered = rawOrder.filter(
    (name, idx, self) =>
      allInvestmentNames.includes(name) && self.indexOf(name) === idx
  );

  // Add missing names at the end
  const missing = allInvestmentNames.filter(name => !filtered.includes(name));
  const combined = [...filtered, ...missing];

  setExpenseOrder(combined);
  setRmdOrder(formData.rmdStrategy || []);
  setRothOrder(formData.rothconversionstrategy || []);
  setSpendingOrder(formData.spendingStrategy || []);
}, [isEditMode, formData]);



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


const [localLifeEventTypes, setLocalLifeEventTypes] = useState([]);


const combinedTypes = [
  ...existingInvestmentTypes,
  ...localInvestmentTypes
];

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
      name: inv.investmentTypeName || "Untitled",
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

      setLocalInvestmentTypes((prev) => [...prev, finalType]);
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
  if (formData.financialGoal === "" ||
    isNaN(parseFloat(formData.financialGoal)) ||
    parseFloat(formData.financialGoal) <= 0
  ) {
    alert("Financial Goal must be a valid number greater than 0.");
    return;
  }
  if (formData.name === ""){
    alert("Financial Plan Name cannot be empty");
  }

  for (const [i, inv] of formData.investments.entries()) {
    if (inv.investmentValue === "" || isNaN(parseFloat(inv.investmentValue)) ||(parseFloat(inv.investmentValue)) <= 0) {
      alert(`Investment ${i + 1}: Value must be a valid number.`);
      return;
    }
    if (!inv.investmentName || inv.investmentName.trim() === "") {
      alert(`Investment ${i + 1}: Name can't be empty.`);
      return;
    }
  }

  if (
    formData.lifeExpectancyRadio === "yes" &&
    isNaN(parseFloat(formData.lifeExpectancyYears))
  ) {
    alert("Life Expectancy (fixed): must be a valid number.");
    return;
  }
  if (
    formData.lifeExpectancyRadio === "no" &&
    (isNaN(parseFloat(formData.lifeExpectancyMean)) ||isNaN(parseFloat(formData.lifeExpectancyStd)))
  ) {
    alert("Life Expectancy (normal): mean and std must be valid numbers.");
    return;
  }
 
  if (formData.planType === "joint") {
    if (
      formData.spouseLifeExpectancyRadio === "yes" &&
      isNaN(parseFloat(formData.spouseLifeExpectancyYears))
    ) {
      alert("Spouse Life Expectancy (fixed): must be a valid number.");
      return;
    }
    if (
      formData.spouseLifeExpectancyRadio === "no" &&
      (isNaN(parseFloat(formData.spouseLifeExpectancyMean)) ||isNaN(parseFloat(formData.spouseLifeExpectancyStd)))
    ) {
      alert("Spouse Life Expectancy (normal): mean and std must be valid numbers.");
      return;
    }
  }

if (formData.inflationAssumptionType === "fixed" &&
    isNaN(parseFloat(formData.inflationAssumptionFixed))) {
  alert("Fixed inflation assumption must be a valid number.");
  return;
}
if (formData.inflationAssumptionType === "normal" &&
    (isNaN(parseFloat(formData.inflationAssumptionMean)) || isNaN(parseFloat(formData.inflationAssumptionStdev)))) {
  alert("Normal inflation assumption: mean and std must be valid numbers.");
  return;
}
if (formData.inflationAssumptionType === "uniform" &&
    (isNaN(parseFloat(formData.inflationAssumptionLower)) || isNaN(parseFloat(formData.inflationAssumptionUpper)))) {
  alert("Uniform inflation assumption: lower and upper bounds must be valid numbers.");
  return;
}

console.log("Form Data at Submit:", formData);
console.log("First Life Event:", formData.lifeEvents?.[0]);
console.log("Inflation Type:", formData.lifeEvents?.[0]?.inflationAssumptionType);
console.log("Inflation Fixed Value:", formData.lifeEvents?.[0]?.inflationAssumptionFixed);


for (const [i, ev] of formData.lifeEvents.entries()) {
  if (!ev.eventName || ev.eventName.trim() === "") {
    alert(`Life Event ${i + 1}: Event name is required.`);
    return;
  }
  if (!ev.type) {
    alert(`Life Event ${i + 1}: Event type is required.`);
    return;
  }
  if (ev.startType === "") {
    alert(`Life Event ${i + 1}: Start type is required.`);
    return;
  }

  if (ev.startType === "startingYear" && isNaN(parseInt(ev.start))) {
    alert(`Life Event ${i + 1}: Start year must be a valid number.`);
    return;
  }

  if (ev.startType === "normal" &&
    (isNaN(parseFloat(ev.startMean)) || isNaN(parseFloat(ev.startStdev)))) {
    alert(`Life Event ${i + 1}: Normal start distribution must have valid mean and stdev.`);
    return;
  }

  if (ev.startType === "uniform" &&
    (isNaN(parseFloat(ev.startMin)) || isNaN(parseFloat(ev.startMax)))) {
    alert(`Life Event ${i + 1}: Uniform start range must have valid min and max.`);
    return;
  }

  if (
    (ev.startType === "startWith" && !ev.startWith) ||
    (ev.startType === "startEndEvent" && !ev.startEndEvent)
  ) {
    alert(`Life Event ${i + 1}: You must select an event to sync with.`);
    return;
  }
  

  if (!ev.durationType) {
    alert(`Life Event ${i + 1}: Duration type is required.`);
    return;
  }

  if (ev.durationType === "fixed" && isNaN(parseInt(ev.durationYear))) {
    alert(`Life Event ${i + 1}: Duration (fixed) must be a valid number.`);
    return;
  }

  if (ev.durationType === "normal" &&
    (isNaN(parseFloat(ev.durationMean)) || isNaN(parseFloat(ev.durationStdev)))) {
    alert(`Life Event ${i + 1}: Duration (normal) must have valid mean and stdev.`);
    return;
  }

  if (ev.durationType === "uniform" &&
    (isNaN(parseFloat(ev.durationLower)) || isNaN(parseFloat(ev.durationUpper)))) {
    alert(`Life Event ${i + 1}: Duration (uniform) must have valid lower and upper bounds.`);
    return;
  }

  if ((ev.type === "income" || ev.type === "expense") && isNaN(parseFloat(ev.initialAmount))) {
    alert(`Life Event ${i + 1}: Initial amount must be a valid number.`);
    return;
  }
}

  
  try {
    formData.investments = formData.investments.map(inv => {
      const matchingType = [...existingInvestmentTypes, ...localInvestmentTypes].find(
        type => type._id === inv.investmentType
      );

      if (!matchingType) {
        console.error("No matching investment type found for:", inv.investmentTypeName);
      }
  
      return {
        ...inv,
        investmentType: matchingType?._id || "", 
      };
    });
    const transformedData = transformFormData(formData, rmdOrder, expenseOrder, spendingOrder, rothOrder);
    const usedTypeIds = new Set(
      formData.investments.map((inv) => String(inv.createdTypeId || inv.investmentType))
    );
    
    const usedInvestmentTypes = [...existingInvestmentTypes, ...localInvestmentTypes].filter((type) =>
      usedTypeIds.has(String(type._id))
    );    
    
    const allInvestmentIds = formData.investments.map((inv) => inv.id);
    const selectedExpenseIds = expenseOrder.map((index) => formData.investments[index]?.id);
    const missingExpenseIds = allInvestmentIds.filter(id => !selectedExpenseIds.includes(id));

    const completedExpenseOrder = [
      ...expenseOrder,
      ...missingExpenseIds.map(
        id => formData.investments.findIndex((inv) => inv.id === id)
      ).filter(idx => idx !== -1)
    ];
    const finalPayload = {
      ...transformedData,
      investmentTypes: usedInvestmentTypes, 
      RMDStrategy: rmdOrder.map((val, idx) => {
        const inv = formData.investments.find((inv, i) => i === idx);
        return inv?.investmentName || "";
      }).filter(Boolean),
      
      expenseWithdrawalStrategy: completedExpenseOrder.map((val, idx) => {
        const inv = formData.investments[val];
        return inv?.investmentName || "";
      }).filter(Boolean),      
      
      RothConversionStrategy: rothOrder.map((val, idx) => {
        const inv = formData.investments.find((inv, i) => i === idx);
        return inv?.investmentName || "";
      }).filter(Boolean),
      
      spendingStrategy: spendingOrder.map((val, idx) => {
        const ev = formData.lifeEvents.find((ev, i) => i === idx && ev.expenseSource === "Discretionary");
        return ev?.eventName || "";
      }).filter(Boolean)
      

    };
    
    const endpoint = isEditMode
      ? `http://localhost:5000/api/plans/${editingPlanId}`
      : "http://localhost:5000/api/plans";

    const method = isEditMode ? "PUT" : "POST";

    const planRes = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalPayload),
      
    });


    if (!planRes.ok) {
      throw new Error("Failed to save plan");
    }

    alert(isEditMode ? "Plan updated successfully!" : "Plan created successfully!");

    if (isEditMode) {
      navigate("/scenario");
    } else {
      setFormData(JSON.parse(JSON.stringify(defaultFormData)));
    }
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
      <div style ={{display:"flex", flexDirection: "column", width:"80%", marginTop:"5%", fontSize:"14px", color:"#db0404"}}>
        <div style ={{fontWeight:"bold"}}>
          Note:
        </div>
        This simulation makes several simplifying assumptions. It assumes all users take the federal standard deduction and that investments 
        have no capital gains at the start of the simulation. Simulations begin in the current calendar year. Tax calculations are approximate and 
        do not include detailed state-specific deductions or credits beyond the selected residence state. Inflation, investment returns, and income 
        distributions follow the statistical models specified by the user. The simulation also assumes no fees, penalties, or required minimum 
        distributions (RMDs) unless explicitly configured. Investment growth is treated as tax-deferred or tax-free based on account type.
      </div>

      {/* ------------------------------------------Basic Information------------------------------------------ */}
      <div className="subheading">Basic Information</div>
      <div className="question">
        {/* Plan Name */}
        <div className="normal-text">Name Your Plan <span style={{ color: "#db0404" }}>(*Required*)</span></div>
        <input
          className="input-boxes"
          type="text"
          name="planName"
          value={formData.planName}
          onChange={handleChange}
        />

        {/* Plan Type */}
        <div className="normal-text">Plan Type <span style={{ color: "#db0404" }}>(*Required*)</span></div>
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
        <div className="normal-text">What Year Were You Born <span style={{ color: "#db0404" }}>(*Required*)</span></div>
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
            <div className="normal-text">Spouse's Birth Year <span style={{ color: "#db0404" }}>(*Required*)</span></div>
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
              {formData.spouseLifeExpectancyRadio === "no" && (
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

        <div className="normal-text ">What state are you in? <span style={{ color: "#db0404" }}>(*Required*)</span></div>
        <select
          className="collapse-options"
          name="residentState"
          value={formData.residentState}
          onChange={(e) => {
            const value = e.target.value;
            setFormData((prev) => ({ ...prev, residentState: value }));
          }}
        >
          <option value="">--Select--</option>
          {US_STATE_ABBREVIATIONS.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

    {/* ------------------------------------------Investments & Savings------------------------------------------ */}
    <div className="subheading">Investments & Savings</div>

    <div className="normal-text">What is your financial goal? <span style={{ color: "#db0404" }}>(*Required*)</span></div>
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
            <div className="normal-text">Select Investment Type</div>
            <select
              className="collapse-options"
              name="investmentType"
              value={investment.investmentType}
              onChange={(e) => {
                const value = e.target.value;
                const updated = [...formData.investments];

                if (value === "create_new") {
                  updated[index].isCreatingNewType = true;
                  updated[index].investmentType = "";
                  updated[index].investmentTypeName = ""; // optional reset
                } else {
                  updated[index].isCreatingNewType = false;
                  updated[index].investmentType = value;
                  const selectedType = combinedTypes.find((t) => t._id === value);
                  updated[index].investmentTypeName = selectedType?.name || "";
                }

                setFormData((prev) => ({ ...prev, investments: updated }));
              }}
            >
              <option value="">--Select--</option>
              <option value="create_new">-- Create New Investment Type --</option>
              {combinedTypes.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.name}
                </option>
              
              ))}
            </select>

            {/* Only show this stuff if they're creating a new type */}
            {investment.isCreatingNewType && (
              <div className="investment-type-container">
                <div className="normal-text">Create New Investment Type Name</div>
                <input
                  className="input-boxes"
                  type="text"
                  name="investmentTypeName"
                  value={investment.investmentTypeName}
                  onChange={(e) => handleInvestmentChange(index, e)}
                />
                <div className="normal-text">Brief Description of Investment <span style={{ color: "#db0404" }}>(*Required*)</span></div>
                <textarea
                  className="input-boxes textarea-box"
                  rows="4"
                  name="investmentDescription"
                  value={investment.investmentDescription}
                  onChange={(e) => handleInvestmentChange(index, e)}
                ></textarea>
                <div className="normal-text">How would you like to express the investment's annual return? <span style={{ color: "#db0404" }}>(*Required*)</span></div>
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
                <div className="normal-text">Expected annual income from dividends or interest? <span style={{ color: "#db0404" }}>(*Required*)</span></div>
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
                <div className="normal-text">Is this investment taxable? <span style={{ color: "#db0404" }}>(*Required*)</span></div>
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
                    
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="taxFile"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        
                        handleInvestmentChange(index, e);
                        handleFileSelection(e)
                        
                        
                      }}
                    />
                    
                    {/* Custom "Choose File" button */}
                    <button
                      onClick={handleChooseFile}
                      className="custom-btn"
                    >
                      Choose File
                    </button>
                    
                    {/* Show selected file name and upload button if a file is chosen */}
                    {selectedFile && (
                      <div>
                        <p style={{ color: "red" }}>Selected file: {selectedFile.name}</p>
                        <button
                          onClick={uploadUserFile}
                          className="custom-btn"
                        >
                          Upload Selected File
                        </button>
                      </div>
                    )}
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

            <div className="normal-text">Investment Name </div>
            <input
              className="input-boxes"
              type="text"
              name="investmentName"
              value={investment.investmentName}
              onChange={(e) => handleInvestmentChange(index, e)}
            />
            {/* Value + account type (these apply to both) */}
            <div className="normal-text">What is the current value of this investment? <span style={{ color: "#db0404" }}>(*Required*)</span></div>
            <input
              className="input-boxes"
              type="text"
              name="investmentValue"
              value={investment.investmentValue}
              onChange={(e) => handleInvestmentChange(index, e)}
            />

            <div className="normal-text">Account Type <span style={{ color: "#db0404" }}>(*Required*)</span></div>
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
                  <div className="normal-text">Select Event Series Type <span style={{ color: "#db0404" }}>(*Required*)</span></div>
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
                      <div>
                      {/* Investment selector (shared for fixed or glide) */}
                      <div className="normal-text">Select Investments for Asset Allocation</div>
                      <select
                        className="collapse-options"
                        name="selectedInvestments"
                        value={lifeEvent.selectedInvestments || []}
                        onChange={(e) => {
                          const target = e.target as HTMLSelectElement;
                          const selected = Array.from(target.selectedOptions).map((opt) => opt.value);
                          handleLifeEventChange(index, {
                            target: { name: "selectedInvestments", value: selected },
                          });
                        }}
                      >
                        <option disabled value="">-- Select --</option>
                        {formData.investments
                          .filter((inv) => inv.accountType !== "pre-tax")
                          .map((inv) => (
                            <option key={inv.investmentName} value={inv.investmentName}>
                              {inv.investmentName}
                            </option>
                          ))}
                      </select>


                      </div>

                      <RadioGroup
                        name={`allocationMode-${index}`}
                        selectedValue={lifeEvent.allocationMode}
                        onChange={(e) => handleLifeEventChange(index, {
                          target: { name: "allocationMode", value: e.target.value }
                        })}
                        options={[
                          { label: "Fixed Allocation", value: "fixed" },
                          { label: "Glide Path", value: "glide" }
                        ]}
                      />
                      {lifeEvent.allocationMode === "fixed" && (
                      <>
                        {formData.investments
                          .filter(inv => inv.accountType !== "pre-tax")
                          .map((inv, invIndex) => (
                            <div key={invIndex}>
                              <label>{inv.investmentName}</label>
                              <input
                                type="number"
                                className="small-input-boxes"
                                name={`fixedAllocation.${inv.investmentName}`}
                                value={lifeEvent.fixedAllocation?.[inv.investmentName] || ""}
                                onChange={(e) => handleAssetAllocationInputChange(index, e, "fixedAllocation")}
                              />
                              %
                            </div>
                          ))}
                      </>
                    )}
                    {lifeEvent.allocationMode === "glide" && (
                      <div>
                        <div className="normal-text">Initial Allocation:</div>
                        {formData.investments
                          .filter(inv => inv.accountType !== "pre-tax")
                          .map((inv, invIndex) => (
                            <div key={invIndex}>
                              <label>{inv.investmentName}</label>
                              <input
                                type="number"
                                className="small-input-boxes"
                                name={`glideInitial.${inv.investmentName}`}
                                value={lifeEvent.glideInitial?.[inv.investmentName] || ""}
                                onChange={(e) => handleAssetAllocationInputChange(index, e, "glideInitial")}
                              />
                              %
                            </div>
                          ))}

                          <div className="normal-text" style={{ marginTop: "10px" }}>Final Allocation:</div>
                          {formData.investments
                            .filter(inv => inv.accountType !== "pre-tax")
                            .map((inv, invIndex) => (
                              <div key={invIndex}>
                                <label>{inv.investmentName}</label>
                                <input
                                  type="number"
                                  className="small-input-boxes"
                                  name={`glideFinal.${inv.investmentName}`}
                                  value={lifeEvent.glideFinal?.[inv.investmentName] || ""}
                                  onChange={(e) => handleAssetAllocationInputChange(index, e, "glideFinal")}
                                />
                                %
                              </div>
                            ))}
                        </div>
                      )}
                      {lifeEvent.type === "invest" && (
                        <div>
                          <label className="normal-text">Maximum Cash Holding:</label>
                          <input
                            className="small-input-boxes"
                            type="number"
                            name="maxCash"
                            value={lifeEvent.maxCash || ""}
                            onChange={(e) => handleLifeEventChange(index, e)}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {lifeEvent.type === "rebalance" && (
                    <>
                      <div className="normal-text">Asset Allocation (Rebalance):</div>

                      {/* First Investment Dropdown */}
                      <div className="normal-text">Select First Investment</div>
                      <select
                        className="collapse-options"
                        name="primaryInvestment"
                        value={lifeEvent.primaryInvestment || ""}
                        onChange={(e) => {
                          const selected = e.target.value;
                          const selectedAccountType = formData.investments.find(
                            (inv) => inv.investmentName === selected
                          )?.accountType;

                          handleLifeEventChange(index, {
                            target: { name: "primaryInvestment", value: selected }
                          });

                          handleLifeEventChange(index, {
                            target: { name: "primaryAccountType", value: selectedAccountType || "" }
                          });

                          handleLifeEventChange(index, {
                            target: { name: "secondaryInvestment", value: "" }
                          });

                          // Reset assetAllocation
                          handleLifeEventChange(index, {
                            target: { name: "assetAllocation", value: {} }
                          });
                        }}
                      >
                        <option value="">-- Select --</option>
                        {formData.investments.map((inv) => (
                          <option key={inv.investmentName} value={inv.investmentName}>
                            {inv.investmentName} ({inv.accountType})
                          </option>
                        ))}
                      </select>

                      {/* First Investment Allocation Input */}
                      {lifeEvent.primaryInvestment && (
                        <div style={{ marginTop: "10px" }}>
                          <label className="normal-text">
                            Enter allocation for {lifeEvent.primaryInvestment} (as a decimal between 0 and 1):
                          </label>
                          <input
                            className="input-boxes"
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            value={lifeEvent.assetAllocation?.[lifeEvent.primaryInvestment] || ""}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value || "0");
                          
                              const alloc = {
                                [lifeEvent.primaryInvestment]: val,
                                [lifeEvent.secondaryInvestment]: Math.max(0, 1 - val)
                              };

                              handleLifeEventChange(index, {
                                target: { name: "assetAllocation", value: alloc }
                              });
                            }}
                          />
                        </div>
                      )}

                      {/* Second Investment Dropdown */}
                      {lifeEvent.primaryInvestment && (
                        <>
                          <div className="normal-text" style={{ marginTop: "10px" }}>
                            Select Second Investment (Same Account Type)
                          </div>
                          <select
                            className="collapse-options"
                            name="secondaryInvestment"
                            value={lifeEvent.secondaryInvestment || ""}
                            onChange={(e) => {
                              const selected = e.target.value;
                              const primaryVal = parseFloat(
                                lifeEvent.assetAllocation?.[lifeEvent.primaryInvestment] || "0"
                              );

                              const rounded = (n: number) => Math.round(n * 1000) / 1000;

                              const alloc = {
                                [lifeEvent.primaryInvestment]: rounded(primaryVal),
                                [selected]: rounded(1 - primaryVal)
                              };
                              
                              handleLifeEventChange(index, {
                                target: { name: "secondaryInvestment", value: selected }
                              });

                              handleLifeEventChange(index, {
                                target: { name: "assetAllocation", value: alloc }
                              });
                            }}
                          >
                            <option value="">-- Select --</option>
                            {formData.investments
                              .filter(
                                (inv) =>
                                  inv.accountType === lifeEvent.primaryAccountType &&
                                  inv.investmentName !== lifeEvent.primaryInvestment
                              )
                              .map((inv) => (
                                <option key={inv.investmentName} value={inv.investmentName}>
                                  {inv.investmentName}
                                </option>
                              ))}
                          </select>
                        </>
                      )}
                    </>
                  )}


                </div>
                <div className="right-side">
                  <div className="normal-text">Name of Event Series <span style={{ color: "#db0404" }}>(*Required*)</span></div>
                  <input
                    className="input-boxes"
                    type="text"
                    name="eventName"
                    value={lifeEvent.eventName}
                    onChange={(e) => handleLifeEventChange(index, e)}
                  />
                  <div className="normal-text">Brief Description of Event Series </div>
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
                <div className="normal-text">What is the initial amount for this event? <span style={{ color: "#db0404" }}>(*Required*)</span></div>
                <input
                  className="input-boxes"
                  type="text"
                  name="initialAmount"
                  placeholder="Enter initial amount..."
                  value={lifeEvent.initialAmount || ""}
                  onChange={(e) => handleLifeEventChange(index, e)}
                />

                {/* Expected Annual Change */}
                <div className="normal-text">How should the annual change be expressed? <span style={{ color: "#db0404" }}>(*Required*)</span></div>
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
                      name="userFraction"
                      placeholder="e.g. 50"
                      value={lifeEvent.userFraction || ""}
                      onChange={(e) => handleLifeEventChange(index, e)}
                    />
                  </>
                )}
              </>
            )}

              {/* Start Date */}
              <div className="normal-text">
                How would you like to express the start date of this event? (select 1) <span style={{ color: "#db0404" }}>(*Required*)</span>
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
                      value="startWith"
                      checked={lifeEvent.startType === "startWith"}
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
                  {(lifeEvent.startType === "startWith" || lifeEvent.startType === "startEndEvent") && (
                  <div className="normal-text">
                    Select Event to Sync Start Time With
                    <select
                      className="collapse-options"
                      name={lifeEvent.startType === "startWith" ? "startWith" : "startEndEvent"}
                      value={
                        lifeEvent.startType === "startWith"
                          ? lifeEvent.startWith
                          : lifeEvent.startEndEvent
                      }
                      onChange={(e) => handleLifeEventChange(index, e)}
                    >
                      <option value="">-- Select Event --</option>
                      {formData.lifeEvents
                        .filter((_, i) => i !== index)
                        .map((ev) => (
                          <option key={ev.eventName} value={ev.eventName}>
                            {ev.eventName || `Event ${ev.id}`}
                          </option>
                        ))}
                    </select>
                  </div>
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
              <div className="normal-text">How should the duration of this event be expressed? <span style={{ color: "#db0404" }}>(*Required*)</span></div>
              <div className="split-container">
                <div className="left-side">
                  <label className="normal-text">
                    <input
                      type="radio"
                      name={`durationType-${index}`}
                      value="fixed"
                      checked={lifeEvent.durationType === "fixed"}
                      onChange={(e) =>
                        handleLifeEventChange(index, {
                          target: { name: "durationType", value: e.target.value },
                        })
                      }
                    />
                    Fixed Amount
                  </label>
                  <label className="normal-text">
                    <input
                      type="radio"
                      name={`durationType-${index}`}
                      value="normal"
                      checked={lifeEvent.durationType === "normal"}
                      onChange={(e) =>
                        handleLifeEventChange(index, {
                          target: { name: "durationType", value: e.target.value },
                        })
                      }
                    />
                    Normal Distribution
                  </label>
                  <label className="normal-text">
                    <input
                      type="radio"
                      name={`durationType-${index}`}
                      value="uniform"
                      checked={lifeEvent.durationType === "uniform"}
                      onChange={(e) =>
                        handleLifeEventChange(index, {
                          target: { name: "durationType", value: e.target.value },
                        })
                      }
                    />
                    Uniform Distribution
                  </label>
                </div>

                <div className="right-side">
                  {lifeEvent.durationType === "fixed" && (
                    <input
                      className="input-boxes"
                      type="text"
                      name="durationYear"
                      placeholder="Enter duration in years"
                      value={lifeEvent.durationYear || ""}
                      onChange={(e) => handleLifeEventChange(index, e)}
                    />
                  )}
                  {lifeEvent.durationType === "normal" && (
                    <>
                      <div className="normal-text">Mean</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="durationMean"
                        placeholder="Enter mean..."
                        value={lifeEvent.durationMean || ""}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      />
                      <div className="normal-text">Standard Deviation</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="durationStdev"
                        placeholder="Enter stdev..."
                        value={lifeEvent.durationStdev || ""}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      />
                    </>
                  )}
                  {lifeEvent.durationType === "uniform" && (
                    <>
                      <div className="normal-text">Lower Bound</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="durationLower"
                        placeholder="Enter lower bound..."
                        value={lifeEvent.durationLower || ""}
                        onChange={(e) => handleLifeEventChange(index, e)}
                      />
                      <div className="normal-text">Upper Bound</div>
                      <input
                        className="input-boxes"
                        type="text"
                        name="durationUpper"
                        placeholder="Enter upper bound..."
                        value={lifeEvent.durationUpper || ""}
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
      {/* Inflation */}
      <div className="normal-text">How would you like to assume inflation? <span style={{ color: "#db0404" }}>(*Required*)</span></div>
      <div className="split-container">
        <div className="left-side">
          <RadioGroup
            name="inflationAssumptionType"
            selectedValue={formData.inflationAssumptionType || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                inflationAssumptionType: e.target.value,
              }))
            }
            options={[
              { label: "Fixed Percentage", value: "fixed" },
              { label: "Normal Distribution", value: "normal" },
              { label: "Uniform Distribution", value: "uniform" },
            ]}
          />
        </div>

        <div className="right-side">
          {formData.inflationAssumptionType === "fixed" && (
            <>
              <div className="normal-text">Fixed Inflation Rate (%)</div>
              <input
                className="input-boxes"
                type="number"
                name="inflationAssumptionFixed"
                value={formData.inflationAssumptionFixed || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    inflationAssumptionFixed: e.target.value,
                  }))
                }
              />
            </>
          )}

    {formData.inflationAssumptionType === "normal" && (
      <>
        <div className="normal-text">Mean Inflation Rate (%)</div>
        <input
          className="input-boxes"
          type="number"
          name="inflationAssumptionMean"
          value={formData.inflationAssumptionMean || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              inflationAssumptionMean: e.target.value,
            }))
          }
        />
        <div className="normal-text">Standard Deviation (%)</div>
        <input
          className="input-boxes"
          type="number"
          name="inflationAssumptionStdev"
          value={formData.inflationAssumptionStdev || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              inflationAssumptionStdev: e.target.value,
            }))
          }
        />
      </>
    )}

    {formData.inflationAssumptionType === "uniform" && (
      <>
        <div className="normal-text">Lower Bound (%)</div>
        <input
          className="input-boxes"
          type="number"
          name="inflationAssumptionLower"
          value={formData.inflationAssumptionLower || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              inflationAssumptionLower: e.target.value,
            }))
          }
        />
        <div className="normal-text">Upper Bound (%)</div>
        <input
          className="input-boxes"
          type="number"
          name="inflationAssumptionUpper"
          value={formData.inflationAssumptionUpper || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              inflationAssumptionUpper: e.target.value,
            }))
          }
        />
      </>
    )}
  </div>
</div>

{/**----------------------------------- STRATEGY ORDERING-------------------------------------------- */}
      <div className="normal-text" style={{ marginTop: "20px" }}>
      How do you want to order your RMD strategy 
      </div>
      <div className="collapse-container">
        {formData.investments.filter(inv => inv.accountType === "pre-tax").length === 0 ? (
          <div className="normal-text">There are no pre-tax investments in this plan.</div>
        ) : (
          rmdOrder.map((selected, index) => (
            <div key={index}>
              <div className="normal-text">RMD Priority #{index + 1}</div>
              <select
                className="collapse-options"
                value={selected}
                onChange={(e) => handleRMDOrderChange(index, e.target.value)}
              >
                <option value="">--Select --</option>
                {formData.investments
                  .filter(inv => inv.accountType === "pre-tax")
                  .map((inv, idx) => (
                    <option key={idx} value={inv.investmentName}>
                      {inv.investmentName}
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
          expenseOrder.map((selected, index) => (
            <div key={index}>
              <div className="normal-text">Expense Withdrawal Priority #{index + 1}</div>
              <select
                className="collapse-options"
                value={selected}
                onChange={(e) => handleExpenseOrderChange(index, e.target.value)}
              >
                <option value="">--Select--</option>
                {formData.investments.map((inv, idx) => (
                  <option key={idx} value={inv.investmentName}>
                    {inv.investmentName}
                  </option>
                ))}
              </select>
            </div>
          ))
        )}
      </div>


      <div className="normal-text" style={{ marginTop: "20px" }}>
        Spending Strategy For Discretionary Events 
      </div>
      <div className="collapse-container">
        {formData.lifeEvents.filter((e) => e.type === "expense" && e.expenseSource === "Discretionary").length === 0 ? (
          <div className="normal-text">No discretionary expenses in current plan.</div>
        ) : (
          spendingOrder.map((selected, index) => (
            <div key={index}>
              <label className="normal-text">Spending Priority #{index + 1}</label>
              <select
                className="collapse-options"
                value={selected}
                onChange={(e) => handleSpendingOrderChange(index, e.target.value)}
              >
                <option value="">--Select--</option>
                {formData.lifeEvents
                  .filter(ev => ev.type === "expense" && ev.expenseSource === "Discretionary")
                  .map((ev, idx) => (
                    <option key={idx} value={ev.eventName}>
                      {ev.eventName}
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
        {formData.rothConversion === "yes" && (
          <>
            <div className="normal-text" style={{ marginTop: "20px" }}>
            How would you like to order your Roth Conversion Strategy
            </div>
    
            <div className="collapse-container">
              {formData.investments.filter((inv) => inv.accountType === "pre-tax").length === 0 ? (
                <div className="normal-text">No pre-tax investments in current plan.</div>
              ) : (
                rothOrder.map((selected, index) => (
                  <div key={index}>
                    <div className="normal-text">Roth Conversion Priority #{index + 1}</div>
                    <select
                      className="collapse-options"
                      value={selected}
                      onChange={(e) => handleRothOrderChange(index, e.target.value)}
                    >
                      <option value="">--Select--</option>
                      {formData.investments
                        .filter(inv => inv.accountType === "pre-tax")
                        .map((inv, idx) => (
                          <option key={idx} value={inv.investmentName}>
                            {inv.investmentName}
                          </option>
                        ))}
                    </select>
                  </div>
                ))
              )}
            </div>
          </>
        )}
        
      </div>

      {/* Final Save Button */}
      <button className="page-buttons" onClick={handleSubmit}>
        SAVE
      </button>
    </div>
  );
};

export default CreatePlan;
