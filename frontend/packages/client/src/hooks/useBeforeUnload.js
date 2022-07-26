import { useEffect } from 'react';

export default function useBeforeUnload(confirmationMessage) {
  useEffect(() => {
    window.onbeforeunload = (e) => {
      e = e || window.event;
      if (e) {
        e.returnValue = confirmationMessage;
      }
      return confirmationMessage;
    };
    return () => {
      window.onbeforeunload = () => {};
    };
  }, [confirmationMessage]);
}
