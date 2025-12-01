import apiClient from './apiClient';

const API_URL = `/api/v1/onboarding`;

/**
 * Fetches the questions for the onboarding questionnaire.
 * @returns {Promise} The API response with the list of questions.
 */
export const getOnboardingQuestions = async () => {
  const response = await apiClient.get(API_URL);
  return response.data;
};

/**
 * Submits the user's answers and completes the onboarding process.
 * The server will use these answers to suggest topics for the user.
 * @param {object} data - The onboarding data.
 * @param {object} data.answers - The user's answers to the questionnaire.
 * @returns {Promise} The API response with the suggested topics.
 */
export const getAiSuggestions = async (data) => {
    const response = await apiClient.post(`${API_URL}/suggest`, data);
    return response.data;
};

/**
 * Submits the user's final topic selections to update their profile.
 * @param {object} data - The final selections.
 * @param {string[]} data.topicsToTeach - Array of topic IDs to teach.
 * @param {string[]} data.topicsToLearn - Array of topic IDs to learn.
 * @returns {Promise} The API response confirming the update.
 */
export const completeOnboarding = async (data) => {
    const response = await apiClient.post(`${API_URL}/complete`, data);
    return response.data;
}