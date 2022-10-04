import {
  API_BASE_URL,
  COMMUNITIES_URL,
  IPFS_GETWAY,
  PROPOSALS_URL,
} from './constants';
import { checkResponse } from 'utils';

export const fetchProposalUserVotes = async ({ addr, proposalIds }) => {
  const response = await fetch(
    `${API_BASE_URL}/votes/${addr}?proposalIds=[${
      proposalIds ? proposalIds.join(',') : ''
    }]`
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
      value: choice.id,
      choiceImgUrl: choice.choiceImgUrl,
    })),
    ipfs: proposal.cid,
    ipfsUrl: `${IPFS_GETWAY}/${proposal.cid}`,
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
  timestamp,
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
      timestamp,
      compositeSignatures,
      voucher,
    }),
  };

  const response = await fetch(url, fetchOptions);
  const proposal = await checkResponse(response);
  proposal.choices = proposal.choices.map((choice) => ({
    label: choice.choiceText,
    value: choice.id,
    choiceImgUrl: choice.choiceImgUrl,
  }));
  return proposal;
};

export const updateProposalApiReq = async ({
  communityId,
  proposalId,
  updatePayload,
  timestamp,
  compositeSignatures,
  voucher,
} = {}) => {
  const url = `${COMMUNITIES_URL}/${communityId}/proposals/${proposalId}`;
  const fetchOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...updatePayload,
      timestamp,
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

export const fetchProposalsByStatus = async ({
  communityId,
  count,
  start,
  status,
}) => {
  const url = `${COMMUNITIES_URL}/${communityId}/proposals?count=${count}&start=${start}${
    status ? `&status=${status}` : ''
  }`;

  const response = await fetch(url);
  return checkResponse(response);
};

export const voteOnProposalApiReq = async ({
  voteData,
  message,
  timestamp,
  compositeSignatures,
  voucher,
  proposalId,
}) => {
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
      voucher,
    }),
  };

  const response = await fetch(
    `${PROPOSALS_URL}/${proposalId}/votes`,
    fetchOptions
  );
  return checkResponse(response);
};

export const fetchProposalResults = async ({ proposalId }) => {
  const response = await fetch(`${PROPOSALS_URL}/${proposalId}/results`);

  return checkResponse(response);
};
