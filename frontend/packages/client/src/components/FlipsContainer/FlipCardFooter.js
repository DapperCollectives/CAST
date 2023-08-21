import { Svg } from '@cast/shared-components';
import { StyledStatusPill } from 'components';
import { FilterValues } from 'const';
import { parseDateFromServer } from 'utils';

const STATUS_BUTTONS = {
  [FilterValues.active]: (
    <button
      class={`button is-rounded is-small has-text-weight-semibold has-background-orange has-border-orange`}
    >
      Cast Your Vote
    </button>
  ),
  [FilterValues.pending]: (
    <div className="pt-3">
      <StyledStatusPill status={FilterValues.pending} />
    </div>
  ),
  [FilterValues.closed]: (
    <div className="pt-3">
      <StyledStatusPill status={FilterValues.closed} />
    </div>
  ),
  [FilterValues.cancelled]: (
    <div className="pt-3">
      <StyledStatusPill status={FilterValues.cancelled} />
    </div>
  ),
};

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

const FlipCardFooter = ({ id, voted, endTime, computedStatus }) => {
  const status = FilterValues[computedStatus] ?? FilterValues.closed;

  return (
    <div className="px-4 pb-4 is-flex is-align-items-center">
      {status === FilterValues.active && voted ? (
        <span className="is-flex has-text-weight-bold is-size-7 pt-2 pb-1">
          <Svg
            name="CheckMark"
            height="15"
            width="15"
            circleFill="white"
            checkFill={'#F4AF4A'}
            style={{
              border: `2px solid #F4AF4A`,
              borderRadius: '50%',
              marginRight: '6.5px',
            }}
          />
          You've Already Voted
        </span>
      ) : (
        <>
          <p className="has-text-grey px-0 smaller-text">
            {STATUS_BUTTONS[status] ?? null}
          </p>
          <div className="is-flex ml-2">
            <IconAndText
              voted={voted}
              endTime={endTime}
              status={status}
              id={id}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default FlipCardFooter;
