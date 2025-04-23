import { updateFederalTaxForFlatInflation } from '../controllers/simulationHelpers';
import { getDB } from '../controllers/simulationHelpers';

jest.mock('../controllers/simulationHelpers', () => {
  const originalModule = jest.requireActual('../controllers/simulationHelpers');
  return {
    __esModule: true,
    ...originalModule,
    getDB: jest.fn(),
  };
});

const mockFind = jest.fn();
const mockToArray = jest.fn();

(getDB as jest.Mock).mockReturnValue({
  collection: jest.fn().mockReturnValue({
    find: mockFind.mockReturnValue({
      toArray: mockToArray,
    }),
  }),
});

describe('updateFederalTaxForFlatInflation', () => {
  it('should correctly adjust tax brackets by inflation rate', async () => {
    const mockDocs = [
      {
        min_value: 10000,
        max_value: 20000,
        tax_rate: 0.1,
        single: 'single desc',
        married: 'married desc',
      },
      {
        min_value: 20000,
        max_value: undefined,
        tax_rate: 0.2,
        single: 'high income',
        married: 'high income',
      },
    ];

    mockToArray.mockResolvedValue(mockDocs);

    const result = await updateFederalTaxForFlatInflation(0.03); // 3% inflation

    expect(result).toEqual([
      {
        min_value: 10000 * 1.03,
        max_value: 20000 * 1.03,
        tax_rate: 0.1,
        single: 'single desc',
        married: 'married desc',
      },
      {
        min_value: 20000 * 1.03,
        max_value: null,
        tax_rate: 0.2,
        single: 'high income',
        married: 'high income',
      },
    ]);
  });
});
