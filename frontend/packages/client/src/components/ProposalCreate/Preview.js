import { StyledStatusPill } from 'components';
import { CommunityName } from 'components/ProposalInformation';
import { FilterValues } from 'const';
import { parseDateToServer } from 'utils';
import { VoteOptions } from '../Proposal';

const Preview = ({ stepsData }) => {
  const [stepOne, stepTwo, stepThree = {}] = Object.values(stepsData);

  const { name, communityId, body } = stepOne;
  const { endDate, endTime, startDate, startTime } = stepThree;

  // use a date here to allow VoteOptions to show the correct message
  const date = new Date();

  const proposal = {
    endTime:
      endDate && endTime
        ? parseDateToServer(stepThree.endDate, stepThree.endTime)
        : new Date().setDate(date.getDate() + 2),
    startTime:
      startDate && startTime
        ? parseDateToServer(stepThree.startDate, stepThree.startTime)
        : new Date().setDate(date.getDate() + 1),
    winCount: 0,
    choices:
      stepTwo?.choices
        ?.sort((a, b) => (a.value > b.value ? 1 : -1))
        .map((choice) => ({
          ...choice,
          label: choice.value,
        })) ?? null,
  };
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
        <VoteOptions proposal={proposal} readOnly />
      )}
    </div>
  );
};

export default Preview;
