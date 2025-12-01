import apiClient from './apiClient';

const API_URL = `/api/v1/mentors`;

export const getAllMentors = async () => {
    return apiClient.get(API_URL);
};

export const getMentorOfferings = async (mentorId) => {
    return apiClient.get(`${API_URL}/${mentorId}/offerings`);
};

export const createMentorOffering = async (offeringData) => {
    return apiClient.post(`${API_URL}/offerings`, offeringData);
};

export const getPremiumContent = async () => {
    return apiClient.get(`${API_URL}/premium-content`);
};

export const getMentorPremiumContent = async (mentorId) => {
    return apiClient.get(`${API_URL}/${mentorId}/premium-content`);
};

export const createPremiumContent = async (contentData) => {
    return apiClient.post(`${API_URL}/premium-content`, contentData);
};