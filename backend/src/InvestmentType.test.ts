import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import InvestmentType, { IInvestmentType } from "./models/InvestmentType";

describe("InvestmentType Model", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it("should create and retrieve an InvestmentType", async () => {
    const investmentData: IInvestmentType = new InvestmentType({
      name: "S&P 500 Index Fund",
      description: "A broad market index fund",
      returnAmtOrPct: "percent",
      returnDistribution: { type: "normal", mean: 0.07, stdev: 0.15 }, 
      expenseRatio: 0.02,
      incomeAmtOrPct: "percent",
      incomeDistribution: { type: "normal", mean: 0.02, stdev: 0.01 }, 
      taxability: true,
    });

    // Save to database
    await investmentData.save();

    // Retrieve from database
    const foundInvestment = await InvestmentType.findOne({ name: "S&P 500 Index Fund" });

    // Assertions
    expect(foundInvestment).not.toBeNull();
    expect(foundInvestment?.name).toBe("S&P 500 Index Fund");
    expect(foundInvestment?.returnDistribution.type).toBe("normal");
    expect(foundInvestment?.incomeDistribution.type).toBe("normal");
  });
});
