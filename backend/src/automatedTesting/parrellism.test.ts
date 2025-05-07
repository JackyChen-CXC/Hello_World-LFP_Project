import { Worker } from 'worker_threads';
import path from 'path';

describe('Simulation Worker Parallelism', () => {
  const numWorkers = 2;
  const simulationsPerWorker = 5;
  const reqData = {
    body: {
      username: 'testuser',
      id: 'test-plan-id' // Ensure this exists in the database
    }
  };

  it('should deploy all workers and collect results', (done) => {
    let completed = 0;
    const allResults: any[] = [];

    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(path.resolve(__dirname, './simulationWorker.ts'), {
        workerData: {
          reqData,
          numSimulations: simulationsPerWorker,
          workerId: i + 1,
          seed: `seed${i}`,
          params: {}
        }
      });

      worker.on('message', (msg) => {
        expect(msg).toHaveProperty('success', true);
        expect(Array.isArray(msg.data)).toBe(true);

        allResults.push(...msg.data);
        completed++;

        if (completed === numWorkers) {
          expect(allResults.length).toBe(numWorkers * simulationsPerWorker);
          done();
        }
      });

      worker.on('error', (err) => {
        done(err); // Fail the test on error
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          done(new Error(`Worker exited with code ${code}`));
        }
      });
    }
  }, 30000); // increase timeout for async workers if needed
});
