import React from 'react';

const StrategyModal = ({ isOpen, closeModal, strategies }) => {
  return (
    <div className={`modal ${isOpen ? 'is-active' : undefined}`}>
      <div className="modal-background" onClick={closeModal} />
      <div className="modal-card rounded-sm px-4">
        <header
          className="modal-card-head is-flex-direction-column is-align-items-stretch has-background-white columns is-mobile m-0 pb-2 pt-3"
          style={{
            borderBottom: 'none',
          }}
        >
          <div className="columns is-mobile m-0 flex-1">
            <div className="column is-flex is-align-items-center px-4 has-text-left">
              <p className="modal-card-title">Strategies</p>
            </div>
            <div className="column is-narrow">
              <div
                className="is-size-2 p-0 leading-tight cursor-pointer"
                onClick={closeModal}
              >
                &times;
              </div>
            </div>
          </div>
        </header>
        <section className="modal-card-body pb-4 pt-2">
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
          style={{ borderTop: 'none' }}
        ></footer>
      </div>
    </div>
  );
};

export default StrategyModal;
