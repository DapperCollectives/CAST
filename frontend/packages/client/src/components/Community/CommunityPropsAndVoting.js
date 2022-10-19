import { createElement } from 'react';
import { useModalContext } from 'contexts/NotificationModal';
import { useWebContext } from 'contexts/Web3';
import { ActionButton, ErrorModal } from 'components';
import StrategySelectorForm from 'components/Community/StrategySelectorForm';
import { kebabToString } from 'utils';
import isEqual from 'lodash/isEqual';

export default function CommunityProposalsAndVoting({
  communityVotingStrategies = [],
  updateCommunity,
  updatingCommunity,
  activeStrategies,
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
          if (name !== 'custom-script') {
            await isValidFlowAddress(contract.addr);
          }
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
        createElement(ErrorModal, {
          message: (
            <div className="mt-4">
              <p className="is-size-6">
                Addresses used are not valid Flow addresses:
              </p>
              <div className="is-flex is-align-items-center is-justify-content-center">
                <ul>
                  {errorMessages.map((type, index) => (
                    <li key={`error-${index}`}>
                      <p className="smaller-text mt-2 has-text-danger">
                        - {kebabToString(type)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ),
          title: 'Flow Address Error',
        }),
        { isErrorModal: true }
      );
      return;
    }

    // onError hook from react-query will handle error
    await updateCommunity({
      strategies: updatePayload,
    }).catch(() => {
      return;
    });
  };

  return (
    <StrategySelectorForm
      existingStrategies={communityVotingStrategies}
      activeStrategies={activeStrategies}
      disableAddButton={updatingCommunity}
      enableDelUniqueItem
      callToAction={(st) => {
        return (
          <ActionButton
            label="Save"
            enabled={
              updatingCommunity
                ? false
                : // or check if list has changed to enable saving
                  // save will be enabled when lists with objecrs are different
                  !isEqual(st, communityVotingStrategies) && st.length > 0
            }
            onClick={() => saveDataToBackend(st)}
            loading={updatingCommunity}
            classNames="mt-5"
          />
        );
      }}
    />
  );
}
