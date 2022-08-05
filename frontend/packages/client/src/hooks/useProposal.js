import { useReducer, useCallback } from 'react';
import { defaultReducer, INITIAL_STATE } from '../reducers';
import { checkResponse, getCompositeSigs } from '../utils';
import { useErrorHandlerContext } from '../contexts/ErrorHandler';
import { CODE as transferTokensCode } from '@onflow/six-transfer-tokens';
import * as t from '@onflow/types';
import * as fcl from '@onflow/fcl';
import {
  encodeTransactionPayload,
  encodeTransactionEnvelope,
} from '@onflow/sdk';

export default function useProposal() {
  const [state, dispatch] = useReducer(defaultReducer, {
    ...INITIAL_STATE,
    loading: false,
  });
  const { notifyError } = useErrorHandlerContext();

  const createProposal = useCallback(
    async (injectedProvider, data) => {
      dispatch({ type: 'PROCESSING' });
      const { communityId, ...proposalData } = data;
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${communityId}/proposals`;
      try {
        const timestamp = Date.now().toString();
        const hexTime = Buffer.from(timestamp).toString('hex');
        const _compositeSignatures = await injectedProvider
          .currentUser()
          .signUserMessage(hexTime);

        const compositeSignatures = getCompositeSigs(_compositeSignatures);

        if (!compositeSignatures) {
          const statusText = 'No valid user signature found.';
          // modal error will open
          notifyError(
            { status: 'Something went wrong with your proposal.', statusText },
            url
          );
          dispatch({
            type: 'ERROR',
            payload: { errorData: statusText },
          });
          return;
        }

        const fetchOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...proposalData,
            timestamp,
            compositeSignatures,
          }),
        };

        const response = await fetch(url, fetchOptions);
        const json = await checkResponse(response);
        dispatch({ type: 'SUCCESS', payload: json });
      } catch (err) {
        notifyError(err, url, 'Something went wrong with your proposal.');
        dispatch({ type: 'ERROR', payload: { errorData: err.message } });
      }
    },
    [dispatch, notifyError]
  );

  const voteOnProposal = async (
    injectedProvider,
    proposal,
    voteData,
    isLedger
  ) => {
    return isLedger
      ? voteOnProposalTxSig(injectedProvider, proposal, voteData)
      : voteOnProposalTxSig(injectedProvider, proposal, voteData);
  };

  const voteOnProposalLedger = useCallback(
    async (injectedProvider, proposal, voteData) => {
      try {
        const timestamp = Date.now();
        const hexChoice = Buffer.from(voteData.choice).toString('hex');
        // use static transaction to address for voting option
        const txOptionsAddresses = (
          process.env.REACT_APP_TX_OPTIONS_ADDRS || ''
        ).split(',');
        const optionId = proposal.choices
          .map((c) => c.value)
          .indexOf(voteData.choice);
        const toAddress = txOptionsAddresses[optionId];
        let _compositeSignatures = '';

        if (!toAddress) {
          return { error: 'Missing voting transaction to address' };
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
              },
            };
          };
        };

        // only serialize the tx not send
        const { transactionId } = await injectedProvider.send([
          injectedProvider.transaction(transferTokensCode),
          injectedProvider.args([
            injectedProvider.arg('0.0', t.UFix64),
            injectedProvider.arg(toAddress, t.Address),
          ]),
          injectedProvider.proposer(buildAuthz(voteData.addr)),
          injectedProvider.authorizations([injectedProvider.authz]),
          injectedProvider.payer(injectedProvider.authz),
          injectedProvider.limit(100),
        ]);

        const message = `${proposal.id}:${hexChoice}:${timestamp}:ledger-${transactionId}`;
        const compositeSignatures = getCompositeSigs([_compositeSignatures]);
        if (!compositeSignatures) {
          return { error: 'No valid user signature found.' };
        }

        // wait on the client till transaction is sealed
        await injectedProvider.tx(transactionId).onceSealed();

        const fetchOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...voteData,
            compositeSignatures,
            message,
            timestamp,
            transactionId,
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
  const voteOnProposalBlocto = useCallback(
    async (injectedProvider, proposal, voteData) => {
      try {
        const timestamp = Date.now();
        const hexChoice = Buffer.from(voteData.choice).toString('hex');
        const message = `${proposal.id}:${hexChoice}:${timestamp}`;
        const hexMessage = Buffer.from(message).toString('hex');
        const _compositeSignatures = await injectedProvider
          .currentUser()
          .signUserMessage(hexMessage);

        const compositeSignatures = getCompositeSigs(_compositeSignatures);
        if (!compositeSignatures) {
          return { error: 'No valid user signature found.' };
        }

        const fetchOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...voteData,
            compositeSignatures,
            message,
            timestamp,
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

  const voteOnProposalTxSig = useCallback(
    async (injectedProvider, proposal, voteData) => {
      try {
        const timestamp = Date.now();
        const hexChoice = Buffer.from(voteData.choice).toString('hex');
        const message = `${proposal.id}:${hexChoice}:${timestamp}`;

        const voucher = await fcl.serialize([
          fcl.transaction`
            transaction() {
              prepare(acct: AuthAccount) {
                log(acct)
              }
            }
          `,
          fcl.limit(999),
          fcl.proposer(fcl.authz),
          fcl.authorizations([fcl.authz]),
          fcl.payer(fcl.authz),
        ]);
        const voucherJSON = JSON.parse(voucher);

        const fetchOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vote: {
              ...voteData,
              message,
              timestamp,
            },
            voucher: voucherJSON,
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
      dispatch({ type: 'PROCESSING' });
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/proposals/${proposalId}`;
      try {
        const response = await fetch(url);
        const proposal = await checkResponse(response);
        // mocking data since backend does not return all fields and sorting
        const sortedProposalChoices =
          proposal.choices?.sort((a, b) =>
            a.choiceText > b.choiceText ? 1 : -1
          ) ?? [];

        const fakeData = {
          ...proposal,
          choices: sortedProposalChoices.map((choice) => ({
            label: choice.choiceText,
            value: choice.choiceText,
            choiceImgUrl: choice.choiceImgUrl,
          })),
          ipfs: proposal.cid,
          ipfsUrl: `${process.env.REACT_APP_IPFS_GATEWAY}${proposal.cid}`,
          totalVotes: proposal.total_votes,
          // this is coming as a string from db but there could be multiple based on design
          strategy: proposal.strategy || '-',
        };
        dispatch({ type: 'SUCCESS', payload: fakeData });
      } catch (err) {
        notifyError(err, url);
        dispatch({ type: 'ERROR', payload: { errorData: err.message } });
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
        const hexTime = Buffer.from(timestamp).toString('hex');
        const _compositeSignatures = await injectedProvider
          .currentUser()
          .signUserMessage(hexTime);
        const compositeSignatures = getCompositeSigs(_compositeSignatures);
        if (!compositeSignatures) {
          return { error: 'No valid user signature found.' };
        }

        const fetchOptions = {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...update,
            timestamp,
            compositeSignatures,
          }),
        };
        dispatch({ type: 'PROCESSING' });
        const response = await fetch(url, fetchOptions);
        const json = await checkResponse(response);

        const sortedProposalChoices =
          json?.choices?.sort((a, b) =>
            a.choiceText > b.choiceText ? 1 : -1
          ) ?? [];

        const updatedResponse = {
          ...json,
          choices: sortedProposalChoices.map((choice) => ({
            label: choice.choiceText,
            value: choice.choiceText,
            choiceImgUrl: choice.choiceImgUrl,
          })),
        };

        dispatch({ type: 'SUCCESS', payload: updatedResponse });

        return updatedResponse;
      } catch (err) {
        notifyError(err, url);
        dispatch({ type: 'ERROR', payload: { errorData: err.message } });
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
