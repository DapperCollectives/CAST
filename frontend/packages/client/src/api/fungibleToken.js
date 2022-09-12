import { API_BASE_URL } from './constants';
import { checkResponse } from 'utils';

export const addFungibleTokenApiReq = async ({ addr, name, path }) => {
  const url = `${API_BASE_URL}/add-fungible-token`;

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      addr,
      name,
      path,
    }),
  };

  const response = await fetch(url, fetchOptions);
  return checkResponse(response);
};
