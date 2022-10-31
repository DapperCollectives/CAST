import { createContext, useContext, useEffect, useState } from 'react';
import { subscribeNotificationIntentions } from 'const';
import {
  getUserSettings as getUser,
  setUserEmail as setEmail,
  startLeanplumForUser,
  subscribeToEmailNotifications,
  unsubscribeFromEmailNotifications,
  updateCommunitySubscription as updateCommunity,
} from 'api/notificationService';
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

  useEffect(() => {
    if (addr) {
      (async () => {
        try {
          await startLeanplumForUser(addr);
          await getUserSettings();
        } catch (e) {
          console.log(e);
        }
      })();
    } else {
      setNotificationSettings(INIT_NOTIFICATION_SETTINGS);
    }
  }, [addr]);

  const setUserEmail = async (email) => {
    try {
      await setEmail(email);
      setNotificationSettings((prevState) => ({
        ...prevState,
        email,
      }));
    } catch {
      throw new Error('cannot set user email');
    }
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

  const updateCommunitySubscription = async (communitySubIntentions) => {
    try {
      await updateCommunity(communitySubIntentions);
      await getUserSettings();
    } catch {
      throw new Error('cannot update community subscription');
    }
  };

  const updateAllEmailNotificationSubscription = async (subscribeIntention) => {
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
  };

  const providerProps = {
    notificationSettings,
    setUserEmail,
    getUserSettings,
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
