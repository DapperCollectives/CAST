import {
  LP_APP_ID,
  LP_CRO_KEY,
  LP_EXPORT_KEY,
} from 'api/constants';
import Leanplum from 'leanplum-sdk';

const COMMUNITY_UPDATES_CATEGORY_ID = 1;
const options = {
  method: 'GET',
  headers: { accept: 'application/json' },
};

export const setUserId = async (walletId) => {
  try {
    Leanplum.setUserId(walletId);
  } catch (e) {
    throw new Error(e);
  }
};

export const getUserSettings = async (walletId) => {
  try {
    fetch(
      `https://api.leanplum.com/api?appId=${LP_APP_ID}&clientKey=${LP_EXPORT_KEY}&apiVersion=1.0.6&userId=${walletId}&action=exportUser`,
      options
    ).then((response) => {
      let data = response.response[0];
      let communitySubscriptions = [];
      let isSubscribedToCommunityUpdates = true;
      const res = {
        email: data.userAttributes.email,
      };

      for (const property in data.userAttributes) {
        if (property.includes('community')) {
          let communityId = property.split('community')[1];
          communitySubscriptions.push({
            communityId,
            subscribed: data.userAttributes[property] === 'True',
          });
        }
      }

      res.communitySubscription = communitySubscriptions;

      if (data.unsubscribeCategories) {
        data.unsubscribeCategories.forEach((category) => {
          if (category.id == 1) {
            isSubscribedToCommunityUpdates = false;
          }
        });
      }

      res.isSubscribedToCommunityUpdates = isSubscribedToCommunityUpdates;
      return res;
    });
  } catch (e) {
    throw new Error(e);
  }
};

export const setUserEmail = async (email) => {
  try {
    Leanplum.setUserAttributes({ email });
  } catch (e) {
    throw new Error(e);
  }
};

export const unsubscribeCommunity = async (communityId) => {
  try {
    let userAttributes = {};
    let communityKey = 'community' + communityId;
    userAttributes[communityKey] = false;
    Leanplum.setUserAttributes(userAttributes);
  } catch (e) {
    throw new Error(e);
  }
};

export const subscribeCommunity = async (communityId) => {
  try {
    let userAttributes = {};
    let communityKey = 'community' + communityId;
    userAttributes[communityKey] = true;
    Leanplum.setUserAttributes(userAttributes);
  } catch (e) {
    throw new Error(e);
  }
};

export const unsubscribeFromEmailNotifications = async (walletId) => {
  try {
    fetch(
      `https://www.leanplum.com/api?appId=${LP_APP_ID}&clientKey=${LP_CRO_KEY}&action=setUserAttributes&userId=${walletId}&unsubscribeCategoriesToAdd=${COMMUNITY_UPDATES_CATEGORY_ID}`,
      options
    ).then((response) => {
      return response;
    });
  } catch (e) {
    throw new Error(e);
  }
};

export const subscribeToEmailNotifications = async (walletId) => {
  try {
    fetch(
      `https://www.leanplum.com/api?appId=${LP_APP_ID}&clientKey=${LP_CRO_KEY}&action=setUserAttributes&userId=${walletId}&unsubscribeCategoriesToRemove=${COMMUNITY_UPDATES_CATEGORY_ID}`,
      options
    ).then((response) => {
      return response;
    });
  } catch (e) {
    throw new Error(e);
  }
};
