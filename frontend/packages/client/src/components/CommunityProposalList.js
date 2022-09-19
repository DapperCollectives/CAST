import { Link } from 'react-router-dom';
import Loader from './Loader';
import ProposalCard from './ProposalCard';

const EmptyPlaceHolder = ({ communityId }) => {
  return (
    <div className="is-flex is-flex-direction-column">
      <div className="border-light rounded-sm mb-5">
        <div className="px-5 py-5 proposal-body-spacing">
          <p
            className="has-text-weight-bold has-text-grey mb-4"
            style={{ fontSize: '18px' }}
          >
            Looks like there’s nothing to vote on yet...
          </p>
          <p className="has-text-grey mb-4 small-text">
            What will your community’s first proposal be?
          </p>
          <Link to={`/community/${communityId}/proposal/create`}>
            <p className="small-text">
              Click here to start creating a proposal now
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};
const CommunityProposalList = ({
  proposalsList,
  initialLoading,
  activeProposals = [],
  filterValue,
  communityId,
  admins = [],
} = {}) => {
  // filter with all value should show active and pending in one group and closed and cancelled in another group
  if (filterValue === 'all') {
    const listIsEmpty =
      proposalsList?.length === 0 && activeProposals?.length === 0;
    return (
      <>
        {initialLoading && <Loader fullHeight />}
        {listIsEmpty && <EmptyPlaceHolder communityId={communityId} />}
        {/* If there's an element in any of the two lists they will render */}
        <div className="is-flex is-flex-direction-column">
          {(activeProposals ?? []).map((pr, i) => {
            pr.isAdminProposal = admins.some(
              ({ addr }) => addr === pr.creatorAddr
            );
            return <ProposalCard pr={pr} key={i} />;
          })}
        </div>
        {proposalsList?.length !== 0 && (
          <div className="has-text-weight-bold is-uppercase mb-5">Closed</div>
        )}
        <div className="is-flex is-flex-direction-column">
          {(proposalsList ?? []).map((pr, i) => {
            pr.isAdminProposal = admins.some(
              ({ addr }) => addr === pr.creatorAddr
            );
            return <ProposalCard pr={pr} key={i} style={{ opacity: '50%' }} />;
          })}
        </div>
      </>
    );
  }
  // all other filter status
  return (
    <>
      {initialLoading && <Loader fullHeight />}
      <div className="is-flex is-flex-direction-column">
        {(proposalsList ?? []).map((pr, i) => (
          <ProposalCard pr={pr} key={i} />
        ))}
      </div>
    </>
  );
};

export default CommunityProposalList;
