import { useReducer, useCallback } from "react";
import { defaultReducer, INITIAL_STATE } from "../reducers";
import { checkResponse } from "../utils";
import { useErrorHandlerContext } from "../contexts/ErrorHandler";
import { CODE as transferTokensCode } from "@onflow/six-transfer-tokens"
import * as t from "@onflow/types";

const mockedData = {
  votes: Array(100)
    .fill(null)
    .map((e, index) => ({
      author: "fireeyesdao.eth",
      voter: "sumedha.eth",
      choice: ["kn00t.eth", "fizz.eth", "bar.eth"][index % 3],
      isCore: index % 3 === 0,
      amount: 459000,
    })),
  results: [
    {
      label: "kn00t.eth",
      percentage: 45,
    },
    {
      label: "fizz.eth",
      percentage: 25,
    },
    {
      label: "bar.eth",
      percentage: 20,
    },
  ],
  winCount: 1000,
};

// for some reason, in emulator fcl this signature is nested two levels
// deep but on testnet fcl this is only nested one level deep
const getSig = (sigArr) =>
  sigArr[0]?.signature?.signature ?? sigArr[0]?.signature;

const getCompositeSigs = (sigArr) => {
  if (sigArr[0]?.signature?.signature) {
    return [sigArr[0].signature];
  }
  return sigArr;
};

export default function useProposal() {
  const [state, dispatch] = useReducer(defaultReducer, {
    ...INITIAL_STATE,
    loading: false,
  });
  const { notifyError } = useErrorHandlerContext();

  const createProposal = useCallback(
    async (injectedProvider, proposalData) => {
      dispatch({ type: "PROCESSING" });
      try {
        const timestamp = Date.now().toString();
        const hexTime = Buffer.from(timestamp).toString("hex");
        const _compositeSignatures = await injectedProvider
          .currentUser()
          .signUserMessage(hexTime);

        // TODO: remove this once deployed to production
        const sig = getSig(_compositeSignatures);
        if (!sig) {
          return { error: "No valid user signature found." };
        }
        const compositeSignatures = getCompositeSigs(_compositeSignatures);
        if (!compositeSignatures) {
          return { error: "No valid user signature found." };
        }

        const fetchOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...proposalData,
            timestamp,
            compositeSignatures,
            sig,
          }),
        };

        const response = await fetch(
          `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/1/proposals`,
          fetchOptions
        );
        const json = await response.json();
        dispatch({ type: "SUCCESS", payload: json });
        return { success: true };
      } catch (err) {
        return { error: String(err) };
      }
    },
    [dispatch]
  );

  const voteOnProposal = async (injectedProvider, proposal, voteData, isLedger) => {
    return isLedger ?
      voteOnProposalLedger(injectedProvider, proposal, voteData)
      : voteOnProposalBlocto(injectedProvider, proposal, voteData);
  };

  const voteOnProposalLedger = useCallback(
    async (injectedProvider, proposal, voteData) => {
      try {
        const timestamp = Date.now();
        const hexChoice = Buffer.from(voteData.choice).toString("hex")
        // use static transaction to address for voting option
        const txOptionsAddresses = (process.env.REACT_APP_TX_OPTIONS_ADDRS || "").split(",");
        const optionId = proposal.choices.map(c => c.value).indexOf(voteData.choice);
        const toAddress = txOptionsAddresses[optionId];
        let _compositeSignatures = "";

        if (!toAddress) {
          return { error: "Missing voting transaction to address" };
        }
        const buildAuthz = (address) => {
          return async function authz(account) {
            return {
              ...account,
              addr: injectedProvider.sansPrefix(address),
              keyId: 0,
              signingFunction: async (signable) => {
                const result = await injectedProvider.authz();
                const signedResult = await result.signingFunction(signable);
                _compositeSignatures = signedResult;
                return {
                  addr: injectedProvider.withPrefix(address),
                  keyId: 0,
                  signature: signedResult.signature,
                };
              }
            };
          };
        }

        // only serialize the tx not send
        const { transactionId } = await injectedProvider.send([
          injectedProvider.transaction(transferTokensCode),
          injectedProvider.args([injectedProvider.arg("0.0", t.UFix64), injectedProvider.arg(toAddress, t.Address)]),
          injectedProvider.proposer(buildAuthz(voteData.addr)),
          injectedProvider.authorizations([injectedProvider.authz]),
          injectedProvider.payer(injectedProvider.authz),
          injectedProvider.limit(100),
        ]);

        const message = `${proposal.id}:${hexChoice}:${timestamp}:ledger-${transactionId}`;
        // TODO: remove after this is deployed to production
        const sig = getSig([_compositeSignatures]);
        if (!sig) {
          return { error: "No valid user signature found." };
        }
        const compositeSignatures = getCompositeSigs([_compositeSignatures]);
        if (!compositeSignatures) {
          return { error: "No valid user signature found." };
        }

        // wait on the client till transaction is sealed
        await injectedProvider.tx(transactionId).onceSealed();

        const fetchOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...voteData,
            compositeSignatures,
            message,
            timestamp,
            transactionId,
            sig,
          }),
        };
        const { id } = proposal;
        const response = await fetch(
          `${process.env.REACT_APP_BACK_END_SERVER_API}/proposals/${id}/votes`,
          fetchOptions
        );

        if (response.json) {
          const json = await response.json();
          return json;
        }

        return { error: response };
      } catch (err) {
        return { error: String(err) };
      }
    }, []);

  const voteOnProposalBlocto = useCallback(
    async (injectedProvider, proposal, voteData) => {
      try {
        const timestamp = Date.now();
        const hexChoice = Buffer.from(voteData.choice).toString("hex")
        const message = `${proposal.id}:${hexChoice}:${timestamp}`;
        const hexMessage = Buffer.from(message).toString("hex");
        const _compositeSignatures = await injectedProvider
          .currentUser()
          .signUserMessage(hexMessage);

        // TODO: remove after this is deployed to production
        const sig = getSig(_compositeSignatures);
        if (!sig) {
          return { error: "No valid user signature found." };
        }
        const compositeSignatures = getCompositeSigs(_compositeSignatures);
        if (!compositeSignatures) {
          return { error: "No valid user signature found." };
        }

        const fetchOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...voteData,
            compositeSignatures,
            message,
            timestamp,
            sig,
          }),
        };
        const { id } = proposal;
        const response = await fetch(
          `${process.env.REACT_APP_BACK_END_SERVER_API}/proposals/${id}/votes`,
          fetchOptions
        );

        if (response.json) {
          const json = await response.json();
          return json;
        }

        return { error: response };
      } catch (err) {
        return { error: String(err) };
      }
    },
    []
  );

  const getProposal = useCallback(
    async (proposalId) => {
      dispatch({ type: "PROCESSING" });
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/proposals/${proposalId}`;
      try {
        const response = await fetch(url);
        const proposal = await checkResponse(response);
        // mocking data since backend does not return all fields
        const fakeData = {
          ...mockedData,
          ...proposal,
          choices: proposal.choices.map((choice) => ({
            label: choice,
            value: choice,
          })),
          ipfs: proposal.cid,
          ipfsUrl: `${process.env.REACT_APP_IPFS_GATEWAY}${proposal.cid}`,
          totalVotes: proposal.total_votes,
          // this is coming as a string from db but there could be multiple based on design
          strategy: proposal.strategy || "-",
        };
        dispatch({ type: "SUCCESS", payload: fakeData });
      } catch (err) {
        notifyError(err, url);
        dispatch({ type: "ERROR", payload: { errorData: err.message } });
      }
    },
    [dispatch, notifyError]
  );
  // for now this will be used for closing a proposal
  const updateProposal = useCallback(
    async (injectedProvider, proposalData, update) => {
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${proposalData.communityId}/proposals/${proposalData.id}`;
      try {
        const timestamp = Date.now().toString();
        const hexTime = Buffer.from(timestamp).toString("hex");
        const _compositeSignatures = await injectedProvider
          .currentUser()
          .signUserMessage(hexTime);

        // TODO: remove after this is deployed to production
        const sig = getSig(_compositeSignatures);
        if (!sig) {
          return { error: "No valid user signature found." };
        }
        const compositeSignatures = getCompositeSigs(_compositeSignatures);
        if (!compositeSignatures) {
          return { error: "No valid user signature found." };
        }

        const fetchOptions = {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...update,
            timestamp,
            compositeSignatures,
            sig,
          }),
        };
        dispatch({ type: "PROCESSING" });
        const response = await fetch(url, fetchOptions);
        const json = await checkResponse(response);
        dispatch({ type: "SUCCESS", payload: json });
        return json;
      } catch (err) {
        notifyError(err, url);
        dispatch({ type: "ERROR", payload: { errorData: err.message } });
        return { error: err.message };
      }
    },
    [dispatch, notifyError]
  );
  return {
    ...state,
    createProposal,
    voteOnProposal,
    getProposal,
    updateProposal,
  };
}
