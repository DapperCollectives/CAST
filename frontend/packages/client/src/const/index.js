// 1024 * 1024 * 5 = 5MB
export const MAX_FILE_SIZE = 5242880;
// 1024 * 1024 * 2 = 2MB
export const MAX_AVATAR_FILE_SIZE = 2097152;

export const MAX_PROPOSAL_IMAGE_FILE_SIZE = 2097152;

export const IS_LOCAL_DEV = process.env.REACT_APP_FLOW_ENV === 'emulator';

export const COMMUNITY_NAME_MAX_LENGTH = 50;

export const COMMUNITY_DESCRIPTION_MAX_LENGTH = 1000;

export const HAS_DELAY_ON_START_TIME =
  process.env.REACT_APP_APP_ENV?.toUpperCase() === 'PRODUCTION';

export const IS_PRODUCTION =
  process.env.REACT_APP_APP_ENV?.toUpperCase() === 'PRODUCTION';

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
  votingStrategies: 'voting-strategies',
};

// Dapper Wallet Txs
export const CREATE_COMMUNITY_TX = `
transaction() {
    prepare(acct: AuthAccount) {
        // create community:
        //
        // this transaction does nothing and will not be run,
        // it is only used to collect a signature.
        //
    }
}
`;
export const CREATE_PROPOSAL_TX = `
transaction() {
    prepare(acct: AuthAccount) {
        // create proposal:
        //
        // this transaction does nothing and will not be run,
        // it is only used to collect a signature.
        //
    }
}`;
export const CAST_VOTE_TX = `
transaction() {
    prepare(acct: AuthAccount) {
        // cast vote:
        //
        // this transaction does nothing and will not be run,
        // it is only used to collect a signature.
        //
    }
}`;
export const UPDATE_COMMUNITY_TX = `
transaction() {
    prepare(acct: AuthAccount) {
        // update community:
        //
        // this transaction does nothing and will not be run,
        // it is only used to collect a signature.
        //
    }
}`;
export const UPDATE_PROPOSAL_TX = `
transaction() {
    prepare(acct: AuthAccount) {
        // update proposal:
        //
        // this transaction does nothing and will not be run,
        // it is only used to collect a signature.
        //
    }
}`;
export const UPDATE_MEMBERSHIP_TX = `
transaction() {
    prepare(acct: AuthAccount) {
        // update community membership:
        //
        // this transaction does nothing and will not be run,
        // it is only used to collect a signature.
        //
    }
}`;
