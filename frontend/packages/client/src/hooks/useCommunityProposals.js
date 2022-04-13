import { useReducer, useEffect, useCallback } from "react";
import {
  paginationReducer,
  PAGINATION_INITIAL_STATE,
  INITIAL_STATE,
} from "../reducers";
import { checkResponse } from "../utils";
import { useErrorHandlerContext } from "../contexts/ErrorHandler";

/**
 * Hook to return proposals created on a community. Results are paginated
 * @param  {int} communityId community Id to get proposals from
 * @param  {int} count page size, used for pagination limiting the number of elements returned. Defaults to 10. Max value is 25.
 * @param  {int} start indicates the start index for paginated results. Defaults to 0.
 */
export default function useCommunityProposals({
  communityId,
  start = PAGINATION_INITIAL_STATE.start,
  count = PAGINATION_INITIAL_STATE.count,
  status,
} = {}) {
  const [state, dispatch] = useReducer(paginationReducer, {
    ...INITIAL_STATE,
    pagination: {
      ...PAGINATION_INITIAL_STATE,
      start,
      count,
    },
  });

  useEffect(() => {
    resetResults();
  }, [status]);

  const { notifyError } = useErrorHandlerContext();
  /**
   * Function to fetch more results based on pagination configuration
   */
  const fetchMore = useCallback(async () => {
    dispatch({ type: "PROCESSING" });
    const url = `${
      process.env.REACT_APP_BACK_END_SERVER_API
    }/communities/${communityId}/proposals?count=${
      state.pagination.count
    }&start=${state.pagination.start}${status ? `&status=${status}` : ""}`;
    try {
      const response = await fetch(url);
      const proposals = await checkResponse(response);

      const updatedProposals = proposals.data.map((p) => ({
        ...p,
        // missing fields added to avoid breaking the frontend rendering
        winCount: 4480000,
        textDecision: "No, do not compensate them",
      }));

      dispatch({
        type: "SUCCESS",
        payload: { ...proposals, data: updatedProposals },
      });
    } catch (err) {
      notifyError(err, url);
      dispatch({ type: "ERROR", payload: { errorData: err.message } });
    }
  }, [state.pagination, communityId, status, notifyError]);

  const getCommunityProposals = useCallback(async () => {
    dispatch({ type: "PROCESSING" });
    const url = `${
      process.env.REACT_APP_BACK_END_SERVER_API
    }/communities/${communityId}/proposals?count=${count}&start=${start}${
      status ? `&status=${status}` : ""
    }`;
    try {
      const response = await fetch(url);
      const proposals = await checkResponse(response);

      const updatedProposals = (proposals.data || []).map((p) => ({
        ...p,
        // missing fields added to avoid breaking the frontend rendering
        winCount: 4480000,
        textDecision: "No, do not compensate them",
      }));

      dispatch({
        type: "SUCCESS",
        payload: { ...proposals, data: updatedProposals },
      });
    } catch (err) {
      notifyError(err, url);
      dispatch({ type: "ERROR", payload: { errorData: err.message } });
    }
  }, [dispatch, communityId, count, start, status, notifyError]);

  const resetResults = () => {
    dispatch({ type: "RESET_RESULTS" });
  };

  useEffect(() => {
    getCommunityProposals();
  }, [getCommunityProposals]);

  return {
    ...state,
    getCommunityProposals,
    fetchMore,
    resetResults,
  };
}
