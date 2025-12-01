import apiClient from './apiClient';

const API_URL = `/api/v1/payments`;

/**
 * Creates a Stripe Checkout session.
 * @param {object} data - The payment data.
 * @param {string} data.type - 'subscription' or 'mentorship'.
 * @param {string} [data.priceId] - The ID of the item to purchase (for mentorship).
 * @returns {Promise} - The Axios response promise.
 */
export const createCheckoutSession = async (data) => {
    return apiClient.post(`${API_URL}/create-checkout-session`, data);
};