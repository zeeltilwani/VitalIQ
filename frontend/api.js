import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - Updated to current local IP
export const API_URL = "http://192.168.1.9:5000/api";
console.log("API URL:", API_URL);

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('❌ [API Error]', error.response?.data || error.message);
        if (!error.response) {
            return Promise.reject(new Error("Backend not reachable"));
        }
        return Promise.reject(error);
    }
);

export default api;
