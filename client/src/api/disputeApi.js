import apiClient from './apiClient';

const API_URL = '/api/v1/disputes';

/**
 * Creates a new dispute ticket.
 * @param {object} disputeData - The data for the new dispute.
 * @param {string} disputeData.exchangeId - The ID of the related exchange.
 * @param {string} disputeData.reason - The reason for the dispute.
 * @param {string} disputeData.description - A detailed description.
 * @returns {Promise} The API response.
 */
export const createDispute = async (disputeData) => {
    const response = await apiClient.post(API_URL, disputeData);
    return response.data;
};

/**
 * Fetches all disputes the current user is involved in.
 * @returns {Promise} The API response.
 */
export const getUserDisputes = async () => {
    const response = await apiClient.get(API_URL);
    return response.data;
};

/**
 * Fetches the details and message history for a specific dispute.
 * @param {string} disputeId - The ID of the dispute.
 * @returns {Promise} The API response.
 */
export const getDisputeDetails = async (disputeId) => {
    const response = await apiClient.get(`${API_URL}/${disputeId}`);
    return response.data;
};

/**
 * Posts a new message to a dispute conversation.
 * @param {string} disputeId - The ID of the dispute.
 * @param {object} messageData - The message content.
 * @param {string} messageData.content - The text of the message.
 * @returns {Promise} The API response.
 */
export const postDisputeMessage = async (disputeId, messageData) => {
    const response = await apiClient.post(`${API_URL}/${disputeId}/messages`, messageData);
    return response.data;
};