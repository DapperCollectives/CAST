import React from "react";
import ActionButton from "components/ActionButton";
import StrategySelector from "components/Community/StrategySelector";

export default function CommunityProposalsAndVoting({
  communityVotingStrategies = [],
  updateCommunity,
  updatingCommunity,
} = {}) {
  // sends updates to backend
  const saveData = async (strategies) => {
    console.log("--- strategies to update ---", strategies);
    // array like:
    /* 
    {
      strategies: [ 
        {
          contractAddress: "0x0000012122222222"
          contractName: "222"
          maxWeight: "2222222"
          minimunBalance: "2222"
          strategy: "staked-token-weighted-default"
        }
      ]
  } 
    */
    await updateCommunity({ strategies });
  };

  // used like this until backend returns strategies
  const st = communityVotingStrategies.map((st) => ({
    strategy: st,
  }));

  return (
    <StrategySelector
      existingStrategies={st}
      disableAddButton={updatingCommunity}
      // st is an array with strategies hold by StrategySelector
      callToAction={(st) => (
        <ActionButton
          label="save"
          enabled={!updatingCommunity}
          onClick={() => saveData(st)}
          loading={updatingCommunity}
          classNames="mt-5"
        />
      )}
    />
  );
}
