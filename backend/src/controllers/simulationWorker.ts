import { runSimulation } from './simulationController';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedrandom from 'seedrandom';

//console.log(process.env.MONGO_URI);
dotenv.config();
//mongoose.connect(process.env.MONGO_URI || '');
mongoose.connect('mongodb://localhost:27017/mydatabase');

process.on('message', async (data: any) => {
    const { reqData, numSimulations, workerId, seed, params } = data;
    seedrandom(seed, { global: true });

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