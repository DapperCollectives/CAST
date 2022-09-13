import React from 'react';

const Results = ({ voteResults }) => {
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
        return (
          <div key={`result-item-${index}`} style={{ marginBottom: '2.5rem' }}>
            <div className="columns is-mobile mb-2">
              <div className="column small-text has-text-grey has-text-left word-break">
                {optionText}
              </div>
              <div className="column is-3 is-flex is-justify-content-flex-end small-text has-text-grey">
                {`${percentage}%`}
              </div>
            </div>
            <div
              style={{ height: 8, background: '#DCDCDC' }}
              className="has-background-grey-light rounded-lg"
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

const WrapperSpacingBottom = ({
  isMobileOnly,
  isTabletOnly,
  isDesktopOnly,
  children,
}) => {
  let classNames = '';
  if (isMobileOnly) {
    classNames = 'px-1 pt-1 pb-1';
  }
  if (isTabletOnly) {
    classNames = 'px-5 pt-3 pb-4';
  }
  if (isDesktopOnly) {
    classNames = 'px-6 pt-2 pb-6';
  }
  return (
    <div className={`has-background-white-ter rounded-sm ${classNames}`}>
      {children}
    </div>
  );
};

export default function ResultPanel({
  results = [],
  isMobileOnly,
  isDesktopOnly,
  isTabletOnly,
} = {}) {
  return (
    <WrapperSpacingBottom
      isMobileOnly={isMobileOnly}
      isDesktopOnly={isDesktopOnly}
      isTabletOnly={isTabletOnly}
    >
      <p className="mb-5">Current Results</p>
      <Results voteResults={results} />
    </WrapperSpacingBottom>
  );
}
