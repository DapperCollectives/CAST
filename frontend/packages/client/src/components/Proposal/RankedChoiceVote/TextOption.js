import { Svg } from '@cast/shared-components';
import { WrapperResponsive as Wrapper } from 'components';

const TextOption = ({
  index,
  handleVote,
  optionsLength,
  label,
  value,
  readOnly,
  isCastVote = false,
  isDragging = false,
  opacity,
}) => {
  const rankStyle =
    isCastVote && index === 0
      ? 'has-background-green'
      : isCastVote
      ? 'has-background-yellow'
      : 'border-light';
  const cursorStyle =
    isCastVote && readOnly
      ? 'auto'
      : isCastVote
      ? 'cursor-grab'
      : 'cursor-pointer';

  let extraClasses = '';
  if (optionsLength !== index + 1) {
    extraClasses = 'mb-5';
  }
  if (optionsLength !== index + 1 && readOnly) {
    extraClasses = 'mb-2';
  }
  let extraStylesMobile = {};
  if (optionsLength !== index + 1) {
    extraStylesMobile = {
      marginBottom: '14px',
    };
  }
  if (optionsLength !== index + 1 && readOnly) {
    extraStylesMobile = {
      marginBottom: '8px',
    };
  }

  return (
    <Wrapper
      key={`proposal-option-${index}`}
      classNames={`border-light transition-all rounded-xl py-4 px-5 has-text-justified word-break is-flex is-justify-content-space-between ${cursorStyle} ${
        isDragging
          ? 'option-vote-dragging has-background-light-grey'
          : 'has-background-white'
      }`}
      extraClasses={extraClasses}
      extraStylesMobile={extraStylesMobile}
      onClick={() => !readOnly && handleVote && handleVote(value)}
    >
      <div
        className="is-flex is-align-items-center"
        style={{ opacity }}
        onClick={() => handleVote && handleVote(value)}
      >
        <div
          className={`rounded-full mr-2 is-flex is-align-items-center is-justify-content-center smaller-text ${rankStyle} ${
            index === 0 ? 'has-text-white' : ''
          }`}
          style={{ width: '1.2rem', height: '1.2rem' }}
        >
          <span>{isCastVote ? index + 1 : null}</span>
        </div>
        <div className="has-text-black px-1" style={{ lineHeight: '22.4px' }}>
          {label}
        </div>
      </div>
      {(isCastVote && !readOnly) || isDragging ? (
        <div className="is-flex is-align-items-center">
          <Svg name="MoveHandle" />
        </div>
      ) : null}
    </Wrapper>
  );
};

export default TextOption;
