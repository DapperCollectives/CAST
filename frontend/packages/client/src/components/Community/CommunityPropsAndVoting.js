import React from 'react';
import ActionButton from 'components/ActionButton';
import StrategySelectorForm from 'components/Community/StrategySelectorForm';
import isEqual from 'lodash/isEqual';
import { useWebContext } from 'contexts/Web3';
import { useModalContext } from 'contexts/NotificationModal';
import { Error } from 'components';
import { kebabToString } from 'utils';

export default function CommunityProposalsAndVoting({
  communityVotingStrategies = [],
  updateCommunity,
  updatingCommunity,
} = {}) {
  const { isValidFlowAddress } = useWebContext();

  const modalContext = useModalContext();

  const saveDataToBackend = async (strategies) => {
    const updatePayload = strategies
      .filter((st) => st?.toDelete !== true)
      .map((st) => ({
        name: st.name,
        contract: st.contract,
      }));

    const errorMessages = [];
    await Promise.all(
      updatePayload.map(async ({ name, contract }) => {
        try {
          await isValidFlowAddress(contract.addr);
        } catch (error) {
          // This is to bypass error on local
          // emulator when keys field is not present
          // on flow emulator response
          if (process.env.REACT_APP_APP_ENV?.toUpperCase() === 'PRODUCTION') {
            errorMessages.push(name);
          } else if (
            !error?.message.includes(
              "Cannot read properties of undefined (reading 'map')"
            )
          ) {
            errorMessages.push(name);
          }
        }
      })
    );
    // open modal if there are errors on addresses
    if (errorMessages.length) {
      modalContext.openModal(
        React.createElement(Error, {
          error: (
            <div className="mt-4">
              <p className="is-size-6">
                Addresses used are not valid Flow addresses:
              </p>
              <div className="is-flex is-align-items-center is-justify-content-center">
                <ul>
                  {errorMessages.map((type, index) => (
                    <li key={`error-${index}`}>
                      <p className="smaller-text mt-2 has-text-red">
                        - {kebabToString(type)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ),
          errorTitle: 'Flow Address Error',
        }),
        { classNameModalContent: 'rounded-sm' }
      );
      return;
    }

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
