import * as fs from 'fs';
import * as path from 'path';

export function writeLog(user: string, log: string, type: 'csv' | 'log') {
  const now = new Date();
  const datetime = now.toISOString().replace(/[:.]/g, '-').split('T').join('_');
  const logDir = path.join(__dirname, '..', 'logs');

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const filename = `${user}_${datetime}.${type}`;
  const filepath = path.join(logDir, filename);

  fs.appendFileSync(filepath, log + (type === 'csv' ? '\n' : '\n\n'), 'utf8');
}


if (require.main === module) {
    writeLog('jack', 'Year,Stocks,Bonds,Cash\n2025,10000,5000,2000', 'csv');
    writeLog('jack', '2025 - Rebalanced portfolio: bought Stocks, sold Bonds.', 'log');
    console.log('Logs written! Check the logs folder.');
  }