import { Svg } from '@cast/shared-components';
import classnames from 'classnames';

// Building blocks for different modals used in the app

export default function Modal({ children }) {
  return <div className="c-modal">{children}</div>;
}

Modal.Header = ({ title, onClose }) => {
  return (
    <div className="c-modal-header spacing-header">
      <p className="c-modal-title is-capitalized">{title}</p>
      <div className="is-flex cursor-pointer" onClick={onClose}>
        <Svg name="Close" width="18" heigth="18" />
      </div>
    </div>
  );
};
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

Modal.BodyMessage = ({ message }) => {
  return <div className="c-modal-message spacing-message">{message}</div>;
};
Modal.BodyContainer = ({ children }) => {
  return <div className="c-modal-message">{children}</div>;
};

Modal.FooterContainer = ({ children }) => {
  return <div className="c-modal-footer spacing-footer">{children}</div>;
};

Modal.FooterButton = ({ onClick, text = 'Close', classNames = '' }) => {
  const color = classNames.includes('has-background-')
    ? 'has-text-black'
    : 'has-background-black has-text-white';

  const className = classnames(
    'button is-fullwidth rounded-lg is-flex has-text-weight-bold px-5',
    { [color]: !!color },
    { [classNames]: !!classNames }
  );
  return (
    <div className={className} style={{ minHeight: '40px' }} onClick={onClick}>
      {text}
    </div>
  );
};

Modal.FooterWithFAQ = ({ faqLink, onClose }) => {
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
      <Modal.FooterButton onClick={onClose} />
    </>
  );
};
