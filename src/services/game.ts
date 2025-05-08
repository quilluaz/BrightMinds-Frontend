import api from './api';
import { GameDTO, StudentGameAttemptDTO } from '../types';

export const gameService = {
  getLibraryGames: async (): Promise<GameDTO[]> => {
    const response = await api.get('/games/library');
    return response.data;
  },

  getGameById: async (gameId: string): Promise<GameDTO> => {
    const response = await api.get(`/games/library/${gameId}`);
    return response.data;
  },

  submitGameAttempt: async (data: Omit<StudentGameAttemptDTO, 'id' | 'createdAt'>): Promise<StudentGameAttemptDTO> => {
    const response = await api.post('/game-attempts', data);
    return response.data;
  },

  getMyAttempts: async (assignedGameId: string): Promise<StudentGameAttemptDTO[]> => {
    const response = await api.get(`/game-attempts/my-attempts`, {
      params: { assignedGameId }
    });
    return response.data;
  }
};