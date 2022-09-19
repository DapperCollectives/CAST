import React from 'react';

const Results = ({ voteResults, status }) => {
  const showViewMore = false;
  const options = Object.keys(voteResults);

  const totalVotes = options.reduce(
    (previousValue, currentValue) => previousValue + voteResults[currentValue],
    0
  );

  return (
    <>
      {options.map((option, index) => {
        const percentage =
          totalVotes === 0 || voteResults[option] === 0
            ? 0
            : ((100 * voteResults[option]) / totalVotes).toFixed(2);

        const optionText =
          option.length > 120 ? `${option.substring(0, 120)}...` : option;
        const isLastOne = options.length === index + 1;
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
                  background: '#747474',
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

export default function ResultPanel({
  results = [],
  isMobileOnly,
  isDesktopOnly,
  isTabletOnly,
} = {}) {
  return (
    <div
      className={`has-background-white-ter rounded p-1-mobile p-5-tablet p-5_5-desktop`}
    >
      <p className="mb-5 has-text-weight-bold">Results</p>
      <Results voteResults={results} />
    </div>
  );
}
