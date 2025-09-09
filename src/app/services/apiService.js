// services/apiService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const apiService = {
    // Device management
    getDevices: () => api.get('/devices'),
    addDevice: (sessionName) => api.post('/devices', sessionName),
    deleteDevice: (sessionName) => api.delete(`/devices/${sessionName}`),
    reconnectDevice: (sessionName) => api.post(`/devices/${sessionName}/reconnect`),

    // Campaign management
    getCampaigns: () => api.get('/campaigns'),
    getCampaign: (id) => api.get(`/campaigns/${id}`),
    startCampaign: (data) => api.post('/campaigns', data),
    stopCampaign: (id) => api.post(`/campaigns/${id}/stop`),
    retryCampaign: (id) => api.post(`/campaigns/${id}/retry`),
    deleteCampaign: (id) => api.delete(`/campaigns/${id}`),

    // File uploads
    uploadContacts: (formData) => api.post('/upload/contacts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    uploadImages: (formData) => api.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Logs
    getCampaignLogs: (campaignId) => api.get(`/logs/${campaignId || ''}`),
    exportLogs: (campaignId) => api.get(`/logs/export/${campaignId || ''}`, {
        responseType: 'blob'
    }),

    // Dashboard stats
    getDashboardStats: () => api.get('/dashboard/stats'),
};

export default apiService;