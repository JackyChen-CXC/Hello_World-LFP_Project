import FinancialPlan from "../models/FinancialPlan";
import InvestmentType from "../models/InvestmentType";

export const createPlan = async (req: any, res: any) => {
	try {
		// get all fields for plan, create new plan and save.
        // Extract data from request body

        // const financialPlan = new FinancialPlan(req.body);
        // const savedPlan = await financialPlan.save();

        const {
            userId, name, maritalStatus, birthYears, lifeExpectancy, spousebirthyear,
            investmentTypes, investments, eventSeries,
            inflationAssumption, afterTaxContributionLimit,
            spendingStrategy, expenseWithdrawalStrategy, RMDStrategy,
            RothConversionOpt, RothConversionStart, RothConversionEnd, RothConversionStrategy,
            financialGoal, residenceState,
        } = req.body;

        // Create a new FinancialPlan document
        const financialPlan = new FinancialPlan({
            userId, name, maritalStatus, birthYears, lifeExpectancy, spousebirthyear,
            investmentTypes, investments, eventSeries,
            inflationAssumption, afterTaxContributionLimit,
            spendingStrategy, expenseWithdrawalStrategy, RMDStrategy,
            RothConversionOpt, RothConversionStart, RothConversionEnd, RothConversionStrategy,
            financialGoal, residenceState,
        });

        // Save the financial plan to MongoDB
        const savedPlan = await financialPlan.save()
            .then(() => {
                console.log(`Saved Financial Plan: ${name}`);
            })
            .catch((err) => {
                console.error(`Error Financial Plan ${name}:`, err);
            });

        return res.status(200).json({
            status: "SUCCESS",
            error: false,
            message: "Financial Plan created successfully",
            data: savedPlan
        });
	} catch (error) {
		res.status(200).json({
			status: "ERROR",
			error: true,
			message: "Creating Plan failed",
		});
	}
};

export const editPlan = async (req: any, res: any) => {
	try {
		// get fields, if not null, change them in the plan
	} catch (error) {
		res.status(200).json({
			status: "ERROR",
			error: true,
			message: "Editting Plan failed.",
		});
	}
};

export const deletePlan = async (req: any, res: any) => {
    try {
      const { id } = req.body;
  
      const plan = await FinancialPlan.findById(id);
      if (!plan) {
        return res.status(404).json({ status: "ERROR", message: "Plan not found" });
      }
  
      // Delete associated investmentTypes
      if (Array.isArray(plan.investmentTypes)) {
        await InvestmentType.deleteMany({ _id: { $in: plan.investmentTypes } });
      }
  
      // Delete the plan itself
      await FinancialPlan.findByIdAndDelete(id);
  
      res.status(200).json({ status: "SUCCESS", message: "Plan and investment types deleted successfully" });
    } catch (error) {
      console.error("Error deleting plan:", error);
      res.status(500).json({
        status: "ERROR",
        error: true,
        message: "Deleting plan failed.",
      });
    }
  };

export const importPlan = async (req: any, res: any) => {
    try {
        // import from YAML (use the scenario.YAML as ref)
        const userId = req.body.userId;
        const scenarioData = req.body.data;

        // console.log(userId);
        // console.log(scenarioData);

        // Add InvestmentTypes
        // Change InvestmentTypes to name attribute (String)
        const importedInvestmentTypes = scenarioData.investmentTypes;
        const savedInvestmentTypes = await InvestmentType.insertMany(importedInvestmentTypes);
        scenarioData.investmentTypes = savedInvestmentTypes;

        // eventSeries
        // console.log(scenarioData.eventSeries)

        // Validate and create a new document
        const newScenario = new FinancialPlan(scenarioData);
        newScenario.userId = userId; // for now use username while User is not stored in mongoDB
        const savedPlan = await newScenario.save();
        // console.log(newScenario);

        return res.json({ message: "Scenario saved successfully!", data: savedPlan });
    }
    catch (error) {
        return res.status(200).json({
            status: "ERROR",
            error: true,
            message: "Importing plan failed.",
            err: error
        });
    }
};

export const exportPlan = async (req: any, res: any) => {
    try {
        const userId = req.body.userId;
        const scenarioData = req.body.data;
        
        const planId = scenarioData.id;
        const scenario = await FinancialPlan.findById(planId);

        if (scenario) {
            // Prepare the result object
            const result = {
                name: scenario.name,
                maritalStatus: scenario.maritalStatus,
                birthYears: scenario.birthYears,
                lifeExpectancy: scenario.lifeExpectancy,
                
                investmentTypes: scenario.investmentTypes,
                
                investments: scenario.investments ? 
                    scenario.investments.map(inv => ({
                        investmentType: inv.investmentType,
                        value: inv.value,
                        taxStatus: inv.taxStatus,
                        id: inv.id
                    })) : [],
                
                eventSeries: scenario.eventSeries,
                
                inflationAssumption: scenario.inflationAssumption,
                afterTaxContributionLimit: scenario.afterTaxContributionLimit,
                spendingStrategy: scenario.spendingStrategy,
                expenseWithdrawalStrategy: scenario.expenseWithdrawalStrategy,
                RMDStrategy: scenario.RMDStrategy,
                
                RothConversionOpt: scenario.RothConversionOpt,
                RothConversionStart: scenario.RothConversionStart,
                RothConversionEnd: scenario.RothConversionEnd,
                RothConversionStrategy: scenario.RothConversionStrategy,
                
                financialGoal: scenario.financialGoal,
                residenceState: scenario.residenceState
            };            
            
            const clonedResult = JSON.parse(JSON.stringify(result));
            // console.log(clonedResult);
            // Convert to YAML file
            const yaml = require('js-yaml');
            const yamlString = yaml.dump(clonedResult, {
                skipInvalid: true,
                noRefs: true,
                keepBooleans: true,
                sortKeys: false,
                lineWidth: -1
            });
            console.log(yamlString);
            // Return YAML file
            return res.status(200).json({
                status: "SUCCESS",
                data: yamlString,
            });
        }
        
        return res.status(200).json({
            status: "ERROR",
            error: true,
            message: "Exporting Plan failed.",
        });
    }
    catch (error) {
        console.log(error);
        return res.status(200).json({
            status: "ERROR",
            error: true,
            message: "Plan does not exist in database.",
            err: error
        });
    }
};

