import { exec } from "child_process";

console.log("Running Python script after npm install...");

exec("python3 src/taxdataScrap.py", (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing Python script: ${error.message}`);
        process.exit(1); // Exit with an error code
    }
    if (stderr) {
        console.error(`Python stderr: ${stderr}`);
    }
    console.log(`Python Output: ${stdout}`);
    process.exit(0); // Exit successfully
});
