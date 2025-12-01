import axios from 'axios';

// Create a separate Axios instance for the admin service
const adminApiClient = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL,
  withCredentials: true, // Crucial for sending httpOnly cookies
});

// --- Support Endpoints ---

export const getAllDisputes = async (filters = {}) => {
    const response = await adminApiClient.get('/api/v1/support/disputes', { params: filters });
    return response.data;
};

export const assignDisputeToMe = async (disputeId) => {
    const response = await adminApiClient.post(`/api/v1/support/disputes/${disputeId}/assign`);
    return response.data;
};

export const resolveDispute = async (disputeId, resolutionMessage) => {
    const response = await adminApiClient.post(`/api/v1/support/disputes/${disputeId}/resolve`, { resolutionMessage });
    return response.data;
};

// --- Admin Endpoints ---

export const getAllUsers = async () => {
    const response = await adminApiClient.get('/api/v1/admin/users');
    return response.data;
};

export const updateUserStatus = async (userId, status) => {
    const response = await adminApiClient.patch(`/api/v1/admin/users/${userId}/status`, { status });
    return response.data;
};

export const updateUserRole = async (userId, role) => {
    const response = await adminApiClient.patch(`/api/v1/admin/users/${userId}/role`, { role });
    return response.data;
};
