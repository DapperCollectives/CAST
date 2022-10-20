import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWebContext } from 'contexts/Web3';
import { useCommunityProposalsWithVotes, useMediaQuery } from 'hooks';
import { FilterValues } from 'const';
import CommunityProposalList from './CommunityProposalList';
import DropDown from './Dropdown';
import WrapperResponsive from './WrapperResponsive';

const statusMap = {
  [FilterValues.pending]: 'Upcoming',
  [FilterValues.closed]: 'Complete',
  [FilterValues.cancelled]: 'Canceled',
};
export default function CommunityProposals({ communityId = 1, admins } = {}) {
  const notMobile = useMediaQuery();

  const {
    user: { addr },
    openWalletModal,
  } = useWebContext();

  const proposalFilterValues = Object.entries(FilterValues)
    .filter(
      ([, value]) =>
        FilterValues.inProgress !== value && FilterValues.terminated !== value
    )
    .map(([key, value]) => ({ value: key, label: statusMap[value] ?? value }));

  const [filterValue, setFilterValues] = useState('all');

  // When filter has all values two requests are made to the backend:
  // one will bring all active and pending proposals: "inprogress"
  // the other will bring all closed and cancelled proposals: "terminated"
  // if status is any other value there will be only
  // one request to bring proposals with the selected status
  const { data: proposals, loading: loadingProposals } =
    useCommunityProposalsWithVotes({
      communityId,
      count: 10,
      status: filterValue === 'all' ? 'terminated' : filterValue,
    });

  // used to load active and pending proposals without pulling data on scrolling
  const { data: activeProposals, loading: loadingActiveProposals } =
    useCommunityProposalsWithVotes({
      communityId,
      count: 25,
      status: 'inprogress',
      scrollToFetchMore: false,
    });

  const classesContainer = notMobile ? 'mt-6' : 'mt-5';

  const initialLoading =
    filterValue !== 'all'
      ? loadingProposals && !proposals
      : loadingProposals &&
        !proposals &&
        !activeProposals &&
        loadingActiveProposals;

  return (
    <div className={`columns ${classesContainer}`}>
      <div className="column is-3-desktop is-4-tablet">
        <div className="columns is-mobile m-0">
          <WrapperResponsive
            classNames="column p-0"
            extraClasses="is-5"
            extraClassesMobile="mt-2 mb-5 is-8 pr-2"
          >
            <DropDown
              defaultValue={{ value: 'all', label: 'All' }}
              values={proposalFilterValues}
              onSelectValue={(value) => {
                setFilterValues(value);
              }}
            />
          </WrapperResponsive>
          {!notMobile && (
            <div className="column p-0 mt-2 pl-2">
              <Link to={`/community/${communityId}/proposal/create`}>
                <div
                  className="button rounded-sm  is-flex small-text has-text-white has-background-black"
                  style={{ minHeight: '40px' }}
                >
                  Create
                </div>
              </Link>
            </div>
          )}
        </div>
        <hr className="my-6 is-hidden-mobile" />
        {notMobile && (
          <div className="columns m-0">
            <div className="column p-0 is-10">
              {addr ? (
                <Link to={`/community/${communityId}/proposal/create`}>
                  <div
                    className="button is-fullwidth rounded-sm is-flex small-text has-text-white has-background-black"
                    style={{ minHeight: '40px' }}
                  >
                    Create Proposal
                  </div>
                </Link>
              ) : (
                <div
                  className="button is-fullwidth rounded-sm is-flex small-text has-text-white has-background-black"
                  style={{ minHeight: '40px' }}
                  onClick={openWalletModal}
                >
                  Create Proposal
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div
        className="column is-9-desktop is-7-tablet"
        style={notMobile ? { paddingLeft: '12%' } : {}}
      >
        <CommunityProposalList
          proposalsList={proposals}
          activeProposals={activeProposals}
          filterValue={filterValue}
          initialLoading={initialLoading}
          communityId={communityId}
          admins={admins}
        />
      </div>
    </div>
  );
}
