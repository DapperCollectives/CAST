import { parseDateToServer } from 'utils';
import { ProposalStatus, VoteOptions } from '../Proposal';

const Preview = ({ stepsData }) => {
  console.log(stepsData);
  console.log(Object.values(stepsData));
  const [stepOne, stepTwo = {}] = Object.values(stepsData);
  const date = new Date();
  const proposal = {
    endTime:
      parseDateToServer(stepTwo?.endDate, stepTwo?.endTime) ??
      new Date().setDate(date.getDate() + 2),
    startTime:
      parseDateToServer(stepTwo?.startDate, stepTwo?.startTime) ?? new Date(),
    winCount: 0,
    choices: stepOne?.choices
      ?.sort((a, b) => (a.value > b.value ? 1 : -1))
      .map((choice) => ({
        ...choice,
        label: choice.value,
      })),
  };
  console.log(proposal);

  const htmlBody = stepOne?.body;

  return (
    <div>
      <ProposalStatus proposal={proposal} />
      <h1 className="title mt-5 is-3">{stepOne?.title}</h1>
      <div
        className="mt-6 mb-5 proposal-copy content"
        dangerouslySetInnerHTML={{
          __html: htmlBody,
        }}
      />
      <VoteOptions proposal={proposal} readOnly />
    </div>
  );
};

export default Preview;
