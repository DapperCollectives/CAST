import React from 'react';

export default function StrategySelector({
  strategies = [],
  onSelectStrategy,
} = {}) {
  const selectStrategy = (stratgy) => () => onSelectStrategy(stratgy);
  return (
    <div
      className="is-flex is-flex-direction-column flex-1"
      style={{ minHeight: '280px' }}
    >
      {strategies.map((st, index) => {
        return (
          <div
            key={`strategy-${index}`}
            className="border-light rounded-sm is-flex is-flex-direction-column is-justify-content-center mb-4 py-4 px-3 cursor-pointer strategy-selector transition-all"
            style={{ minHeight: '99px' }}
            onClick={selectStrategy(st.key)}
          >
            <div className="columns is-multiline">
              <div className="column is-12 pb-2">
                <p>{st.name}</p>
              </div>
              <div className="column is-12 pt-2">
                <p className="small-text has-text-grey">{st.description}</p>
              </div>
            </div>
          </div>
        );
      })}
      {strategies.length === 0 && (
        <div className="is-flex is-flex-direction-column is-justify-content-center is-align-items-center flex-1">
          <p className="small-text has-text-grey">No more Strategies to Add</p>
        </div>
      )}
    </div>
  );
}
