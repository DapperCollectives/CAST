import { createContext, useContext, useEffect, useState } from 'react';
import { subscribeNotificationIntentions } from 'const';
import {
  getUserSettings as getUser,
  setUserEmail as setEmail,
  startLeanplumForUser,
  subscribeCommunity,
  subscribeToEmailNotifications,
  unsubscribeCommunity,
  unsubscribeFromEmailNotifications,
} from 'api/notificationService';
import { useWebContext } from './Web3';

const NotificationServiceContext = createContext({});

const INIT_NOTIFICATION_SETTINGS = {
  email: '',
  communitySubscription: [],
  isSubscribedFromCommunityUpdates: false,
};

const updateCommunitySubscriptionState = (
  communitySubscription,
  communityId,
  subscribedValue
) => {
  const newCommunitySubscription = [...communitySubscription];
  const updateIndex = newCommunitySubscription.findIndex(
    (communitySub) => communitySub.communityId === communityId
  );
  if (updateIndex === -1) {
    newCommunitySubscription.push({ communityId, subscribed: subscribedValue });
  } else {
    newCommunitySubscription[updateIndex].subscribed = subscribedValue;
  }
  return newCommunitySubscription;
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

  const updateCommunitySubscription = async (
    communityId,
    subscribeIntention
  ) => {
    try {
      if (subscribeIntention === subscribeNotificationIntentions.subscribe) {
        await subscribeCommunity(communityId);
      } else if (
        subscribeIntention === subscribeNotificationIntentions.unsubscribe
      ) {
        await unsubscribeCommunity(communityId);
      }
      setNotificationSettings((prevState) => {
        const newCommunitySubscription = updateCommunitySubscriptionState(
          prevState.communitySubscription,
          communityId,
          subscribeIntention === subscribeNotificationIntentions.subscribe
        );
        return {
          ...prevState,
          communitySubscription: newCommunitySubscription,
        };
      });
    } catch {
      throw new Error('cannot subscribe community');
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
