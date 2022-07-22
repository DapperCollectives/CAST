const fs = require("fs");
const { exec, spawn } = require("child_process");

const execCb = (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`);
    return;
  }

  console.log(stdout);
};

let chainProcess;

if (fs.existsSync("./flow.json")) {
  console.log("Found flow file, starting emulator...");
  chainProcess = spawn("flow", ["emulator", "--verbose"]);
} else {
  console.log("No existing flow file found, creating new one...");
  exec("flow init", (error, stdout, stderr) => {
    execCb(error, stdout, stderr);
    chainProcess = spawn("flow", ["emulator", "--verbose"]);
  });
}

chainProcess.stdout.on("data", (stdout) => {
  console.log(stdout.toString());
});

chainProcess.stderr.on("data", (stderr) => {
  console.log(`stderr: ${stderr}`);
});

const execOpts = {
  env: {
    ...process.env,
    APP_ENV: "local",
    BASE_URL: "http://localhost:8701",
  },
};

exec(
  'flow dev-wallet --emulator-host "http://localhost:8888" -f flow.json',
  execOpts,
  execCb
);
