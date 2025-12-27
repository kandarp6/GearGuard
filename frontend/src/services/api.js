import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Equipment API
export const equipmentAPI = {
  getAll: () => api.get('/equipment'),
  getById: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  scrap: (id) => api.patch(`/equipment/${id}/scrap`),
  delete: (id) => api.delete(`/equipment/${id}`),
};

// Maintenance Teams API
export const teamsAPI = {
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
  getDetails: (id) => api.get(`/teams/${id}/details`),
};

// Technicians API
export const techniciansAPI = {
  getAll: () => api.get('/technicians'),
  getById: (id) => api.get(`/technicians/${id}`),
  getByTeam: (teamId) => api.get(`/technicians/team/${teamId}`),
};

// Maintenance Requests API
export const requestsAPI = {
  getAll: (params) => api.get('/requests', { params }),
  getById: (id) => api.get(`/requests/${id}`),
  create: (data) => api.post('/requests', data),
  updateStatus: (id, status, data = {}) => api.patch(`/requests/${id}/status`, { status, ...data }),
  assignTechnician: (id, technicianId) => api.patch(`/requests/${id}/assign`, { technician_id: technicianId }),
  update: (id, data) => api.put(`/requests/${id}`, data),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;

