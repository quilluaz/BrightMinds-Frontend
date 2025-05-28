import React from 'react';
import { BarChart2, Users, Award, Clock } from 'lucide-react';
import { LeaderboardEntry, AssignedGameDTO } from '../../types';

interface ClassroomStatisticsProps {
  leaderboard: LeaderboardEntry[];
  assignedGames: AssignedGameDTO[];
  averageScore: number | null;
  totalStudents: number;
}

const ClassroomStatistics: React.FC<ClassroomStatisticsProps> = ({
  leaderboard,
  assignedGames,
  averageScore,
  totalStudents,
}) => {
  // Calculate statistics
  const totalGames = assignedGames.length;
  const completedGames = assignedGames.filter(game => game.status === 'COMPLETED').length;
  const highestScore = leaderboard.length > 0 ? Math.max(...leaderboard.map(entry => entry.score)) : 0;
  const lowestScore = leaderboard.length > 0 ? Math.min(...leaderboard.map(entry => entry.score)) : 0;

  const stats = [
    {
      title: 'Average Score',
      value: averageScore?.toString() || '0',
      icon: BarChart2,
      color: 'text-blue-500',
    },
    {
      title: 'Total Students',
      value: totalStudents.toString(),
      icon: Users,
      color: 'text-green-500',
    },
    {
      title: 'Highest Score',
      value: highestScore.toString(),
      icon: Award,
      color: 'text-yellow-500',
    },
    {
      title: 'Games Completed',
      value: `${completedGames}/${totalGames}`,
      icon: Clock,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-6 border dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-semibold text-primary-text dark:text-primary-text-dark">
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Score Distribution */}
      <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-6 border dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-primary-text dark:text-primary-text-dark">
          Score Distribution
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Lowest: {lowestScore} pts</span>
            <span>Highest: {highestScore} pts</span>
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500"
              style={{
                width: `${((averageScore || 0) / highestScore) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-6 border dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-primary-text dark:text-primary-text-dark">
          Performance Insights
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Completion Rate</span>
            <span className="font-semibold text-primary-text dark:text-primary-text-dark">
              {totalGames > 0 ? `${Math.round((completedGames / totalGames) * 100)}%` : '0%'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Score Range</span>
            <span className="font-semibold text-primary-text dark:text-primary-text-dark">
              {lowestScore} - {highestScore} pts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomStatistics; 