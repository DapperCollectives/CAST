import React, { useState } from "react";
import { useVotingStrategies } from "hooks";
import { AddButton, ActionButton } from "components";
import { Bin } from "components/Svg";
import { useModalContext } from "contexts/NotificationModal";
import StrategyEditorModal from "./StrategyEditorModal";

const StrategyInput = ({ index, commuVotStra, onDeleteStrategy } = {}) => {
  return (
    <div
      key={`index-${index}`}
      className="column is-12 is-mobile p-0 m-0 mb-4 fade-in"
      style={{ position: "relative" }}
    >
      <input
        type="text"
        className="border-light rounded-sm p-3 column is-full"
        defaultValue={commuVotStra}
        style={{
          width: "100%",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignContent: "center",
          position: "absolute",
          right: 15,
          top: 9,
        }}
      >
        <div
          className="cursor-pointer is-flex is-align-items-center"
          onClick={() => onDeleteStrategy(index)}
        >
          <Bin />
        </div>
      </div>
    </div>
  );
};

export default function CommunityProposalsAndVoting({
  communityVotingStrategies = [],
  communityId,
  updateCommunity,
  updatingCommunity,
} = {}) {
  const { data: allVotingStrategies, loading: loadingAllStrategies } =
    useVotingStrategies();

  const [currentStrategies, setCurrentStrategies] = useState(
    communityVotingStrategies.map((st) => ({ strategy: st, fromServer: true }))
  );

  // holds array of objects with strategy information to be added
  const [newStrategies, setNewStrategies] = useState([]);

  const { openModal, closeModal } = useModalContext();

  // filter strategis: remove existing on community
  // and the ones to be added sent to add in the backend
  const strategiesToAdd = (allVotingStrategies || []).filter(
    (st) =>
      ![...currentStrategies, ...newStrategies].find(
        (currentSt) =>
          currentSt.strategy === st.key && currentSt?.toBeremoved !== true
      )
  );

  const addNewStrategy = (newStrategyInfo) => {
    setNewStrategies((state) => [...state, newStrategyInfo]);
    closeModal();
  };

  const onAddStrategy = () => {
    openModal(
      <StrategyEditorModal
        onDismiss={() => closeModal()}
        strategies={strategiesToAdd}
        onDone={addNewStrategy}
      />,
      {
        classNameModalContent: "rounded-sm",
        showCloseButton: false,
      }
    );
  };

  // removes existing strategies on the community
  const onDeleteStrategy = (index) => {
    console.log("called to remove", index);
    setCurrentStrategies((state) =>
      state.map((datum, idx) => {
        if (idx === index) {
          return { ...datum, removed: true };
        }
        return datum;
      })
    );
  };

  // removes new strategies not saved yet
  const onDeleteNewStrategy = (index) => {
    setNewStrategies((state) => state.filter((st, idx) => idx !== index));
  };

  // sends updates to backend
  const saveData = () => {
    // we need to remove strategies first:
    // in case user removes and old one and
    // creates the same strategy with different contract information
    // use same signature for both requests
    console.log(
      "--- strategies to delete ---",
      currentStrategies.filter((st) => st?.toBeremoved)
    );
    // we will add new strategies
    console.log("--- strategies to add ---", newStrategies);

    // await updateCommunity()
  };

  const savingData = false;

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
      {currentStrategies.map((commuVotStra, index) =>
        commuVotStra?.toBeremoved ? null : (
          <StrategyInput
            index={index}
            key={`existing-${index}`}
            commuVotStra={commuVotStra.strategy}
            onDeleteStrategy={onDeleteStrategy}
          />
        )
      )}
      {newStrategies.map((st, index) => (
        <StrategyInput
          index={index}
          key={`new-${index}`}
          commuVotStra={st.strategy}
          onDeleteStrategy={onDeleteNewStrategy}
        />
      ))}
      <AddButton
        disabled={updatingCommunity || loadingAllStrategies}
        addText={"Strategy"}
        onAdd={onAddStrategy}
        className="mt-2"
      />
      <ActionButton
        label="save"
        enabled={!updatingCommunity}
        onClick={saveData}
        loading={savingData}
        classNames="mt-5"
      />
    </div>
  );
}
