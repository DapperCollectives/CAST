import { useMemo } from 'react';
import { WrapperResponsive as Wrapper } from 'components';
import { useVotesForAddress } from 'hooks';
import { FilterValues } from 'const';
import { getProposalType, parseDateFromServer } from 'utils';
import { getStatus } from '../getStatus';
import ImageBasedOptions from './ImageBasedOptions';
import TextBasedOptions from './TextBasedOptions';
import VoteHeader from './VoteHeader';

const VoteOptions = ({
  labelType,
  proposal,
  onOptionSelect,
  optionChosen,
  castVote,
  onConfirmVote,
  loggedIn,
  addr,
}) => {
  const { diffFromNow: endDiff } = parseDateFromServer(proposal.endTime);
  const { diffFromNow: startDiff } = parseDateFromServer(proposal.startTime);

  const status = getStatus(startDiff, endDiff, proposal?.computedStatus);

  const isActive = status === FilterValues.active;
  const isClosed = [FilterValues.closed, FilterValues.cancelled].includes(
    status
  );

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

  const voteClasses = `vote-options border-light rounded mb-6${
    !hasntVoted ? ' is-voted' : ''
  }`;

  let previousVote = castVote;
  let currentOption = optionChosen;

  if (!hasntVoted && checkedVotes && votesFromAddress.length) {
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

  const userVoted = !!currentOption && currentOption === previousVote;

  const headerStatus = userVoted
    ? 'user-voted'
    : isClosed
    ? 'is-closed'
    : 'invite-to-vote';

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
        <VoteHeader status={headerStatus} />
      </Wrapper>
      {!isImageChoice && (
        <TextBasedOptions
          choices={choices}
          currentOption={currentOption}
          hideVoteButton={previousVote || isClosed}
          labelType={labelType}
          onOptionSelect={isClosed ? () => {} : onOptionSelect}
          readOnly={isClosed || !canVote}
          onConfirmVote={onConfirmVote}
        />
      )}
      {isImageChoice && (
        <ImageBasedOptions
          choiceA={choiceA}
          choiceB={choiceB}
          currentOption={currentOption}
          readOnly={isClosed || !canVote}
          confirmAndVote={confirmAndVoteImage}
        />
      )}
    </div>
  );
};

export default VoteOptions;
