import React from 'react';
import { Bin } from 'components/Svg';

export function StrategyInput({
  index,
  commuVotStra,
  onDeleteStrategy,
  enableDelete,
} = {}) {
  return (
    <div
      key={`index-${index}`}
      className="column is-12 is-mobile p-0 m-0 mb-4 fade-in"
      style={{ position: 'relative' }}
    >
      <div
        className="border-light rounded-sm p-3 column is-full small-text is-uppercase"
        style={{
          width: '100%',
          lineHeight: 'normal',
        }}
      >
        {commuVotStra}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignContent: 'center',
          position: 'absolute',
          right: 15,
          top: 9,
        }}
      >
        {enableDelete && (
          <div
            className="cursor-pointer is-flex is-align-items-center"
            onClick={() => onDeleteStrategy(index)}
          >
            <Bin />
          </div>
        )}
      </div>
    </div>
  );
}
