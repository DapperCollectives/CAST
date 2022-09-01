import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Web3Consumer } from '../contexts/Web3';
import { Copy } from 'components/Svg';

const SignInOutButton = ({
  user: { loggedIn, addr },
  openWalletModal,
  injectedProvider,
  closeModal,
}) => {
  const [dropDownClass, setDropDownClass] = useState('');

  const signOut = (event) => {
    event.preventDefault();
    event.stopPropagation();
    injectedProvider.unauthenticate();
    // setDropDownClass('');
  };

  const connectWallet = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (closeModal) {
      closeModal();
    }
    openWalletModal();
  };

  const openDropdown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDropDownClass('is-active');
  };

  const closeOnBlur = (e) => {
    console.log(e);
    if (e.type === 'blur') {
      setDropDownClass('');
    }
  };

  return (
    <div onBlur={closeOnBlur}>
      <div
        className={`dropdown ${dropDownClass}`}
        aria-haspopup="true"
        aria-controls="dropdown-menu"
      >
        <div className="dropdown-trigger">
          <button
            onClick={loggedIn ? openDropdown : connectWallet}
            className="wallet-connect button is-primary is-uppercase transition-all small-text"
          >
            {loggedIn ? (
              <div>
                <span className="is-hidden-mobile is-hidden-connect">
                  {addr} -&nbsp;
                </span>
                <span>Disconnect</span>
              </div>
            ) : (
              <>
                <span>Connect</span>
                <span className="is-hidden-mobile">&nbsp;Wallet</span>
              </>
            )}
          </button>
        </div>
        <div className="dropdown-menu" id="dropdown-menu" role="menu">
          <div className="dropdown-content">
            <div className="is-flex">
              <div className="columns">
                <div className="column">{addr}</div>
                <div className="column">
                  <CopyToClipboard
                    text={addr}
                    onCopy={(e) => {
                      console.log('eee', e);
                    }}
                  >
                    <div className="button is-white rounded-sm">
                      <Copy />
                    </div>
                  </CopyToClipboard>
                </div>
              </div>
            </div>
            <hr className="dropdown-divider" />

            <div
              className="button is-fullwidth rounded-sm is-uppercase is-flex small-text has-text-white has-background-black"
              style={{ minHeight: '32px' }}
              onClick={signOut}
            >
              disconnect
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CurrentUser = ({ web3, closeModal }) => {
  const { user, injectedProvider, openWalletModal } = web3;
  if (!user) {
    return null;
  }

  return (
    <div className="card">
      <SignInOutButton
        user={user}
        injectedProvider={injectedProvider}
        openWalletModal={openWalletModal}
        closeModal={closeModal}
      />
    </div>
  );
};

export default Web3Consumer(CurrentUser);
