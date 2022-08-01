import { useCallback, useEffect, useReducer } from 'react';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useWebContext } from 'contexts/Web3';
import { checkResponse, getCompositeSigs } from 'utils';
import { INITIAL_STATE, defaultReducer } from 'reducers';

export default function useCommunityDetails(id) {
  const {
    user: { addr },
    injectedProvider,
  } = useWebContext();
  const { notifyError } = useErrorHandlerContext();
  const [state, dispatch] = useReducer(defaultReducer, INITIAL_STATE);
  const getCommunityDetails = useCallback(async () => {
    dispatch({ type: 'PROCESSING' });
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${id}`;
    try {
      const response = await fetch(url);
      const details = await checkResponse(response);
      // merging with mock data
      const detailsUpdated = {
        about: {
          textAbout: details.body,
        },
        ...details,
      };

      dispatch({ type: 'SUCCESS', payload: detailsUpdated });
    } catch (err) {
      notifyError(err, url);
      dispatch({ type: 'ERROR', payload: { errorData: err.message } });
    }
  }, [dispatch, id, notifyError]);

  useEffect(() => {
    getCommunityDetails();
  }, [getCommunityDetails]);

  const updateCommunityDetails = useCallback(
    async (communityId, update) => {
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${communityId}`;
      try {
        const timestamp = Date.now().toString();
        const hexTime = Buffer.from(timestamp).toString('hex');
        const _compositeSignatures = await injectedProvider
          .currentUser()
          .signUserMessage(hexTime);

        const compositeSignatures = getCompositeSigs(_compositeSignatures);

        if (!compositeSignatures) {
          return { error: 'No valid user signature found.' };
        }

        const fetchOptions = {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...update,
            signingAddr: addr,
            timestamp,
            compositeSignatures,
          }),
        };
        dispatch({ type: 'PROCESSING' });
        const response = await fetch(url, fetchOptions);
        const json = await checkResponse(response);
        dispatch({
          type: 'SUCCESS',
          payload: json,
        });
        return json;
      } catch (err) {
        notifyError(err, url);
        dispatch({ type: 'ERROR', payload: { errorData: err.message } });
        return { error: err.message };
      }
    },
    [dispatch, notifyError, addr, injectedProvider]
  );

  return {
    ...state,
    updateCommunityDetails,
    getCommunityDetails,
  };
}
