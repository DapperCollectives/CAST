import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ErrorModal } from 'components';
import { useModalContext } from './NotificationModal';

const ErrorHandlerContext = createContext({});

const getErrorMessageWithContext = ({ message, errorCode, details }) => {
  if (errorCode && details) {
    // These errors require to show FAQs link
    const showFAQ = ['ERR_1003', 'ERR_1004'].includes(errorCode);
    return {
      message,
      details,
      faqLink: showFAQ ? 'https://docs.cast.fyi' : undefined,
    };
  }
  // defafult to error message and use Error as title
  return { details: message, message: 'Error' };
};

export const useErrorHandlerContext = () => {
  const context = useContext(ErrorHandlerContext);
  if (context === undefined) {
    throw new Error(
      '`useErrorHandlerContext` must be used within a `ErrorHandlerProvider`.'
    );
  }
  return context;
};

const ErrorHandlerProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const [errorOpened, setErrorOpened] = useState(false);

  const { openModal, isOpen, closeModal } = useModalContext();

  const closeError = useCallback(() => {
    setError(null);
    setErrorOpened(false);
  }, []);

  useEffect(() => {
    if (error !== null && !errorOpened) {
      const { message, details, faqLink } = getErrorMessageWithContext(error);
      openModal(
        createElement(ErrorModal, {
          onClose: closeModal,
          message: details,
          title: message,
          faqLink,
        }),
        {
          onClose: closeError,
          isErrorModal: true,
        }
      );
      setErrorOpened(true);
    }
  }, [openModal, error, closeError, isOpen, errorOpened, closeModal]);

  /**
   * Hook to call modal error and show a message
   * @param  {Object | Error} err
   *    Object { status: number | string, message: string, header: string, errorCode: string } or
   *    Error object with message that contains a string that will be parsed to get status and statusText
   * @param  {string} url indicates the url request that generated the error
   */
  const notifyError = useCallback((err) => {
    try {
      const response = JSON.parse(err.message);
      if (typeof response === 'object') {
        setError(response);
      }
    } catch (error) {
      setError({
        status: err?.status,
        message: err?.statusText || `${err?.message}`,
      });
    }
  }, []);

  const providerProps = useMemo(
    () => ({
      notifyError,
    }),
    [notifyError]
  );

  return (
    <ErrorHandlerContext.Provider value={providerProps}>
      {children}
    </ErrorHandlerContext.Provider>
  );
};

export default ErrorHandlerProvider;
