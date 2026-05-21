// services/api.js
import axios from 'axios';

const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = rawApiUrl.replace(/\/$/, '') + '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // ✅ changed from sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== AUTHENTICATION APIs =====
export const authAPI = {
  signup: (firstName, username, email, password) =>
    apiClient.post('/signup', { firstName, username, email, password }),

  login: (username, password) =>
    apiClient.post('/login', { username, password }),

  getProfile: () => apiClient.get('/profile'),

  // ✅ ADD THIS — was missing!
  updateProfile: (formData) =>
    apiClient.put('/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  getAllUsers: () => apiClient.get('/admin/users'),

  addUser: (firstName, username, email, password, role = 'student') =>
    apiClient.post('/admin/users', { firstName, username, email, password, role }),

  updateUserRole: (userId, role) =>
    apiClient.patch(`/admin/users/${userId}/role`, { role }),

  getUserRegistrations: (userId) =>
    apiClient.get(`/admin/users/${userId}/registrations`),

  deleteUser: (userId) =>
    apiClient.delete(`/admin/users/${userId}`),

  getDashboardStats: () =>
    apiClient.get('/admin/dashboard'),
};

// ===== EVENTS APIs =====
export const eventsAPI = {
  getAllEvents: () => apiClient.get('/events'),
  getEventById: (eventId) => apiClient.get(`/events/${eventId}`),
  searchEvents: (query) => apiClient.get(`/events/search?q=${query}`),
  createEvent: (formData) =>
    apiClient.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateEvent: (eventId, eventData) =>
    apiClient.put(`/events/${eventId}`, eventData, {
      headers: {
        'Content-Type': eventData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    }),
  deleteEvent: (eventId) =>
    apiClient.delete(`/events/${eventId}`),
  getEventRegistrations: (eventId) =>
    apiClient.get(`/admin/events/${eventId}/registrations`),
};

// ===== REGISTRATION APIs =====
export const registrationAPI = {
  registerEvent: (eventId) =>
    apiClient.post(`/events/${eventId}/register`),
  cancelRegistration: (registrationId) =>
    apiClient.delete(`/registrations/${registrationId}`),
  getMyRegistrations: () => apiClient.get('/my-registrations'),
  forceCancel: (registrationId) =>
    apiClient.delete(`/admin/registrations/${registrationId}`),
};

export default apiClient;