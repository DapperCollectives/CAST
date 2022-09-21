import { API_BASE_URL } from './constants';
import { checkResponse } from 'utils';

export const fetchCommunityCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/community-categories`);
  return checkResponse(response);
};
