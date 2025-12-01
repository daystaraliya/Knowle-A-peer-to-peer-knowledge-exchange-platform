import apiClient from './apiClient';

const API_URL = `/api/v1/leaderboard`;

export const getLeaderboard = async (criteria = 'points') => {
  const response = await apiClient.get(`${API_URL}/?criteria=${criteria}`);
  return response.data;
};