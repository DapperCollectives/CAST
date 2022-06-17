import React, { useCallback, useState } from "react";

/**
 *
 * Pass to the openModal the component and the configuration
 * openModal(
 *   content: (
 *     <div className="columns m-0 flex-1 has-background-orange">
 *       <div className="column">this is the modal content</div>
 *     </div>
 *   ),
 *   modalConfig: {
 *     closeOnBackgroundClick: boolean
 *     showCloseButton: boolean,
 *     classNameModalContent: string,
 *   }
 * );
 */
const NotificationModalContext = React.createContext({});

export const useModalContext = () => {
  const context = React.useContext(NotificationModalContext);
  if (context === undefined) {
    throw new Error(
      "`useModalContext` must be used within a `NotificationModalProvider`."
    );
  }
  return context;
};

const NotificationModalProvider = ({ children }) => {
  const [modal, setModal] = useState(false);
  const [content, setContent] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    // more configuration can be added here
    closeOnBackgroundClick: true,
    showCloseButton: true,
    classNameModalContent: "",
    onClose: () => {},
  });

  const openModal = useCallback(
    (content, customModalConfig) => {
      if (customModalConfig) {
        setModalConfig(() => ({
          ...modalConfig,
          // set default values if modal is re-opened without configuration
          // this is when two components are using the modal with different configuration at the same time
          closeOnBackgroundClick: true,
          showCloseButton: true,
          classNameModalContent: "",
          ...customModalConfig,
        }));
      }
      setContent(content);
      setModal(true);
    },
    [modalConfig]
  );

  const closeModal = useCallback(() => {
    setModal(false);
    // this unmounts the component
    setContent(null);
    modalConfig.onClose();
  }, [modalConfig]);

  const { closeOnBackgroundClick } = modalConfig;
  const handleClickOnBackground = useCallback(() => {
    if (closeOnBackgroundClick) {
      closeModal();
    }
  }, [closeModal, closeOnBackgroundClick]);

  const providerProps = {
    openModal,
    closeModal,
    isOpen: modal,
  };

  const className = `modal${modal ? " is-active" : ""}`;

  return (
    <NotificationModalContext.Provider value={providerProps}>
      <>
        <div className={className}>
          <div
            className="modal-background"
            onClick={handleClickOnBackground}
          ></div>
          <div
            className={`modal-content ${
              modalConfig.backgroundColor
                ? modalConfig.backgroundColor
                : " has-background-white"
            } ${modalConfig.classNameModalContent}`}
          >
            {!!content ? content : <p>Empty Modal</p>}
          </div>
          {modalConfig.showCloseButton && (
            <button
              className="modal-close is-large"
              aria-label="close"
              onClick={closeModal}
            ></button>
          )}
        </div>
        {children}
      </>
    </NotificationModalContext.Provider>
  );
};

export default NotificationModalProvider;
