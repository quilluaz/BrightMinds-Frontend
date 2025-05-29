import api from './api';
import {
  ClassroomDTO,
  CreateClassroomRequestDTO,
  UpdateClassroomRequestDTO,
  EnrollStudentRequestDTO,
  AssignGameRequestDTO,
  AssignedGameDTO,
  LeaderboardEntryDTO, // Assuming this type exists or is similar to BackendLeaderboardEntryStructure
  UpdateAssignedGameRequestDTO, // Added
} from '../types';

export const classroomService = {
  // ... existing methods ...

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

  enrollInClassroom: async (data: EnrollStudentRequestDTO): Promise<ClassroomDTO> => {
    const response = await api.post('/classrooms/enroll', data);
    return response.data;
  },

  getEnrolledClassrooms: async (): Promise<ClassroomDTO[]> => {
    const response = await api.get('/classrooms/enrolled');
    return response.data;
  },

  assignGame: async (classroomId: string, data: AssignGameRequestDTO): Promise<AssignedGameDTO> => {
    const response = await api.post(`/classrooms/${classroomId}/games`, data); // Corrected based on original context
    return response.data;
  },

  getAssignedGames: async (classroomId: string): Promise<AssignedGameDTO[]> => {
    const response = await api.get(`/classrooms/${classroomId}/games`);
    return response.data;
  },

  getClassroomLeaderboard: async (classroomId: string): Promise<LeaderboardEntryDTO[]> => {
    // Assuming LeaderboardEntryDTO is the expected return type from backend for this service
    const response = await api.get(`/classrooms/${classroomId}/leaderboard`);
    return response.data;
  },

  getGameLeaderboard: async (classroomId: string, gameId: string): Promise<LeaderboardEntryDTO[]> => {
    // Assuming LeaderboardEntryDTO is the expected return type
    const response = await api.get(`/classrooms/${classroomId}/games/${gameId}/leaderboard`);
    return response.data;
  },

  // --- NEW METHODS ---
  updateAssignedGame: async (
    classroomId: string, 
    assignedGameId: string, 
    data: UpdateAssignedGameRequestDTO
  ): Promise<AssignedGameDTO> => {
    const response = await api.put(`/classrooms/${classroomId}/assigned-games/${assignedGameId}`, data);
    // Assuming the backend returns the updated AssignedGameDTO
    return response.data;
  },

  deleteAssignedGame: async (classroomId: string, assignedGameId: string): Promise<void> => {
    await api.delete(`/classrooms/${classroomId}/assigned-games/${assignedGameId}`);
  },
};