import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import FinancialPlan from "./models/FinancialPlan"; // Assuming FinancialPlan contains LifeEvent

describe("FinancialPlan Model with LifeEvent", () => {
  let mongoServer: MongoMemoryServer;

  // Setup and start MongoDB in-memory server
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  // Clean up after tests
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it("should create and retrieve a FinancialPlan with a life event", async () => {
    const lifeEvent = {
      name: "Retirement Income",
      description: "Income from retirement funds",
      start: { type: "normal", mean: 60, stdev: 2 },
      duration: { type: "normal", mean: 20, stdev: 5 },
      type: "income",
      initialAmount: 50000,
      changeAmtOrPct: "percent",
      changeDistribution: { type: "normal", mean: 3, stdev: 0.5 },
      inflationAdjusted: true,
      userFraction: 1,
      socialSecurity: true,
    };

    const financialPlanData = {
      userId: "123456",
      name: "Retirement Plan",
      maritalStatus: "individual",
      birthYears: [1985],
      lifeExpectancy: [{ type: "normal", mean: 85, stdev: 5 }],
      investmentTypes: ["Stocks", "Bonds"],
      investments: [],
      eventSeries: [lifeEvent], // Embedding the life event
      inflationAssumption: { type: "normal", mean: 2, stdev: 1 },
      afterTaxContributionLimit: 6000,
      spendingStrategy: ["conservative"],
      expenseWithdrawalStrategy: [],
      RMDStrategy: [],
      RothConversionOpt: false,
      RothConversionStart: 60,
      RothConversionEnd: 70,
      RothConversionStrategy: [],
      financialGoal: 1000000,
      residenceState: "NY",
      sharedUsersId: [],
      sharedUserPerms: [],
      version: 1,
    };

    // Create and save a financial plan with a life event
    const financialPlan = new FinancialPlan(financialPlanData);
    await financialPlan.save();

    // Retrieve the saved financial plan
    const foundPlan = await FinancialPlan.findOne({ name: "Retirement Plan" });

    // Assertions
    expect(foundPlan).not.toBeNull();
    expect(foundPlan?.name).toBe("Retirement Plan");
    expect(foundPlan?.eventSeries.length).toBeGreaterThan(0);
    expect(foundPlan?.eventSeries[0].name).toBe("Retirement Income");
    expect(foundPlan?.eventSeries[0].description).toBe("Income from retirement funds");
    expect(foundPlan?.eventSeries[0].initialAmount).toBe(50000);
  });
});
