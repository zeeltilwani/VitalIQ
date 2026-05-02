import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── API BASE URL ───
// IMPORTANT: This MUST match your laptop's WiFi IP.
// Run `ipconfig` in terminal → look for "Wireless LAN adapter Wi-Fi" → IPv4 Address
// Current WiFi IP: 192.168.1.11
export const API_URL = "http://192.168.31.167:5000/api";

console.log("╔══════════════════════════════════════╗");
console.log("║ VitalIQ API:", API_URL);
console.log("╚══════════════════════════════════════╝");

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        console.log(`→ [API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => Promise.reject(error)
);

// Response error handler
api.interceptors.response.use(
    (response) => {
        console.log(`← [API] ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        if (!error.response) {
            console.error('❌ [NETWORK] Backend not reachable at', API_URL);
            return Promise.reject(new Error(
                'Server not reachable. Check that backend is running and phone is on same WiFi.'
            ));
        }
        const status = error.response.status;
        const data = error.response.data;
        console.error(`❌ [API ${status}]`, data?.error || data?.message || error.message);
        return Promise.reject(error);
    }
);

export default api;
