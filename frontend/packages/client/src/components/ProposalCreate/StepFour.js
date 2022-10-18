import { useCallback, useEffect } from 'react';
import { parseDateToServer } from 'utils';
import { ProposalStatus, VoteOptions } from '../Proposal';

const StepThree = ({ stepsData, setStepValid }) => {
  const setPreviewValid = useCallback(() => {
    setStepValid(true);
  }, [setStepValid]);

  useEffect(() => {
    setPreviewValid();
  }, [setPreviewValid]);

  const proposal = {
    endTime: parseDateToServer(stepsData[2].endDate, stepsData[2].endTime),
    startTime: parseDateToServer(
      stepsData[2].startDate,
      stepsData[2].startTime
    ),
    winCount: 0,
    choices: stepsData[1]?.choices
      ?.sort((a, b) => (a.value > b.value ? 1 : -1))
      .map((choice) => ({
        ...choice,
        label: choice.value,
      })),
  };

  const htmlBody = stepsData[0]?.body;

  return (
    <div>
      <ProposalStatus proposal={proposal} />
      <h1 className="title mt-5 is-3">{stepsData[0]?.title}</h1>
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

export default StepThree;
