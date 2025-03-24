import { exec } from "child_process";

console.log("Running Webscraping after npm install...");

const command = process.platform === "win32"
    ? `"venv\\Scripts\\python" src/taxdataScrap.py`
    : `"venv/bin/python3" src/taxdataScrap.py`;

// const command = "src/taxdataScrap.py";

exec(command, (error, stdout, stderr) => {
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
