// client/src/api/pushApi.js
import apiClient from './apiClient';

/**
 * Saves the user's push subscription object to the server.
 * @param {PushSubscription} subscription - The subscription object from the browser's PushManager.
 * @returns {Promise}
 */
export const savePushSubscription = async (subscription) => {
    const response = await apiClient.post('/api/v1/users/push/subscribe', { subscription });
    return response.data;
};
