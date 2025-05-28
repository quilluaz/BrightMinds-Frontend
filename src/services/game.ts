import api from './api';
import { GameDTO, StudentGameAttemptDTO } from '../types';

// Define an interface for the raw game object received from the backend
// This helps ensure type safety during mapping.
interface BackendGame {
  activityId: number; // Assuming activityId is a number from backend
  activityName: string;
  description?: string;
  subject?: string;
  gameMode?: GameDTO['gameMode']; // Use GameDTO's gameMode type
  isPremade?: boolean;
  maxScore?: number;
  maxExp?: number;
  gameData?: string;
  // Add any other fields that your backend Game entity sends
}

// Interface for creating a new game
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
    // Map the backend response to the frontend GameDTO structure
    return response.data.map(backendGame => ({
      id: backendGame.activityId.toString(), // Convert to string if your GameDTO id is string
      title: backendGame.activityName,       // Explicitly map activityName to title
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
    const response = await api.post('/game-attempts', data);
    return response.data;
  },

  getMyAttempts: async (assignedGameId: string): Promise<StudentGameAttemptDTO[]> => {
    const response = await api.get(`/game-attempts/my-attempts`, { 
      params: { assignedGameId }
    });
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