import { API_BASE_URL, PROPOSALS_URL } from './constants';
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
