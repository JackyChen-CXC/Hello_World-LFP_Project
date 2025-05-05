import { parentPort, workerData } from 'worker_threads';
import { runSimulation } from './simulationController';
import mongoose from 'mongoose';
import dotenv from 'dotenv';


//console.log(process.env.MONGO_URI);
dotenv.config();
//mongoose.connect(process.env.MONGO_URI || '');
mongoose.connect('mongodb://localhost:27017/mydatabase');

process.on('message', async (data: any) => {
    const { reqData, numSimulations, workerId } = data;

    const fakeRes: any = {
        data: null,
        status: function() {
            return {
                json: function(msg: any) {
                    fakeRes.data = msg;  // Store the data
                }
            };
        },
        json: function(msg: any) {
            fakeRes.data = msg;  // Store the data
        }
    };

    try {
        const timerLabel = `simulationTime_worker_${workerId}`;
        console.log(`Worker ${workerId} starting ${numSimulations} simulations...`);
        console.time(timerLabel);
        const results = [];
        
        for (let i = 0; i < numSimulations; i++) {
            await runSimulation(reqData, fakeRes);
            if (fakeRes.data && fakeRes.data.data) {
                results.push(fakeRes.data.data);
            }
        }

        console.timeEnd(timerLabel);
        console.log(`Worker ${workerId} finished.`);

        // Send all data in one message at the end
        process.send?.({
            success: true,
            message: `Worker ${workerId} completed ${numSimulations} simulations`,
            data: results,
        });
    } catch (err: any) {
        process.send?.({ success: false, message: err.message, data: undefined });
    }
});





















// export const createSimulation = async (req: any, res: any) => {
//     try {
//         const { username, id } = req.body;
//         const plan = await FinancialPlan.findById(id);

//         if (!plan) {
//             return res.status(404).json({ error: 'Financial plan not found' });
//         }

//         // Create simulation and result objects in MongoDB
//         const simulation = new Simulation({ planId: id });
//         const result = new SimulationResult({
//             simulationId: simulation._id,
//             inflationAssumption: plan.inflationAssumption,
//             financialGoal: plan.financialGoal
//         });
//         simulation.resultsId = result._id.toString();

//         await simulation.save();
//         await result.save();

//         writeLog(username, "started running/queued simulation", "csv");

//         const numWorkers = 10;  // You can decide how many workers to spawn
//         const simulationsPerWorker = 100;  // This is 1000 simulations divided by 10 workers

//         // Start multiple workers for parallel processing
//         let completedSimulations = 0;
//         const workers = [];

//         for (let i = 0; i < numWorkers; i++) {
//             const worker = new Worker(path.resolve(__dirname, './simulationWorker.ts'), {
//                 workerData: {
//                     reqData: {
//                         body: {
//                             username: username,
//                             id: id
//                         }
//                     },
//                     numSimulations: simulationsPerWorker, // Divide simulations among workers
//                     workerId: i + 1
//                 }
//             });

//             workers.push(worker);

//             worker.on('message', (msg) => {
//                 console.log(`Worker ${i + 1}:`, msg);
//                 completedSimulations++;
//                 if (completedSimulations === numWorkers * simulationsPerWorker) {
//                     // All simulations are completed
//                     console.log('All simulations completed!');
//                 }
//             });

//             worker.on('error', (err) => {
//                 console.error(`Worker ${i + 1} error:`, err);
//             });

//             worker.on('exit', (code) => {
//                 if (code !== 0) {
//                     console.error(`Worker ${i + 1} stopped with exit code ${code}`);
//                 }
//             });
//         }

//         return res.status(200).json({
//             status: "OK",
//             error: false,
//             message: "Simulation in queue.",
//             simulationId: simulation._id,
//             resultId: result._id
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: "ERROR",
//             error: true,
//             message: "Simulation failed to be added.",
//         });
//     }
// };




















// import { parentPort, workerData } from 'worker_threads';
// import { runSimulation } from './path-to-your-runSimulation';

// (async () => {
//     try {
//         const { reqData, numSimulations, workerId } = workerData;

//         for (let i = 0; i < numSimulations; i++) {
//             // Modify reqData if needed to vary the simulations
//             const fakeRes: any = {
//                 status: () => ({
//                     json: (msg: any) => parentPort?.postMessage(msg)
//                 }),
//                 json: (msg: any) => parentPort?.postMessage(msg)
//             };

//             // Run the simulation for each iteration
//             await runSimulation(reqData, fakeRes);
//         }

//         parentPort?.postMessage({
//             success: true,
//             message: `Worker ${workerId} completed ${numSimulations} simulations`
//         });
//     } catch (err: any) {
//         parentPort?.postMessage({ error: true, message: err.message });
//     }
// })();