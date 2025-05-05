import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import createUserRouter from "./routes/createUserRoutes";
import authUserRouter from "./routes/authUserRoutes";
import userRouter from "./routes/userRoutes";
import modelRouter from "./routes/modelRoutes";
import testingRouter from "./routes/testingRoutes";
import stateTaxRouter from "./routes/stateTaxUploadRoutes";
import uploadUserFileRouter from "./routes/uploadUserFileRoutes";
import simulationRouter from "./routes/simulationRoutes";

dotenv.config();
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 5000;
const mongodbURL = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mydatabase";

app.use(express.json());
app.use(cors());

mongoose
  .connect(mongodbURL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err: Error) => console.error('Error connecting to MongoDB:', err));

app.use('/api', testingRouter);

app.use('/api', createUserRouter);

app.use('/api', authUserRouter);

// Ideally, authentication happens in between but for now just to test routes

app.use('/api', userRouter);

app.use('/api', modelRouter);

app.use('/api', stateTaxRouter);

app.use('/api', uploadUserFileRouter);

app.use('/api/simulations', simulationRouter);

app.get("/", (_, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => 
  console.log(`Server running on port ${PORT}`)
);