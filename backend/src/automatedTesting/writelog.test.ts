import fs from 'fs';
import path from 'path';
import { writeLog } from '../controllers/logHelper';


describe('writeLog', () => {
  const testUser = 'testuser';
  const csvPath = path.join(__dirname, '../logs');

  it('should create a CSV log file with a line', async () => {
    const line = 'Year,Stocks,Cash\n2025,1000,500';
    await writeLog(testUser, line, 'csv');

    const files = fs.readdirSync(csvPath).filter(f => f.startsWith(testUser) && f.endsWith('.csv'));
    expect(files.length).toBeGreaterThan(0);

    const lastFile = path.join(csvPath, files[files.length - 1]);
    const content = fs.readFileSync(lastFile, 'utf-8');
    expect(content).toContain('2025,1000,500');
  });
});