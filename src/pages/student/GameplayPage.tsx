import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, ArrowRight, Trophy } from 'lucide-react';
import Button from '../../components/common/Button';
import { useClassroom } from '../../context/ClassroomContext';
import { Game, GameQuestion } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const GameplayPage: React.FC = () => {
  const { classroomId, gameId } = useParams<{ classroomId: string; gameId: string }>();
  const navigate = useNavigate();
  const { games, submitGameResults } = useClassroom();
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds per question
  
  // Find the current game
  useEffect(() => {
    if (gameId) {
      const game = games.find(g => g.id === gameId);
      if (game) {
        setCurrentGame(game);
      }
    }
    
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [gameId, games]);
  
  // Timer logic
  useEffect(() => {
    if (isLoading || gameCompleted || isAnswerSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Time's up, auto-submit current answer
          handleAnswerSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isLoading, gameCompleted, isAnswerSubmitted, currentQuestionIndex]);
  
  // Reset timer when moving to next question
  useEffect(() => {
    if (!isLoading && !gameCompleted) {
      setTimeLeft(60);
    }
  }, [currentQuestionIndex, isLoading, gameCompleted]);
  
  if (isLoading || !currentGame) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  const currentQuestion = currentGame.questions[currentQuestionIndex];
  
  const handleOptionSelect = (optionId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(optionId);
  };
  
  const handleAnswerSubmit = () => {
    if (!selectedOptionId && !isAnswerSubmitted) {
      // If time's up and no answer selected, treat as incorrect
      setIsAnswerSubmitted(true);
      setIsCorrect(false);
      return;
    }
    
    if (isAnswerSubmitted) return;
    
    const selectedOption = currentQuestion.options.find(opt => opt.id === selectedOptionId);
    const correct = !!selectedOption?.isCorrect;
    
    setIsAnswerSubmitted(true);
    setIsCorrect(correct);
    
    if (correct) {
      // Add to score (calculate based on time left as a bonus)
      const timeBonus = Math.floor(timeLeft / 10); // 0-6 bonus points based on time
      const questionScore = 10 + timeBonus;
      setScore(prevScore => prevScore + questionScore);
    }
  };
  
  const handleNextQuestion = () => {
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    
    if (currentQuestionIndex < currentGame.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Game completed
      setGameCompleted(true);
      
      // Calculate final percentage score
      const finalPercentage = Math.round((score / (currentGame.questions.length * 10)) * 100);
      
      // Submit results
      if (classroomId) {
        submitGameResults(classroomId, currentGame.id, finalPercentage);
      }
    }
  };
  
  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / currentGame.questions.length) * 100;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {!gameCompleted ? (
        <>
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-primary-text">{currentGame.title}</h1>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center text-gray-600">
                <Clock size={18} className="mr-1" />
                <span>{timeLeft} seconds</span>
              </div>
              
              <div className="text-sm">
                Question {currentQuestionIndex + 1} of {currentGame.questions.length}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
              <div 
                className="bg-primary-interactive h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </header>
          
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4">{currentQuestion.text}</h2>
            
            {currentQuestion.imageUrl && (
              <div className="mb-6">
                <img 
                  src={currentQuestion.imageUrl} 
                  alt="Question illustration" 
                  className="rounded-lg max-h-60 mx-auto"
                />
              </div>
            )}
            
            <div className="space-y-3">
              {currentQuestion.options.map(option => (
                <button
                  key={option.id}
                  className={`
                    w-full text-left p-4 rounded-lg border transition-all
                    ${selectedOptionId === option.id 
                      ? 'border-primary-interactive bg-primary-interactive bg-opacity-10'
                      : 'border-gray-200 hover:border-primary-interactive hover:bg-gray-50'
                    }
                    ${isAnswerSubmitted && option.isCorrect ? 'bg-green-100 border-green-500' : ''}
                    ${isAnswerSubmitted && selectedOptionId === option.id && !option.isCorrect 
                      ? 'bg-red-100 border-red-500' 
                      : ''
                    }
                  `}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={isAnswerSubmitted}
                >
                  {option.text}
                  
                  {isAnswerSubmitted && option.isCorrect && (
                    <CheckCircle size={18} className="inline ml-2 text-green-600" />
                  )}
                  
                  {isAnswerSubmitted && selectedOptionId === option.id && !option.isCorrect && (
                    <XCircle size={18} className="inline ml-2 text-red-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            {!isAnswerSubmitted ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleAnswerSubmit}
                disabled={!selectedOptionId}
              >
                Submit Answer
              </Button>
            ) : (
              <div className="flex items-center">
                {isCorrect ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle size={20} className="mr-2" />
                    <span className="font-medium">Correct!</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircle size={20} className="mr-2" />
                    <span className="font-medium">Incorrect!</span>
                  </div>
                )}
              </div>
            )}
            
            {isAnswerSubmitted && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleNextQuestion}
                icon={<ArrowRight size={18} />}
              >
                {currentQuestionIndex < currentGame.questions.length - 1
                  ? 'Next Question'
                  : 'See Results'
                }
              </Button>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary-accent bg-opacity-20 text-primary-energetic rounded-full flex items-center justify-center animate-celebrate">
              <Trophy size={40} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Great Job!</h2>
          <p className="text-gray-600 mb-8">You've completed {currentGame.title}</p>
          
          <div className="mb-8">
            <div className="mx-auto w-40 h-40 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-primary-text">
                  {Math.round((score / (currentGame.questions.length * 10)) * 100)}%
                </span>
              </div>
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E8F9FF"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#7A89C2"
                  strokeWidth="3"
                  strokeDasharray={`${Math.round((score / (currentGame.questions.length * 10)) * 100)}, 100`}
                />
              </svg>
            </div>
            
            <p className="font-medium text-lg mt-4">Your Score: {score} points</p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(`/student/classrooms/${classroomId}`)}
            >
              Back to Classroom
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                // Reset the game to play again
                setCurrentQuestionIndex(0);
                setSelectedOptionId(null);
                setIsAnswerSubmitted(false);
                setScore(0);
                setGameCompleted(false);
                setTimeLeft(60);
              }}
            >
              Play Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameplayPage;