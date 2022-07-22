import React from 'react';
import { Web3Consumer } from '../contexts/Web3';

const SignInOutButton = ({
  user: { loggedIn, addr },
  openWalletModal,
  injectedProvider,
}) => {
  const signInOrOut = async (event) => {
    event.preventDefault();
    if (loggedIn) {
      injectedProvider.unauthenticate();
    } else {
      openWalletModal();
    }
  };
  return (
    <button
      onClick={signInOrOut}
      className="wallet-connect button is-primary is-uppercase transition-all small-text"
    >
      {loggedIn ? (
        <>
          <span className="is-hidden-mobile is-hidden-connect">
            {addr} -&nbsp;
          </span>
          <span>Disconnect</span>
        </>
      ) : (
        <>
          <span>Connect</span>
          <span className="is-hidden-mobile">&nbsp;Wallet</span>
        </>
      )}
    </button>
  );
};

const CurrentUser = ({ web3 }) => {
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
      />
    </div>
  );
};

export default Web3Consumer(CurrentUser);
