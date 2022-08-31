import { useCallback, useReducer } from 'react';
import { useErrorHandlerContext } from '../contexts/ErrorHandler';
import { useWebContext } from 'contexts/Web3';
import { useFileUploader } from 'hooks';
import { CREATE_COMMUNITY_TX } from 'const';
import { checkResponse } from 'utils';
import networks from 'networks';
import {
  INITIAL_STATE,
  PAGINATION_INITIAL_STATE,
  paginationReducer,
} from '../reducers';

const networkConfig = networks[process.env.REACT_APP_FLOW_ENV];

const setDefaultValue = (field, fallbackValue) => {
  if (field === undefined || field === '') {
    return fallbackValue;
  }
  return field;
};
export default function useCommunity({
  start = PAGINATION_INITIAL_STATE.start,
  count = PAGINATION_INITIAL_STATE.count,
  initialLoading,
} = {}) {
  const [state, dispatch] = useReducer(paginationReducer, {
    ...INITIAL_STATE,
    loading: initialLoading ?? INITIAL_STATE.loading,
    pagination: {
      ...PAGINATION_INITIAL_STATE,
      start,
      count,
    },
  });
  const { notifyError } = useErrorHandlerContext();
  // for now not using modal notification if there was an error uploading image
  const { uploadFile } = useFileUploader({ useModalNotifications: false });
  const { user, signMessageByWalletProvider } = useWebContext();

  const getCommunities = useCallback(async () => {
    dispatch({ type: 'PROCESSING' });
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities?count=${count}&start=${start}`;
    try {
      const response = await fetch(url);
      const communities = await checkResponse(response);
      dispatch({
        type: 'SUCCESS',
        payload: communities ?? [],
      });
    } catch (err) {
      // notify user of error
      notifyError(err, url);
      dispatch({ type: 'ERROR', payload: { errorData: err.message } });
    }
  }, [dispatch, notifyError, count, start]);

  const createCommunity = useCallback(
    async (communityData) => {
      console.log(communityData);
      dispatch({ type: 'PROCESSING' });
      const { flowAddress } = networkConfig;
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities`;
      try {
        const hexTime = Buffer.from(Date.now().toString()).toString('hex');

        const [compositeSignatures, voucher] =
          await signMessageByWalletProvider(
            user?.services[0]?.uid,
            CREATE_COMMUNITY_TX,
            hexTime
          );

        if (!compositeSignatures && !voucher) {
          const statusText = 'No valid user signature found.';
          // modal error will open
          notifyError(
            {
              status: 'Something went wrong with creating the community.',
              statusText,
            },
            url
          );
          dispatch({
            type: 'ERROR',
            payload: { errorData: statusText },
          });
          return;
        }

        const {
          communityName: name,
          communityDescription: body,
          communityCategory: category,
          communityTerms: termsAndConditionsUrl,
          listAddrAdmins,
          listAddrAuthors,
          creatorAddr,
          slug,
          discordUrl,
          githubUrl,
          instagramUrl,
          twitterUrl,
          websiteUrl,
          logo,
          banner,
          contractAddress: contractAddr,
          contractName: contractN,
          contractType: contractT,
          storagePath: storageP,
          proposalThreshold,
          onlyAuthorsToSubmitProposals,
          strategies,
        } = communityData;

        // check for logo / banner uploads
        // admins can edit later the images
        let communityLogo;
        let communityBanner;
        if (logo?.file) {
          try {
            communityLogo = await uploadFile(logo.file);
          } catch (err) {
            communityLogo = undefined;
          }
        }
        if (banner?.file) {
          try {
            communityBanner = await uploadFile(banner.file);
          } catch (err) {
            communityBanner = undefined;
          }
        }

        const fetchOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            body,
            category,
            termsAndConditionsUrl,
            creatorAddr,
            additionalAuthors: listAddrAuthors,
            additionalAdmins: listAddrAdmins,
            slug,
            githubUrl,
            instagramUrl,
            twitterUrl,
            websiteUrl,
            discordUrl,
            logo: communityLogo?.fileUrl,
            bannerImgUrl: communityBanner?.fileUrl,
            contractAddr: setDefaultValue(
              contractAddr,
              flowAddress.contractAddr
            ),
            contractName: setDefaultValue(contractN, flowAddress.contractName),
            contractType: setDefaultValue(contractT, flowAddress.contractType),
            publicPath: setDefaultValue(storageP, flowAddress.storagePath),
            proposalThreshold: setDefaultValue(proposalThreshold, '0'),
            strategies,
            onlyAuthorsToSubmit: Boolean(onlyAuthorsToSubmitProposals),
            timestamp: hexTime,
            compositeSignatures,
            voucher,
          }),
        };

        const response = await fetch(url, fetchOptions);
        const json = await checkResponse(response);
        dispatch({ type: 'SUCCESS', payload: { data: [json] } });
      } catch (err) {
        notifyError(err, url, 'Something went wrong with your proposal.');
        dispatch({ type: 'ERROR', payload: { errorData: err.message } });
      }
    },
    [
      dispatch,
      notifyError,
      uploadFile,
      signMessageByWalletProvider,
      user?.services,
    ]
  );

  return {
    ...state,
    getCommunities,
    createCommunity,
  };
}
