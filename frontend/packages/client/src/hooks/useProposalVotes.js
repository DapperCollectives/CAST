import { useReducer, useEffect, useCallback } from "react";
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
export default function useProposalVotes({
  proposalId,
  count = PAGINATION_INITIAL_STATE.count,
  start = PAGINATION_INITIAL_STATE.start,
} = {}) {
  const [state, dispatch] = useReducer(paginationReducer, {
    ...INITIAL_STATE,
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

  /**
   * Function to fetch more results based on pagination configuration
   * @param  {int} proposalId id used to fetch votes from
   */
  const fetchMore = useCallback(async () => {
    dispatch({ type: "PROCESSING" });
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/proposals/${proposalId}/votes?count=${state.pagination.count}&start=${state.pagination.start}`;
    try {
      const response = await fetch(url);
      const proposalVotes = await response.json();

      dispatch({ type: "SUCCESS", payload: proposalVotes });
    } catch (err) {
      notifyError(err, url);
      dispatch({ type: "ERROR", payload: { errorData: err.message } });
    }
  }, [state.pagination, proposalId, notifyError]);

  const getProposalVotes = useCallback(async () => {
    dispatch({ type: "PROCESSING" });
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/proposals/${proposalId}/votes?count=${count}&start=${start}`;
    try {
      const response = await fetch(url);
      const proposalVotes = await checkResponse(response);
      dispatch({ type: "SUCCESS", payload: proposalVotes });
    } catch (err) {
      notifyError(err, url);
      dispatch({
        type: "ERROR",
        payload: { errorData: err.message },
      });
    }
  }, [dispatch, proposalId, count, start, notifyError]);

  const getAllProposalVotes = useCallback(async () => {
    dispatch({ type: "PROCESSING" });
    let page = 0;
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/proposals/${proposalId}/votes?count=25`;
    try {
      let response = await fetch(`${url}&start=${page}`);
      let proposalVotes = await checkResponse(response);

      const votesArray = [...proposalVotes.data];

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

  // Initial Load to fetch from API
  useEffect(() => {
    (async () => {
      await getProposalVotes();
    })();
  }, [proposalId, getProposalVotes]);

  return {
    ...state,
    getProposalVotes,
    getAllProposalVotes,
    resetResults,
    fetchMore,
  };
}
