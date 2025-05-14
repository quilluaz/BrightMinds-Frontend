// src/data/anyongTubigPairs.ts
import { MatchingPair } from '../types'; // This path ('../types') assumes your 'types/index.ts' is in 'src/types/'

// Change 'export default' at the bottom to 'export const' here
export const anyongTubigPairs: MatchingPair[] = [
    { id: 1, word: 'Ilog', imageUrl: '/images/anyong-tubig/ilog.jpg' },
    { id: 2, word: 'Lawa', imageUrl: '/images/anyong-tubig/lawa.jpg' },
    { id: 3, word: 'Dagat', imageUrl: '/images/anyong-tubig/dagat.jpg' },
    { id: 4, word: 'Talon', imageUrl: '/images/anyong-tubig/talon.jpg' },
    { id: 5, word: 'Look', imageUrl: '/images/anyong-tubig/look.jpg' },
    { id: 6, word: 'Bukal', imageUrl: '/images/anyong-tubig/bukal.jpg' },
    // Add more pairs relevant to your province! Aim for 6-12 pairs for a good game size.
];

// Remove the 'export default anyongTubigPairs;' line if you make the change above.