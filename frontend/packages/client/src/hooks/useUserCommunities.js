import { useReducer, useEffect, useCallback } from "react";
import {
  paginationReducer,
  INITIAL_STATE,
  PAGINATION_INITIAL_STATE,
} from "../reducers";
import { checkResponse } from "../utils";
import { useErrorHandlerContext } from "../contexts/ErrorHandler";

export default function useUserCommunities({
  addr,
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
  const getCommunityUser = useCallback(async () => {
    dispatch({ type: "PROCESSING" });
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/users/${addr}/communities?count=${count}&start=${start}`;
    try {
      const response = await fetch(url);
      const communityUser = await checkResponse(response);
      dispatch({
        type: "SUCCESS",
        payload: communityUser,
      });
    } catch (err) {
      // notify user of error
      notifyError(err, url);
      dispatch({ type: "ERROR", payload: { errorData: err.message } });
    }
  }, [dispatch, notifyError, addr, count, start]);

  const fetchMore = useCallback(async () => {
    dispatch({ type: "PROCESSING" });
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/users/${addr}/communities?count=${state.pagination.count}&start=${state.pagination.start}`;
    try {
      const response = await fetch(url);
      const proposalVotes = await response.json();

      dispatch({ type: "SUCCESS", payload: proposalVotes });
    } catch (err) {
      notifyError(err, url);
      dispatch({ type: "ERROR", payload: { errorData: err.message } });
    }
  }, [state.pagination, addr, notifyError]);

  useEffect(() => {
    if (addr) {
      getCommunityUser();
    }
  }, [getCommunityUser, addr]);

  return {
    ...state,
    getCommunityUser,
    fetchMore,
  };
}
