"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
console.log("Running Webscraping after npm install...");
var command = process.platform === "win32"
    ? "\"venv\\Scripts\\python\" src/taxdataScrap.py"
    : "\"venv/bin/python3\" src/taxdataScrap.py";
// const command = "src/taxdataScrap.py";
(0, child_process_1.exec)(command, function (error, stdout, stderr) {
    if (error) {
        console.error("Error executing Python script: ".concat(error.message));
        process.exit(1); // Exit with an error code
    }
    if (stderr) {
        console.error("Python stderr: ".concat(stderr));
    }
    console.log("Python Output: ".concat(stdout));
    process.exit(0); // Exit successfully
});
