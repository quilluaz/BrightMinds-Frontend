import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface GameLandingPageProps {
  title: string;
  subtitle: string;
  description: string;
  instruction: string;
  onStart: () => void;
  gameIcon?: string;
}

const COLORS = {
  light: {
    primaryBackground: '#E8F9FF',
    primaryText: '#1A1B41',
    interactiveElements: '#7A89C2',
    primaryAccent: '#DBD053',
    secondaryAccent: '#FFA500',
    neutralBackground: '#FFFFFF',
    cardBackground: '#FFFFFF',
    borderColor: 'transparent',
    hoverBg: 'bg-slate-200',
  },
  dark: {
    primaryBackground: '#1A1B41',
    primaryText: '#E8F9FF',
    interactiveElements: '#9BA8E5',
    primaryAccent: '#DBD053',
    secondaryAccent: '#FFA500',
    neutralBackground: '#2A2B51',
    cardBackground: '#2A2B51',
    borderColor: '#3A3B61',
    hoverBg: 'bg-slate-700',
  },
};

const GameLandingPage: React.FC<GameLandingPageProps> = ({
  title,
  subtitle,
  description,
  instruction,
  onStart,
  gameIcon
}) => {
  const { theme } = useTheme();
  const colors = COLORS[theme];

  return (
    <div className={`bg-pattern min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-200`} style={{ color: colors.primaryText }}>
      <div className={`p-10 rounded-3xl shadow-xl text-center max-w-xl w-full transition-colors duration-200`} style={{ backgroundColor: colors.cardBackground }}>
        {gameIcon && (
          <div className="mb-8 flex justify-center">
            <img src={gameIcon} alt={title} className="w-32 h-32 object-contain" />
          </div>
        )}
        <h1 className="text-5xl sm:text-6xl font-bold mb-4" style={{ color: colors.primaryText }}>
          Welcome to
        </h1>
        <h2 className="text-4xl sm:text-5xl font-bold mb-8" style={{ color: colors.secondaryAccent }}>
          {title}
        </h2>
        <p className="text-xl sm:text-xl mb-3 opacity-80" style={{ color: colors.primaryText }}>
          {subtitle}
        </p>
        <p className="text-xl sm:text-2xl mb-12 opacity-80" style={{ color: colors.primaryText }}>
          {description}
        </p>
        <p className="text-lg mb-8 italic" style={{ color: colors.interactiveElements }}>
          {instruction}
        </p>
        <button
          onClick={onStart}
          className="hover:bg-[#db8e00] text-white font-bold py-4 px-12 rounded-full text-2xl sm:text-3xl transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#DBD053] shadow-lg"
          style={{ backgroundColor: colors.secondaryAccent }}
        >
          Start
        </button>
      </div>
    </div>
  );
};

export default GameLandingPage; 