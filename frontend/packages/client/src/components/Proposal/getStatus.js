import { FilterValues } from 'const';

export const getStatus = (startDiff, endDiff, status) => {
  // get status from backend
  if (FilterValues[status]) {
    return FilterValues[status];
  }
  // create status based on dates
  if (startDiff > 0) {
    return FilterValues.pending;
  }
  if (endDiff > 0) {
    return FilterValues.active;
  }
  // defaults to closed
  return FilterValues.closed;
};
