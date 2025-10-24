import api from './api';

export const authService = {
  // Registro de usuario
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Habilitar 2FA
  enable2FA: async () => {
    const response = await api.post('/auth/enable-2fa');
    return response.data;
  },

  // Verificar 2FA
  verify2FA: async (token) => {
    const response = await api.post('/auth/verify-2fa', { token });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Verificar si hay token
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};
