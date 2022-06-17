import React, { useState } from "react";
import { WrapperResponsive, Loader, AddButton, ActionButton } from "components";
import { Bin } from "components/Svg";
import { useModalContext } from "contexts/NotificationModal";
import { useVotingStrategies } from "hooks";
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
  loading,
  communityVotingStrategies = [],
} = {}) {
  const { data: allVotingStrategies, loading: loadingAllStrategies } =
    useVotingStrategies();

  const [newStrategies, setNewStrategies] = useState([]);

  const { openModal, closeModal } = useModalContext();

  const strategiesToAdd = (allVotingStrategies || []).filter(
    (st) => !communityVotingStrategies.includes(st.key)
  );

  const addNewStrategy = (data) => {
    setNewStrategies((state) => [...state, data]);
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
  const onDeleteStrategy = () => {};

  // removes new strategies not saved yet
  const onDeleteNewStrategy = (index) => {
    setNewStrategies((state) => state.filter((st, idx) => idx !== index));
  };

  // sends updates to backend
  const saveData = () => {};

  const savingData = false;

  return (
    <WrapperResponsive
      classNames="border-light rounded-lg columns is-flex-direction-column is-mobile m-0"
      extraClasses="p-6 mb-6"
      extraClassesMobile="p-4 mb-4"
    >
      <div className="columns flex-1">
        <div className="column">
          <div className="is-flex flex-1">
            <WrapperResponsive
              tag="h5"
              classNames="title is-6 mb-2 is-flex"
              extraClassesMobile="mt-4"
            >
              Voting Strategies
            </WrapperResponsive>
          </div>
          <div className="is-flex flex-1 mt-5">
            <p className="has-text-grey small-text">
              Voting strategies are used to calculate each user’s voting power
              on proposals.
            </p>
          </div>
        </div>
      </div>
      {loading && <Loader className="py-5" />}
      {!loading &&
        communityVotingStrategies.map((commuVotStra, index) => (
          <StrategyInput
            key={`existing-${index}`}
            commuVotStra={commuVotStra}
            onDeleteStrategy={onDeleteStrategy}
          />
        ))}
      {newStrategies.map((st, index) => (
        <StrategyInput
          index={index}
          key={`new-${index}`}
          commuVotStra={st.strategy}
          onDeleteStrategy={onDeleteNewStrategy}
        />
      ))}
      <AddButton
        disabled={loading}
        addText={"Strategy"}
        onAdd={onAddStrategy}
        className="mt-2"
      />
      <ActionButton
        label="save"
        enabled={true}
        onClick={saveData}
        loading={savingData}
        classNames="mt-5"
      />
    </WrapperResponsive>
  );
}
