const getPriorityBasedProposals = (proposals = []) => {
  const currentDate = new Date();
  if (proposals) {
    const updatedProposal = proposals;
    updatedProposal.sort((a, b) => {
      // The calculations are based on the endTime of proposals,
      // which should be close to the current date
      const differenceA = Math.abs(new Date(a.endTime) - currentDate);
      const differenceB = Math.abs(new Date(b.endTime) - currentDate);
      return differenceA - differenceB;
    });
    return updatedProposal ?? [];
  }
  return [];
};

export const getUpdatedFlipsData = ({ liveProposals, concludedProposals }) => {
  const sortedLiveFlips = getPriorityBasedProposals(liveProposals);
  const sortedConcludedFlips = getPriorityBasedProposals(concludedProposals);
  return [...sortedLiveFlips, ...sortedConcludedFlips];
};
