import api from './api';
import { CreateUserRequestDTO, UpdateUserRequestDTO, UserDTO } from '../types';

export const authService = {
  register: async (data: CreateUserRequestDTO): Promise<UserDTO> => {
    const response = await api.post('/users/register', data);
    return response.data;
  },

  login: async (email: string, password: string): Promise<UserDTO> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getCurrentUser: async (): Promise<UserDTO> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (userId: string, data: UpdateUserRequestDTO): Promise<UserDTO> => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('firebase_token');
  }
};