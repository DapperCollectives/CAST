import { checkResponse } from '../utils';
import { COMMUNITIES_URL } from './constants';

const DEFAULT_PAGE_SIZE = 10;
const getLeaderBoardUrl = (communityId, pageSize) =>
  `${COMMUNITIES_URL}/${communityId}/leaderboard?count=${pageSize}`;

const fetchLeaderBoard = async (communityId, pageSize = DEFAULT_PAGE_SIZE) => {
  try {
    const response = await fetch(getLeaderBoardUrl(communityId, pageSize));
    return await checkResponse(response);
  } catch (err) {
    throw err;
  }
};

export default fetchLeaderBoard;
