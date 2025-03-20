import User from "../models/User";
import FinancialPlan from "../models/FinancialPlan";
import { getPlansByUser } from "../queries/financialQueries";
import axios from "axios";

export const getFinancialPlans = async (req: any, res: any) => {
	try {
        const { username } = req.body;
        const plans = await getPlansByUser(username);

        return res.status(200).json({
            status: "SUCCESS",
            error: false,
            message: "Financial Plans retrieved successfully",
            data: plans,
        });

    } catch (error) {
		console.log(error)
		res.status(200).json({
			status: "ERROR",
			error: true,
			message: "Error getting Financial Plans",
		});
	}
};



export const webscrape = async (req: any, res: any) => {
	try {
		// use app.py from ..\microservices\webscraping
        // await axios.post('http://localhost:5001/api/flask/videos'
	} catch (error) {
		res.status(200).json({
			status: "ERROR",
			error: true,
			message: "Login failed.",
		});
	}
};