import apiClient from './apiClient';

const EXCHANGE_URL = '/api/v1/exchanges';
const RECORDING_URL = '/api/v1/recordings';

export const findMatches = async (language = '') => {
  const response = await apiClient.get(`${EXCHANGE_URL}/matches`, {
    params: { language: language || undefined } // Pass language if it exists
  });
  return response.data;
};

export const getExchangeDetails = async (exchangeId) => {
  const response = await apiClient.get(`${EXCHANGE_URL}/${exchangeId}`);
  return response.data;
};

export const createExchange = async (exchangeData) => {
    const response = await apiClient.post(EXCHANGE_URL, exchangeData);
    return response.data;
};

export const getUserExchanges = async () => {
    const response = await apiClient.get(EXCHANGE_URL);
    return response.data;
}

export const updateExchangeStatus = async (exchangeId, status) => {
    const response = await apiClient.patch(`${EXCHANGE_URL}/${exchangeId}/status`, { status });
    return response.data;
}

// MODIFICATION START
export const confirmCompletion = async (exchangeId) => {
    const response = await apiClient.post(`${EXCHANGE_URL}/${exchangeId}/confirm-completion`);
    return response.data;
};
// MODIFICATION END

export const submitReview = async (exchangeId, reviewData) => {
    const response = await apiClient.post(`${EXCHANGE_URL}/${exchangeId}/review`, reviewData);
    return response.data;
}

// --- Recording Endpoints ---
export const uploadRecording = async (exchangeId, audioFormData) => {
    const response = await apiClient.post(`${EXCHANGE_URL}/${exchangeId}/recordings`, audioFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const getRecordingsForExchange = async (exchangeId) => {
    const response = await apiClient.get(`${EXCHANGE_URL}/${exchangeId}/recordings`);
    return response.data;
};

export const getRecordingDetails = async (recordingId) => {
    const response = await apiClient.get(`${RECORDING_URL}/${recordingId}`);
    return response.data;
};