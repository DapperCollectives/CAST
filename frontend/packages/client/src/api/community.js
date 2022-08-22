import { COMMUNITIES_URL } from './constants';
import { checkResponse } from 'utils';

const DEFAULT_PAGE_SIZE = 10;
const getLeaderBoardUrl = (communityId, addr, pageSize) =>
  `${COMMUNITIES_URL}/${communityId}/leaderboard?count=${pageSize}&addr=${addr}`;

export const fetchLeaderBoard = async (
  communityId,
  addr,
  pageSize = DEFAULT_PAGE_SIZE
) => {
  try {
    const response = await fetch(
      getLeaderBoardUrl(communityId, addr, pageSize)
    );
    return await checkResponse(response);
  } catch (err) {
    throw err;
  }
};

export const fetchActiveStrategies = async (communityId) => {
  try {
    const response = await fetch(
      `${COMMUNITIES_URL}/${communityId}/strategies`
    );
    return await checkResponse(response);
  } catch (err) {
    throw err;
  }
};
