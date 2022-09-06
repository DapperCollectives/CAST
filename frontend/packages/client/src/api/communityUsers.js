import { API_BASE_URL } from './constants';
import { checkResponse } from 'utils';

export const addUserToCommunityUserApiRep = async ({
  communityId,
  addr,
  hexTime,
  compositeSignatures,
  voucher,
  userType = 'member',
}) => {
  const url = `${API_BASE_URL}/communities/${communityId}/users`;

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      communityId: parseInt(communityId),
      addr,
      userType,
      signingAddr: addr,
      timestamp: hexTime,
      compositeSignatures,
      voucher,
    }),
  };

  const response = await fetch(url, fetchOptions);
  return checkResponse(response);
};

export const deleteCommunityMemberApiReq = async ({
  communityId,
  addr,
  hexTime,
  compositeSignatures,
  voucher,
  userType = 'member',
}) => {
  const url = `${API_BASE_URL}/communities/${communityId}/users/${addr}/${userType}`;

  const fetchOptions = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      communityId: parseInt(communityId),
      addr,
      userType: 'member',
      signingAddr: addr,
      timestamp: hexTime,
      compositeSignatures,
      voucher,
    }),
  };

  const response = await fetch(url, fetchOptions);
  return checkResponse(response);
};
