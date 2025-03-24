// For automated testing, need frontend + backend tests
import mongoose from "mongoose";
import User from "./models/User";
import Simulation from "./models/Simulation";
import FinancialPlan from "./models/FinancialPlan";
import { addAnonymousUser } from "./controllers/createUserController";
import { createFinancialPlan } from "./controllers/modelController";
import { DistributionSchema } from "./models/Distribution";
import SimulationResult from "./models/SimulationResult";

// Creates a template financial plan, simulation & simulation result to simulate the use of each
const template = async () => {
    try {
        // Financial Plan
        const financialPlan = new FinancialPlan({
            
        });
        // Simulation
        const simulation = new Simulation({
        
        });
        // Simulation Result
        const result = new SimulationResult({

        });
        console.log("Database seeded with example template.");
    } catch (error) {
        console.error("Error adding template to database:", error);
    }
  };
