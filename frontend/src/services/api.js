import axios from "axios";
import { io } from "socket.io-client";

const API_BASE_URL = "https://shadi-production-a097.up.railway.app/api";
const SOCKET_URL = "https://shadi-production-a097.up.railway.app";
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (!window.location.pathname.startsWith("/admin")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// Auth Services
export const authService = {
  register: (userData) => api.post("/auth/register", userData),
  login: (email, password) => api.post("/auth/login", { email, password }),
  sendOtp: (mobile) => api.post("/auth/send-otp", { mobile }),
  verifyOtp: (mobile, otp) => api.post("/auth/verify-otp", { mobile, otp }),
  me: () => api.get("/auth/me"),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return Promise.resolve();
  },
  verifyEmail: (token) => api.post("/auth/verify-email", { token }),
};

// Profile Services
export const profileService = {
  getMe: () => api.get("/profiles/me"),
  updateMe: (data) => api.put("/profiles/me", data),
  getProfile: (id) => api.get(`/profiles/${id}`),
  updateProfile: (id, data) => api.put(`/profiles/${id}`, data),
  uploadPhoto: (id, formData) => api.post(`/profiles/${id}/photos`, formData),
  deletePhoto: (id, photoId) => api.delete(`/profiles/${id}/photos/${photoId}`),
  getAll: (filters) => api.get("/profiles", { params: filters }),
};

// Matching Services
export const matchService = {
  getMatches: (filters) => api.get("/matches", { params: filters }),
  like: (profileId) => api.post(`/matches/${profileId}/like`),
  pass: (profileId) => api.post(`/matches/${profileId}/pass`),
  unlike: (profileId) => api.post(`/matches/${profileId}/unlike`),
  getLikes: () => api.get("/matches/likes"),
  getLikedProfiles: () => api.get("/matches/liked"),
  getViews: () => api.get("/matches/views"),
};

export const premiumService = {
  getPlans: () => api.get("/premium/plans"),
  getStatus: () => api.get("/premium/me"),
  checkout: (planId) => api.post("/premium/checkout", { planId }),
  verify: (payload) => api.post("/premium/verify", payload),
  support: (payload) => api.post("/premium/support", payload),
};

// Messaging Services
export const messageService = {
  startConversation: (profileId) => api.post(`/messages/start/${profileId}`),
  getConversations: () => api.get("/messages/conversations"),
  getMessages: (conversationId) =>
    api.get(`/messages/conversations/${conversationId}`),
  sendMessage: (
    conversationId,
    message,
    replyToMessageId = null,
    forwardedFromMessageId = null,
  ) =>
    api.post(`/messages/conversations/${conversationId}`, {
      message,
      replyToMessageId,
      forwardedFromMessageId,
    }),

  deleteForEveryone: (messageId) =>
    api.delete(`/messages/${messageId}/everyone`),

  reactMessage: (messageId, emoji) =>
    api.post(`/messages/${messageId}/react`, { emoji }),
  deleteConversation: (conversationId) =>
    api.delete(`/messages/conversations/${conversationId}`),
};

// Admin Reporting Services
export const adminService = {
  getReport: () => api.get("/admin/report"),
  getSection: (sectionName, limit = 500) =>
    api.get(`/admin/sections/${sectionName}`, { params: { limit } }),
  getTable: (tableName, limit = 200) =>
    api.get(`/admin/tables/${tableName}`, { params: { limit } }),
  downloadTableUrl: (tableName) =>
    `${API_BASE_URL}/admin/tables/${tableName}/download`,
  deleteRow: (tableName, id) => api.delete(`/admin/tables/${tableName}/${id}`),
};

// Search and Filter Services
export const searchService = {
  search: (query) => api.get("/search", { params: { q: query } }),
  filter: (filters) => api.get("/profiles/filter", { params: filters }),
};

let socket;

export const socketService = {
  connect: () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    if (!socket) {
      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
      });
    }

    return socket;
  },
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },
  getSocket: () => socket,
};

export default api;
