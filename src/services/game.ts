import api from './api';
import { GameDTO, StudentGameAttemptDTO } from '../types';

// Define an interface for the raw game object received from the backend
interface BackendGame {
  activityId: number;
  activityName: string;
  description?: string;
  subject?: string;
  gameMode?: GameDTO['gameMode'];
  isPremade?: boolean;
  maxScore?: number;
  maxExp?: number;
  gameData?: string;
}

interface CreateGameDTO {
  activityName: string;
  description?: string;
  subject?: string;
  gameMode: GameDTO['gameMode'];
  isPremade: boolean;
  maxScore: number;
  maxExp: number;
  gameData: string;
}

export const gameService = {
  getLibraryGames: async (): Promise<GameDTO[]> => {
    const response = await api.get<BackendGame[]>('/games');
    return response.data.map(backendGame => ({
      id: backendGame.activityId.toString(),
      title: backendGame.activityName,
      description: backendGame.description,
      subject: backendGame.subject,
      gameMode: backendGame.gameMode,
      isPremade: backendGame.isPremade,
      maxScore: backendGame.maxScore,
      maxExp: backendGame.maxExp,
      gameData: backendGame.gameData,
    }));
  },

  getPremadeGames: async (): Promise<GameDTO[]> => {
    const response = await api.get<BackendGame[]>('/games/premade');
    return response.data.map(backendGame => ({
      id: backendGame.activityId.toString(),
      title: backendGame.activityName,
      description: backendGame.description,
      subject: backendGame.subject,
      gameMode: backendGame.gameMode,
      isPremade: backendGame.isPremade,
      maxScore: backendGame.maxScore,
      maxExp: backendGame.maxExp,
      gameData: backendGame.gameData,
    }));
  },

  getGameById: async (gameId: string): Promise<GameDTO> => {
    const response = await api.get<BackendGame>(`/games/${gameId}`);
    const backendGame = response.data;
    return {
      id: backendGame.activityId.toString(),
      title: backendGame.activityName,
      description: backendGame.description,
      subject: backendGame.subject,
      gameMode: backendGame.gameMode,
      isPremade: backendGame.isPremade,
      maxScore: backendGame.maxScore,
      maxExp: backendGame.maxExp,
      gameData: backendGame.gameData,
    };
  },

  submitGameAttempt: async (data: Omit<StudentGameAttemptDTO, 'id' | 'createdAt'>): Promise<StudentGameAttemptDTO> => {
    // The backend expects /api/attempts/submit based on AttemptController.java
    const response = await api.post('/attempts/submit', data);
    return response.data;
  },

  // MODIFIED: Now requires studentId
  getMyAttempts: async (assignedGameId: string, studentId: string): Promise<StudentGameAttemptDTO[]> => {
    if (!studentId) {
      console.error("getMyAttempts: studentId is required.");
      return []; // Or throw an error
    }
    // Calls the endpoint: /api/attempts/assignment/{assignedGameId}/student/{studentId}
    const response = await api.get(`/attempts/assignment/${assignedGameId}/student/${studentId}`);
    return response.data;
  },

  createGame: async (gameData: CreateGameDTO): Promise<GameDTO> => {
    const response = await api.post<BackendGame>('/games', gameData);
    const backendGame = response.data;
    return {
      id: backendGame.activityId.toString(),
      title: backendGame.activityName,
      description: backendGame.description,
      subject: backendGame.subject,
      gameMode: backendGame.gameMode,
      isPremade: backendGame.isPremade,
      maxScore: backendGame.maxScore,
      maxExp: backendGame.maxExp,
      gameData: backendGame.gameData,
    };
  }
};