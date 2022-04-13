const fs = require("fs");
const { exec } = require("child_process");

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

if (fs.existsSync("./flow.json")) {
  exec("flow emulator --dev-wallet", execCb);
} else {
  console.log("No existing flow file found, creating new one...");
  exec("flow init", (error, stdout, stderr) => {
    execCb(error, stdout, stderr);
    exec("flow emulator --dev-wallet", execCb);
  });
}
