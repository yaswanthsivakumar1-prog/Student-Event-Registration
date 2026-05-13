// services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== AUTHENTICATION APIs =====
export const authAPI = {
  signup: (name, email, password) =>
    apiClient.post('/signup', { name, email, password }),

  login: (email, password) =>
    apiClient.post('/login', { email, password }),

  getProfile: () => apiClient.get('/profile'),
  getAllUsers: () => apiClient.get('/users'),
  addUser: (name, email, password) => apiClient.post('/admin/users', { name, email, password }),
};

// ===== EVENTS APIs =====
export const eventsAPI = {
  getAllEvents: () => apiClient.get('/events'),

  getEventById: (eventId) => apiClient.get(`/events/${eventId}`),

  searchEvents: (query) => apiClient.get(`/events/search?q=${query}`),
};

// ===== REGISTRATION APIs =====
export const registrationAPI = {
  registerEvent: (eventId) =>
    apiClient.post(`/events/${eventId}/register`),

  cancelRegistration: (registrationId) =>
    apiClient.delete(`/registrations/${registrationId}`),

  getMyRegistrations: () => apiClient.get('/my-registrations'),
};

export default apiClient;
