import { useReducer, useEffect, useCallback } from "react";
import { defaultReducer, INITIAL_STATE } from "../reducers";
import { checkResponse } from "../utils";
import { useErrorHandlerContext } from "../contexts/ErrorHandler";

export default function useVotingResults(proposalId) {
  const [state, dispatch] = useReducer(defaultReducer, INITIAL_STATE);
  const { notifyError } = useErrorHandlerContext();
  const getVotingResults = useCallback(async () => {
    dispatch({ type: "PROCESSING" });
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/proposals/${proposalId}/results`;
    try {
      const response = await fetch(url);
      const results = await checkResponse(response);
      dispatch({ type: "SUCCESS", payload: results });
    } catch (err) {
      notifyError(err, url);
      dispatch({
        type: "ERROR",
        payload: { errorData: err.message },
      });
    }
  }, [dispatch, proposalId, notifyError]);

  useEffect(() => {
    getVotingResults();
  }, [getVotingResults]);

  return {
    ...state,
    getVotingResults,
  };
}
