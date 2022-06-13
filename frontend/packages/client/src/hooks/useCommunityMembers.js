import { useReducer, useEffect, useCallback } from "react";
import {
  paginationReducer,
  PAGINATION_INITIAL_STATE,
  INITIAL_STATE,
} from "../reducers";
import { checkResponse } from "../utils";
import { useErrorHandlerContext } from "../contexts/ErrorHandler";

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

/**
 * Hook to return community members. Results are paginated
 * @param  {int} communityId community Id to get members from
 * @param  {int} count page size, used for pagination limiting the number of elements returned. Defaults to 10. Max value is 25.
 * @param  {int} start indicates the start index for paginated results. Defaults to 0.
 */
export default function useCommunityMembers({
  communityId,
  start = PAGINATION_INITIAL_STATE.start,
  count = PAGINATION_INITIAL_STATE.count,
} = {}) {
  const [state, dispatch] = useReducer(paginationReducer, {
    ...INITIAL_STATE,
    pagination: {
      ...PAGINATION_INITIAL_STATE,
      start,
      count,
    },
  });

  const { notifyError } = useErrorHandlerContext();
  /**
   * Function to fetch more results based on pagination configuration
   */
  const fetchMore = useCallback(async () => {
    dispatch({ type: "PROCESSING" });
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${communityId}/users?count=${state.pagination.count}&start=${state.pagination.start}`;
    try {
      const response = await fetch(url);
      const members = await checkResponse(response);

      // this needs to be replaced with real data from backend on votingStreak and score
      const membersMocked = members?.data.map((member) => ({
        ...member,
        // see how these two fields get implemented
        votingStreak: getRandomInt(50),
        score: getRandomInt(500),
      }));

      dispatch({
        type: "SUCCESS",
        payload: { ...members, data: membersMocked },
      });
    } catch (err) {
      notifyError(err, url);
      dispatch({ type: "ERROR", payload: { errorData: err.message } });
    }
  }, [state.pagination, communityId, notifyError]);

  const getCommunityMembers = useCallback(async () => {
    dispatch({ type: "PROCESSING" });
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${communityId}/users?count=${count}&start=${start}`;
    try {
      const response = await fetch(url);
      const members = await checkResponse(response);
      // this needs to be replaced with real data from backend on votingStreak and score
      const membersMocked = members?.data.map((member) => ({
        ...member,
        // see how these two fields get implemented
        votingStreak: getRandomInt(50),
        score: getRandomInt(500),
      }));

      dispatch({
        type: "SUCCESS",
        payload: { ...members, data: membersMocked },
      });
    } catch (err) {
      notifyError(err, url);
      dispatch({ type: "ERROR", payload: { errorData: err.message } });
    }
  }, [dispatch, communityId, count, start, notifyError]);

  const resetResults = () => {
    dispatch({ type: "RESET_RESULTS" });
  };

  useEffect(() => {
    getCommunityMembers();
  }, [getCommunityMembers]);

  return {
    ...state,
    getCommunityMembers,
    fetchMore,
    resetResults,
  };
}
