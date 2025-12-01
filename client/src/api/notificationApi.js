import apiClient from './apiClient';

const API_URL = `/api/v1/notifications`;

export const getNotifications = async () => {
  const response = await apiClient.get(API_URL);
  return response.data;
};

export const markNotificationsAsRead = async () => {
    const response = await apiClient.patch(`${API_URL}/read`);
    return response.data;
}