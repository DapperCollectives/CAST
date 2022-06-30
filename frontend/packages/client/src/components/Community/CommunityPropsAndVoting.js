import React from 'react';
import ActionButton from 'components/ActionButton';
import StrategySelectorForm from 'components/Community/StrategySelectorForm';
import isEqual from 'lodash/isEqual';

export default function CommunityProposalsAndVoting({
  communityVotingStrategies = [],
  updateCommunity,
  updatingCommunity,
} = {}) {
  const saveDataToBackend = async (strategies) => {
    const updatePayload = strategies
      .filter((st) => st?.toDelete !== true)
      .map((st) => ({
        name: st.name,
        contract: st.contract,
      }));
    await updateCommunity({
      strategies: updatePayload,
    });
  };

  return (
    <StrategySelectorForm
      existingStrategies={communityVotingStrategies}
      disableAddButton={updatingCommunity}
      callToAction={(st) => (
        <ActionButton
          label="save"
          enabled={
            updatingCommunity
              ? false
              : // or check if list has changed to enable saving
                !isEqual(st, communityVotingStrategies)
          }
          onClick={() => saveDataToBackend(st)}
          loading={updatingCommunity}
          classNames="mt-5"
        />
      )}
    />
  );
}
