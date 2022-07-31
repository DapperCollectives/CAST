import React, { useEffect, useCallback } from 'react';
import { parseDateToServer } from 'utils';
import { customDraftToHTML } from 'utils';
import { ProposalStatus, VoteOptions } from '../Proposal';

const StepThree = ({ stepsData, setStepValid }) => {
  const setPreviewValid = useCallback(() => {
    setStepValid(true);
  }, [setStepValid]);

  useEffect(() => {
    setPreviewValid();
  }, [setPreviewValid]);

  const proposal = {
    endTime: parseDateToServer(stepsData[1].endDate, stepsData[1].endTime),
    startTime: parseDateToServer(
      stepsData[1].startDate,
      stepsData[1].startTime
    ),
    winCount: 0,
    choices: stepsData[0]?.choices
      ?.sort((a, b) => (a.value > b.value ? 1 : -1))
      .map((choice) => ({
        ...choice,
        label: choice.value,
      })),
  };

  const currentContent = stepsData[0]?.description?.getCurrentContent();

  const htmlBody = customDraftToHTML(currentContent);

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
