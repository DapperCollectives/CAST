import { useRef, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Svg } from '@cast/shared-components';
import { useOnClickOutside } from 'hooks';
import { FRONTEND_URL } from 'const';
import classnames from 'classnames';

export default function ShareDropdown({
  communityId,
  proposalId,
  isMobile,
} = {}) {
  const [dropdownStatus, setDropdownStatus] = useState('');
  const dropdownRef = useRef();
  // use for click out on dropdown
  const closeDropDown = () => {
    setDropdownStatus('');
  };
  useOnClickOutside(dropdownRef, closeDropDown);

  const styleButtons = isMobile ? { maxHeight: '32px' } : { maxHeight: '40px' };

  const stylesShareButton = classnames(
    'button rounded-lg is-flex has-text-weight-bold has-background-white px-4 ml-4',
    { 'small-text': isMobile }
  );
  return (
    <div className={`dropdown ${dropdownStatus} is-right`}>
      <div className="dropdown-trigger">
        <div
          className={stylesShareButton}
          style={styleButtons}
          onClick={() => setDropdownStatus('is-active')}
        >
          <Svg name="Share" /> <span className="ml-3">Share</span>
        </div>
      </div>
      <div
        className="dropdown-menu"
        id="dropdown-menu"
        role="menu"
        ref={dropdownRef}
      >
        <div className="dropdown-content rounded">
          <CopyToClipboard
            text={`${FRONTEND_URL}/community/${communityId}/proposal/${proposalId}`}
            onCopy={closeDropDown}
          >
            <div
              className="columns p-0 m-0 is-mobile button is-white "
              style={{ minHeight: '48px' }}
            >
              <div className="column is-flex is-align-items-center is-justify-content-flex-end is-3 pr-1">
                <Svg name="Copy" />
              </div>
              <div className="column is-flex is-align-items-center">
                <span className="has-text-weight-bold">Copy Link</span>
              </div>
            </div>
          </CopyToClipboard>
          <div className="border-light" />
          <div
            className="columns p-0 m-0 is-mobile button is-white "
            style={{ minHeight: '48px' }}
          >
            <div className="column is-flex is-align-items-center is-justify-content-flex-end is-3 pr-1">
              <Svg name="Twitter" />
            </div>
            <div className="column is-flex is-align-items-center">
              <a
                className="twitter-share-button has-text-weight-bold has-text-black"
                href={`https://twitter.com/intent/tweet?text=${`${FRONTEND_URL}/community/${communityId}/proposal/${proposalId}`}`}
              >
                Tweet
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
