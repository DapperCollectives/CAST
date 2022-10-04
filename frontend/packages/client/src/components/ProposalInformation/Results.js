import { useMemo } from 'react';
import { FilterValues } from 'const';

export default function Results({
  proposalChoices,
  voteResults,
  computedStatus,
} = {}) {
  // sort results array if proposal is closed or active

  const sortedResults = useMemo(
    () =>
      Object.entries(voteResults).sort(([, valueA], [, valueB]) => {
        return valueA >= valueB ? -1 : 1;
      }),
    [voteResults]
  );

  // get leader if proposal is closed or active
  let leadingOption;
  if (
    [FilterValues.closed, FilterValues.active].includes(
      FilterValues[computedStatus]
    )
  ) {
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
      <p className="mb-5 medium-text has-text-weight-bold">Results</p>
      {options.map((option, index) => {
        const percentage =
          totalVotes === 0 || voteResults[option] === 0
            ? 0
            : ((100 * voteResults[option]) / totalVotes).toFixed(2);

        const optionText = proposalChoices.find((c) => {
          return c.value === Number(option);
        }).label;
        const optionTextTrunc =
          optionText.length > 120
            ? `${optionText.substring(0, 120)}...`
            : optionText;

        const isLastOne = options.length === index + 1;
        const isLeaderOption = leadingOption && leadingOption[0] === option;

        return (
          <div
            key={`result-item-${index}`}
            style={isLastOne ? {} : { marginBottom: '2.5rem' }}
          >
            <div className="columns is-mobile mb-2">
              <div className="column pb-0 mb-0 small-text has-text-grey has-text-left word-break">
                {optionTextTrunc}
              </div>
              <div className="column pb-0 mb-0 is-3 is-flex is-justify-content-flex-end small-text has-text-grey">
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
}
