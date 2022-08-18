import { checkResponse } from 'utils';

export const fetchProposalUserVotes = async (addr, proposalIds) => {
  const response = await fetch(
    `${
      process.env.REACT_APP_BACK_END_SERVER_API
    }/votes/${addr}?proposalIds=[${proposalIds.join(',')}]`
  );
  return checkResponse(response);
};
