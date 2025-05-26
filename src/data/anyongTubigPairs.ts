// src/data/anyongTubigPairs.ts
import { MatchingPair } from '../types'; // This path ('../types') assumes your 'types/index.ts' is in 'src/types/'

// Change 'export default' at the bottom to 'export const' here
export const anyongTubigPairs: MatchingPair[] = [
    { id: 1, word: 'Ilog', english: 'River',  imageUrl: '/images/matching-card/ilog.jpg' },
    { id: 2, word: 'Lawa', english: 'Lake', imageUrl: '/images/matching-card/lawa.jpg' },
    { id: 3, word: 'Dagat', english: 'Sea', imageUrl: '/images/matching-card/dagat.jpg' },
    { id: 4, word: 'Talon', english: 'Waterfall', imageUrl: '/images/matching-card/talon.jpg' },
    { id: 5, word: 'Look', english: 'Bay', imageUrl: '/images/matching-card/look.jpg' },
    { id: 6, word: 'Bukal', english: 'Spring', imageUrl: '/images/matching-card/bukal.jpg' },
    
];

// Remove the 'export default anyongTubigPairs;' line if you make the change above.