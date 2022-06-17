import React from "react";
import { WrapperResponsive, Loader, AddButton, ActionButton } from "components";
import { Bin } from "components/Svg";
import { useModalContext } from "contexts/NotificationModal";
import { useVotingStrategies } from "hooks";

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

const StrategyModalSelector = ({
  onDismiss = () => {},
  enableDismiss = true,
} = {}) => {
  return (
    <div
      className="modal-card has-background-white m-0 p-5"
      style={{ height: "570px" }}
    >
      <header
        className="modal-card-head has-background-white columns is-mobile p-4 m-0"
        style={{ borderBottom: "none" }}
      >
        <div className="column px-0 is-flex flex-1 ">
          <h2 className="is-size-4">Edit Strategy Details</h2>
        </div>
        <div
          className={`column is-narrow px-0 has-text-right is-size-2 leading-tight cursor-pointer ${
            enableDismiss && "has-text-grey"
          }`}
          onClick={onDismiss}
        >
          &times;
        </div>
      </header>
      <section className="modal-card-body" style={{ minHeight: "280px" }}>
        <div
          className="is-flex is-flex-direction-column flex-1"
          style={{ height: "100%" }}
        ></div>
      </section>
      <footer
        className="modal-card-foot has-background-white pb-0 pt-1 px-4"
        style={{ borderTop: "none" }}
      >
        <div className="columns is-flex p-0 m-0 flex-1 is-justify-content-end"></div>
      </footer>
    </div>
  );
};

export default function CommunityProposalsAndVoting({
  loading,
  communityVotingStrategies = [],
} = {}) {
  const { data: allVotingStrategies, loading: loadingAllStrategies } =
    useVotingStrategies();

  console.log(communityVotingStrategies);

  const { openModal, closeModal } = useModalContext();
  
  const onAddStrategy = () => {
    openModal(<StrategyModalSelector onDismiss={() => closeModal()} />, {
      classNameModalContent: "rounded-sm",
    });
  };
  
  const onDeleteStrategy = () => {};
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
            key={index}
            commuVotStra={commuVotStra}
            onDeleteStrategy={onDeleteStrategy}
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
