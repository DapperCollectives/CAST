import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import isEqual from 'lodash/isEqual';

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
const NotificationModalContext = createContext({});

export const useModalContext = () => {
  const context = useContext(NotificationModalContext);
  if (context === undefined) {
    throw new Error(
      '`useModalContext` must be used within a `NotificationModalProvider`.'
    );
  }
  return context;
};

const NotificationModalProvider = ({ children }) => {
  const onCloseCallbackRef = useRef(() => {});
  const [modal, setModal] = useState(false);
  const [content, setContent] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    // more configuration can be added here
    closeOnBackgroundClick: true,
    showCloseButton: true,
    classNameModalContent: '',
  });

  const openModal = useCallback(
    (content, customModalConfig) => {
      if (customModalConfig) {
        const { isErrorModal, onClose } = customModalConfig;

        // save in a ref callback when mocal is closed
        onCloseCallbackRef.current = onClose;

        const newConfiguration = {
          ...modalConfig,
          // set default values if modal is re-opened without configuration
          // this is when two components are using the modal with different configuration at the same time
          closeOnBackgroundClick: true,
          showCloseButton: true,
          classNameModalContent: '',
          ...customModalConfig,
          // only for error modals overwrite configuration to make it transparent and use ErrorModal component
          ...(isErrorModal
            ? {
                classNameModalContent: 'is-flex is-justify-content-center',
                backgroundColor: ' ',
              }
            : undefined),
        };
        // compare configuration to avoid setting state with same object values
        if (!isEqual(modalConfig, newConfiguration)) {
          setModalConfig(newConfiguration);
        }
      }
      setContent(content);
      setModal(true);
    },
    [modalConfig]
  );

  const closeModal = useCallback(({ onCloseCallback } = {}) => {
    setModal(false);
    // this unmounts the component
    setContent(null);
    // calling any callback set on open modal
    onCloseCallbackRef.current && onCloseCallbackRef.current();
    // calling any callback set on closeModal
    onCloseCallback && onCloseCallback();
  }, []);

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

  const className = `modal${modal ? ' is-active' : ''}`;

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
                : ' has-background-white'
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
