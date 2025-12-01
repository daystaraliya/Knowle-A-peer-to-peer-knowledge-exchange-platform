import apiClient from './apiClient';

const API_URL = `/api/v1/topics`;

export const getTopics = async (searchTerm = '') => {
  const response = await apiClient.get(`${API_URL}/?search=${searchTerm}`);
  return response.data;
};

export const createTopic = async (topicData) => {
  const response = await apiClient.post(API_URL, topicData);
  return response.data;
};