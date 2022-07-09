import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useModalContext } from './NotificationModal';
import { Error } from '../components';

const ErrorHandlerContext = React.createContext({});

export const useErrorHandlerContext = () => {
  const context = React.useContext(ErrorHandlerContext);
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

  const { openModal, isOpen } = useModalContext();

  const closeError = useCallback(() => {
    setError(null);
    setErrorOpened(false);
  }, []);

  useEffect(() => {
    if (error !== null && !errorOpened) {
      openModal(
        React.createElement(Error, {
          error: (
            <p className="has-text-red p-3 has-text-justified">
              <b>{error.statusText}</b>
            </p>
          ),
          errorTitle:
            typeof error.status === 'number'
              ? `Error code: ${error.status}`
              : error?.status,
        }),
        {
          onClose: closeError,
          classNameModalContent: 'rounded-sm',
        }
      );
      setErrorOpened(true);
    }
  }, [openModal, error, closeError, isOpen, errorOpened]);

  /**
   * Hook to call modal error and show a message
   * @param  {Object | Error} err
   *    Object { status: number | string, statusText: string } or
   *    Error object with message that contains a string that will be parsed to get status and statusText
   * @param  {string} url indicates the url request that generated the error
   */
  const notifyError = useCallback((err, url) => {
    try {
      const response = JSON.parse(err.message);
      if (typeof response === 'object') {
        setError(response);
      }
    } catch (error) {
      setError({
        status: err?.status ?? 500,
        statusText: err?.statusText || `Server not available: ${err?.message}`,
        url: url ?? '',
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
