import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export type GameMode = 'MATCHING' | 'IMAGE_MULTIPLE_CHOICE' | 'SORTING' | 'FOUR_PICS_ONE_WORD';

interface GameData {
  activityName: string;
  maxScore: number;
  maxExp: number;
  isPremade: boolean;
  gameMode: GameMode;
  gameData: string;
  createdBy: {
    id: number;
  };
}

export const gameService = {
  createGame: async (gameData: GameData) => {
    try {
      const response = await axios.post(`${API_URL}/games`, gameData);
      return response.data;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  },
}; 