import * as fs from 'fs';
import * as path from 'path';

export function writeLog(user: string, log: string, type: 'csv' | 'log') {
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // e.g., '2025-04-14'
  const logDir = path.join(__dirname, '..', 'logs');

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const filename = `${user}_${date}.${type}`;
  const filepath = path.join(logDir, filename);

  fs.appendFileSync(filepath, log + (type === 'csv' ? '\n' : '\n\n'), 'utf8');
}

// function that uses console.log with typed rest parameters
export const createLog = (username: string, ...args: unknown[]): void => {
  const logInfo = args.map(arg =>
      typeof arg === 'string' ? arg : JSON.stringify(arg)
  ).join(' ') + '\n';
  writeLog(username, logInfo, "log");
  // console.log.apply(console, args); // Optionally keep original logging
};

if (require.main === module) {
    writeLog('jack', 'Year,Stocks,Bonds,Cash\n2025,10000,5000,2000', 'csv');
    writeLog('jack', '2025 - Rebalanced portfolio: bought Stocks, sold Bonds.', 'log');
    console.log('Logs written! Check the logs folder.');
  }