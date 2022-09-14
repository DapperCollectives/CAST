import { useEffect, useMemo, useState } from 'react';
import { useVotesForAddress } from 'hooks';
import { FilterValues } from 'const';
import { getProposalType, parseDateFromServer } from 'utils';
import { WrapperResponsive as Wrapper } from '..';
import { getStatus } from './getStatus';

const TextBasedOptions = ({
  choices,
  currentOption,
  previousVote,
  labelType,
  onOptionSelect,
  readOnly,
  onConfirmVote,
}) => {
  const _onOptionSelect = (event) => {
    onOptionSelect(event?.target?.value);
  };

  const showVotedCheck = (value) =>
    String(currentOption) === String(value) &&
    String(previousVote) === String(value);

  return (
    <>
      <Wrapper
        extraClasses="has-background-white-ter p-6"
        extraClassesMobile="has-background-white-ter p-4"
      >
        {choices.map((opt, i) => (
          <Wrapper
            key={`proposal-option-${i}`}
            classNames="has-background-white border-light option-vote transition-all rounded-sm py-5 px-4 has-text-justified word-break"
            extraClasses={choices?.length !== i + 1 ? 'mb-5' : {}}
            extraStylesMobile={
              choices?.length !== i + 1 ? { marginBottom: '14px' } : {}
            }
          >
            <label className="radio is-flex">
              <input
                type="radio"
                name={`${labelType}-${opt.value}`}
                value={opt.value}
                className={`mr-3 ${showVotedCheck(opt.value) && 'is-chosen'}`}
                onChange={_onOptionSelect}
                checked={currentOption === String(opt.value)}
              />
              <span />
              <div className="has-text-black" style={{ lineHeight: '22.4px' }}>
                {opt.label}
              </div>
            </label>
          </Wrapper>
        ))}
      </Wrapper>
      {!previousVote && (
        <Wrapper
          classNames="py-5"
          extraClasses="px-6"
          extraClassesMobile="px-4"
        >
          <button
            style={{ height: 48, width: '100%' }}
            className={`button vote-button transition-all is-flex has-background-yellow rounded-sm is-${
              currentOption && !readOnly ? 'enabled' : 'disabled'
            }`}
            onClick={readOnly ? () => {} : onConfirmVote}
          >
            VOTE
          </button>
        </Wrapper>
      )}
    </>
  );
};

const ButtonChoice = ({
  choice,
  currentOption,
  readOnly,
  confirmAndVote,
  previousVote,
}) => {
  const _confirmAndVote = (value) => () => confirmAndVote(value);

  const showVotedCheck = (value) =>
    String(currentOption) === String(value) &&
    String(previousVote) === String(value);

  return (
    <button
      style={{ minHeight: '67px', height: 'auto', width: '100%' }}
      className={`button vote-button transition-all is-flex has-background-yellow rounded-sm is-${
        (choice.value === currentOption || !currentOption) && !readOnly
          ? 'enabled'
          : 'disabled'
      }`}
      onClick={_confirmAndVote(choice.value)}
    >
      <div className="columns is-mobile">
        {showVotedCheck(choice.value) && (
          <div className="column is-narrow is-flex is-align-items-center">
            <span className={`mr-3 is-button-chosen is-inline-flex`} />
          </div>
        )}
        <div className="column">
          <p
            className="has-text-justified"
            style={{
              whiteSpace: 'normal',
              wordWrap: 'break-word',
            }}
          >
            {choice.label}
          </p>
        </div>
      </div>
    </button>
  );
};

const ImageBasedOptions = ({
  choiceA,
  choiceB,
  currentOption,
  confirmAndVote,
  readOnly,
  previousVote,
}) => {
  const [imageA, setImageA] = useState(null);
  const [imageB, setImageB] = useState(null);

  // process image A
  useEffect(() => {
    if (!imageA) {
      const img = new Image();
      img.onload = function (event) {
        const { target } = event;
        const maxDim =
          target.naturalHeight > target.naturalWidth ? 'height' : 'width';

        setImageA({
          file: target,
          height: target.naturalHeight,
          width: target.naturalWidth,
          maxDim,
        });
      };
      img.src = choiceA.choiceImgUrl;
    }
  }, [choiceA, setImageA, imageA]);

  // process Image B
  useEffect(() => {
    if (!imageB) {
      const img = new Image();
      img.onload = function (event) {
        const { target } = event;
        const maxDim =
          target.naturalHeight > target.naturalWidth ? 'height' : 'width';

        setImageB({
          file: target,
          height: target.naturalHeight,
          width: target.naturalWidth,
          maxDim,
        });
      };
      img.src = choiceB.choiceImgUrl;
    }
  }, [choiceB, setImageB, imageB]);

  const styleHeight = { height: '500px' };
  const imageStyle = { maxHeight: '500px' };

  return (
    <div className="columns">
      <Wrapper
        classNames="column is-6 pt-0 is-flex is-flex-direction-column"
        extraClasses="pr-1"
        extraClassesMobile=""
      >
        <div
          className="is-flex flex-1 is-align-items-center is-justify-content-center"
          style={styleHeight}
        >
          {imageA && (
            <img
              src={imageA?.file.src}
              alt={choiceA.label}
              style={
                imageA?.maxDim === 'width' ? { width: '100%' } : imageStyle
              }
            />
          )}
        </div>
        <ButtonChoice
          choice={choiceA}
          currentOption={currentOption}
          readOnly={readOnly}
          confirmAndVote={confirmAndVote}
          previousVote={previousVote}
        />
      </Wrapper>
      <Wrapper
        classNames="column is-6 pt-0 is-flex is-flex-direction-column"
        extraClasses="pl-1"
        extraClassesMobile=""
      >
        <div
          className="is-flex flex-1 is-align-items-center is-justify-content-center"
          style={styleHeight}
        >
          {imageB && (
            <img
              src={imageB?.file.src}
              alt={choiceB.label}
              style={
                imageB?.maxDim === 'width' ? { width: '100%' } : imageStyle
              }
            />
          )}
        </div>
        <ButtonChoice
          choice={choiceB}
          currentOption={currentOption}
          readOnly={readOnly}
          confirmAndVote={confirmAndVote}
          previousVote={previousVote}
        />
      </Wrapper>
    </div>
  );
};

const VoteOptions = ({
  labelType,
  proposal,
  onOptionSelect,
  optionChosen,
  castVote,
  onConfirmVote,
  loggedIn,
  addr,
  readOnly = false,
}) => {
  const { diffFromNow: endDiff } = parseDateFromServer(proposal.endTime);
  const { diffFromNow: startDiff } = parseDateFromServer(proposal.startTime);

  const status = getStatus(startDiff, endDiff, proposal?.computedStatus);

  const isActive = status === FilterValues.active;

  const { data: votesFromAddress } = useVotesForAddress({
    enabled: Boolean(addr && proposal?.id),
    proposalIds: [proposal.id],
    addr,
  });

  const checkedVotes = Array.isArray(votesFromAddress);

  const hasntVoted =
    !castVote &&
    checkedVotes &&
    votesFromAddress.every(
      (voteObj) => String(proposal.id) !== Object.keys(voteObj)[0]
    );

  const canVote = isActive && (hasntVoted || !loggedIn);
  const voteClasses = `vote-options border-light rounded-sm mb-6 ${
    !canVote && 'is-disabled'
  } ${!hasntVoted && 'is-voted'}`;

  let previousVote = castVote;
  let currentOption = optionChosen;
  if (
    !hasntVoted &&
    Array.isArray(votesFromAddress) &&
    votesFromAddress.length
  ) {
    const previousVoteObj = votesFromAddress.find(
      (voteObj) => Object.keys(voteObj)[0] === String(proposal.id)
    );
    const voteOption = previousVoteObj?.[String(proposal.id)];
    previousVote = voteOption;
    currentOption = voteOption;
  }
  const { choices } = proposal;

  const isImageChoice = useMemo(
    () => getProposalType(choices) === 'image',
    [choices]
  );

  const [choiceA, choiceB] = choices;

  const confirmAndVoteImage = (value) => {
    onOptionSelect(value);
    onConfirmVote();
  };

  return (
    <div className={voteClasses}>
      <Wrapper
        classNames={`${
          isImageChoice
            ? 'is-flex is-flex-direction-column is-align-items-center is-justify-content-center'
            : ''
        }`}
        extraClasses="px-6 pt-6 pb-6"
        extraClassesMobile="px-4 pt-6 pb-6"
      >
        <h3 className={`is-size-5 `} style={{ lineHeight: '24px' }}>
          Cast your vote
        </h3>
      </Wrapper>
      {!isImageChoice && (
        <TextBasedOptions
          choices={choices}
          currentOption={currentOption}
          previousVote={previousVote}
          labelType={labelType}
          onOptionSelect={readOnly ? () => {} : onOptionSelect}
          readOnly={readOnly}
          onConfirmVote={onConfirmVote}
        />
      )}
      {isImageChoice && (
        <ImageBasedOptions
          choiceA={choiceA}
          choiceB={choiceB}
          currentOption={currentOption}
          previousVote={previousVote}
          readOnly={readOnly}
          confirmAndVote={confirmAndVoteImage}
        />
      )}
    </div>
  );
};

export default VoteOptions;
