import React from "react";

export default function StrategySelector({
  onDismiss = () => {},
  enableDismiss = true,
  strategies = [],
  onSelectStrategy,
} = {}) {
  const selectStrategy = (stratgy) => () => onSelectStrategy(stratgy);
  return (
    <div
      className="is-flex is-flex-direction-column flex-1"
      style={{ height: "100%" }}
    >
      {strategies.map((st, index) => {
        return (
          <div
            key={`strategy-${index}`}
            className="border-light rounded-sm is-flex is-flex-direction-column is-justify-content-center mb-4 py-4 px-3 cursor-pointer strategy-selector transition-all"
            style={{ minHeight: "99px" }}
            onClick={selectStrategy(st.key)}
          >
            <div className="columns is-multiline">
              <div className="column is-12 pb-2">
                <p className="">{st.name}</p>
              </div>
              <div className="column is-12 pt-2">
                <p className="small-text has-text-grey">{st.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
