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

export const gameService = {
  getLibraryGames: async (): Promise<GameDTO[]> => {
    const response = await api.get<BackendGame[]>('/games/premade');
    // Map the backend response to the frontend GameDTO structure
    return response.data.map(backendGame => ({
      id: backendGame.activityId.toString(), // Convert to string if your GameDTO id is string
      title: backendGame.activityName,       // Explicitly map activityName to title
      description: backendGame.description,
      subject: backendGame.subject,
      gameMode: backendGame.gameMode,
      isPremade: backendGame.isPremade,
      // questions: [], // Assuming questions are not sent in the library preview
                       // or map them if they are part of BackendGame and GameDTO
      // maxScore: backendGame.maxScore, // Map if needed in GameDTO
      // maxExp: backendGame.maxExp,     // Map if needed in GameDTO
      // gameData: backendGame.gameData, // Map if needed in GameDTO
    }));
  },

  getGameById: async (gameId: string): Promise<GameDTO> => {
    // Similar mapping might be needed here if the single game response also uses activityName
    const response = await api.get<BackendGame>(`/games/${gameId}`);
    const backendGame = response.data;
    return {
      id: backendGame.activityId.toString(),
      title: backendGame.activityName,
      description: backendGame.description,
      subject: backendGame.subject,
      gameMode: backendGame.gameMode,
      isPremade: backendGame.isPremade,
      // questions: parseGameDataIfNeeded(backendGame.gameData), // Example
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
  }
};