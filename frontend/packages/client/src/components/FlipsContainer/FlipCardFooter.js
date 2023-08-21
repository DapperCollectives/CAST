import { Svg } from '@cast/shared-components';
import { StatusLabel, StyledStatusPill } from 'components';
import { FilterValues } from 'const';
import { parseDateFromServer } from 'utils';

const IconAndText = ({ endTime, status }) => {
  const { diffDuration } = parseDateFromServer(endTime);
  return status === FilterValues.active ? (
    <>
      <Svg name="Active" />
      <p className="has-text-black has-text-weight-bold p-0 is-size-7 ml-1">
        {diffDuration} left
      </p>
    </>
  ) : null;
};

const getStatusComponent = (voted) => {
  return {
    [FilterValues.active]: (
      <StatusLabel
        status="Active"
        voted={voted}
        rounder
        color="has-background-orange"
        className="proposal-status-label has-text-weight-bold has-text-black"
      />
    ),
    [FilterValues.pending]: <StyledStatusPill status={FilterValues.pending} />,
    [FilterValues.closed]: <StyledStatusPill status={FilterValues.closed} />,
    [FilterValues.cancelled]: (
      <StyledStatusPill status={FilterValues.cancelled} />
    ),
  };
};

const FlipCardFooter = ({ id, voted, endTime, computedStatus }) => {
  const status = FilterValues[computedStatus] ?? FilterValues.closed;

  return (
    <div className="px-4 pb-5 pt-2 is-flex is-align-items-center">
      <p className="has-text-grey px-0 smaller-text">
        {getStatusComponent(voted)[status] ?? null}
      </p>
      <div className="is-flex ml-2">
        <IconAndText voted={voted} endTime={endTime} status={status} id={id} />
      </div>
    </div>
  );
};

export default FlipCardFooter;
