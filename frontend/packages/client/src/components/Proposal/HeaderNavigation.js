import { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Link } from 'react-router-dom';
import { Svg } from '@cast/shared-components';
import { JoinCommunityButton } from 'components';
import { useMediaQuery } from 'hooks';
import classnames from 'classnames';

const HeaderNavigation = ({ communityId, proposalId } = {}) => {
  const notMobile = useMediaQuery();

  const [dropdownStatus, setDropdownStatus] = useState('');
  const styleButtons = notMobile
    ? { maxHeight: '40px' }
    : { maxHeight: '32px' };

  console.log('dropdownStatus', dropdownStatus);

  const stylesBackButton = classnames(
    'button is-fullwidth rounded-lg is-flex has-text-weight-bold has-background-white ',
    { 'small-text px-4': !notMobile },
    { 'px-5': notMobile }
  );
  const stylesShareButton = classnames(
    'button rounded-lg is-flex has-text-weight-bold has-background-white px-4 ml-4',
    { 'small-text': !notMobile }
  );

  // use for click out on dropdown
  const closeOnBlur = () => {
    setDropdownStatus('');
  };

  const closeDropDown = () => {
    setDropdownStatus('');
  };
  return (
    <div
      className="is-flex mb-6 mb-3-mobile"
      style={{ justifyContent: 'space-between' }}
    >
      <Link to={`/community/${communityId}?tab=proposals`}>
        <div className={stylesBackButton} style={styleButtons}>
          <Svg name="ArrowLeft" />
          <span className="ml-3">Back</span>
        </div>
      </Link>
      <div className="is-flex">
        <JoinCommunityButton
          communityId={communityId}
          size={notMobile ? 'small' : 'smaller'}
        />

        <div
          className={`dropdown ${dropdownStatus} is-right`}
          onBlur={closeOnBlur}
          aria-haspopup="true"
          aria-controls="dropdown-menu"
        >
          <div className="dropdown-trigger">
            <div
              className={stylesShareButton}
              style={styleButtons}
              onClick={() => setDropdownStatus('is-active')}
            >
              <Svg name="Share" /> <span className="ml-3">Share</span>
            </div>
          </div>
          <div className="dropdown-menu" id="dropdown-menu" role="menu">
            <div className="dropdown-content rounded">
              <CopyToClipboard
                text={`/community/${communityId}/proposal/${proposalId}`}
                onCopy={closeDropDown}
              >
                <div className="columns p-0 m-0 is-mobile button is-white">
                  <div className="column is-flex is-align-items-center is-justify-content-flex-end is-3">
                    <Svg name="Copy" />
                  </div>
                  <div className="column is-flex is-align-items-center">
                    <span className="has-text-weight-bold">Copy Link</span>
                  </div>
                </div>
              </CopyToClipboard>
              <div className="border-light" />
              <a className="dropdown-item">Twitter</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderNavigation;
