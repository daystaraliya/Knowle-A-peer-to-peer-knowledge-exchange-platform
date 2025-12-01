import apiClient from './apiClient';

const API_URL = `/api/v1/feature-requests`;

export const getFeatureRequests = async (sortBy = 'popular') => {
  const response = await apiClient.get(API_URL, {
    params: { sortBy }
  });
  return response.data;
};

export const createFeatureRequest = async (requestData) => {
  const response = await apiClient.post(API_URL, requestData);
  return response.data;
};

export const toggleUpvote = async (requestId) => {
  const response = await apiClient.post(`${API_URL}/${requestId}/upvote`);
  return response.data;
};