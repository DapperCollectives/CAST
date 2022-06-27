import React, { useEffect, useState } from 'react';
import { useVotingStrategies } from 'hooks';
import { AddButton } from 'components';
import { Bin } from 'components/Svg';
import { useModalContext } from 'contexts/NotificationModal';
import StrategyEditorModal from './StrategyEditorModal';
import isEqual from 'lodash/isEqual';
import { kebabToString } from 'utils';

const StrategyInput = ({
  index,
  commuVotStra,
  onDeleteStrategy,
  enableDelete,
  onChange = () => {},
} = {}) => {
  return (
    <div
      key={`index-${index}`}
      className="column is-12 is-mobile p-0 m-0 mb-4 fade-in"
      style={{ position: 'relative' }}
    >
      <input
        type="text"
        className="border-light rounded-sm p-3 column is-full"
        value={commuVotStra}
        onChange={onChange}
        style={{
          width: '100%',
        }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignContent: 'center',
          position: 'absolute',
          right: 15,
          top: 9,
        }}
      >
        {enableDelete && (
          <div
            className="cursor-pointer is-flex is-align-items-center"
            onClick={() => onDeleteStrategy(index)}
          >
            <Bin />
          </div>
        )}
      </div>
    </div>
  );
};

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

  // filter strategies already added from the ones received from backend
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

  // hide delete one there's only one strategy
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
        <StrategyInput
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
