"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var dotenv_1 = __importDefault(require("dotenv"));
var createUserRoutes_1 = __importDefault(require("./routes/createUserRoutes"));
var authUserRoutes_1 = __importDefault(require("./routes/authUserRoutes"));
var userRoutes_1 = __importDefault(require("./routes/userRoutes"));
var modelRoutes_1 = __importDefault(require("./routes/modelRoutes"));
var testingRoutes_1 = __importDefault(require("./routes/testingRoutes"));
var stateTaxUploadRoutes_1 = __importDefault(require("./routes/stateTaxUploadRoutes"));
var uploadUserFileRoutes_1 = __importDefault(require("./routes/uploadUserFileRoutes"));
var simulationRoutes_1 = __importDefault(require("./routes/simulationRoutes"));
dotenv_1.default.config();
var mongoose = require('mongoose');
var app = (0, express_1.default)();
var PORT = process.env.PORT || 5000;
var mongodbURL = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mydatabase";
app.use(express_1.default.json());
app.use((0, cors_1.default)());
mongoose
    .connect(mongodbURL)
    .then(function () { return console.log('Connected to MongoDB'); })
    .catch(function (err) { return console.error('Error connecting to MongoDB:', err); });
app.use('/api', testingRoutes_1.default);
app.use('/api', createUserRoutes_1.default);
app.use('/api', authUserRoutes_1.default);
// Ideally, authentication happens in between but for now just to test routes
app.use('/api', userRoutes_1.default);
app.use('/api', modelRoutes_1.default);
app.use('/api', stateTaxUploadRoutes_1.default);
app.use('/api', uploadUserFileRoutes_1.default);
app.use('/api', simulationRoutes_1.default);
app.get("/", function (_, res) {
    res.send("API is running...");
});
app.listen(PORT, function () {
    return console.log("Server running on port ".concat(PORT));
});
