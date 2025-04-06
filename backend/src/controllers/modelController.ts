import { exec } from "child_process";
import FinancialPlan from "../models/FinancialPlan";
import InvestmentType from "../models/InvestmentType";

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


export const getInvestmentTypeById = async (req: any, res: any) => {
	try {
		const { id } = req.params;
		const investmentType = await InvestmentType.findById(id);

		if (!investmentType) {
		return res.status(404).json({ error: "Investment type not found" });
		}

		return res.status(200).json(investmentType);
	} catch (error) {
		console.error("Error fetching investment type:", error);
		return res.status(500).json({ error: "Server error" });
	}
};
export const getInvestmentTypesByPlanId = async (req: any, res: any) => {
	try {
		const { planId } = req.params;
		const plan = await FinancialPlan.findById(planId);
		if (!plan) {
		return res.status(404).json({ error: "Plan not found" });
		}

		const investmentTypes = await InvestmentType.find({
		_id: { $in: plan.investmentTypes },
		});

		return res.status(200).json({ data: investmentTypes });
	} catch (error) {
		console.error("Error fetching investment types for plan:", error);
		return res.status(500).json({ message: "Failed to fetch investment types" });
	}
};

export const getInvestmentTypeByName = async (req: any, res: any) => {
	try {
		const { name } = req.params;
		const investmentType = await InvestmentType.findOne({ name });
	
		if (!investmentType) {
			return res.status(404).json({ error: "Investment type not found" });
		}
	
		return res.status(200).json(investmentType);
		} catch (error) {
		console.error("Error fetching investment type by name:", error);
		return res.status(500).json({ error: "Server error" });
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
    exec('python3 ../microservices/webscraping/taxdataScrap.py', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            res.status(500).json({
                status: "ERROR",
                error: true,
                message: "Web scraping failed.",
            });
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }

        console.log(`Python Output: ${stdout}`);
        res.status(200).json({
            status: "SUCCESS",
            error: false,
            message: stdout.trim(),  // Return script output
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
