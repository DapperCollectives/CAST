import { useReducer, useCallback } from 'react';
import { defaultReducer, INITIAL_STATE } from '../reducers';
import { checkResponse } from '../utils';
import { useErrorHandlerContext } from '../contexts/ErrorHandler';

export default function useFileUploader({ useModalNotifications = true } = {}) {
  const [state, dispatch] = useReducer(defaultReducer, {
    ...INITIAL_STATE,
    loading: false,
  });
  const { notifyError } = useErrorHandlerContext();

  const uploadFile = useCallback(
    async (image) => {
      dispatch({ type: 'PROCESSING' });
      const formData = new FormData();
      formData.append('file', image);
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/upload`;
      try {
        const fetchOptions = {
          method: 'POST',
          body: formData,
        };
        const response = await fetch(url, fetchOptions);
        const upload = await checkResponse(response);
        // complete url on IPFS
        const fileUrl = `${process.env.REACT_APP_IPFS_GATEWAY}${upload.cid}`;
        dispatch({
          type: 'SUCCESS',
          payload: { ...upload, fileUrl },
        });
        return { ...upload, fileUrl };
      } catch (err) {
        // notify user of error
        if (useModalNotifications) {
          notifyError(err, url);
        }
        dispatch({ type: 'ERROR', payload: { errorData: err.message } });
      }
    },
    [dispatch, notifyError, useModalNotifications]
  );

  return {
    ...state,
    uploadFile,
  };
}
