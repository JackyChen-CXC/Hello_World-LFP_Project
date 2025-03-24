import FinancialPlan from "../models/FinancialPlan";

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

export const deletePlan = async (req:any, res:any) => {
    try {
      const { id } = req.body;
      await FinancialPlan.findByIdAndDelete(id);
      res.status(200).json({ message: "Plan deleted successfully" });
    } catch (error) {
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
        const scenarioData = req.body.data;

        // Validate and create a new document
        const newScenario = new FinancialPlan(scenarioData);
        console.log(newScenario);
        // await newScenario.save();

        // res.json({ message: "Scenario saved successfully!", scenario: newScenario });
    }
    catch (error) {
        res.status(200).json({
            status: "ERROR",
            error: true,
            message: "Importing plan failed.",
        });
    }
};

export const exportPlan = async (req: any, res: any) => {
    try {
        // export from YAML (use the scenario.YAML as ref)
    }
    catch (error) {
        res.status(200).json({
            status: "ERROR",
            error: true,
            message: "Exporting Plan failed.",
        });
    }
};

// For import/export YAML
// export const postVideo = async (req: any, res: any) => {
// 	const form = formidable({
// 		// maxFileSize: 100 * 1024 * 1024,
// 		uploadDir: './processing_queue',
// 		keepExtensions: true
// 	});

// 	form.parse(req, async (err, fields, files) => {
// 		// console.log("Uploading video");
// 		if (err) {
// 			console.error("Error parsing the form:", err);
// 			return res.status(200).json({
// 				status: 'ERROR',
// 				error: true,
// 				message: 'Failed to parse form data.'
// 			});
// 		}
//     }
// }