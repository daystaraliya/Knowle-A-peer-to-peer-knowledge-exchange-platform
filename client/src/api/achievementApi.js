import apiClient from './apiClient';

const API_URL = `/api/v1/achievements`;

export const getUserAchievements = async (userId) => {
  const response = await apiClient.get(`${API_URL}/user/${userId}`);
  return response.data;
};