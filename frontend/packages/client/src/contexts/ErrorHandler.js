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
import { internalErrorCodes } from 'const';
import { useModalContext } from './NotificationModal';

const ErrorHandlerContext = createContext({});

const getErrorMessageWithContext = ({ statusText }) => {
  const errorArray = statusText.split('::');

  if (errorArray.length === 3 && internalErrorCodes.includes(errorArray[0])) {
    const [code, title, message] = errorArray;
    const showFAQ = ['ERR03', 'ERR04'].includes(code);
    return {
      title,
      message,
      faqLink: showFAQ ? 'https://docs.cast.fyi' : undefined,
    };
  }
  return { message: statusText, title: 'Error' };
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
      const { message, title, faqLink } = getErrorMessageWithContext(error);
      openModal(
        createElement(ErrorModal, {
          onClose: closeModal,
          message,
          title,
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
   *    Object { status: number | string, statusText: string } or
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
        statusText: err?.statusText || `${err?.message}`,
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
