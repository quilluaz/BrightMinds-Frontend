import React from 'react';
import { Trophy } from 'lucide-react';
import { LeaderboardEntry } from '../../types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  highlightedUserId?: string;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ entries, highlightedUserId }) => {
  const getTrophyColor = (rank: number): string => {
    switch (rank) {
      case 1: return 'text-yellow-400 dark:text-yellow-300'; // Gold
      case 2: return 'text-gray-400 dark:text-gray-500';   // Silver (adjusted dark for better visibility)
      case 3: return 'text-amber-600 dark:text-amber-500';  // Bronze
      default: return 'text-gray-300 dark:text-gray-600';
    }
  };

  return (
    // Main container for the table
    <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm overflow-hidden border dark:border-gray-700">
      <table className="min-w-full">
        <thead>
          {/* Table header row styling */}
          <tr className="bg-primary-interactive bg-opacity-10 dark:bg-primary-interactive-dark dark:bg-opacity-20">
            <th className="py-3 px-4 text-left text-sm font-semibold text-primary-text dark:text-primary-text-dark">Rank</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-primary-text dark:text-primary-text-dark">Student</th>
            <th className="py-3 px-4 text-right text-sm font-semibold text-primary-text dark:text-primary-text-dark">Score</th>
          </tr>
        </thead>
        {/* Table body styling, including row dividers */}
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {entries.map((entry) => (
            <tr 
              key={entry.studentId} 
              // Row styling for default, hover, and highlighted user
              className={`${
                entry.studentId === highlightedUserId 
                  ? 'bg-primary-accent bg-opacity-10 dark:bg-primary-accent-dark dark:bg-opacity-20' 
                  : 'hover:bg-gray-50 dark:hover:bg-slate-700'
              } transition-colors`}
            >
              <td className="py-3 px-4 whitespace-nowrap">
                <div className="flex items-center">
                  {entry.rank <= 3 ? (
                    <Trophy size={16} className={`mr-1 ${getTrophyColor(entry.rank)}`} />
                  ) : (
                    // Text color for rank numbers
                    <span className="w-6 text-center text-primary-text dark:text-primary-text-dark">{entry.rank}</span>
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
                  {/* Student name text color and font weight for highlighted user */}
                  <span className={`${entry.studentId === highlightedUserId ? 'font-semibold' : ''} text-primary-text dark:text-primary-text-dark`}>
                    {entry.studentName}
                  </span>
                  {/* "You" badge styling */}
                  {entry.studentId === highlightedUserId && (
                    <span className="ml-2 text-xs bg-primary-accent dark:bg-primary-accent-dark text-primary-text dark:text-black px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>
              </td>
              {/* Score text color */}
              <td className="py-3 px-4 text-right whitespace-nowrap font-semibold text-primary-text dark:text-primary-text-dark">
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