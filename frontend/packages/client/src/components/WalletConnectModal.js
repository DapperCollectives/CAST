import React, { useMemo }, { useMemo } from 'react';
import { IS_LOCAL_DEV } from 'const';
import * as fcl from '@onflow/fcl';
import * as fcl from '@onflow/fcl';
import classnames from 'classnames';
import sortBy from 'lodash/sortBy';
import { ArrowRight, Close } from './Svg';

const getWalletIcon = (provider) => {
  if (provider?.name === 'Lilico') {
    return provider.icon;
  }
  return `https://fcl-discovery.onflow.org${provider.icon}`;
};

export default function WalletConnectModal({
  services = [],
  openModal,
  closeModal,
  injectedProvider,
} = {}) {
  const modalClasses = classnames('modal', {
    'is-active': openModal,
  });

  const handleClickOnBackground = () => {
    closeModal();
  };

  // sorting alphabetically services
  const listOfServices = useMemo(
    () =>
      sortBy(
        services.map((service) => ({
          connectToService: () => {
            if (service.uid === 'dapper-wallet#authn') {
              // dapper wallet uses POP/RPC
              fcl.config().put('discovery.wallet.method', 'POP/RPC');
            } else {
              // other wallets are fine with IFRAME/RPC
              fcl.config().put('discovery.wallet.method', 'IFRAME/RPC');
            }
            injectedProvider.authenticate(
              !IS_LOCAL_DEV ? { service } : undefined
            );
            closeModal();
          },
          icon: getWalletIcon(service.provider),
          name: service.provider.name,
        })),
        (service) => service.name
      ),
    [services, closeModal, injectedProvider]
  );

  return (
    <div className={modalClasses}>
      <div className="modal-background" onClick={handleClickOnBackground}></div>
      <div
        className="modal-card rounded-sm has-background-white"
        style={{ maxWidth: '375px', maxHeight: '420px' }}
      >
        <header
          className="modal-card-head has-background-white columns is-mobile m-0 px-5 pt-5"
          style={{ borderBottom: 'none' }}
        >
          <div className="column p-0 is-flex flex-1">
            <h2 className="is-size-4 has-text-weight-bold">Connect a wallet</h2>
          </div>
          <div
            className={`column is-narrow p-0 has-text-right is-size-2 leading-tight cursor-pointer`}
            onClick={closeModal}
          >
            <Close />
          </div>
        </header>
        <section
          className="modal-card-body pt-1 pb-3 px-5"
          style={{ minHeight: '150px' }}
        >
          {listOfServices.map((service, index) => {
            return (
              <div
                className="border-light rounded-sm is-flex is-flex-direction-column is-justify-content-center mb-2 py-4 px-3 cursor-pointer strategy-selector transition-all"
                style={{ height: '60px' }}
                onClick={service.connectToService}
                key={`service-${index}`}
              >
                <div className="columns is-mobile">
                  <div className="column is-narrow is-flex is-align-items-center">
                    <img
                      src={service.icon}
                      alt={service.name}
                      style={{ width: '30px', height: '30px' }}
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
          className="modal-card-foot is-justify-content-center px-0-mobile wallet-connect-footer"
          style={{ height: '107px', borderTop: '0px' }}
        >
          <div className="columns is-multiline">
            <div className="column is-12 is-flex is-align-items-center">
              <p className="is-size-6 pr-1">
                Need a wallet?
                <a
                  target="_blank"
                  rel="noreferrer noopener"
                  href="https://dapper-collectives.gitbook.io/cast-docs/"
                  className="px-1 has-text-black is-underlined"
                  onClick={closeModal}
                >
                  Learn more
                </a>
              </p>
              <ArrowRight />
            </div>
            <div className="column is-12">
              <p
                className="has-text-grey smaller-text is-flex"
                style={{ whiteSpace: 'nowrap' }}
              >
                You agree to the the
                <a
                  href="#/terms-of-service"
                  className="px-1 is-underlined has-text-grey"
                  onClick={closeModal}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Terms of Service
                </a>
                and
                <a
                  href="#/privacy-policy"
                  className="px-1 is-underlined has-text-grey"
                  onClick={closeModal}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
