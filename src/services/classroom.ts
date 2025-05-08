import api from './api';
import {
  ClassroomDTO,
  CreateClassroomRequestDTO,
  UpdateClassroomRequestDTO,
  EnrollStudentRequestDTO,
  AssignGameRequestDTO,
  AssignedGameDTO,
  LeaderboardEntryDTO
} from '../types';

export const classroomService = {
  // Teacher endpoints
  createClassroom: async (data: CreateClassroomRequestDTO): Promise<ClassroomDTO> => {
    const response = await api.post('/classrooms', data);
    return response.data;
  },

  updateClassroom: async (classroomId: string, data: UpdateClassroomRequestDTO): Promise<ClassroomDTO> => {
    const response = await api.put(`/classrooms/${classroomId}`, data);
    return response.data;
  },

  getTeacherClassrooms: async (): Promise<ClassroomDTO[]> => {
    const response = await api.get('/classrooms/teaching');
    return response.data;
  },

  // Student endpoints
  enrollInClassroom: async (data: EnrollStudentRequestDTO): Promise<ClassroomDTO> => {
    const response = await api.post('/classrooms/enroll', data);
    return response.data;
  },

  getEnrolledClassrooms: async (): Promise<ClassroomDTO[]> => {
    const response = await api.get('/classrooms/enrolled');
    return response.data;
  },

  // Game management
  assignGame: async (classroomId: string, data: AssignGameRequestDTO): Promise<AssignedGameDTO> => {
    const response = await api.post(`/classrooms/${classroomId}/games`, data);
    return response.data;
  },

  getAssignedGames: async (classroomId: string): Promise<AssignedGameDTO[]> => {
    const response = await api.get(`/classrooms/${classroomId}/games`);
    return response.data;
  },

  // Leaderboard
  getClassroomLeaderboard: async (classroomId: string): Promise<LeaderboardEntryDTO[]> => {
    const response = await api.get(`/classrooms/${classroomId}/leaderboard`);
    return response.data;
  },

  getGameLeaderboard: async (classroomId: string, gameId: string): Promise<LeaderboardEntryDTO[]> => {
    const response = await api.get(`/classrooms/${classroomId}/games/${gameId}/leaderboard`);
    return response.data;
  }
};