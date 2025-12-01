import apiClient from './apiClient';

export const register = async (userData) => {
  const response = await apiClient.post('/api/v1/users/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await apiClient.post('/api/v1/users/login', credentials);
  return response.data;
};

export const logout = async () => {
    const response = await apiClient.post('/api/v1/users/logout');
    return response.data;
};

export const getProfile = async () => {
  const response = await apiClient.get('/api/v1/users/profile');
  return response.data;
};

export const updateProfile = async (profileData) => {
    const response = await apiClient.patch('/api/v1/users/profile', profileData);
    return response.data;
}

export const updateUserAvatar = async (formData) => {
    const response = await apiClient.patch('/api/v1/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

export const updateUserTopics = async (topics) => {
    const response = await apiClient.patch('/api/v1/users/topics', topics);
    return response.data;
}

export const forgotPassword = async (email) => {
    const response = await apiClient.post('/api/v1/users/forgot-password', { email });
    return response.data;
}

export const resetPassword = async (token, password) => {
    const response = await apiClient.post(`/api/v1/users/reset-password/${token}`, { password });
    return response.data;
}

export const getPublicProfile = async (slug) => {
    const response = await apiClient.get(`/api/v1/users/public/slug/${slug}`);
    return response.data;
}

export const updateProfileVisibility = async (visibilityData) => {
    const response = await apiClient.patch('/api/v1/users/profile/visibility', visibilityData);
    return response.data;
}

export const getTeacherAnalytics = async () => {
    const response = await apiClient.get('/api/v1/users/analytics/teacher');
    return response.data;
};

export const regenerateReviewSummary = async () => {
    const response = await apiClient.post('/api/v1/users/reviews/regenerate');
    return response.data;
};

export const getRelatedUsers = async (userId) => {
    const response = await apiClient.get(`/api/v1/users/related/${userId}`);
    return response.data;
};