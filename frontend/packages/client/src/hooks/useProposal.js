import { useCallback, useReducer } from 'react';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useWebContext } from 'contexts/Web3';
import { CAST_VOTE_TX, CREATE_PROPOSAL_TX, UPDATE_PROPOSAL_TX } from 'const';
import { checkResponse, getCompositeSigs } from 'utils';
import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { INITIAL_STATE, defaultReducer } from '../reducers';

// REFACTOR

export default function useProposal() {
  const [state, dispatch] = useReducer(defaultReducer, {
    ...INITIAL_STATE,
    loading: false,
  });
  const { notifyError } = useErrorHandlerContext();
  const { user, signMessageByWalletProvider } = useWebContext();

  const createProposal = useCallback(
    async (data) => {
      dispatch({ type: 'PROCESSING' });
      const { communityId, ...proposalData } = data;
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${communityId}/proposals`;
      try {
        const hexTime = Buffer.from(Date.now().toString()).toString('hex');
        const [compositeSignatures, voucher] =
          await signMessageByWalletProvider(
            user?.services[0]?.uid,
            CREATE_PROPOSAL_TX,
            hexTime
          );

        if (!compositeSignatures && !voucher) {
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
            timestamp: hexTime,
            compositeSignatures,
            voucher,
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
    [dispatch, notifyError, signMessageByWalletProvider, user?.services]
  );

  const voteOnProposal = async (
    injectedProvider,
    proposal,
    voteData,
    walletProviderId
  ) => {
    switch (walletProviderId) {
      case 'dapper#authn':
        return voteOnProposalWithTxSig(injectedProvider, proposal, voteData);
      case 'fcl-ledger-authz':
        return voteOnProposalWithTxSig(injectedProvider, proposal, voteData);
      default:
        return voteOnProposalWithMessageSig(
          injectedProvider,
          proposal,
          voteData
        );
    }
  };

  const voteOnProposalWithMessageSig = useCallback(
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
            message: hexMessage,
            timestamp,
            voucher: null,
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

  const voteOnProposalWithTxSig = useCallback(
    async (injectedProvider, proposal, voteData) => {
      try {
        const timestamp = Date.now();
        const hexChoice = Buffer.from(voteData.choice).toString('hex');
        const message = `${proposal.id}:${hexChoice}:${timestamp}`;

        const voucher = await fcl.serialize([
          fcl.transaction(CAST_VOTE_TX),
          fcl.args([
            fcl.arg(`${proposal.id}`, t.String),
            fcl.arg(hexChoice, t.String),
            fcl.arg(`${timestamp}`, t.String),
          ]),
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
            ...voteData,
            message,
            timestamp,
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
        const hexTime = Buffer.from(Date.now().toString()).toString('hex');

        const [compositeSignatures, voucher] =
          await signMessageByWalletProvider(
            user?.services[0]?.uid,
            UPDATE_PROPOSAL_TX,
            hexTime
          );

        if (!compositeSignatures && !voucher) {
          return { error: 'No valid user signature found.' };
        }

        const fetchOptions = {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...update,
            timestamp: hexTime,
            compositeSignatures,
            voucher,
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
    [dispatch, notifyError, signMessageByWalletProvider, user?.services]
  );
  return {
    ...state,
    createProposal,
    voteOnProposal,
    getProposal,
    updateProposal,
  };
}
