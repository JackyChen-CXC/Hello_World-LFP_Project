import { exec } from "child_process";
import FinancialPlan from "../models/FinancialPlan";
import InvestmentType from "../models/InvestmentType";

{/**----------------------------Investment Controllers---------------------------------------- */}
export const createInvestmentType = async (req: any, res: any) => {
	try {
	const {
		name,
		description,
		returnAmtOrPct,
		returnDistribution,
		incomeAmtOrPct,
		incomeDistribution,
		taxability,
		expenseRatio
	} = req.body;

	const newInvestmentType = new InvestmentType({
		name,
		description,
		returnAmtOrPct,
		returnDistribution,
		incomeAmtOrPct,
		incomeDistribution,
		taxability,
		expenseRatio,
	});

	await newInvestmentType.save();
	return res.status(201).json(newInvestmentType);
	} catch (error) {
	console.error("Error creating investment type:", error);
	return res.status(500).json({ error: "Failed to create investment type" });
	}
};

export const findInvestmentType = async (req: any, res: any) => {
	try {
		const {
			name,
			returnAmtOrPct,
			returnDistribution = {},
			incomeAmtOrPct,
			incomeDistribution = {},
			taxability
		} = req.body;
		
		if (!name || !returnAmtOrPct || !incomeAmtOrPct || returnDistribution.type === undefined || incomeDistribution.type === undefined) {
		return res.status(400).json({ error: "Missing required fields for lookup" });
		}
		
		const investmentType = await InvestmentType.findOne({
		name,
		returnAmtOrPct,
		"returnDistribution.type": returnDistribution.type,
		"returnDistribution.value": returnDistribution.value,
		incomeAmtOrPct,
		"incomeDistribution.type": incomeDistribution.type,
		"incomeDistribution.value": incomeDistribution.value,
		taxability,
		});
		

	return res.status(200).json(investmentType || null);
	} catch (err) {
		console.error("Error finding investment type:", err);
		res.status(500).json({ error: "Failed to find investment type" });
	}
};

export const getAllInvestmentTypes = async (req: any, res: any) => {
	try {
		const investmentTypes = await InvestmentType.find();
		return res.status(200).json(investmentTypes);
	} catch (error) {
		console.error("Error fetching investment types:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

export const getInvestmentTypeById = async (req:any, res:any) => {
  try {
	const { id } = req.params;
	const investmentType = await InvestmentType.findById(id);
	if (!investmentType) return res.status(404).json({ error: "Not found" });
	return res.status(200).json(investmentType);
  } catch (err) {
	return res.status(500).json({ error: "Server error" });
  }
};

export const getInvestmentsByPlanId = async (req: any, res: any) => {
	try {
		const { planId } = req.params;
	
		const plan = await FinancialPlan.findById(planId).select("investments");
	
		if (!plan) {
			return res.status(404).json({ error: "Plan not found" });
		}
	
		return res.status(200).json(plan.investments);
		} catch (error) {
		console.error("Error fetching investments:", error);
		return res.status(500).json({ error: "Server error" });
		}
};

export const deleteInvestmentTypeById = async (req: any, res: any) => {
	try {
		const { id } = req.params;
		const deleted = await InvestmentType.findByIdAndDelete(id);
	
		if (!deleted) {
			return res.status(404).json({ error: "Investment type not found" });
		}
	
		return res.status(200).json({ message: "Investment type deleted successfully" });
	} catch (error) {
		console.error("Error deleting investment type:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

{/**----------------------------Event Series Controllers---------------------------------------- */}
export const getAllEvents = async (req: any, res: any) => {
	try {

		const plans = await FinancialPlan.find({}, "eventSeries");

		// Flatten all eventSeries arrays into one big array
		const allEvents = plans.flatMap(plan => plan.eventSeries || []);

		return res.status(200).json(allEvents);
	} catch (error) {
		console.error("Error fetching events:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

{/**----------------------------Financial Plan Controllers---------------------------------------- */}


export const getAllFinancialPlans = async (req: any, res: any) => {
	try {
		const { userId } = req.body;

		if (!userId) {
		return res.status(400).json({
			status: "ERROR",
			error: true,
			message: "User ID is required to fetch plans",
		});
		}

		const plans = await FinancialPlan.find({ userId }); 

		return res.status(200).json({
		status: "SUCCESS",
		error: false,
		message: "Financial Plans retrieved successfully",
		data: plans,
		});
	} catch (err) {
		console.error("Error fetching plans by userId:", err);
		return res.status(500).json({
		status: "ERROR",
		error: true,
		message: "Failed to retrieve plans",
		});
	}
	};
  
  


	export const createFinancialPlan = async (req: any, res: any) => {
		try {
			const newPlan = new FinancialPlan(req.body);
	
			await newPlan.save();
			res.status(201).json(newPlan);
		} catch (err) {
			console.error("Error creating plan:", err);
			res.status(500).json({ error: "Failed to create financial plan" });
		}
	};
	
  


export const getSpecificFinancialPlan = async (req: any, res: any) => {
	try {
		const { id } = req.params;
		const plan = await FinancialPlan.findById(id);

		if (!plan) {
			return res.status(404).json({ message: "Plan not found" });
		}

		return res.status(200).json({ data: plan });
		} catch (err) {
		console.error("Error fetching plan by ID:", err);
		return res.status(500).json({ message: "Failed to retrieve plan" });
	}
};


export const webscrape = async (req: any, res: any) => {
    const command = process.platform === "win32"
        ? `"venv\\Scripts\\python" src/taxdataScrap.py`
        : `"venv/bin/python3" src/taxdataScrap.py`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${error.message}`);
            res.status(500).json({
                status: "ERROR",
                error: true,
                message: "Web scraping failed.",
            });
            return;
        }

        if (stderr) {
            console.error(`Python stderr: ${stderr}`);
        }

        console.log(`Python Output: ${stdout}`);
        res.status(200).json({
            status: "SUCCESS",
            error: false,
            message: stdout.trim(),
        });
    });
};

export const rmdWebscrape = async (req: any, res: any) => {
	const command = process.platform === "win32"
        ? `"venv\\Scripts\\python" src/rmdscrap.py`
        : `"venv/bin/python3" src/rmdscrap.py`;

		exec(command, (error, stdout, stderr) => {
			if (error) {
				console.error(`Error executing Python script: ${error.message}`);
				res.status(500).json({
					status: "ERROR",
					error: true,
					message: "RMD Table scraping failed.",
				});
				return;
			}
	
			if (stderr) {
				console.error(`Python stderr: ${stderr}`);
			}
	
			console.log(`Python Output: ${stdout}`);
			res.status(200).json({
				status: "SUCCESS",
				error: false,
				message: stdout.trim(),
			});
		});
};

export const updateFinancialPlan = async (req: any, res: any) => {
	try {
		const { id } = req.params;
		const updatedPlan = await FinancialPlan.findByIdAndUpdate(id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!updatedPlan) {
			return res.status(404).json({ error: "Plan not found" });
		}

		return res.status(200).json({ message: "Plan updated", data: updatedPlan });
	} catch (err) {
		console.error("Error updating plan:", err);
		return res.status(500).json({ error: "Failed to update plan" });
	}
};
