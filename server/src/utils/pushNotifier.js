import webpush from 'web-push';
import { PushSubscription } from '../models/pushSubscription.models.js';

// This function should be called once when the server starts.
// For simplicity in the microservice, we will call it here.
const configureWebPush = () => {
     if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        console.warn('VAPID keys not found. Push notifications will be disabled.');
        return;
    }
    webpush.setVapidDetails(
        'mailto:admin@knowle.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
};

configureWebPush();

/**
 * Sends a push notification to a specific user.
 * @param {mongoose.Types.ObjectId} userId - The ID of the user to notify.
 * @param {object} payload - The notification payload.
 * @param {string} payload.title - The title of the notification.
 * @param {string} payload.body - The body text of the notification.
 * @param {object} payload.data - Additional data, like a URL to open on click.
 */
export const sendPushNotification = async (userId, payload) => {
    if (!process.env.VAPID_PUBLIC_KEY) return; // Don't try if not configured
    
    try {
        const subDoc = await PushSubscription.findOne({ user: userId });
        if (subDoc && subDoc.subscription) {
            await webpush.sendNotification(subDoc.subscription, JSON.stringify(payload));
            console.log(`Push notification sent to user ${userId}`);
        }
    } catch (error) {
        console.error(`Error sending push notification to user ${userId}:`, error.message);
        // If subscription is no longer valid, remove it from the DB.
        if (error.statusCode === 404 || error.statusCode === 410) {
            console.log(`Deleting expired push subscription for user ${userId}`);
            await PushSubscription.deleteOne({ 'subscription.endpoint': error.endpoint });
        }
    }
};
