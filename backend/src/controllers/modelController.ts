import User from "../models/User";
import FinancialPlan from "../models/FinancialPlan";
import { getPlansByUser } from "../queries/financialQueries";
import axios from "axios";

import { Request, Response } from "express";

export const getAllFinancialPlans = async (req: any, res: any) => {
	try {
	  const plans = await FinancialPlan.find({});
	  return res.status(200).json({
		status: "SUCCESS",
		error: false,
		message: "All Financial Plans retrieved successfully",
		data: plans,
	  });
	} catch (err) {
	  console.error("Error fetching all plans:", err);
	  return res.status(500).json({
		status: "ERROR",
		error: true,
		message: "Failed to retrieve plans",
	  });
	}
  };

export const createFinancialPlan = async (req:any, res:any) => {
	try {
	  console.log("Received body:", req.body); // 👈 DEBUG LINE
	  const newPlan = new FinancialPlan(req.body);
	  await newPlan.save();
	  res.status(201).json(newPlan);
	} catch (err) {
	  console.error("Error creating plan:", err); // 👈 DEBUG LINE
	  res.status(500).json({ error: "Failed to create financial plan" });
	}
  };
  


export const getFinancialPlans = async (req: any, res: any) => {
	try {
        const { username } = req.body;
        const plans = await getPlansByUser(username);
		console.log(plans)
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


export const scrapeDoc = async (req: any, res: any) => {
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