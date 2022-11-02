import { StyledStatusPill } from 'components';
import { CommunityName } from 'components/ProposalInformation';
import { FilterValues } from 'const';
import { parseDateToServer } from 'utils';
import { SingleChoiceVote } from '../Proposal';

const Preview = ({ stepsData }) => {
  const [
    { name, communityId, body },
    { choices } = { choices: [] },
    { endDate, endTime, startDate, startTime } = {},
  ] = Object.values(stepsData);

  // use a date here to allow VoteOptions to show the correct message
  const date = new Date();
  const proposal = {
    endTime:
      endDate && endTime
        ? parseDateToServer(endDate, endTime)
        : new Date().setDate(date.getDate() + 2),
    startTime:
      startDate && startTime
        ? parseDateToServer(startDate, startTime)
        : new Date().setDate(date.getDate() + 1),
    winCount: 0,
    choices:
      choices.length >= 2 && choices.every((el) => el.value !== '')
        ? choices
            .sort((a, b) => (a.value > b.value ? 1 : -1))
            .map((choice) => ({
              ...choice,
              label: choice.value,
            }))
        : null,
  };
  console.log(proposal.choices);
  return (
    <div>
      <h1 className="title mt-5 is-3">{name}</h1>
      <div className="is-flex is-align-items-center">
        <CommunityName communityId={communityId} classNames="mr-3" />
        <StyledStatusPill status={FilterValues.draft} />
      </div>
      <div
        className="mt-6 mb-5 proposal-copy content"
        dangerouslySetInnerHTML={{
          __html: body,
        }}
      />
      {Boolean(proposal.choices) && (
        <SingleChoiceVote proposal={proposal} readOnly />
      )}
    </div>
  );
};

export default Preview;
