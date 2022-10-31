import { useState } from 'react';
import { Svg } from '@cast/shared-components';
import { WrapperResponsive as Wrapper } from 'components';
import CastVotes from './CastVotes';
import TextOption from './TextOption';

const getVoteNumber = (num) => {
  switch (num) {
    case 1:
      return `${num}st`;
    case 2:
      return `${num}nd`;
    case 3:
      return `${num}rd`;
    default:
      return `${num}th`;
  }
};

const TextBasedOptions = ({
  choices,
  readOnly,
  onConfirmVote,
  hideVoteButton,
  castVotes,
  setCastVotes,
  optionChosen,
  hasntVoted,
}) => {
  const [options, setOptions] = useState(choices);

  const handleCastVote = (value) => {
    const index = options.findIndex((vote) => vote.value === value);
    setCastVotes([...castVotes, options[index]]);
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleRemoveVote = (value) => {
    const index = castVotes.findIndex((vote) => vote.value === value);
    setOptions([castVotes[index], ...options]);
    const newCastVotes = [...castVotes];
    newCastVotes.splice(index, 1);
    setCastVotes(newCastVotes);
  };

  return (
    <>
      <div
        className={`has-background-light-grey p-6 ${
          hideVoteButton ? 'rounded-lg-bottom' : ''
        }`}
      >
        <div style={{ display: readOnly ? 'none' : 'block' }}>
          {castVotes.length > 0 ? (
            <div
              className={`is-flex smaller-text pb-6 ${
                castVotes.length > 1
                  ? 'is-justify-content-space-between'
                  : 'is-justify-content-flex-end'
              }`}
            >
              {castVotes.length > 1 ? (
                <span>Drag and drop, or click to re-order</span>
              ) : null}
              <span>
                {castVotes.length} of {choices.length}
              </span>
            </div>
          ) : (
            <p className="mb-6 has-text-grey has-text-weight-bold smaller-text is-flex is-align-items-center is-justify-content-center">
              All choices are randomized on page load{' '}
              <span className="pl-2 is-flex is-align-items-center">
                <Svg name="Reload" width={10} height={12} />
              </span>
            </p>
          )}
        </div>
        <div>
          <CastVotes
            votes={
              readOnly && optionChosen && optionChosen.length > 0
                ? optionChosen
                : readOnly
                ? options
                : castVotes
            }
            setVotes={setCastVotes}
            readOnly={readOnly}
            removeVote={handleRemoveVote}
            hasntVoted={hasntVoted}
          />
        </div>
        {!readOnly && castVotes.length > 0 && options.length !== 0 ? (
          <div className="has-text-centered mt-6 mb-4 has-text-weight-bold medium-text">
            Select your {getVoteNumber(castVotes.length + 1)} choice, or vote
            now
          </div>
        ) : null}
        <div>
          {!readOnly
            ? options.map((opt, i, arr) => (
                <TextOption
                  key={`${opt.label}-${i}`}
                  index={i}
                  label={opt.label}
                  labelType={opt.labelType}
                  value={opt.value}
                  handleVote={handleCastVote}
                  optionsLength={arr.length}
                  readOnly={readOnly}
                />
              ))
            : null}
        </div>
        {options.length === 0 && !readOnly ? (
          <div className="has-text-weight-bold has-text-centered pt-6">
            <span className="mr-2">&#10003;</span>All set. Time to cast your
            vote.
          </div>
        ) : null}
      </div>
      {!hideVoteButton && (
        <Wrapper
          classNames="py-5"
          extraClasses="px-6"
          extraClassesMobile="px-4"
        >
          <button
            style={{ height: 48, width: '100%' }}
            className={`button vote-button transition-all is-flex has-background-yellow rounded-xl has-text-weight-bold is-${
              castVotes.length > 0 && !readOnly ? 'enabled' : 'disabled'
            }`}
            onClick={readOnly ? () => {} : () => onConfirmVote(castVotes)}
          >
            Vote
          </button>
        </Wrapper>
      )}
    </>
  );
};

export default TextBasedOptions;
