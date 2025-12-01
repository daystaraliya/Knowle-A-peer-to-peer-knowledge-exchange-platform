import apiClient from './apiClient';

const API_URL = '/api/v1/agreements';

export const createAgreement = async (agreementData) => {
    const response = await apiClient.post(API_URL, agreementData);
    return response.data;
};

export const getUserAgreements = async () => {
    const response = await apiClient.get(API_URL);
    return response.data;
};

export const getAgreementDetails = async (id) => {
    const response = await apiClient.get(`${API_URL}/${id}`);
    return response.data;
};

export const updateAgreementStatus = async (id, status) => {
    const response = await apiClient.patch(`${API_URL}/${id}/status`, { status });
    return response.data;
};