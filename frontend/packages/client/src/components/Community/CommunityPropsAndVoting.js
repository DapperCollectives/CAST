import React from 'react';
import ActionButton from 'components/ActionButton';
import StrategySelectorForm from 'components/Community/StrategySelectorForm';
import isEqual from 'lodash/isEqual';

// this object is used to change
// field names as are used
// on the backend
const fieldMapPayload = {
  contractAddress: 'addr',
  contractName: 'name',
  maxWeight: 'maxWeight',
  minimunBalance: 'threshold',
  publicPath: 'publicPath',
};

// this function renames fields to prepare payload for backend
const mapFieldsForBackend = (contract) => {
  return Object.assign(
    {},
    ...Object.entries(contract).map(([key, value]) => ({
      ...(fieldMapPayload[key] && value
        ? {
            [fieldMapPayload[key]]: value,
          }
        : undefined),
    }))
  );
};

const hasListChanged = (newList, originalList) => {
  return !isEqual(newList, originalList);
};

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
        contract: mapFieldsForBackend(st.contract),
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
              : hasListChanged(st, communityVotingStrategies)
          }
          onClick={() => saveDataToBackend(st)}
          loading={updatingCommunity}
          classNames="mt-5"
        />
      )}
    />
  );
}
