import mongoose from 'mongoose';
import { performRothOptimizer } from '../controllers/simulationHelpers';
import { IFinancialPlan } from '../models/FinancialPlan';

interface IInvestment {
  id: string;
  value: number;
  investmentType: IInvestmentType;
  taxStatus: 'pre-tax' | 'after-tax';
}
interface IDistribution {
  mean: number;
  stdev: number;
}
interface IUser {
  _id: string;
  email: string;
}
interface ILifeEvent {
  name: string;
  start: number;
  duration: number;
}
interface IInvestmentType {
  name: string;
  description?: string;
  returnAmtOrPct?: number;
  returnDistribution?: IDistribution;
  expenseRatio?: number;
}

function getMockFinancialPlan(partial?: Partial<IFinancialPlan>): IFinancialPlan {
  return {
    _id: new mongoose.Types.ObjectId(),
    userId: 'mock-user',
    name: 'Mock Plan',
    maritalStatus: 'individual',
    birthYears: [1980],
    lifeExpectancy: [],
    investmentTypes: [],
    investments: [], // Empty investments array
    eventSeries: [],
    inflationAssumption: { mean: 0.02, stdev: 0.01 },
    afterTaxContributionLimit: 6000,
    spendingStrategy: [],
    expenseWithdrawalStrategy: [],
    RMDStrategy: [],
    RothConversionOpt: true,
    RothConversionStart: 60,
    RothConversionEnd: 70,
    RothConversionStrategy: [],
    financialGoal: 1000000,
    residenceState: 'NY',
    sharedUsersId: [],
    sharedUserPerms: [],
    version: 1,
    ...partial,
  } as unknown as IFinancialPlan; 
}

const mockInvestmentType: any = {
  name: 'Stocks', 
};

describe('performRothOptimizer', () => {
  const taxBrackets = [
    { min_value: 0, max_value: 11000, single: true },
    { min_value: 11000, max_value: 44725, single: true },
    { min_value: 44725, max_value: 95375, single: true },
  ];
  const standardDeduction = { single: 13850, married: 27700 };

  it('moves Roth conversion amount under bracket limit', () => {
    const financialPlan = getMockFinancialPlan({
      investments: [], 
      RothConversionStrategy: ['inv1'],
    });

    const newIncome = performRothOptimizer(
      financialPlan,
      40000,
      10000,
      'single',
      taxBrackets,
      standardDeduction
    );

    const ira = financialPlan.investments.find(inv => inv.id === 'inv1');
    const roth = financialPlan.investments.find(inv => inv.id === 'inv1_after-tax');

    expect(ira?.value).toBe(0);
    expect(roth?.value).toBe(5000);
    expect(newIncome).toBeGreaterThanOrEqual(40000);
  });

  it('does nothing if income exceeds bracket max', () => {
    const financialPlan = getMockFinancialPlan({
      investments: [], 
      RothConversionStrategy: ['inv2'],
    });

    const newIncome = performRothOptimizer(
      financialPlan,
      95000,
      10000,
      'single',
      taxBrackets,
      standardDeduction
    );

    const ira = financialPlan.investments.find(inv => inv.id === 'inv2');
    const roth = financialPlan.investments.find(inv => inv.id === 'inv2_after-tax');

    expect(ira?.value).toBe(8000);
    expect(roth).toBeUndefined();
    expect(newIncome).toBeGreaterThanOrEqual(95000);
  });
});
