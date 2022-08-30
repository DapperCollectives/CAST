import { useCallback, useReducer } from 'react';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { checkResponse } from 'utils';
import { INITIAL_STATE, defaultReducer } from '../reducers';

export default function useAddFungibleToken() {
  const [state, dispatch] = useReducer(defaultReducer, INITIAL_STATE);
  const { notifyError } = useErrorHandlerContext();

  const addFungibleToken = useCallback(
    async (addr, name, path) => {
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/add-fungible-token`;
      try {
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
        dispatch({ type: 'PROCESSING' });
        const response = await fetch(url, fetchOptions);
        const json = await checkResponse(response);
        dispatch({
          type: 'SUCCESS',
        });
        return json;
      } catch (err) {
        notifyError(err, url);
        dispatch({ type: 'ERROR', payload: { errorData: err.message } });
        return { error: err.message };
      }
    },
    [dispatch, notifyError]
  );

  return {
    ...state,
    addFungibleToken,
  };
}
