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
      <div className="modal-card" style={{ maxWidth: '375px' }}>
        <header
          className="modal-card-head has-background-white columns is-mobile m-0 px-5 pt-4"
          style={{ borderBottom: 'none' }}
        >
          <div className="column p-0 is-flex flex-1">
            <h2 className="is-size-4">Connect a wallet</h2>
          </div>
          <div
            className={`column is-narrow px-0 has-text-right is-size-2 leading-tight cursor-pointer`}
            onClick={closeModal}
          >
            &times;
          </div>
        </header>
        <section
          className="modal-card-body py-0 px-5"
          style={{ minHeight: '280px' }}
        >
          {listOfServices.map((service) => {
            return (
              <div
                className="border-light rounded-sm is-flex is-flex-direction-column is-justify-content-center mb-4 py-4 px-3 cursor-pointer strategy-selector transition-all"
                style={{ height: '50px' }}
                onClick={service.connectToService}
              >
                <div className="columns">
                  <div className="column is-narrow is-flex is-align-items-center">
                    <img
                      src={service.icon}
                      alt={service.name}
                      style={{ width: '25px', height: '25px' }}
                    />
                  </div>
                  <div className="column is-flex is-align-items-center">
                    <p className="is-size-5">{service.name}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
        <footer
          className="modal-card-foot has-background-grey-lighter pb-6"
          style={{ height: '107px' }}
        >
          <div className="is-flex">
            <div className="columns">
              <div className="column is-flex is-align-items-center">
                <p className="is-size-5">Need a wallet? Learn more</p>
              </div>
            </div>
          </div>
          <div className="is-flex"></div>
        </footer>
      </div>
    </div>
  );
}
