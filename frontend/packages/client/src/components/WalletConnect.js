import { useEffect, useRef, useState } from 'react';
import Blockies from 'react-blockies';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Link } from 'react-router-dom';
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
  expandToContainer,
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
  const addressStyle = classnames('', { 'small-text': !notMobile });

  return !loggedIn ? (
    <>
      <button
        onClick={connectWallet}
        className={buttonClass}
        style={
          expandToContainer
            ? { width: '100%', height: '48px' }
            : notMobile
            ? {
                width: '159px',
                height: '40px',
              }
            : { width: '121px', height: '32px' }
        }
      >
        <span className="has-text-weight-bold">Connect</span>
        <span className="is-hidden-mobile has-text-weight-bold">
          &nbsp;Wallet
        </span>
      </button>
    </>
  ) : (
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
            onClick={openDropdown}
            className={buttonClass}
            style={
              notMobile
                ? {
                    width: '147px',
                    height: '40px',
                  }
                : { width: '121px', height: '32px' }
            }
          >
            <div className="is-flex is-align-items-center flex-1">
              <Blockies
                seed={addr}
                size={notMobile ? 6.5 : 5}
                scale={4}
                className="blockies"
              />
              <div className="is-flex flex-1 is-justify-content-flex-end pr-1-mobile">
                <p className={addressStyle}>{truncateAddress(addr, 4, 4)}</p>
              </div>
            </div>
          </button>
        </div>

        <div
          className="dropdown-menu wallet-connect-content"
          id="dropdown-menu"
          role="menu"
          ref={dropdownRef}
          style={!notMobile ? { left: '-155px' } : { left: '-130px' }}
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
            <Link
              to="/settings"
              className="has-text-black cursor-pointer is-flex is-flex-direction-row is-align-items-center is-fullwidth px-4 py-2 has-text-weight-bold"
              onClick={closeDropdown}
            >
              <Svg name="Cog" />
              <span className="ml-2">Settings</span>
            </Link>
            <hr className="dropdown-divider" />
            <div className="px-4 pb-4 pt-2">
              <div
                className="button is-fullwidth rounded-lg is-flex small-text has-text-white has-background-black cursor-pointer"
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

const CurrentUser = ({ web3, closeModal, expandToContainer = false } = {}) => {
  const { user, injectedProvider, openWalletModal } = web3;
  if (!user) {
    return null;
  }

  return (
    <SignInOutButton
      user={user}
      injectedProvider={injectedProvider}
      openWalletModal={openWalletModal}
      closeModal={closeModal}
      expandToContainer={expandToContainer}
    />
  );
};

export default Web3Consumer(CurrentUser);
