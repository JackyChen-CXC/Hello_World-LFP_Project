import User from "../models/User";
import FinancialPlan from "../models/FinancialPlan";
import { getPlansByUser } from "../queries/financialQueries";
import axios from "axios";

import { Request, Response } from "express";

import { exec } from 'child_process';

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
  
  

export const createFinancialPlan = async (req:any, res:any) => {
	try {
	  console.log("Received body:", req.body); 
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