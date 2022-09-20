import { useMemo } from 'react';
import { Svg } from '@cast/shared-components';
import { Pill } from 'components';
import { FilterValues } from 'const';
import { parseDateFromServer } from 'utils';

const Results = ({ voteResults, computedStatus }) => {
  // sort results array if proposal is closed or active
  let leadingOption;
  if (
    [FilterValues.closed, FilterValues.active].includes(
      FilterValues[computedStatus]
    )
  ) {
    const sortedResults = Object.entries(voteResults).sort(
      ([, valueA], [, valueB]) => {
        return valueA >= valueB ? -1 : 1;
      }
    );
    console.log('sortedResults', sortedResults);
    const [first] = sortedResults;
    leadingOption = first;
  }

  const showViewMore = false;
  const options = Object.keys(voteResults);

  const totalVotes = options.reduce(
    (previousValue, currentValue) => previousValue + voteResults[currentValue],
    0
  );

  const optionBaseColorMap = {
    [FilterValues.active]: '#F4AF4A',
    [FilterValues.closed]: '#757575',
  };

  const leaderColor = {
    [FilterValues.active]: '#FBD84D',
    [FilterValues.closed]: '#2EAE4F',
  };

  const baseColor =
    optionBaseColorMap[FilterValues[computedStatus]] ?? '#E8E8E8';

  // do not render if proposal was cancelled
  if (FilterValues[computedStatus] === FilterValues.cancelled) {
    return null;
  }

  return (
    <>
      <p className="mb-5 has-text-weight-bold">Results</p>
      {options.map((option, index) => {
        const percentage =
          totalVotes === 0 || voteResults[option] === 0
            ? 0
            : ((100 * voteResults[option]) / totalVotes).toFixed(2);

        const optionText =
          option.length > 120 ? `${option.substring(0, 120)}...` : option;

        const isLastOne = options.length === index + 1;
        const isLeaderOption = leadingOption && leadingOption[0] === option;

        return (
          <div
            key={`result-item-${index}`}
            style={isLastOne ? {} : { marginBottom: '2.5rem' }}
          >
            <div className="columns is-mobile mb-2">
              <div className="column small-text has-text-grey has-text-left word-break">
                {optionText}
              </div>
              <div className="column is-3 is-flex is-justify-content-flex-end small-text has-text-grey">
                {`${percentage}%`}
              </div>
            </div>
            <div
              style={{ height: 20, background: '#E8E8E8' }}
              className="rounded-lg"
            >
              <div
                className="rounded-lg"
                style={{
                  width: `${percentage}%`,
                  height: '100%',
                  background: isLeaderOption
                    ? leaderColor[FilterValues[computedStatus]] ?? baseColor
                    : baseColor,
                }}
              />
            </div>
          </div>
        );
      })}
      {showViewMore && (
        <div className="is-flex is-justify-content-start is-align-items-center">
          <button className="button is-white has-background-white-ter p-0">
            View more
          </button>
        </div>
      )}
    </>
  );
};

export default function ResultsPanel({
  results = [],
  endTime,
  computedStatus,
} = {}) {
  const status = FilterValues[computedStatus] ?? FilterValues.closed;

  const pillForStatus = useMemo(
    () => ({
      [FilterValues.active]: (
        <Pill status="Active" backgroundColorClass="has-background-warning" />
      ),
      [FilterValues.pending]: (
        <Pill status="Upcoming" backgroundColorClass="has-background-orange" />
      ),
      [FilterValues.closed]: (
        <Pill
          status={
            <span>
              Complete <Svg name="CheckOutlined" />
            </span>
          }
          backgroundColorClass="has-background-success"
        />
      ),
      [FilterValues.cancelled]: (
        <Pill status="Canceled" backgroundColorClass="has-background-danger" />
      ),
    }),
    []
  );

  const iconStatusMap = {
    [FilterValues.active]: <Svg name="Active" />,
  };

  const { diffDuration } = parseDateFromServer(endTime);

  const textDescriptionMap = {
    [FilterValues.active]: `${diffDuration} remaining`,
    [FilterValues.pending]: `Starting in ${diffDuration}`,
    [FilterValues.closed]: null,
    [FilterValues.cancelled]: null,
  };

  return (
    <div
      className={`has-background-white-ter rounded p-1-mobile p-5-tablet p-5_5-desktop`}
    >
      <div className="columns is-mobile m-0 p-0 mb-5">
        <div className="column is-flex is-align-items-center pl-0 py-0 is-narrow">
          {pillForStatus[status]}
        </div>
        <div className="column is-flex is-align-items-center p-0 py-0 pl-1">
          {iconStatusMap?.[status] ?? null}
          <span className="pl-2 smaller-text has-text-weight-bold">
            {textDescriptionMap?.[status]}
          </span>
        </div>
      </div>
      <Results voteResults={results} computedStatus={computedStatus} />
    </div>
  );
}
