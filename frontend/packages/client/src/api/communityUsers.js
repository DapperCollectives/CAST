import { COMMUNITIES_URL } from './constants';
import { checkResponse } from 'utils';

export const addUserToCommunityUserApiRep = async ({
  communityId,
  addr,
  hexTime,
  compositeSignatures,
  voucher,
  signingAddr,
  userType = 'member',
}) => {
  const url = `${COMMUNITIES_URL}/${communityId}/users`;

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      communityId: parseInt(communityId),
      addr,
      userType,
      signingAddr,
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
  signingAddr,
}) => {
  const url = `${COMMUNITIES_URL}/${communityId}/users/${addr}/${userType}`;

  const fetchOptions = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      communityId: parseInt(communityId),
      addr,
      userType,
      signingAddr,
      timestamp: hexTime,
      compositeSignatures,
      voucher,
    }),
  };

  const response = await fetch(url, fetchOptions);
  return checkResponse(response);
};

export const communityUsersApiReq = async ({
  communityId,
  type,
  count,
  start,
}) => {
  const url = `${COMMUNITIES_URL}/${communityId}/users${
    type ? `/type/${type}` : ''
  }?count=${count}&start=${start}`;

  const response = await fetch(url);
  return checkResponse(response);
};
