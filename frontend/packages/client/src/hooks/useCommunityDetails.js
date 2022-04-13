import { useReducer, useEffect, useCallback } from "react";
import { defaultReducer, INITIAL_STATE } from "../reducers";
import { checkResponse } from "../utils";
import { useErrorHandlerContext } from "../contexts/ErrorHandler";

export default function useCommunityDetails(id) {
  const { notifyError } = useErrorHandlerContext();
  const [state, dispatch] = useReducer(defaultReducer, INITIAL_STATE);
  const getCommunityDetails = useCallback(async () => {
    dispatch({ type: "PROCESSING" });
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${id}`;
    try {
      const response = await fetch(url);
      const details = await checkResponse(response);
      // merging with mock data
      const detailsMocked = {
        logo: "https://i.imgur.com/RMKXPCw.png",
        name: "Flow",
        description:
          "Flow's decentralized governance and node operations community.",
        about: {
          textAbout:
            "The Flow community is a steward of the platform and ecosystem: taking an active role in building and improving everything from the node software to the tools that developers use to create amazing experiences, exercising agency to make decisions, in a fair and open process, that set Flow's trajectory.",
        },
        ...details,
      };

      dispatch({ type: "SUCCESS", payload: detailsMocked });
    } catch (err) {
      notifyError(err, url);
      dispatch({ type: "ERROR", payload: { errorData: err.message } });
    }
  }, [dispatch, id, notifyError]);

  useEffect(() => {
    getCommunityDetails();
  }, [getCommunityDetails]);

  return {
    ...state,
    getCommunityDetails,
  };
}
