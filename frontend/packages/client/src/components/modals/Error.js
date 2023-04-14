import Modal from './Modal';

export default function ErrorModal({
  title = 'Error',
  message = '',
  onClose = () => {},
  // external link
  faqLink = null,
  footerComponent = null,
}) {
  return (
    <Modal>
      <Modal.ErrorHeader title={title} onClose={onClose} />
      <Modal.BodyMessage message={message} />
      {footerComponent ? (
        <Modal.FooterContainer>{footerComponent}</Modal.FooterContainer>
      ) : (
        <Modal.FooterContainer>
          {faqLink ? (
            <Modal.FotterWithFAQ faqLink={faqLink} onClose={onClose} />
          ) : (
            <Modal.FooterButton onClick={onClose} />
          )}
        </Modal.FooterContainer>
      )}
    </Modal>
  );
}
