import { Svg } from '@cast/shared-components';

export default function StrategyInput({
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
        className="border-light rounded-sm p-3 column is-full small-text"
        style={{
          width: '100%',
          lineHeight: 'normal',
          textTransform: 'capitalize',
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
            <Svg name="Bin" />
          </div>
        )}
      </div>
    </div>
  );
}
