export const defaultReducer = (state, action) => {
  switch (action.type) {
    case "PROCESSING":
      return {
        ...state,
        loading: true,
        error: false,
      };
    case "SUCCESS":
      return {
        ...state,
        loading: false,
        error: false,
        // do not update state if no payload is passed
        ...(action?.payload ? { data: action.payload } : undefined),
      };
    case "ERROR":
      return {
        ...state,
        loading: false,
        error: true,
        errorData: action.payload.errorData,
      };
    default:
      throw new Error();
  }
};
