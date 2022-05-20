import { useReducer, useCallback } from "react";
import { defaultReducer, INITIAL_STATE } from "../reducers";
import { useErrorHandlerContext } from "../contexts/ErrorHandler";

const getCompositeSigs = (sigArr) => {
  if (sigArr[0]?.signature?.signature) {
    return [sigArr[0].signature];
  }
  return sigArr;
};

export default function useJoinCommunity() {
  const [state, dispatch] = useReducer(defaultReducer, {
    ...INITIAL_STATE,
    loading: false,
  });
  const { notifyError } = useErrorHandlerContext();

  const createCommunityUser = useCallback(
    async (communityId, user, injectedProvider) => {
      const { addr } = user;
      const { currentUser } = injectedProvider;
      const { signUserMessage } = currentUser();
      dispatch({ type: "PROCESSING" });
      const timestamp = Date.now().toString();
      const hexTime = Buffer.from(timestamp).toString("hex");
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${communityId}/users`;
      const _compositeSignatures = await signUserMessage(hexTime);
      if (_compositeSignatures.indexOf("Declined:") > -1) {
        dispatch({ type: "SUCCESS" });
        return { success: false };
      }
      const compositeSignatures = getCompositeSigs(_compositeSignatures);
      if (!compositeSignatures) {
        return { error: "No valid user signature found." };
      }

      try {
        const fetchOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            communityId: parseInt(communityId),
            addr,
            userType: "member",
            signingAddr: addr,
            timestamp,
            compositeSignatures,
          }),
        };

        const response = await fetch(url, fetchOptions);
        const json = await response.json();
        dispatch({ type: "SUCCESS", payload: json });
        return { success: true };
      } catch (err) {
        notifyError(err, url);
        dispatch({ type: "ERROR", payload: { errorData: err.message } });
      }
    },
    [notifyError]
  );

  const deleteUserFromCommunity = useCallback(
    async (communityId, user, injectedProvider) => {
      const { addr } = user;
      const { currentUser } = injectedProvider;
      const { signUserMessage } = currentUser();
      dispatch({ type: "PROCESSING" });
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${communityId}/users/${addr}/member`;
      const timestamp = Date.now().toString();
      const hexTime = Buffer.from(timestamp).toString("hex");
      const _compositeSignatures = await signUserMessage(hexTime);
      if (_compositeSignatures.indexOf("Declined:") > -1) {
        dispatch({ type: "SUCCESS" });
        return { success: false };
      }
      const compositeSignatures = getCompositeSigs(_compositeSignatures);
      if (!compositeSignatures) {
        return { error: "No valid user signature found." };
      }

      try {
        const fetchOptions = {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            communityId: parseInt(communityId),
            addr,
            userType: "member",
            signingAddr: addr,
            timestamp,
            compositeSignatures,
          }),
        };

        const response = await fetch(url, fetchOptions);
        const json = await response.json();
        dispatch({ type: "SUCCESS", payload: json });
        return { success: true };
      } catch (err) {
        notifyError(err, url);
        dispatch({ type: "ERROR", payload: { errorData: err.message } });
      }
    },
    [notifyError]
  );

  return {
    ...state,
    createCommunityUser,
    deleteUserFromCommunity,
  };
}
