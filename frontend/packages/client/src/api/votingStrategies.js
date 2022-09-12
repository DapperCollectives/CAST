import { API_BASE_URL } from './constants';
import { checkResponse } from 'utils';

export const fetchVotingStrategies = async () => {
  const response = await fetch(`${API_BASE_URL}/voting-strategies`);

  return checkResponse(response);
};
