import { Svg } from '@cast/shared-components';

export default function ErrorModal({
  title = 'Error',
  message = '',
  onClose = () => {},
  // external link
  faqLink = null,
  footerComponent = null,
}) {
  return (
    <div className="modal-error">
      <div className="modal-error-header">
        <Svg name="ErrorOutline" />
        <p className="modal-error-title">{title}</p>
        <div className="is-flex cursor-pointer" onClick={onClose}>
          <Svg name="Close" width="18" heigth="18" />
        </div>
      </div>
      <div className="modal-error-message">{message}</div>
      <div className="modal-error-footer">
        {!footerComponent ? (
          <>
            {faqLink ? (
              <a
                target="_blank"
                rel="noreferrer noopener"
                href={faqLink}
                className="button is-fullwidth rounded-lg is-flex has-text-weight-bold has-background-white px-5 mr-5"
              >
                Read FAQ
              </a>
            ) : null}
            <div
              className="button is-fullwidth rounded-lg is-flex has-text-weight-bold has-text-white has-background-black px-5"
              style={{ minHeight: '40px' }}
              onClick={onClose}
            >
              Close
            </div>
          </>
        ) : (
          footerComponent
        )}
      </div>
    </div>
  );
}
