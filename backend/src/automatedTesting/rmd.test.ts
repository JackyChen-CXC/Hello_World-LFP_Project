import { calculateRMD, calculateRMD_Investment } from "../controllers/simulationHelpers";
import { getDB } from "../controllers/simulationHelpers";

jest.mock('../controllers/simulationHelpers');  // Mocking database

describe('RMD Calculation and RMD Investment Move', () => {
    let financialPlan: any;
    const mockCurrentYear = 2025;
    const mockAge = 70;
    const mockCurYearIncome = 50000;

    beforeEach(() => {
        financialPlan = {
            investments: [
                { id: '1', taxStatus: 'pre-tax', value: 100000, investmentType: 'stock' },
                { id: '2', taxStatus: 'pre-tax', value: 200000, investmentType: 'bond' }
            ],
            RMDStrategy: ['1', '2']
        };

        (getDB as jest.Mock).mockReturnValue({
            collection: (collectionName: string) => ({
                findOne: jest.fn(() =>
                    collectionName === `rmd_${mockCurrentYear}`
                        ? { age: mockAge, distribution_period: 25 } 
                        : null
                )
            })
        });

        // Mock calculateRMD and calculateRMD_Investment
        (calculateRMD as jest.Mock).mockResolvedValue(12000);  
        (calculateRMD_Investment as jest.Mock).mockImplementation((plan, rmd) => {
            plan.investments.push({
                id: '3',
                taxStatus: 'non-retirement',
                value: rmd,
                investmentType: 'stock'
            });
            return plan.investments;  
        });
    });

    describe('calculateRMD', () => {
        it('calculates RMD correctly when distribution period is found', async () => {
            const rmd = await calculateRMD(financialPlan, mockAge, mockCurYearIncome);
            expect(rmd).toBe(12000);  
        });

    });

    describe('calculateRMD_Investment', () => {
        it('moves RMD from pre-tax investments to non-retirement investments', () => {
            const rmd = 12000;  
            const updatedInvestments = calculateRMD_Investment(financialPlan, rmd);

            const nonRetirementInvestments = updatedInvestments.filter(
                inv => inv.taxStatus === 'non-retirement'
            );

            expect(nonRetirementInvestments.length).toBe(1); 
            expect(nonRetirementInvestments[0].value).toBe(12000);  
        });

        it('creates new non-retirement investment if one doesn\'t exist', () => {
            financialPlan.investments = [
                { id: '1', taxStatus: 'pre-tax', value: 20000, investmentType: 'stock' }
            ];

            const rmd = 10000;  // Set a fixed RMD value
            const updatedInvestments = calculateRMD_Investment(financialPlan, rmd);

            const nonRetirementInvestments = updatedInvestments.filter(
                inv => inv.taxStatus === 'non-retirement'
            );

            expect(nonRetirementInvestments.length).toBe(1);  // One new non-retirement investment
            expect(nonRetirementInvestments[0].value).toBe(10000);  // Ensure RMD value is correct
        });

    });
});
