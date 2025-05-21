import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { playSound, SoundType, CelebrationAnimation, GameCompleteCelebration, animationStyles } from './GameConfigurations';

// Color Palette
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

interface Choice {
  id: string;
  imagePlaceholderText: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  questionText: string;
  choices: Choice[];
}

const questionsData: Question[] = [
  {
    id: 1,
    questionText: 'Aling larawan ang nagpapakita ng pamumuhay sa tabing-ilog?',
    choices: [
      { id: 'A', imagePlaceholderText: '/images/multiple-choice/river1.jpg', isCorrect: true },
      { id: 'B', imagePlaceholderText: '/images/multiple-choice/tower1.jpg', isCorrect: false },
      { id: 'C', imagePlaceholderText: '/images/multiple-choice/rice-fields1.jpg', isCorrect: false },
      { id: 'D', imagePlaceholderText: '/images/multiple-choice/factory1.jpg', isCorrect: false },
    ],
  },
  {
    id: 2,
    questionText: 'Alin sa mga ito ang nagpapakita ng hanapbuhay sa may bundok?',
    choices: [
      { id: 'A', imagePlaceholderText: '/images/multiple-choice/fish2.jpg', isCorrect: false },
      { id: 'B', imagePlaceholderText: '/images/multiple-choice/carpentry2.jpg', isCorrect: false },
      { id: 'C', imagePlaceholderText: '/images/multiple-choice/farm2.jpg', isCorrect: true },
      { id: 'D', imagePlaceholderText: '/images/multiple-choice/jeepney2.jpg', isCorrect: false },
    ],
  },
 /* {
    id: 3,
    questionText: 'Ano ang tawag sa uri ng pamumuhay na simple at tahimik sa lalawigan?',
    choices: [
      { id: 'A', imagePlaceholderText: 'Placeholder: Mataas na pamumuhay', isCorrect: false },
      { id: 'B', imagePlaceholderText: 'Placeholder: Modernong pamumuhay', isCorrect: false },
      { id: 'C', imagePlaceholderText: 'Placeholder: Payak na pamumuhay', isCorrect: true },
      { id: 'D', imagePlaceholderText: 'Placeholder: Masayang pamumuhay', isCorrect: false },
    ],
  },*/
  {
    id: 3,
    questionText: 'Anong produkto ang karaniwang nakukuha sa pangingisda?',
    choices: [
      { id: 'A', imagePlaceholderText: '/images/multiple-choice/pigs3.jpg', isCorrect: false },
      { id: 'B', imagePlaceholderText: '/images/multiple-choice/chickens3.jpg', isCorrect: false },
      { id: 'C', imagePlaceholderText: '/images/multiple-choice/fish3.jpg', isCorrect: true },
      { id: 'D', imagePlaceholderText: '/images/multiple-choice/bananas3.jpg', isCorrect: false },
    ],
  },
  {
    id: 4,
    questionText: 'Alin ang hanapbuhay na hindi karaniwan sa lalawigan?',
    choices: [
      { id: 'A', imagePlaceholderText: '/images/multiple-choice/farmer4.jpg', isCorrect: false },
      { id: 'B', imagePlaceholderText: '/images/multiple-choice/pangagalakal4.jpg', isCorrect: false },
      { id: 'C', imagePlaceholderText: '/images/multiple-choice/agent4.jpg', isCorrect: true },
      { id: 'D', imagePlaceholderText: '/images/multiple-choice/fisherman4.jpg', isCorrect: false },
    ],
  },
 /* {
    id: 6,
    questionText: 'Ano ang ginagawa ng mangingisda pagkatapos manghuli ng isda?',
    choices: [
      { id: 'A', imagePlaceholderText: 'Placeholder: Itinatago ito', isCorrect: false },
      { id: 'B', imagePlaceholderText: 'Placeholder: Itinitinda sa palengke', isCorrect: true },
      { id: 'C', imagePlaceholderText: 'Placeholder: Itinatapon', isCorrect: false },
      { id: 'D', imagePlaceholderText: 'Placeholder: Ibinibigay sa zoo', isCorrect: false },
    ],
  },
  {
    id: 7,
    questionText: 'Anong larawan ang nagpapakita ng pagtatanim ng gulay?',
    choices: [
      { id: 'A', imagePlaceholderText: 'Placeholder: Lalaking may lambat', isCorrect: false },
      { id: 'B', imagePlaceholderText: 'Placeholder: Batang nagbubungkal ng lupa', isCorrect: true },
      { id: 'C', imagePlaceholderText: 'Placeholder: Babaeng namamalengke', isCorrect: false },
      { id: 'D', imagePlaceholderText: 'Placeholder: Lolo na nagbabasa', isCorrect: false },
    ],
  },*/
  {
    id: 5,
    questionText: 'Anong hanapbuhay ang makikita sa kagubatan?',
    choices: [
      { id: 'A', imagePlaceholderText: '/images/multiple-choice/pangangahoy5.jpg', isCorrect: true },
      { id: 'B', imagePlaceholderText: '/images/multiple-choice/cooking5.jpg', isCorrect: false },
      { id: 'C', imagePlaceholderText: '/images/multiple-choice/painting5.jpg', isCorrect: false },
      { id: 'D', imagePlaceholderText: '/images/multiple-choice/paglalako5.jpg', isCorrect: false },
    ],
  },
  /*{
    id: 9,
    questionText: 'Ano ang karaniwang tanim sa mga lalawigan?',
    choices: [
      { id: 'A', imagePlaceholderText: '/assets/multiple-choice/rice-fields1.jpg', isCorrect: true },
      { id: 'B', imagePlaceholderText: 'Placeholder: Mansanas', isCorrect: false },
      { id: 'C', imagePlaceholderText: 'Placeholder: Ubas', isCorrect: false },
      { id: 'D', imagePlaceholderText: 'Placeholder: Repolyo', isCorrect: false },
    ],
  },*/
  {
    id: 6,
    questionText: 'Alin sa mga ito ang pamumuhay sa kabundukan?',
    choices: [
      { id: 'A', imagePlaceholderText: '/images/multiple-choice/farmer4.jpg', isCorrect: false },
      { id: 'B', imagePlaceholderText: '/images/multiple-choice/fisherman4.jpg', isCorrect: false },
      { id: 'C', imagePlaceholderText: '/images/multiple-choice/pagkakahoy6.jpg', isCorrect: true },
      { id: 'D', imagePlaceholderText: '/images/multiple-choice/paglalako5.jpg', isCorrect: false },
    ],
  },
  {
    id: 7,
    questionText: 'Ano ang pangunahing hanapbuhay sa palayan?',
    choices: [
      { id: 'A', imagePlaceholderText: '/images/multiple-choice/fisherman4.jpg', isCorrect: false },
      { id: 'B', imagePlaceholderText: '/images/multiple-choice/farmer4.jpg', isCorrect: true },
      { id: 'C', imagePlaceholderText: '/images/multiple-choice/pagkakahoy6.jpg', isCorrect: false },
      { id: 'D', imagePlaceholderText: '/images/multiple-choice/paglalako5.jpg', isCorrect: false },
    ],
  },
  {
    id: 8,
    questionText: 'Anong hanapbuhay ang karaniwang makikita sa tabing-dagat?',
    choices: [
      { id: 'A', imagePlaceholderText: '/images/multiple-choice/fisherman4.jpg', isCorrect: true },
      { id: 'B', imagePlaceholderText: '/images/multiple-choice/farmer4.jpg', isCorrect: false },
      { id: 'C', imagePlaceholderText: '/images/multiple-choice/pagkakahoy6.jpg', isCorrect: false },
      { id: 'D', imagePlaceholderText: '/images/multiple-choice/paglalako5.jpg', isCorrect: false },
    ],
  },
 /*  {
    id: 13,
    questionText: 'Alin sa mga ito ang gawain sa pamayanan?',
    choices: [
      { id: 'A', imagePlaceholderText: 'Placeholder: Paglilinis ng kalsada', isCorrect: true },
      { id: 'B', imagePlaceholderText: 'Placeholder: Panonood ng sine', isCorrect: false },
      { id: 'C', imagePlaceholderText: 'Placeholder: Pagkain sa fast food', isCorrect: false },
      { id: 'D', imagePlaceholderText: 'Placeholder: Pamamasyal', isCorrect: false },
    ],
  },*/
  {
    id: 9,
    questionText: 'Anong hayop ang karaniwang kasama sa bukid?',
    choices: [
      { id: 'A', imagePlaceholderText: '/images/multiple-choice/carabao9.jpg', isCorrect: true },
      { id: 'B', imagePlaceholderText: '/images/multiple-choice/cat9.jpg', isCorrect: false },
      { id: 'C', imagePlaceholderText: '/images/multiple-choice/dog9.jpg', isCorrect: false },
      { id: 'D', imagePlaceholderText: '/images/multiple-choice/bird9.jpg', isCorrect: false },
    ],
  },
  {
    id: 10,
    questionText: 'Alin sa mga ito ang anyong lupa?',
    choices: [
      { id: 'A', imagePlaceholderText: '/images/multiple-choice/dagat10.jpg', isCorrect: false },
      { id: 'B', imagePlaceholderText: '/images/multiple-choice/bundok10.jpg', isCorrect: true },
      { id: 'C', imagePlaceholderText: '/images/multiple-choice/ilog10.jpg', isCorrect: false },
      { id: 'D', imagePlaceholderText: '/images/multiple-choice/falls10.jpg', isCorrect: false },
    ],
  },
];

const ImageMultipleChoiceGame: React.FC = () => {
  const { theme } = useTheme();
  const colors = COLORS[theme];
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showGameCompleteCelebration, setShowGameCompleteCelebration] = useState(false);

  const currentQuestion = questionsData[currentQuestionIndex];

  const handleStartGame = () => {
    playSound('click');
    setHasGameStarted(true);
  };

  const handleAnswerSelection = (choiceId: string) => {
    if (showFeedback) return;

    playSound('click');

    const choice = currentQuestion.choices.find(c => c.id === choiceId);
    if (choice) {
      setSelectedAnswer(choiceId);
      const correct = choice.isCorrect;
      setIsAnswerCorrect(correct);
      if (correct) {
        playSound('correct');
        setScore(prevScore => prevScore + 1);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      } else {
        playSound('incorrect');
      }
      setShowFeedback(true);

      setTimeout(() => {
        setShowFeedback(false);
        setSelectedAnswer(null);
        if (currentQuestionIndex < questionsData.length - 1) {
          setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        } else {
          playSound('gameComplete');
          setShowGameCompleteCelebration(true);
          setShowScore(true);
        }
      }, 2000);
    }
  };

  const restartGame = () => {
    playSound('click');
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowScore(false);
    setShowGameCompleteCelebration(false);
    setHasGameStarted(false);
  };

  // Function to determine if the imagePlaceholderText is an actual image path
  const isImagePath = (text: string) => {
    return text.startsWith('/images/multiple-choice/') && text.endsWith('.jpg');
  };

  if (!hasGameStarted) {
    return (
      <div className={`bg-pattern min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-200`} style={{ color: colors.primaryText }}>
        <div className={`p-10 rounded-3xl shadow-xl text-center max-w-xl w-full transition-colors duration-200`} style={{ backgroundColor: colors.cardBackground }}>
          <h1 className="text-5xl sm:text-6xl font-bold mb-4" style={{ color: colors.primaryText }}>
            Welcome to
          </h1>
          <h2 className="text-4xl sm:text-5xl font-bold mb-8" style={{ color: colors.secondaryAccent }}>
            Identify the Correct Image!
          </h2>
          <p className="text-xl sm:text-xl mb-3 opacity-80" style={{ color: colors.primaryText }}>
            Subukan ang iyong kaalaman sa Araling Panlipunan at Tagalog sa masayang paraan!
          </p>
          <p className="text-xl sm:text-2xl mb-12 opacity-80" style={{ color: colors.primaryText }}>
            Choose the correct picture for each question.
          </p>
          <button
            onClick={handleStartGame}
            className="hover:bg-[#db8e00] text-white font-bold py-4 px-12 rounded-full text-2xl sm:text-3xl transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#DBD053] shadow-lg"
            style={{ backgroundColor: colors.secondaryAccent }}
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  if (showScore) {
    return (
      <div className={`bg-pattern min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-200`} style={{ color: colors.primaryText }}>
        {showGameCompleteCelebration && <GameCompleteCelebration />}
        <div className={`p-10 rounded-3xl shadow-xl text-center max-w-md w-full transition-colors duration-200`} style={{ backgroundColor: colors.cardBackground }}>
          <h2 className="text-5xl font-bold mb-6" style={{ color: colors.primaryAccent }}>The Game has Finished</h2>
          <p className="text-3xl mb-10" style={{ color: colors.primaryText }}>
            Your Score: <span className="font-bold text-4xl" style={{ color: colors.secondaryAccent }}>{score}</span> / {questionsData.length}
          </p>
          <button
            onClick={restartGame}
            className="hover:bg-[#5f6b9a] text-white font-bold py-4 px-10 rounded-full text-2xl transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#DBD053] shadow-lg"
            style={{ backgroundColor: colors.interactiveElements }}
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className={`bg-pattern min-h-screen flex items-center justify-center transition-colors duration-200`} style={{ color: colors.primaryText }}>Nagloloading ang laro...</div>;
  }

  return (
    <div className={`bg-pattern min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-200`} style={{ color: colors.primaryText }}>
      {showCelebration && <CelebrationAnimation />}
      <div className={`p-6 sm:p-10 rounded-3xl shadow-xl w-full max-w-3xl transition-colors duration-200`} style={{ backgroundColor: colors.cardBackground }}>
        <div className="mb-8 text-center">
          <p className="text-xl sm:text-2xl font-semibold mb-2" style={{ color: colors.interactiveElements }}>
            Tanong {currentQuestionIndex + 1} ng {questionsData.length}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: colors.primaryText }}>{currentQuestion.questionText}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {currentQuestion.choices.map(choice => (
            <button
              key={choice.id}
              onClick={() => handleAnswerSelection(choice.id)}
              disabled={showFeedback}
              className={`relative border-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none group p-6 pt-14 sm:p-8 sm:pt-16
                ${selectedAnswer === choice.id && showFeedback && isAnswerCorrect ? 'border-[#DBD053] ring-4 ring-[#DBD053]' : 'border-transparent'}
                ${selectedAnswer === choice.id && showFeedback && !isAnswerCorrect ? 'border-red-500 ring-4 ring-red-500' : selectedAnswer !== choice.id ? 'border-transparent' : ''}
                ${!selectedAnswer && !showFeedback ? 'focus:border-[#7A89C2]' : ''}
                ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={{ backgroundColor: colors.cardBackground, borderColor: colors.borderColor }}
            >
              <div className="absolute top-3 left-3 text-white text-lg font-bold w-10 h-10 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: colors.secondaryAccent }}>
                {choice.id}
              </div>
              <div className={`w-full h-48 sm:h-60 flex items-center justify-center rounded-xl mb-3 group-hover:${colors.hoverBg}`}>
                {isImagePath(choice.imagePlaceholderText) ? (
                  <img
                    src={choice.imagePlaceholderText}
                    alt={`Choice ${choice.id}`}
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.src = '/path/to/fallback-image.jpg';
                      console.error(`Failed to load image: ${choice.imagePlaceholderText}`);
                    }}
                  />
                ) : (
                  <span className={`text-lg px-2 text-center w-full h-full flex items-center justify-center rounded-xl`} style={{ color: colors.primaryText, backgroundColor: colors.neutralBackground }}>
                    {choice.imagePlaceholderText}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {showFeedback && (
          <div className={`mt-6 p-5 rounded-xl text-2xl font-semibold shadow-md text-center transition-colors duration-200
            ${isAnswerCorrect ? 'text-[#1A1B41]' : 'text-white'}`}
            style={{ backgroundColor: isAnswerCorrect ? colors.primaryAccent : 'rgb(239, 68, 68)' }}
          >
            {isAnswerCorrect ? 'Magaling! Tamang sagot!' : 'Oops! Subukan muli sa susunod.'}
          </div>
        )}
        
        <div className="mt-10 text-center">
          <p className="text-3xl font-bold" style={{ color: colors.secondaryAccent }}>Score: {score}</p>
        </div>
      </div>
    </div>
  );
};

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = animationStyles;
document.head.appendChild(styleSheet);

export default ImageMultipleChoiceGame;