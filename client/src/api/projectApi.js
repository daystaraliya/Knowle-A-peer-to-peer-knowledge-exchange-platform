import apiClient from './apiClient';

const API_URL = `/api/v1/projects`;

// Project endpoints
export const createProject = async (exchangeId) => {
    const response = await apiClient.post(API_URL, { exchangeId });
    return response.data;
};

export const getUserProjects = async () => {
    const response = await apiClient.get(API_URL);
    return response.data;
};

export const getProjectDetails = async (projectId) => {
    const response = await apiClient.get(`${API_URL}/${projectId}`);
    return response.data;
};

// Task endpoints
export const createTask = async (projectId, taskData) => {
    const response = await apiClient.post(`${API_URL}/${projectId}/tasks`, taskData);
    return response.data;
};

export const updateTask = async (taskId, updateData) => {
    const response = await apiClient.patch(`${API_URL}/tasks/${taskId}`, updateData);
    return response.data;
}

export const deleteTask = async (taskId) => {
    const response = await apiClient.delete(`${API_URL}/tasks/${taskId}`);
    return response.data;
}