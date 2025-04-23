import { updateIncomeEvents } from '../controllers/simulationHelpers';
import { ILifeEvent } from '../models/FinancialPlan';
import { generateFromDistribution } from '../controllers/simulationHelpers';
import { Types } from "mongoose"; 

jest.mock('../controllers/simulationHelpers', () => ({
    generateFromDistribution: jest.fn(),
    updateIncomeEvents: jest.fn(),
}));

const mockYear = new Date().getFullYear();

const mockEvent = (overrides: Partial<any> = {}): any => ({
    _id: "mock-id",
    name: "Mock Event",
    description: "Test",
    start: { type: "fixed", value: 2024 },
    duration: { type: "fixed", value: 2 },
    type: "income",
    initialAmount: 10000,
    changeAmtOrPct: "percent",
    changeDistribution: { type: "fixed", value: 0.05 },
    inflationAdjusted: false,
    userFraction: 0.5,
    socialSecurity: false,
    discretionary: false,
    assetAllocation: {},
    glidePath: false,
    assetAllocation2: {},
    maxCash: 0,
    ...overrides,
});

describe("updateIncomeEvents", () => {

    beforeEach(() => {
        (generateFromDistribution as jest.Mock).mockReturnValue(0); 
        (updateIncomeEvents as jest.Mock).mockImplementation((events: any[], inflation: number, spouseAlive: boolean) => {
            if (events[0].start.value > mockYear) {
                return [[{ initialAmount: 0 }]]; 
            }
            if (spouseAlive) {
                return [[{ initialAmount: events[0].initialAmount / 2 }]]; 
            }
            if (events[0].socialSecurity) {
                return [[{ initialAmount: events[0].initialAmount }], events[0].initialAmount];
            }
            return [[{ initialAmount: events[0].initialAmount }]]; 
        });
    });

    test("income added for inflation", () => {
        const result = updateIncomeEvents([
            mockEvent({ start: { value: mockYear + 1 } })
        ], 0.02, false);
        expect(result[0][0].initialAmount).toBe(0);
    });

    test("adds full income when spouse is alive", () => {
        const result = updateIncomeEvents([
            mockEvent({})
        ], 0.02, false);
        expect(result[0][0].initialAmount).toBe(10000);
    });

    test("adds partial income when spouse is dead", () => {
        const result = updateIncomeEvents([
            mockEvent({})
        ], 0.02, true);
        expect(result[0][0].initialAmount).toBe(5000);
    });

    test("updated currentyearincome", () => {
        const result = updateIncomeEvents([
            mockEvent({ socialSecurity: true })
        ], 0.02, false);
        expect(result[1]).toBe(10000);
    });

 


});
