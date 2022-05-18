import { useReducer, useCallback } from "react";
import {
  paginationReducer,
  PAGINATION_INITIAL_STATE,
  INITIAL_STATE,
} from "../reducers";
import { checkResponse } from "../utils";
import { useErrorHandlerContext } from "../contexts/ErrorHandler";

/**
 * Hook to return proposal votes for a proposal. Results are paginated
 * @param  {int} count page size, used for pagination limiting the number of elements returned. Defaults to 10. Max value is 25.
 * @param  {int} start indicates the start index for paginated results. Defaults to 0.
 */
export default function useAllProposalVotes({
  proposalId,
  count = PAGINATION_INITIAL_STATE.count,
  start = PAGINATION_INITIAL_STATE.start,
} = {}) {
  const [state, dispatch] = useReducer(paginationReducer, {
    ...INITIAL_STATE,
    loading: false,
    pagination: {
      ...PAGINATION_INITIAL_STATE,
      count,
      start,
    },
  });

  const { notifyError } = useErrorHandlerContext();
  /**
   * Function to reset results from Api call stored in hook state
   */
  const resetResults = useCallback(() => {
    dispatch({ type: "RESET_RESULTS" });
  }, []);

  const getAllProposalVotes = useCallback(async () => {
    dispatch({ type: "PROCESSING" });
    let page = 0;
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/proposals/${proposalId}/votes?count=25`;
    try {
      let response = await fetch(`${url}&start=${page}`);
      let proposalVotes = await checkResponse(response);

      const votesArray = proposalVotes?.data ? [...proposalVotes.data] : [];

      while (proposalVotes?.next !== -1) {
        page = proposalVotes?.next;
        response = await fetch(`${url}&start=${page}`);
        proposalVotes = await checkResponse(response);
        votesArray.push(...proposalVotes.data);
      }

      dispatch({
        type: "SUCCESS",
        payload: { ...proposalVotes, data: votesArray },
      });
    } catch (err) {
      notifyError(err, url);
      dispatch({
        type: "ERROR",
        payload: { errorData: err.message },
      });
    }
  }, [dispatch, proposalId, notifyError]);

  return {
    ...state,
    getAllProposalVotes,
    resetResults,
  };
}
