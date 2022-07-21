const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// emulator, testnet, mainnet
const NETWORK = process.env.NETWORK ?? "emulator";

const addAccounts = () => {
  exec(
    `flow accounts create -f ${path.resolve(__dirname, "flow.json")}`,
    (error, stdout, stderr) => {
      if (error?.message || stderr) {
        console.log(`error: ${error.message}`);
        return;
      }
      console.log(stdout);
    }
  );
};

const deployContracts = () => {
  exec(`flow project deploy`, (error, stdout, stderr) => {
    if (error?.message || stderr) {
      console.log(`error: ${error.message}`);
      return;
    }

    //updateContractAddresses(NETWORK);

    //   console.log(stdout);
    //   // create accounts if using emulator
    if (NETWORK === "emulator") {
      addAccounts();
    }
  });
};

const deploy = () => {
  if (fs.existsSync("./flow.json")) {
    deployContracts();
  } else {
    console.log("No existing flow file found, creating new one...");
    exec("flow init", (error, _, stderr) => {
      if (error?.message || stderr) {
        console.log(`error: ${error.message}`);
        return;
      }

      console.log("Initialized flow.json ...");
      deployContracts();
    });
  }
};

deploy();
