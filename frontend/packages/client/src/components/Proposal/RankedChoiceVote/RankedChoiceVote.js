import { useMemo, useState } from 'react';
import { WrapperResponsive as Wrapper } from 'components';
import { useVotesForAddress } from 'hooks';
import { FilterValues } from 'const';
import { getProposalType, parseDateFromServer } from 'utils';
import VoteHeader from '../VoteHeader';
import { getStatus } from '../getStatus';
import TextBasedOptions from './TextBasedOptions';

const shuffle = (array) => {
  const arrayCopy = [...array];
  let currentIndex = arrayCopy.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [arrayCopy[currentIndex], arrayCopy[randomIndex]] = [
      arrayCopy[randomIndex],
      arrayCopy[currentIndex],
    ];

    return arrayCopy;
  }

  return array;
};

const RankedChoiceVote = ({
  proposal,
  optionChosen,
  castVote,
  onConfirmVote,
  loggedIn,
  addr,
  readOnly,
}) => {
  const { diffFromNow: endDiff } = parseDateFromServer(proposal.endTime);
  const { diffFromNow: startDiff } = parseDateFromServer(proposal.startTime);

  const [castVotes, setCastVotes] = useState([]);

  const handleSetCastVotes = (votes) => {
    setCastVotes(votes);
  };

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

  const randomizedChoices = shuffle(choices);

  const userVoted = currentOption !== null && currentOption === previousVote;

  const voteStatus = userVoted
    ? 'user-voted'
    : isClosed
    ? 'is-closed'
    : 'invite-to-vote';

  let userVotes = [];
  votesFromAddress?.length > 0 &&
    votesFromAddress[0][proposal.id].forEach((val) => {
      const choice = choices.find((c) => `${c.value}` === val);
      userVotes = [...userVotes, choice];
    });

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
        <VoteHeader status={voteStatus} />
      </Wrapper>
      {!isImageChoice && (
        <TextBasedOptions
          castVotes={castVotes}
          setCastVotes={handleSetCastVotes}
          choices={randomizedChoices}
          hideVoteButton={!hasntVoted || previousVote || isClosed}
          readOnly={isClosed || !canVote || readOnly}
          onConfirmVote={onConfirmVote}
          hasntVoted={hasntVoted}
          optionChosen={optionChosen || userVotes}
        />
      )}
    </div>
  );
};

export default RankedChoiceVote;
