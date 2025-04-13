import { IDistribution } from "../models/Distribution";
import { IInvestment, ILifeEvent } from "../models/FinancialPlan";
import mongoose from "mongoose";
// Helper Functions

export function getLifeEventsByType(events: ILifeEvent[], type: ILifeEvent["type"]): ILifeEvent[] {
    return events.filter(event => event.type === type);
}

export function getCash(investments: IInvestment[]): IInvestment {
    return investments.filter(investments => investments.id === "cash")[0];
}

// Return a number given Distribution types: "fixed" | "normal" | "uniform"
export function generateFromDistribution(dist: IDistribution): number | undefined {
    switch (dist.type) { // fixed number
        case "fixed":
            return dist.value;
        case "normal": // normal distibution
            if (typeof dist.mean === "number" && typeof dist.stdev === "number") {
                // Box-Muller transform
                const u1 = Math.random();
                const u2 = Math.random();
                const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
                return dist.mean + dist.stdev * z;
            }
        case "uniform": // uniform distibution
            if (typeof dist.lower === "number" && typeof dist.upper === "number") {
                return dist.lower + Math.random() * (dist.upper - dist.lower);
            }
        default:
            // wrong use of function
            console.log("Wrong use of Distribution function");
            return undefined;
    }      
}

// to write/get specific files from raw DB
export function getDB(){
    const db = mongoose.connection;
    return db;
}

// Example uses
// const result = await db.createCollection("new_tax_collection");
// const collection = db.collection("tax_data");
// const result = await collection.insertOne({
//     year: 2025,
//     bracket: "10%",
//     incomeLimit: 11000
//   });