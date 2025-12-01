import apiClient from './apiClient';

const API_URL = `/api/v1/events`;

export const getAllEvents = async (topic = '') => {
  const response = await apiClient.get(API_URL, {
    params: { topic: topic || undefined }
  });
  return response.data;
};

export const getEventDetails = async (eventId) => {
  const response = await apiClient.get(`${API_URL}/${eventId}`);
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await apiClient.post(API_URL, eventData);
  return response.data;
};

export const registerForEvent = async (eventId) => {
  const response = await apiClient.post(`${API_URL}/${eventId}/register`);
  return response.data;
};

export const cancelRegistration = async (eventId) => {
  const response = await apiClient.post(`${API_URL}/${eventId}/cancel`);
  return response.data;
};

export const getHostedEvents = async () => {
    const response = await apiClient.get(`${API_URL}/hosted/me`);
    return response.data;
};

export const getRegisteredEvents = async () => {
    const response = await apiClient.get(`${API_URL}/registered/me`);
    return response.data;
};