import apiClient from './apiClient';

const API_URL = `/api/v1/assessment`;

/**
 * Starts a skill assessment for a given topic.
 * @param {string} topicId - The ID of the topic to be assessed.
 * @returns {Promise} The API response with assessment questions.
 */
export const startAssessment = async (topicId) => {
  const response = await apiClient.post(`${API_URL}/start/${topicId}`);
  return response.data;
};

/**
 * Submits the user's answers for evaluation.
 * @param {string} topicId - The ID of the topic that was assessed.
 * @param {object} data - The assessment data, including questions and answers.
 * @returns {Promise} The API response with the proficiency result.
 */
export const submitAssessment = async (topicId, data) => {
    const response = await apiClient.post(`${API_URL}/submit/${topicId}`, data);
    return response.data;
};