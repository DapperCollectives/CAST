import { useEffect, useRef, useState } from 'react';
import Blockies from 'react-blockies';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Web3Consumer } from 'contexts/Web3';
import { Svg } from '@cast/shared-components';
import { useMediaQuery, useOnClickOutside } from 'hooks';
import { truncateAddress } from 'utils';
import classnames from 'classnames';
import Tooltip from './Tooltip';

const SignInOutButton = ({
  user: { loggedIn, addr },
  openWalletModal,
  injectedProvider,
  closeModal,
}) => {
  const notMobile = useMediaQuery();

  const [dropDownClass, setDropDownClass] = useState('');
  const [addressCopied, setAddressCopied] = useState(false);

  const dropdownRef = useRef();

  const closeDropdown = (e) => {
    setDropDownClass('');
  };

  useOnClickOutside(dropdownRef, closeDropdown);

  const signOut = (event) => {
    event.preventDefault();
    event.stopPropagation();
    injectedProvider.unauthenticate();
    setDropDownClass('');
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

  const markAddressCopied = () => setAddressCopied(true);

  useEffect(() => {
    let timeout;
    if (addressCopied) {
      timeout = setTimeout(() => {
        setAddressCopied(false);
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [addressCopied]);

  const dropdownBackground = classnames('', {
    'wallet-connect-background': dropDownClass && !notMobile,
  });

  const buttonClass = classnames(
    'wallet-connect button transition-all small-text rounded-lg',
    { 'is-primary': !loggedIn },
    { 'px-2': !notMobile }
  );
  const addressStyle = classnames('', { 'smaller-text': !notMobile });

  return (
    <>
      <div className={dropdownBackground} />
      <div
        className={`dropdown ${dropDownClass}`}
        aria-haspopup="true"
        aria-controls="dropdown-menu"
        style={{ position: 'relative' }}
      >
        <div className="dropdown-trigger is-flex is-justify-content-flex-end">
          <button
            onClick={loggedIn ? openDropdown : connectWallet}
            className={buttonClass}
            style={
              notMobile
                ? {
                    ...(loggedIn ? { width: '147px' } : { width: '206px' }),
                    height: '40px',
                  }
                : { width: '105px', height: '32px' }
            }
          >
            {loggedIn ? (
              <div className="is-flex is-align-items-center flex-1 is-justify-content-space-around">
                <Blockies
                  seed={addr}
                  size={notMobile ? 6.5 : 5}
                  scale={4}
                  className="blockies"
                />
                <div className="is-flex">
                  <p className={addressStyle}>{truncateAddress(addr, 4, 4)}</p>
                </div>
              </div>
            ) : (
              <>
                <span>Connect</span>
                <span className="is-hidden-mobile">&nbsp;Wallet</span>
              </>
            )}
          </button>
        </div>

        <div
          className="dropdown-menu wallet-connect-content"
          id="dropdown-menu"
          role="menu"
          ref={dropdownRef}
          style={!notMobile ? { left: '-170px' } : { left: '-130px' }}
        >
          <div
            className="dropdown-content p-0 rounded"
            style={{ width: '277px' }}
          >
            <div className="px-4 pt-4 pb-2">
              <Tooltip
                classNames="is-flex is-flex-grow-1 is-align-items-center transition-all"
                position="top"
                text="Copied!"
                alwaysVisible={true}
                enabled={addressCopied}
              >
                <CopyToClipboard text={addr} onCopy={markAddressCopied}>
                  <div
                    className="columns flex-1 is-mobile m-0 px-4 py-0 rounded-lg button is-white border-light"
                    style={{
                      borderColor: 'hsl(0deg, 0%, 86%)',
                      height: '32px',
                    }}
                  >
                    <div className="column p-0 is-flex is-align-items-center">
                      <span className="small-text">{addr}</span>
                    </div>
                    <div className="column p-0 is-flex is-align-items-center is-narrow">
                      <div
                        className="is-flex is-align-items-center py-0 px-1"
                        style={{ height: '23px' }}
                      >
                        <Svg name="Copy" />
                      </div>
                    </div>
                  </div>
                </CopyToClipboard>
              </Tooltip>
            </div>

            <hr className="dropdown-divider" />
            <div className="px-4 pb-4 pt-2">
              <div
                className="button is-fullwidth rounded-lg is-flex small-text has-text-white has-background-black"
                style={{ height: '32px' }}
                onClick={signOut}
              >
                Disconnect
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const CurrentUser = ({ web3, closeModal, expandContainer }) => {
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
        expandContainer={expandContainer}
      />
    </div>
  );
};

export default Web3Consumer(CurrentUser);
