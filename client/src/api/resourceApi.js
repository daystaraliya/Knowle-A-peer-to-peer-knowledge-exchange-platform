import apiClient from './apiClient';

const API_URL = `/api/v1/resources`;

export const getResources = async (topic = '') => {
  const response = await apiClient.get(API_URL, {
    params: { topic: topic || undefined }
  });
  return response.data;
};

export const getResourceDetails = async (resourceId) => {
  const response = await apiClient.get(`${API_URL}/${resourceId}`);
  return response.data;
};

export const createResource = async (resourceData) => {
  const response = await apiClient.post(API_URL, resourceData);
  return response.data;
};

export const updateResource = async (resourceId, resourceData) => {
    const response = await apiClient.patch(`${API_URL}/${resourceId}`, resourceData);
    return response.data;
};

export const deleteResource = async (resourceId) => {
    const response = await apiClient.delete(`${API_URL}/${resourceId}`);
    return response.data;
};

export const toggleUpvote = async (resourceId) => {
  const response = await apiClient.post(`${API_URL}/${resourceId}/upvote`);
  return response.data;
};