import { API_BASE_URL, COMMUNITIES_URL, PROPOSALS_URL } from './constants';
import { checkResponse } from 'utils';

export const fetchProposalUserVotes = async (addr, proposalIds) => {
  const response = await fetch(
    `${API_BASE_URL}/votes/${addr}?proposalIds=[${proposalIds.join(',')}]`
  );
  return checkResponse(response);
};

export const fetchProposal = async ({ proposalId }) => {
  const url = `${PROPOSALS_URL}/${proposalId}`;
  const response = await fetch(url);
  const proposal = await checkResponse(response);

  const sortedProposalChoices =
    proposal.choices?.sort((a, b) => (a.choiceText > b.choiceText ? 1 : -1)) ??
    [];

  const proposalData = {
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

  return proposalData;
};

export const createProposalApiReq = async ({
  proposalPayload,
  compositeSignatures,
  voucher,
  hexTime,
} = {}) => {
  const { communityId, ...proposalData } = proposalPayload;
  const url = `${COMMUNITIES_URL}/${communityId}/proposals`;
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
  return checkResponse(response);
};

export const updateProposalApiReq = async ({
  communityId,
  proposalId,
  updatePayload,
  hexTime,
  compositeSignatures,
  voucher,
} = {}) => {
  const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${communityId}/proposals/${proposalId}`;
  const fetchOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...updatePayload,
      timestamp: hexTime,
      compositeSignatures,
      voucher,
    }),
  };

  const response = await fetch(url, fetchOptions);
  const json = await checkResponse(response);

  const sortedProposalChoices =
    json?.choices?.sort((a, b) => (a.choiceText > b.choiceText ? 1 : -1)) ?? [];

  const updatedResponse = {
    ...json,
    choices: sortedProposalChoices.map((choice) => ({
      label: choice.choiceText,
      value: choice.choiceText,
      choiceImgUrl: choice.choiceImgUrl,
    })),
  };

  return updatedResponse;
};
