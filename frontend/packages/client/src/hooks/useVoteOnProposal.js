import { useCallback, useReducer } from 'react';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useWebContext } from 'contexts/Web3';
import { CAST_VOTE_TX } from 'const';
import { getCompositeSigs } from 'utils';
import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { INITIAL_STATE, defaultReducer } from '../reducers';

// REFACTOR

export default function useVoteOnProposal() {
  const [state, dispatch] = useReducer(defaultReducer, {
    ...INITIAL_STATE,
    loading: false,
  });
  const { notifyError } = useErrorHandlerContext();
  const { user, signMessageByWalletProvider } = useWebContext();

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

  return {
    ...state,
    voteOnProposal,
  };
}
