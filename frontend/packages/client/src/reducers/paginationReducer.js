export const paginationReducer = (state, action) => {
  switch (action.type) {
    case "PROCESSING":
      return {
        ...state,
        loading: true,
        error: false,
      };
    case "SUCCESS":
      const { count, next, totalRecords, data } = action.payload;
      const newData = data ? data : [];
      // return if there are no more items and hook is called again
      if (state.pagination.next < 0 && state.data) {
        return {
          ...state,
          loading: false,
          error: false,
          pagination: {
            ...state.pagination,
          },
        };
      }

      return {
        ...state,
        loading: false,
        error: false,
        // accumulates results
        data: [
          // if there was data loaded append new data
          ...(state.data ? state.data : []),
          // if no data is return then is empty
          ...newData,
        ],
        pagination: {
          ...state.pagination,
          next,
          start:
            next > 0 ? state.pagination.start + count : state.pagination.start,
          totalRecords,
        },
      };
    case "RESET_RESULTS": {
      return {
        ...state,
        data: null,
        pagination: {
          ...state.pagination,
          start: 0,
        },
      };
    }
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
