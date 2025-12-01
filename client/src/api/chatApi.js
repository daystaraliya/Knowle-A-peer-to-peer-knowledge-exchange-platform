import apiClient from './apiClient';

const API_URL = `/api/v1/messages`;

export const getMessageHistory = async (exchangeId) => {
  const response = await apiClient.get(`${API_URL}/exchange/${exchangeId}`);
  return response.data;
};