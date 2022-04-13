import path from "path";
import {
    emulator, init, getAccountAddress, getTransactionCode,
    deployContractByName, executeScript, getContractAddress, sendTransaction, shallPass, shallRevert
} from "flow-js-testing";
import { assert } from "console";

// Some consts
const SUCCESS_CODE = 4

// Increase timeout if your tests failing due to timeout
jest.setTimeout(10000);

let DeployerAccount, Jackson, Rob, Manny, Matt, NonInitializedAccount;
let UserAccounts = []
let contractDeployment;
let VotingCommunity, addressMap;

beforeAll(async () => {
    const basePath = path.resolve(__dirname, "../.");
    // You can specify different port to parallelize execution of describe blocks
    const port = 8080;

    // Setting logging flag to true will pipe emulator output to console
    const logging = true;

    await init(basePath, { port });
    await emulator.start(port, logging);

    // Initialize some Addresses
    DeployerAccount = await getAccountAddress("DeployerAccount")
    Jackson = await getAccountAddress("Jackson");
    Rob = await getAccountAddress("Rob");
    Matt = await getAccountAddress("Matt");
    Manny = await getAccountAddress("Manny");
    NonInitializedAccount = await getAccountAddress("NonInitializedAccount");

    UserAccounts = [Jackson, Rob, Matt, Manny]

    // Deploy CommunityVoting contract
    contractDeployment = await deployContractByName({ to: DeployerAccount, name: 'VotingCommunity' });
    // console.log(contractDeployment)

    // Make sure our contract deployed correctly
    expect(contractDeployment[0].status).toBe(SUCCESS_CODE)

    // Initialize constants
    VotingCommunity = await getContractAddress("VotingCommunity")
    addressMap = { VotingCommunity }

    return;
});

// Stop emulator, so it could be restarted
afterAll(async () => {
    contractDeployment = null;
    return emulator.stop();
});

describe("VotingCommunity Contract", () => {

    test("Requesting Admin Proxy", async () => {

        const txCode = await getTransactionCode({
            name: "RequestAdmin",
            addressMap
        })

        // Have each user request to be an Admin
        for (let acct of UserAccounts) {
            const signers = [acct]
            const args = []
            const txResult = await shallPass(
                sendTransaction({ code: txCode, args, signers })
            )
            expect(txResult[0].status).toBe(SUCCESS_CODE)
        }

        ///////////////////////////////////////////////////////////////////
        // Grant AdminProxy:
        ///////////////////////////////////////////////////////////////////

        const DistributeAdminCapabilityTemplate = (await getTransactionCode({
            name: "DistributeAdminCapability",
            addressMap
        })).toString()

        // SuperAdmin account should be able to distribute Admin Capabilities to accounts that
        // have requested thme
        for (let acct of UserAccounts) {
            const signers = [DeployerAccount]
            const privatePath = `/private/VotingCommunityAdmin_${acct}`
            const storagePath = `/storage/VotingCommunityAdmin_${acct}`
            let DistributeAdminCapabilityCode = DistributeAdminCapabilityTemplate
              .replace(/%STORAGE_PATH%/ig, storagePath)
              .replace(/%PRIVATE_PATH%/ig, privatePath)
            
              console.log(DistributeAdminCapabilityCode)

            const txResult = await shallPass(
                sendTransaction({ code: DistributeAdminCapabilityCode, args: [acct], signers })
            )

            expect(txResult[0].status).toBe(SUCCESS_CODE)
        }

        ///////////////////////////////////////////////////////////////////
        // Create & Store Community via AdminProxy capability:
        ///////////////////////////////////////////////////////////////////

        const CreateAndStoreCommunityCode = await getTransactionCode({
          name: "CreateAndStoreCommunity",
          addressMap
        })

        // Accounts w/ admin Capabilities should be able to create & store communities
        // in DeployerAccount's storage
        for (let acct of UserAccounts) {
          const signers = [acct]
          const args = [`Flow Community by ${acct}`, `Cool Flow Community created by address: ${acct}`, {}]
          const txResult = await shallPass(
              sendTransaction({ code: CreateAndStoreCommunityCode, args, signers })
          )
          expect(txResult[0].status).toBe(SUCCESS_CODE)
        }

        // Deployer account that has been initialized
        // should be able to create a community
        // const deployerCommunityTxResult = await shallPass(
        //     sendTransaction({ code: createCommunityTxCode, args: createCommunityArgs, signers: [DeployerAccount] })
        // )

        // Transaction should fail if account that hasnt
        // initialized a CommuintyCollection tries to create a community
        // const nonInitTxResult = await shallRevert(
        //     sendTransaction({ code: createCommunityTxCode, args: createCommunityArgs, signers: [NonInitializedAccount] })
        // )
    });

    // test("Fetching Communities & Proposals", async () => {

    //     ///////////
    //     // GETTERS
    //     ///////////

    //     // Get list of all communities
    //     const getCommunitiesResult = await executeScript("GetCommunities", [DeployerAccount]);
    //     expect(getCommunitiesResult.length).toBe(6)

    //     // Get community by ID
    //     const getCommunityResult = await executeScript("GetCommunity", [DeployerAccount, 1])
    //     expect(getCommunityResult.id).toBe(1)


    //     // Get list of all proposals for communityId 1
    //     const getProposalsResult = await executeScript("GetProposals", [DeployerAccount, 1]);
    //     expect(getProposalsResult.length).toBe(UserAccounts.length + 1)

    //     // Get proposal by ID for communityId 1
    //     const getProposalResult = await executeScript("GetProposal", [DeployerAccount, 1, 1])
    //     expect(getProposalResult.id).toBe(1)


    // })

    // test("Voting on Proposals", async () => {
    //     //
    //     // Voting on a proposal:
    //     //

    //     const castVoteTxCode = await getTransactionCode({
    //         name: "CastVote",
    //         addressMap
    //     })

    //     const castVoteTxArgs = [
    //         1, // Community ID
    //         1, // Proposal ID
    //         "Yes", // Choice
    //         DeployerAccount
    //     ]

    //     for (let acct of UserAccounts) {
    //         const signers = [acct]
    //         const txResult = await shallPass(
    //             sendTransaction({ code: castVoteTxCode, args: castVoteTxArgs, signers })
    //         )
    //         expect(txResult.status).toBe(SUCCESS_CODE)
    //     }
    // })

    // test("Uninitializing accounts", async () => {
    //     ///////////////////////
    //     // Uninitialize Account
    //     ///////////////////////

    //     const txCode = await getTransactionCode({
    //         name: "UninitializeAccount",
    //         addressMap
    //     })

    //     // Initialize each user account with a VotingCommunity.CommunityCollection resource
    //     for (let acct of UserAccounts) {
    //         const signers = [acct]
    //         const args = []
    //         const txResult = await shallPass(
    //             sendTransaction({ code: txCode, args, signers })
    //         )
    //         expect(txResult.status).toBe(SUCCESS_CODE)
    //     }
    // })
})