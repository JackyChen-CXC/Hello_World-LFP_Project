// For automated testing, need frontend + backend tests
import mongoose from "mongoose";
import User from "./models/User";
import Simulation from "./models/Simulation";
import FinancialPlan from "./models/FinancialPlan";
import { addAnonymousUser } from "./controllers/createUserController";
import { createFinancialPlan } from "./controllers/modelController";
import { DistributionSchema } from "./models/Distribution";

const seedDatabase = async () => {
    try {
        const existingUsers = await User.countDocuments();
        if (existingUsers > 0) {
            console.log("Database alread initalized/template alr created. Skipping seeding.");
            return;
        }
        // const res = addAnonymousUser(NaN, NaN); // ?
        // await TemplateModel.insertMany(sampleTemplates);
        console.log("Database seeded with example templates.");
    } catch (error) {
        console.error("Error seeding database:", error);
    }
  };
