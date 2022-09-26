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
import isError from 'lodash/isError';
import { useModalContext } from './NotificationModal';

const ErrorHandlerContext = createContext({});

const getErrorMessageWithContext = (error) => {
  const { message = 'Error', errorCode, details } = error ?? {};

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
  return { message, details };
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
   *    Object { message: string, details: string, errorCode: string } or
   *    Error object: message that contains a string that will be parsed to get message, details and errorCode
   * @param  {string} url indicates the url request that generated the error
   */
  const notifyError = useCallback((err) => {
    // regular object
    if (!isError(err)) {
      setError(err);
      return;
    }

    // failed from checkResponse err.message has details from failure
    try {
      const response = JSON.parse(err.message);
      if (typeof response === 'object') {
        setError(response);
      }
    } catch (error) {
      // failed on any other case 'err' has a plain error message
      setError({
        message: `Error`,
        details: err?.message,
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
