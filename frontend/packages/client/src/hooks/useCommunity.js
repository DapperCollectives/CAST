import { useReducer, useEffect, useCallback } from "react";
import { defaultReducer, INITIAL_STATE } from "../reducers";
import { checkResponse } from "../utils";
import { useErrorHandlerContext } from "../contexts/ErrorHandler";

const mockData = {
  createdAt: new Date().toISOString(),
  creatorAddr: "0xf8d6e0586b0a20c7",
  description: "Coming soon...",
  isComingSoon: true,
  logo: "/miquelahead.png",
  id: 2,
  name: "?????",
  sig: "",
  timestamp: "",
};

const addMockData = (data) => [...data, mockData];

export default function useCommunity() {
  const [state, dispatch] = useReducer(defaultReducer, INITIAL_STATE);
  const { notifyError } = useErrorHandlerContext();
  const getCommunities = useCallback(async () => {
    dispatch({ type: "PROCESSING" });
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities`;
    try {
      const response = await fetch(url);
      const communities = await checkResponse(response);
      dispatch({
        type: "SUCCESS",
        payload: addMockData(communities?.data ?? []),
      });
    } catch (err) {
      // notify user of error
      notifyError(err, url);
      dispatch({ type: "ERROR", payload: { errorData: err.message } });
    }
  }, [dispatch, notifyError]);

  useEffect(() => {
    getCommunities();
  }, [getCommunities]);

  return {
    ...state,
    getCommunities,
  };
}
