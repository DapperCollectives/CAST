import { COMMUNITIES_URL } from './constants';
import { checkResponse, setDefaultValue } from 'utils';
import networks from 'networks';

const networkConfig = networks[process.env.REACT_APP_FLOW_ENV];
const { flowAddress } = networkConfig;

const DEFAULT_PAGE_SIZE = 10;
const getLeaderBoardUrl = (communityId, addr, pageSize) =>
  `${COMMUNITIES_URL}/${communityId}/leaderboard?count=${pageSize}&addr=${addr}`;

export const fetchLeaderBoard = async (
  communityId,
  addr,
  pageSize = DEFAULT_PAGE_SIZE
) => {
  const response = await fetch(getLeaderBoardUrl(communityId, addr, pageSize));
  return checkResponse(response);
};

export const fetchActiveStrategies = async (communityId) => {
  const response = await fetch(`${COMMUNITIES_URL}/${communityId}/strategies`);
  return checkResponse(response);
};

export const fetchCommunityDetails = async (communityId) => {
  const response = await fetch(`${COMMUNITIES_URL}/${communityId}`);
  return checkResponse(response);
};

export const createCommunityApiReq = async ({
  payload,
  timestamp,
  compositeSignatures,
}) => {
  const {
    communityTerms: termsAndConditionsUrl,
    creatorAddr,
    slug,
    discordUrl,
    githubUrl,
    instagramUrl,
    twitterUrl,
    websiteUrl,
    strategies,
    logo,
    bannerImgUrl,
  } = payload;

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: payload.name,
      body: payload?.body,
      category: payload.category.value,
      termsAndConditionsUrl,
      creatorAddr,
      additionalAuthors: payload?.listAddrAuthors,
      additionalAdmins: payload?.listAddrAdmins,
      slug,
      githubUrl,
      instagramUrl,
      twitterUrl,
      websiteUrl,
      discordUrl,
      logo,
      bannerImgUrl,
      contractAddr: setDefaultValue(
        payload?.contractAddr,
        flowAddress.contractAddr
      ),
      contractName: setDefaultValue(
        payload?.contractN,
        flowAddress.contractName
      ),
      publicPath: setDefaultValue(payload?.storageP, flowAddress.storagePath),
      proosalThreshold: setDefaultValue(payload?.proposalThreshold, '0'),

      strategies,
      onlyAuthorsToSubmit: Boolean(payload?.onlyAuthorsToSubmitProposals),
      timestamp,
      compositeSignatures,
    }),
  };

  const response = await fetch(COMMUNITIES_URL, fetchOptions);

  return checkResponse(response);
};

export const updateCommunityDetailsApiReq = async ({
  updatePayload,
  communityId,
} = {}) => {
  const fetchOptions = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatePayload),
  };

  const response = await fetch(
    `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${communityId}`,
    fetchOptions
  );
  return checkResponse(response);
};
