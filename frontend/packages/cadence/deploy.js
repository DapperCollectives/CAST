const fs = require("fs");
const { exec } = require("child_process");

// emulator, testnet, mainnet
const NETWORK = "emulator";

const deployContracts = (address, contractNames) => {
  exec(`flow project deploy --network=${NETWORK}`, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }

    const deployedContracts = {};
    contractNames.forEach((cn) => {
      deployedContracts[`0x${cn}`] = `0x${address}`;
    });
    fs.writeFileSync(
      "../client/src/contracts.json",
      JSON.stringify(deployedContracts, 0, 2)
    );

    console.log(stdout);
  });
};

const addContracts = () => {
  const flowJson = require("./flow.json");
  const contracts = {};
  const contractNames = [];
  const accountName = Object.keys(flowJson.accounts)[0];
  const { address } = flowJson.accounts[accountName];

  console.log("Adding contracts...");
  const dir = fs.opendirSync("./contracts");
  let dirent;
  while ((dirent = dir.readSync()) !== null) {
    console.log(dirent.name);
    const contractName = dirent.name.replace(".cdc", "");
    contractNames.push(contractName);
    contracts[contractName] = `./contracts/${dirent.name}`;
  }
  dir.closeSync();

  flowJson["contracts"] = contracts;
  flowJson.deployments[NETWORK] = {
    [accountName]: contractNames,
  };
  fs.writeFileSync("./flow.json", JSON.stringify(flowJson, 0, 2));
  deployContracts(address, contractNames);
};

const deploy = () => {
  if (fs.existsSync("./flow.json")) {
    addContracts();
  } else {
    console.log("No existing flow file found, creating new one...");
    exec("flow init", (error, _, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }

      console.log("Initialized flow.json ...");
      addContracts();
    });
  }
};

deploy();
