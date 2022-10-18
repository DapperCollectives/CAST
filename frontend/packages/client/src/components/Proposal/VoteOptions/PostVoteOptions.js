import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useModalContext } from 'contexts/NotificationModal';
import { Svg } from '@cast/shared-components';
import NotificationsModal from 'components/modals/Notifications';
import { FRONTEND_URL } from 'const';

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

  return (
    <div className="">
      <div className="is-flex is-align-items-center">
        <Svg name="CheckMark" />
        <b className="is-size-4 ml-2">
          You successfully voted on this proposal!
        </b>
      </div>
      <div className="is-flex is-align-items-center mt-5">
        <a
          className="is-flex flex-1 is-align-items-center rounded-lg button twitter-button mr-2"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            proposalUrl
          )}`}
          target="_blank"
          rel="noreferrer noopenner"
        >
          <Svg name="Twitter" />
          <span className="ml-1">Share on Twitter</span>
        </a>
        <CopyToClipboard
          text={window?.location?.href}
          onCopy={() => setLinkCopied(true)}
        >
          <div className="is-flex flex-1 is-align-items-center rounded-lg button mx-2">
            <Svg name="Copy" />
            <span className="ml-1">
              {linkCopied ? 'Link Copied!' : 'Copy Link'}
            </span>
          </div>
        </CopyToClipboard>
        <div
          className="is-flex flex-1 is-align-items-center rounded-lg button ml-2"
          onClick={openNotificationsModal}
        >
          <Svg name="Bell" />
          <span className="ml-1">Subscribe for Updates</span>
        </div>
      </div>
    </div>
  );
};

export default PostVoteOptions;
