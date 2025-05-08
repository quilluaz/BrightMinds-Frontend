import React from 'react';
import { Trophy } from 'lucide-react';
import { LeaderboardEntry } from '../../types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  highlightedUserId?: string;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ entries, highlightedUserId }) => {
  // Function to get trophy color
  const getTrophyColor = (rank: number): string => {
    switch (rank) {
      case 1: return 'text-yellow-500'; // Gold
      case 2: return 'text-gray-400';   // Silver
      case 3: return 'text-amber-700';  // Bronze
      default: return 'text-gray-300';  // Default
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="min-w-full">
        <thead>
          <tr className="bg-primary-interactive bg-opacity-10">
            <th className="py-3 px-4 text-left text-sm font-semibold text-primary-text">Rank</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-primary-text">Student</th>
            <th className="py-3 px-4 text-right text-sm font-semibold text-primary-text">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entries.map((entry) => (
            <tr 
              key={entry.studentId} 
              className={`${
                entry.studentId === highlightedUserId 
                  ? 'bg-primary-accent bg-opacity-10' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <td className="py-3 px-4 whitespace-nowrap">
                <div className="flex items-center">
                  {entry.rank <= 3 ? (
                    <Trophy size={16} className={`mr-1 ${getTrophyColor(entry.rank)}`} />
                  ) : (
                    <span className="w-6 text-center">{entry.rank}</span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 whitespace-nowrap">
                <div className="flex items-center">
                  {entry.avatarUrl && (
                    <img 
                      src={entry.avatarUrl} 
                      alt={entry.studentName} 
                      className="w-6 h-6 rounded-full mr-2"
                    />
                  )}
                  <span className={entry.studentId === highlightedUserId ? 'font-semibold' : ''}>
                    {entry.studentName}
                  </span>
                  {entry.studentId === highlightedUserId && (
                    <span className="ml-2 text-xs bg-primary-accent text-primary-text px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-right whitespace-nowrap font-semibold">
                {entry.score} pts
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;