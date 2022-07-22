import React from 'react';
import classnames from 'classnames';

export default function WalletConnectModal({
  services = [],
  openModal,
  closeModal,
  injectedProvider,
} = {}) {
  const modalClasses = classnames('modal', {
    'is-active': openModal,
  });

  const listOfServices = services.map((service) => ({
    connectToService: () => {
      injectedProvider.authenticate(service);
      closeModal();
    },
    icon: `https://fcl-discovery.onflow.org${service.provider.icon}`,
    name: service.provider.name,
  }));

  return (
    <div className={modalClasses}>
      <div className="modal-background"></div>
      <div className="modal-card" style={{ maxWidth: '300px' }}>
        <header
          className="modal-card-head has-background-white columns is-mobile m-0 px-4 pt-4"
          style={{ borderBottom: 'none' }}
        >
          <div className="column p-0 is-flex flex-1">
            <h2 className="is-size-4">Connect a Wallet</h2>
          </div>
          <div
            className={`column is-narrow px-0 has-text-right is-size-2 leading-tight cursor-pointer`}
            onClick={closeModal}
          >
            &times;
          </div>
        </header>
        <section
          className="modal-card-body py-0 px-4"
          style={{ minHeight: '280px' }}
        >
          {listOfServices.map((service) => {
            return (
              <div
                className="border-light rounded-sm is-flex is-flex-direction-column is-justify-content-center mb-4 py-4 px-3 cursor-pointer strategy-selector transition-all"
                style={{ minHeight: '48px' }}
                onClick={service.connectToService}
              >
                <div className="columns">
                  <div className="column">
                    <img src={service.icon} alt={service.name} />
                  </div>
                  <div className="column">{service.name}</div>
                </div>
              </div>
            );
          })}
        </section>
        <footer className="modal-card-foot has-background-white pb-6"></footer>
      </div>
    </div>
  );
}
