import React from "react";

const StrategyModal = ({ isOpen, closeModal, strategies }) => {
  return (
    <div className={`modal ${isOpen ? "is-active" : undefined}`}>
      <div className="modal-background" onClick={closeModal} />
      <div className="modal-card rounded-sm px-4">
        <header
          className="modal-card-head is-flex-direction-column has-background-white columns is-mobile m-0 py-2"
          style={{
            borderBottom: "none",
          }}
        >
          <div
            className="column is-full has-text-right is-size-2 p-0 leading-tight cursor-pointer"
            onClick={closeModal}
          >
            &times;
          </div>
          <div className="column px-4 is-full has-text-left">
            <p className="modal-card-title">Strategies</p>
          </div>
        </header>
        <section className="modal-card-body py-4">
          {strategies.map((strategy, index) => {
            return (
              <div className="columns m-0 is-mobile" key={`strategy-${index}`}>
                <div className="column px-4  is-full">
                  <p className="mb-4">{strategy.name}</p>
                  <p className="has-text-grey mb-4 small-text">
                    {strategy.description}
                  </p>
                </div>
              </div>
            );
          })}
        </section>
        <footer
          className="modal-card-foot has-background-white"
          style={{ borderTop: "none" }}
        ></footer>
      </div>
    </div>
  );
};

export default StrategyModal;
