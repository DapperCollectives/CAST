// 1024 * 1024 * 5 = 5MB
export const MAX_FILE_SIZE = 5242880;
// 1024 * 1024 * 2 = 2MB
export const MAX_AVATAR_FILE_SIZE = 2097152;

export const MAX_PROPOSAL_IMAGE_FILE_SIZE = 2097152;

export const IS_LOCAL_DEV = process.env.REACT_APP_FLOW_ENV !== 'emulator';

export const FilterValues = {
  all: 'All',
  active: 'Active',
  pending: 'Pending',
  closed: 'Closed',
  cancelled: 'Cancelled',
  // group of active and pending
  inProgress: 'In Progress',
  // group of closed and canceled
  terminated: 'Terminated',
};

export const CommunityEditPageTabs = {
  profile: 'profile',
  details: 'details',
  proposalAndVoting: 'proposals-and-voting',
};
