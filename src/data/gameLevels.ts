// src/data/gameLevels.ts
import { MatchingPair } from '../types';
import { anyongTubigPairs } from './anyongTubigPairs';
import { anyongLupaPairs } from './anyongLupaPairs';
import { pambansangSagisagPairs } from './pambansangSagisagPairs';

export interface LevelConfiguration {
  level: number;
  title: string; // e.g., "Anyong Tubig", "Anyong Lupa"
  pairs: MatchingPair[];
  // You could add other level-specific settings here in the future
}

export const gameLevels: LevelConfiguration[] = [
  {
    level: 1,
    title: 'Anyong Tubig',
    pairs: anyongTubigPairs,
  },
  {
    level: 2,
    title: 'Anyong Lupa',
    pairs: anyongLupaPairs, 
  },
  { 
    level: 3,
    title: 'Mga Pambansang Sagisag',
    pairs: pambansangSagisagPairs,
  },
];