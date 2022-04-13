import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useModalContext } from "./NotificationModal";
import { Error } from "../components";

const ErrorHandlerContext = React.createContext({});

export const useErrorHandlerContext = () => {
  const context = React.useContext(ErrorHandlerContext);
  if (context === undefined) {
    throw new Error(
      "`useErrorHandlerContext` must be used within a `ErrorHandlerProvider`."
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
            <p className="has-text-red">
              <b>{error.statusText}</b>
            </p>
          ),
          errorTitle: `Error code: ${error.errorCode}`,
        }),
        {
          onClose: closeError,
        }
      );
      setErrorOpened(true);
    }
  }, [openModal, error, closeError, isOpen, errorOpened]);

  const notifyError = useCallback((err, url) => {
    try {
      const response = JSON.parse(err.message);
      if (typeof response === "object") {
        setError(response);
      }
    } catch (error) {
      setError({
        status: 500,
        statusText: `Server not available: ${err.message}`,
        url,
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
