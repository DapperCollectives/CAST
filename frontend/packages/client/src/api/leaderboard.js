import { checkResponse } from '../utils';
import { COMMUNITIES_URL } from './constants';

const LEADERBOARD_SIZE = 10;
const getLeaderBoardUrl = (communityId) =>
  `${COMMUNITIES_URL}/${communityId}/leaderboard?count=${LEADERBOARD_SIZE}`;

const fetchLeaderBoard = async (communityId) => {
  try {
    const response = await fetch(getLeaderBoardUrl(communityId));
    return await checkResponse(response);
  } catch (err) {
    throw err;
  }
};

export default fetchLeaderBoard;
