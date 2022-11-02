import { createContext, useContext, useEffect, useState } from 'react';
import { ErrorModal, RetryModal } from 'components';
import { subscribeNotificationIntentions } from 'const';
import {
  getUserSettings as getUser,
  setUserEmail as setEmail,
  startLeanplumForUser,
  subscribeToEmailNotifications,
  unsubscribeFromEmailNotifications,
  updateCommunitySubscription as updateCommunity,
} from 'api/notificationService';
import { debounce } from 'lodash';
import { useModalContext } from './NotificationModal';
import { useWebContext } from './Web3';

const NotificationServiceContext = createContext({});

const INIT_NOTIFICATION_SETTINGS = {
  email: '',
  communitySubscription: [],
  isSubscribedFromCommunityUpdates: false,
};

export const useNotificationServiceContext = () => {
  const context = useContext(NotificationServiceContext);
  if (context === undefined) {
    throw new Error(
      '`useNotificationServiceContext` must be used within a `NotificationServiceProvider`.'
    );
  }
  return context;
};

const NotificationServiceProvider = ({ children }) => {
  const [notificationSettings, setNotificationSettings] = useState(
    INIT_NOTIFICATION_SETTINGS
  );

  const {
    user: { addr },
  } = useWebContext();
  const { openModal, closeModal } = useModalContext();

  useEffect(() => {
    if (addr) {
      initUser();
    } else {
      setNotificationSettings(INIT_NOTIFICATION_SETTINGS);
    }
  }, [addr]);

  const initUser = debounce(
    async () => {
      try {
        console.log('init user called');
        await startLeanplumForUser(addr);
        await getUserSettings();
      } catch (e) {
        openRetryModal();
      }
    },
    //Leanplum API rate limit is 1QPS
    2000,
    { leading: true, trailing: false }
  );

  const openRetryModal = () => {
    openModal(
      <RetryModal
        message="There is an issue getting your notifications settings, you can try again."
        closeModal={closeModal}
        onRetry={initUser}
      />,
      {
        isErrorModal: true,
      }
    );
  };
  const handleNotificationServiceError = (fn) => {
    return async (...args) => {
      try {
        await fn(...args);
      } catch {
        openModal(
          <ErrorModal
            message="Something went wrong, and your action could not be completed. Please try again later."
            title="Error"
            footerComponent={
              <button
                className="button subscribe-community-button p-0 is-fullwidth rounded-lg"
                onClick={closeModal}
              >
                Close
              </button>
            }
            onClose={closeModal}
          />,
          { isErrorModal: true }
        );
        throw new Error();
      }
    };
  };
  const getUserSettings = async () => {
    try {
      const { communitySubscription, isSubscribedFromCommunityUpdates, email } =
        await getUser(addr);
      setNotificationSettings((prevState) => ({
        ...prevState,
        communitySubscription,
        isSubscribedFromCommunityUpdates,
        email,
      }));
    } catch {
      throw new Error('cannot get user settings');
    }
  };
  const setUserEmail = handleNotificationServiceError(async (email) => {
    try {
      await setEmail(email);
      setNotificationSettings((prevState) => ({
        ...prevState,
        email,
      }));
    } catch {
      throw new Error('cannot set user email');
    }
  });

  const updateCommunitySubscription = handleNotificationServiceError(
    async (communitySubIntentions) => {
      try {
        await updateCommunity(communitySubIntentions);
        await new Promise((r) => setTimeout(r, 500));
        await getUserSettings();
      } catch {
        throw new Error('cannot update community subscription');
      }
      // throw Error();
    }
  );

  const updateAllEmailNotificationSubscription = handleNotificationServiceError(
    async (subscribeIntention) => {
      if (subscribeIntention === subscribeNotificationIntentions.resubscribe) {
        subscribeToEmailNotifications(addr);
      } else if (
        subscribeIntention === subscribeNotificationIntentions.unsubscribe
      ) {
        unsubscribeFromEmailNotifications(addr);
      }
      setNotificationSettings((prevState) => ({
        ...prevState,
        isSubscribedFromCommunityUpdates:
          subscribeIntention === subscribeNotificationIntentions.resubscribe,
      }));
    }
  );

  const providerProps = {
    notificationSettings,
    setUserEmail,
    updateCommunitySubscription,
    updateAllEmailNotificationSubscription,
  };
  return (
    <NotificationServiceContext.Provider value={providerProps}>
      {children}
    </NotificationServiceContext.Provider>
  );
};

export default NotificationServiceProvider;
