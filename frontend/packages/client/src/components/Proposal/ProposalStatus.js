import React from 'react';
import { parseDateFromServer } from 'utils';
import { getStatus } from './getStatus';
import { FilterValues } from 'const';
import { StatusLabel } from 'components';

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
            <StatusLabel
              margin="mr-3"
              status={<b>Active</b>}
              color="has-background-orange"
              className="smaller-text"
            />
          )}
          {calculatedStatus === FilterValues.pending && (
            <StatusLabel
              margin="mr-3"
              status={<b>Pending</b>}
              color="has-background-grey-light"
              className="smaller-text"
            />
          )}
          <span style={{ lineHeight: '18.8px' }} className="smaller-text">
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
          <StatusLabel
            status={<b>Cancelled</b>}
            color="has-background-grey"
            className="smaller-text"
          />
        </code>
      </div>
    );
  }

  return (
    <div className={className}>
      <code className="has-text-grey pl-0">
        <StatusLabel status={'Closed'} className="smaller-text" />
      </code>
    </div>
  );
};

export default ProposalStatus;
