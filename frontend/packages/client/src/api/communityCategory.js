import { API_BASE_URL } from './constants';
import { checkResponse } from 'utils';

export const fetchCommunityCategories = async () => {
  const url = `${API_BASE_URL}/community-categories`;
  try {
    const response = await fetch(url);
    return await checkResponse(response);
  } catch (err) {
    throw err;
  }
};
