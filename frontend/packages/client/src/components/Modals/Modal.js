import { Svg } from '@cast/shared-components';

// Building blocks for different modals used in the app

export default function Modal({ children }) {
  return <div className="c-modal">{children}</div>;
}

Modal.ErrorHeader = ({ title, onClose }) => {
  return (
    <div className="c-modal-header spacing-header">
      <Svg name="ErrorOutline" />
      <p className="c-modal-title">{title}</p>
      <div className="is-flex cursor-pointer" onClick={onClose}>
        <Svg name="Close" width="18" heigth="18" />
      </div>
    </div>
  );
};

Modal.MessageBody = ({ message }) => {
  return <div className="c-modal-message spacing-message">{message}</div>;
};

Modal.FooterContainer = ({ children }) => {
  return <div className="c-modal-footer spacing-footer">{children}</div>;
};

Modal.FooterCloseButton = ({ onClose }) => {
  return (
    <div
      className="button is-fullwidth rounded-lg is-flex has-text-weight-bold has-text-white has-background-black px-5"
      style={{ minHeight: '40px' }}
      onClick={onClose}
    >
      Close
    </div>
  );
};

Modal.FotterWithFAQ = ({ faqLink, onClose }) => {
  return (
    <>
      <a
        target="_blank"
        rel="noreferrer noopener"
        href={faqLink}
        className="button is-fullwidth rounded-lg is-flex has-text-weight-bold has-background-white px-5 mr-5"
      >
        Read FAQ
      </a>
      <Modal.FooterCloseButton onClose={onClose} />
    </>
  );
};
