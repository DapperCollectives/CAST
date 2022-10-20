import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useModalContext } from 'contexts/NotificationModal';
import { Svg } from '@cast/shared-components';
import NotificationsModal from 'components/modals/Notifications';
import { FRONTEND_URL } from 'const';
import classnames from 'classnames';

const PostVoteOptions = ({ communityId, proposalId }) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const { openModal, closeModal } = useModalContext();
  const openNotificationsModal = () =>
    openModal(
      <NotificationsModal onClose={closeModal} communityId={communityId} />,
      {
        classNameModalContent: 'modal-content-sm',
      }
    );

  const proposalUrl = `${FRONTEND_URL}/#/community/${communityId}/proposal/${proposalId}`;

  const buttonsContainerClasses = classnames(
    'is-flex is-flex-wrap-wrap is-flex-direction-column',
    'is-flex-direction-row-desktop-only is-justify-content-center',
    'mt-5 m-0 columns is-mobile p-0'
  );

  return (
    <div className="">
      <div className="is-flex is-align-items-center">
        <Svg name="CheckMark" />
        <b className="is-size-4 ml-2">
          You successfully voted on this proposal!
        </b>
      </div>
      <div className={buttonsContainerClasses}>
        <div
          className="column is-full-mobile p-0 mr-2-desktop mb-2"
          style={{ flexGrow: 0 }}
        >
          <a
            className="is-flex flex-1 is-align-items-center rounded-lg button twitter-button"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              proposalUrl
            )}`}
            target="_blank"
            rel="noreferrer noopenner"
          >
            <Svg name="Twitter" />
            <span className="ml-1">Share on Twitter</span>
          </a>
        </div>
        <div
          className="column is-full-mobile p-0 mx-2-desktop mb-2"
          style={{ flexGrow: 0 }}
        >
          <CopyToClipboard
            text={window?.location?.href}
            onCopy={() => setLinkCopied(true)}
          >
            <div className="is-flex flex-1 is-align-items-center rounded-lg button">
              <Svg name="Copy" />
              <span className="ml-1">
                {linkCopied ? 'Link Copied!' : 'Copy Link'}
              </span>
            </div>
          </CopyToClipboard>
        </div>
        <div
          className="column is-full-mobile p-0 ml-2-desktop mb-2"
          style={{ flexGrow: 0 }}
        >
          <div
            className="is-flex flex-1 is-align-items-center rounded-lg button"
            onClick={openNotificationsModal}
          >
            <Svg name="Bell" />
            <span className="ml-1">Subscribe for Updates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostVoteOptions;
