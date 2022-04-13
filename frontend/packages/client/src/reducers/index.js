export { defaultReducer } from "./defaultReducer";
export { paginationReducer } from "./paginationReducer";

export const PAGINATION_INITIAL_STATE = {
  count: 10,
  next: -1,
  start: 0,
  totalRecords: 0,
};

export const INITIAL_STATE = {
  loading: true,
  error: false,
  data: null,
  errorData: null,
};
