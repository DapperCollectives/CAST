import { StyledStatusPill } from 'components';
import { FilterValues } from 'const';
import { parseDateFromServer } from 'utils';
import { getStatus } from './getStatus';

const ProposalStatus = ({ proposal, className = '' }) => {
  const { diffFromNow: endDiff, diffDays } = parseDateFromServer(
    proposal.endTime
  );
  const { diffFromNow: startDiff } = parseDateFromServer(proposal.startTime);

  const calculatedStatus = getStatus(
    startDiff,
    endDiff,
    proposal?.computedStatus
  );

  if (
    calculatedStatus === FilterValues.active ||
    calculatedStatus === FilterValues.pending
  ) {
    return (
      <div className={className}>
        <code className="has-text-grey pl-0">
          {calculatedStatus === FilterValues.active && (
            <StyledStatusPill status={FilterValues.active} />
          )}
          {calculatedStatus === FilterValues.pending && (
            <StyledStatusPill status={FilterValues.pending} />
          )}
          <span style={{ lineHeight: '18.8px' }} className="smaller-text pl-2">
            Ends in {diffDays} days
          </span>
        </code>
      </div>
    );
  }

  if (calculatedStatus === FilterValues.cancelled) {
    return (
      <div className={className}>
        <code className="has-text-grey pl-0">
          <StyledStatusPill status={FilterValues.cancelled} />
        </code>
      </div>
    );
  }

  return (
    <div className={className}>
      <code className="has-text-grey pl-0">
        <StyledStatusPill status={FilterValues.closed} />
      </code>
    </div>
  );
};

export default ProposalStatus;
