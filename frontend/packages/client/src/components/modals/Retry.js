import { useState } from 'react';
import Error from './Error';

export default function RetryModal({
  message,
  closeModal,
  onRetry,
  onSuccess = () => {},
  onError = () => {},
}) {
  const [isRetrying, setIsRetrying] = useState(false);
  const displayMessage = isRetrying ? 'trying...' : message;
  const handleRetry = (retryFn) => {
    return async (...arg) => {
      setIsRetrying(true);
      try {
        const result = await retryFn(...arg);
        onSuccess(result);
      } catch (e) {
        onError(e);
      } finally {
        setTimeout(() => setIsRetrying(false), 3000);
      }
    };
  };
  return (
    <Error
      message={displayMessage}
      title="Error"
      footerComponent={
        <>
          <button
            className="button has-background-black has-text-white p-0 is-fullwidth rounded-lg"
            onClick={handleRetry(onRetry)}
            disabled={isRetrying}
          >
            Retry
          </button>
          <button
            className="button subscribe-community-button p-0 is-fullwidth rounded-lg"
            onClick={closeModal}
          >
            Close
          </button>
        </>
      }
      onClose={closeModal}
    />
  );
}
