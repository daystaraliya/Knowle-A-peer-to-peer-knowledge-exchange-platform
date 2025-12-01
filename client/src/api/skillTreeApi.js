import apiClient from './apiClient';

const API_URL = `/api/v1/skill-trees`;

export const getSkillTrees = async () => {
    const response = await apiClient.get(API_URL);
    return response.data;
};

export const getSkillTreeDetails = async (treeId) => {
    const response = await apiClient.get(`${API_URL}/${treeId}`);
    return response.data;
};

export const getUserProgress = async (treeId) => {
    const response = await apiClient.get(`${API_URL}/${treeId}/progress`);
    return response.data;
};