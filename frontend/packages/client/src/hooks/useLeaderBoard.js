import { useReducer, useEffect, useCallback } from "react";
import { defaultReducer, INITIAL_STATE } from "../reducers";
// import { checkResponse } from "../utils";
import { useErrorHandlerContext } from "../contexts/ErrorHandler";

export default function useLeaderBoard() {
  const [state, dispatch] = useReducer(defaultReducer, INITIAL_STATE);
  const { notifyError } = useErrorHandlerContext();

  const getLeaderBoard = useCallback(async () => {
    dispatch({ type: "PROCESSING" });
    // const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/..`;
    try {
      // uncomment this lines when endpoint is ready
      // const response = await fetch(url);
      // const allowList = await checkResponse(response);

      // fake data
      const result = {
        leaderBoard: [
          {
            addr: "nick.fn",
            score: "123 $XYZ",
          },
          {
            addr: "askash.find",
            score: "123 $XYZ",
          },
          {
            addr: "m33stie.fn",
            score: "123 $XYZ",
          },
          {
            addr: "0xd1...0b9b",
            score: "123 $XYZ",
          },
          {
            addr: "0ak.fn",
            score: "123 $XYZ",
          },
        ],
        currentUser: {
          addr: "joshprin...",
          score: "123 $XYZ",
          index: 122,
        },
      };

      dispatch({ type: "SUCCESS", payload: result });
    } catch (err) {
      // notify user of error
      notifyError(
        err,
        // uncomment this line when endpoint is ready
        //url
        "urlToEndpoint"
      );
      dispatch({ type: "ERROR", payload: { errorData: err.message } });
    }
  }, [dispatch, notifyError]);

  useEffect(() => {
    getLeaderBoard();
  }, [getLeaderBoard]);

  return {
    ...state,
    getLeaderBoard,
  };
}
