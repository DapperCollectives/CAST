import { useReducer, useCallback } from 'react';
import {
  paginationReducer,
  PAGINATION_INITIAL_STATE,
  INITIAL_STATE,
} from '../reducers';
import { checkResponse, getCompositeSigs } from 'utils';
import { useErrorHandlerContext } from '../contexts/ErrorHandler';
import { useFileUploader } from 'hooks';

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
    async (injectedProvider, communityData) => {
      dispatch({ type: 'PROCESSING' });
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities`;
      try {
        const timestamp = Date.now().toString();
        const hexTime = Buffer.from(timestamp).toString('hex');
        const _compositeSignatures = await injectedProvider
          .currentUser()
          .signUserMessage(hexTime);

        const compositeSignatures = getCompositeSigs(_compositeSignatures);

        if (!compositeSignatures) {
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
          category,
          communityTerms: termsAndConditionsUrl,
          listAddrAdmins,
          listAddrAuthors,
          creatorAddr,
          slug,
          proposalThreshold,
          discordUrl,
          githubUrl,
          instagramUrl,
          twitterUrl,
          websiteUrl,
          logo,
          contractAddress,
          contractName,
          storagePath,
          onlyAuthorsToSubmitProposals,
          strategies,
        } = communityData;

        let communityLogo;
        // not handling upload error: there's a default image
        // admins can edit later the image
        if (logo.file) {
          try {
            communityLogo = await uploadFile(logo.file);
          } catch (err) {
            communityLogo = undefined;
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
            additionalAuthors: listAddrAuthors?.map((ele) => ele.addr),
            additionalAdmins: listAddrAdmins?.map((ele) => ele.addr),
            proposalThreshold,
            slug,
            githubUrl,
            instagramUrl,
            twitterUrl,
            websiteUrl,
            discordUrl,
            logo: communityLogo?.fileUrl,
            contractAddress,
            contractName,
            storagePath,
            strategies,
            onlyAuthorsToSubmit: Boolean(onlyAuthorsToSubmitProposals),
            timestamp,
            compositeSignatures,
          }),
        };
        const response = await fetch(url, fetchOptions);
        const json = await checkResponse(response);
        dispatch({ type: 'SUCCESS', payload: json });
      } catch (err) {
        notifyError(err, url, 'Something went wrong with your proposal.');
        dispatch({ type: 'ERROR', payload: { errorData: err.message } });
      }
    },
    [dispatch, notifyError, uploadFile]
  );

  return {
    ...state,
    getCommunities,
    createCommunity,
  };
}
