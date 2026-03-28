import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const orig = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || orig._retry) return Promise.reject(error);
    if (orig.url?.includes('/api/auth/')) return Promise.reject(error);

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        orig.headers.Authorization = `Bearer ${token}`;
        return api(orig);
      });
    }

    orig._retry = true;
    isRefreshing = true;
    try {
      const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
      const newToken = data.data.accessToken;
      localStorage.setItem('access_token', newToken);
      processQueue(null, newToken);
      orig.headers.Authorization = `Bearer ${newToken}`;
      return api(orig);
    } catch (e) {
      processQueue(e, null);
      localStorage.removeItem('access_token');
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

export const authApi = {
  register: (d: { name: string; email: string; password: string }) => api.post('/api/auth/register', d),
  login: (d: { email: string; password: string }) => api.post('/api/auth/login', d),
  logout: () => api.post('/api/auth/logout'),
  refresh: () => api.post('/api/auth/refresh'),
  me: () => api.get('/api/auth/me'),
};

export const transactionsApi = {
  list: (params?: Record<string, unknown>) => api.get('/api/transactions', { params }),
  getById: (id: string) => api.get(`/api/transactions/${id}`),
  create: (data: Record<string, unknown>) => api.post('/api/transactions', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/api/transactions/${id}`, data),
  delete: (id: string) => api.delete(`/api/transactions/${id}`),
};

export const categoriesApi = {
  list: () => api.get('/api/categories'),
  getById: (id: string) => api.get(`/api/categories/${id}`),
  create: (data: Record<string, unknown>) => api.post('/api/categories', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/api/categories/${id}`, data),
  delete: (id: string) => api.delete(`/api/categories/${id}`),
};

export const analyticsApi = {
  overview: (params?: Record<string, unknown>) => api.get('/api/analytics/overview', { params }),
  monthly: (params?: Record<string, unknown>) => api.get('/api/analytics/monthly', { params }),
  categories: (params?: Record<string, unknown>) => api.get('/api/analytics/categories', { params }),
  trend: (params?: Record<string, unknown>) => api.get('/api/analytics/trend', { params }),
};

export const budgetsApi = {
  list: () => api.get('/api/budgets'),
  summary: () => api.get('/api/budgets/summary'),
  create: (data: Record<string, unknown>) => api.post('/api/budgets', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/api/budgets/${id}`, data),
  delete: (id: string) => api.delete(`/api/budgets/${id}`),
};

export const userApi = {
  updateProfile: (data: Record<string, unknown>) => api.put('/api/user/profile', data),
  changePassword: (data: Record<string, unknown>) => api.put('/api/user/password', data),
  deleteAccount: (password: string) => api.delete('/api/user/account', { data: { password } }),
};
