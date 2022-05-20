import { useReducer, useEffect, useCallback } from "react";
import { defaultReducer, INITIAL_STATE } from "../reducers";
import { checkResponse, getCompositeSigs } from "utils";
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

  const createCommunity = useCallback(
    async (injectedProvider, communityData) => {
      console.log("here A");
      dispatch({ type: "PROCESSING" });
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities`;
      try {
        const timestamp = Date.now().toString();
        const hexTime = Buffer.from(timestamp).toString("hex");
        const _compositeSignatures = await injectedProvider
          .currentUser()
          .signUserMessage(hexTime);

        const compositeSignatures = getCompositeSigs(_compositeSignatures);

        if (!compositeSignatures) {
          const statusText = "No valid user signature found.";
          // modal error will open
          notifyError(
            {
              status: "Something went wrong with creating the community.",
              statusText,
            },
            url
          );
          dispatch({
            type: "ERROR",
            payload: { errorData: statusText },
          });
          return;
        }
        
        const {
          communityName: name,
          communityDescription: body,
          category,
          communityTerms: terms_and_conditions_url,
          listAddrAdmins,
          listAddrAuthors,
          creatorAddr,
          ...rest
        } = communityData;
        
        console.log("...communityData", communityData);
        
        const payload = {
          name,
          body,
          category,
          terms_and_conditions_url,
          creatorAddr,
          additional_authors: listAddrAuthors?.map((ele) => ele.addr),
          additional_admins: listAddrAdmins?.map((ele) => ele.addr),
          slug: "AAAA",
          proposal_threshold: '200'
        };


        const fetchOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            timestamp,
            compositeSignatures,
          }),
        };

        console.log("fetch", fetchOptions);

        const response = await fetch(url, fetchOptions);
        const json = await checkResponse(response);
        dispatch({ type: "SUCCESS", payload: json });
      } catch (err) {
        notifyError(err, url, "Something went wrong with your proposal.");
        dispatch({ type: "ERROR", payload: { errorData: err.message } });
      }
    },
    [dispatch, notifyError]
  );

  return {
    ...state,
    getCommunities,
    createCommunity,
  };
}
