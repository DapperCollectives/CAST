import { useState } from 'react';

const GET_USER_SETTINGS_RESPONSE = {
  email: '',
  communityNotifications: [],
  isUnsubscribedFromCommunityUpdates: false,
};
export default function useNotificationService(walletId) {
  const [notificationSettings, setNotificationSettings] = useState({
    email: '',
    communityNotifications: [],
    isUnsubscribedFromCommunityUpdates: false,
  });

  const getUserSettings = async () => {
    try {
      //here we call api
      setNotificationSettings(GET_USER_SETTINGS_RESPONSE);
    } catch {
      throw new Error('cannot get user settings');
    }
  };

  const unsubscribeCommunityNotifications = async (communityId) => {
    try {
      //here we call api
      setNotificationSettings((prevState) => ({
        ...prevState,
        communityNotifications: {
          ...prevState.communityNotifications,
          [communityId]: false,
        },
      }));
    } catch {
      throw new Error('cannot unsubscribe community');
    }
  };

  const subscribeCommunity = async (communityId) => {
    try {
      //here we call api
      setNotificationSettings((prevState) => ({
        ...prevState,
        communityNotifications: {
          ...prevState.communityNotifications,
          [communityId]: true,
        },
      }));
    } catch {
      throw new Error('cannot subscribe community');
    }
  };

  const unsubscribeFromEmailNotifications = async () => {
    try {
      //here we call api
      setNotificationSettings((prevState) => ({
        ...prevState,
        isUnsubscribedFromCommunityUpdates: true,
      }));
    } catch {
      throw new Error('cannot unscribe from email notifications');
    }
  };

  const resubscribeFromEmailNotifications = async () => {
    try {
      //here we call api
      setNotificationSettings((prevState) => ({
        ...prevState,
        isUnsubscribedFromCommunityUpdates: false,
      }));
    } catch {
      throw new Error('cannot resubscribe from email notifications');
    }
  };
  return {
    notificationSettings,
    getUserSettings,
    unsubscribeCommunityNotifications,
    subscribeCommunity,
    unsubscribeFromEmailNotifications,
    resubscribeFromEmailNotifications,
  };
}
