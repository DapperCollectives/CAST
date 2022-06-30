import React, { useEffect, useState } from 'react';
import isEqual from 'lodash/isEqual';
import { AddButton } from 'components';
import { useModalContext } from 'contexts/NotificationModal';
import StrategyEditorModal from './StrategyEditorModal';
import StrategySelectorInput from 'components/Community/StrategySelectorInput';
import { useVotingStrategies } from 'hooks';
import { kebabToString } from 'utils';

export default function StrategySelectorForm({
  existingStrategies = [],
  disableAddButton = false,
  // this fc returns a component(Button) to render
  callToAction = () => {},
  // callback to return strategies selected
  onStrategySelection,
} = {}) {
  // holds array of objects with strategy information
  const [strategies, setStrategies] = useState([]);

  // update state if new strategies are passed
  useState(() => {
    setStrategies(existingStrategies);
  }, [existingStrategies]);

  // only notify parent component if callback was passed
  useEffect(() => {
    if (onStrategySelection && !isEqual(strategies, existingStrategies)) {
      onStrategySelection(strategies);
    }
  }, [strategies, onStrategySelection, existingStrategies]);

  const { data: allVotingStrategies, loading: loadingAllStrategies } =
    useVotingStrategies();

  const { openModal, closeModal } = useModalContext();

  // filter strategies already added
  const strategiesList = (allVotingStrategies || []).filter(
    (st) => !strategies.find((currentSt) => currentSt.name === st.key)
  );

  const addNewStrategy = (newStrategyInfo) => {
    setStrategies((state) => [...state, newStrategyInfo]);
    closeModal();
  };

  const onAddStrategy = () => {
    openModal(
      <StrategyEditorModal
        onDismiss={() => closeModal()}
        strategies={strategiesList}
        onDone={addNewStrategy}
      />,
      {
        classNameModalContent: 'rounded-sm',
        showCloseButton: false,
      }
    );
  };

  const onDeleteStrategy = (index) => {
    setStrategies((state) => state.filter((_, idx) => idx !== index));
  };

  // hide delete when there's only one strategy
  const enableDelete = strategies.length > 1;

  const callToActionComponent = callToAction(strategies);

  return (
    <div className="border-light rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 mb-6 p-4-mobile mb-4-mobile">
      <div className="columns flex-1">
        <div className="column">
          <div className="is-flex flex-1">
            <h5 className="title is-6 mb-2 is-flex mt-4-mobile">
              Voting Strategies
            </h5>
          </div>
          <div className="is-flex flex-1 mt-5">
            <p className="has-text-grey small-text">
              Voting strategies are used to calculate each user’s voting power
              on proposals.
            </p>
          </div>
        </div>
      </div>
      {/* filter elements that will be deleted */}
      {strategies.map((st, index) => (
        <StrategySelectorInput
          index={index}
          key={`strategy-${index}`}
          commuVotStra={kebabToString(st.name)}
          onDeleteStrategy={onDeleteStrategy}
          enableDelete={enableDelete}
        />
      ))}
      <AddButton
        disabled={disableAddButton || loadingAllStrategies}
        addText={'Strategy'}
        onAdd={onAddStrategy}
        className="mt-2"
      />
      {callToActionComponent}
    </div>
  );
}
