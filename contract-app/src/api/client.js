import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 추가
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 - 401 처리
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;

// Auth API
export const authAPI = {
  signup: (data) => client.post('/api/auth/signup', data),
  join: (data) => client.post('/api/auth/join', data),
  login: (data) => client.post('/api/auth/login', data),
  me: () => client.get('/api/auth/me'),
};

// Members API
export const membersAPI = {
  getMembers: () => client.get('/api/members'),
  updateStatus: (userId, status) => client.patch(`/api/members/${userId}/status`, { status }),
  invite: (email) => client.post('/api/members/invite', { email }),
  getInvitations: () => client.get('/api/members/invitations'),
  deleteInvitation: (id) => client.delete(`/api/members/invitations/${id}`),
  acceptInvitation: (data) => client.post('/api/members/accept-invitation', data),
  getCompanyInfo: () => client.get('/api/members/company'),
  updateCompanyInfo: (data) => client.patch('/api/members/company', data),
};

// Documents API
export const documentsAPI = {
  getDocuments: () => client.get('/api/documents'),
  getDocument: (id) => client.get(`/api/documents/${id}`),
  createDocument: (data) => client.post('/api/documents', data),
  updateDocument: (id, data) => client.patch(`/api/documents/${id}`, data),
  deleteDocument: (id) => client.delete(`/api/documents/${id}`),
};

// Files API (서류 보관함)
export const filesAPI = {
  getFiles: () => client.get('/api/files'),
  uploadFile: (data) => client.post('/api/files', data),
  deleteFile: (fileType) => client.delete(`/api/files/${encodeURIComponent(fileType)}`),
};

// Employees API (직원 관리)
export const employeesAPI = {
  getEmployees: () => client.get('/api/employees'),
  getEmployee: (id) => client.get(`/api/employees/${id}`),
  createEmployee: (data) => client.post('/api/employees', data),
  updateEmployee: (id, data) => client.patch(`/api/employees/${id}`, data),
  deleteEmployee: (id) => client.delete(`/api/employees/${id}`),
};
