import path from "path";
import {
  emulator,
  init,
  getAccountAddress,
  getTransactionCode,
  deployContractByName,
  getContractAddress,
  sendTransaction,
  shallPass,
} from "flow-js-testing";

// Some consts
const SUCCESS_CODE = 4;

// Increase timeout if your tests failing due to timeout
jest.setTimeout(10000);

describe("basic-test", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../packages/cadence");
    // You can specify different port to parallelize execution of describe blocks
    const port = 8080;
    // Setting logging flag to true will pipe emulator output to console
    const logging = false;

    await init(basePath, { port });
    return emulator.start(port, logging);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop();
  });

  test("basic functions", async () => {
    // Initialize some Addresses
    const Account = await getAccountAddress("Dev");

    ////////////////////
    // Deploy a Contract
    ////////////////////
    const deploymentResult = await deployContractByName({
      to: Account,
      name: "HelloWorld",
    });
    expect(deploymentResult.status).toBe(SUCCESS_CODE);

    ////////////////////
    // Run a Transaction
    ////////////////////

    // Create transaction code from template/deployed contracts
    const HelloWorld = await getContractAddress("HelloWorld");
    const addressMap = { HelloWorld };

    const txCode = await getTransactionCode({
      name: "HelloWorld",
      addressMap,
    });

    // Run the transaction
    const args = [];
    const signers = [Account];
    const txResult = await shallPass(
      sendTransaction({ code: txCode, args, signers })
    );
    expect(txResult.status).toBe(SUCCESS_CODE);
  });
});
