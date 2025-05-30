// src/components/game/Selina/ImageMultipleChoiceGame.tsx
import React, { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import {
  playSound,
  SoundType,
  CelebrationAnimation,
  GameCompleteCelebration,
  animationStyles,
} from "./GameConfigurations";
import BackgroundMusic from "../BackgroundMusic";
import { AssignedGameDTO } from "../../../types"; // Import AssignedGameDTO
import { useNavigate } from "react-router-dom"; // For navigation if needed
import { API_BASE_URL } from "../../../config"; // Import the API base URL
import Button from "../../../components/common/Button";

// Color Palette (as originally provided)
const COLORS = {
  light: {
    primaryBackground: "#E8F9FF",
    primaryText: "#1A1B41",
    interactiveElements: "#7A89C2",
    primaryAccent: "#DBD053",
    secondaryAccent: "#FFA500",
    neutralBackground: "#FFFFFF",
    cardBackground: "#FFFFFF",
    borderColor: "transparent",
    hoverBg: "bg-slate-200",
  },
  dark: {
    primaryBackground: "#1A1B41",
    primaryText: "#E8F9FF",
    interactiveElements: "#9BA8E5",
    primaryAccent: "#DBD053",
    secondaryAccent: "#FFA500",
    neutralBackground: "#2A2B51",
    cardBackground: "#2A2B51",
    borderColor: "#3A3B61",
    hoverBg: "bg-slate-700",
  },
};

interface Choice {
  id: string;
  imagePlaceholderText: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  questionText: string;
  choices: Choice[];
}

interface GameData {
  questions: Question[];
}

// Original questionsData from the provided file
const questionsData: Question[] = [
  {
    id: "1",
    questionText: "Aling larawan ang nagpapakita ng pamumuhay sa tabing-ilog?",
    choices: [
      {
        id: "A",
        imagePlaceholderText: "/images/multiple-choice/river1.jpg",
        isCorrect: true,
      },
      {
        id: "B",
        imagePlaceholderText: "/images/multiple-choice/tower1.jpg",
        isCorrect: false,
      },
      {
        id: "C",
        imagePlaceholderText: "/images/multiple-choice/rice-fields1.jpg",
        isCorrect: false,
      },
      {
        id: "D",
        imagePlaceholderText: "/images/multiple-choice/factory1.jpg",
        isCorrect: false,
      },
    ],
  },
  {
    id: "2",
    questionText:
      "Alin sa mga ito ang nagpapakita ng hanapbuhay sa may bundok?",
    choices: [
      {
        id: "A",
        imagePlaceholderText: "/images/multiple-choice/fish2.jpg",
        isCorrect: false,
      },
      {
        id: "B",
        imagePlaceholderText: "/images/multiple-choice/carpentry2.jpg",
        isCorrect: false,
      },
      {
        id: "C",
        imagePlaceholderText: "/images/multiple-choice/farm2.jpg",
        isCorrect: true,
      },
      {
        id: "D",
        imagePlaceholderText: "/images/multiple-choice/jeepney2.jpg",
        isCorrect: false,
      },
    ],
  },
  {
    id: "3",
    questionText: "Anong produkto ang karaniwang nakukuha sa pangingisda?",
    choices: [
      {
        id: "A",
        imagePlaceholderText: "/images/multiple-choice/pigs3.jpg",
        isCorrect: false,
      },
      {
        id: "B",
        imagePlaceholderText: "/images/multiple-choice/chickens3.jpg",
        isCorrect: false,
      },
      {
        id: "C",
        imagePlaceholderText: "/images/multiple-choice/fish3.jpg",
        isCorrect: true,
      },
      {
        id: "D",
        imagePlaceholderText: "/images/multiple-choice/bananas3.jpg",
        isCorrect: false,
      },
    ],
  },
  {
    id: "4",
    questionText: "Alin ang hanapbuhay na hindi karaniwan sa lalawigan?",
    choices: [
      {
        id: "A",
        imagePlaceholderText: "/images/multiple-choice/farmer4.jpg",
        isCorrect: false,
      },
      {
        id: "B",
        imagePlaceholderText: "/images/multiple-choice/pangagalakal4.jpg",
        isCorrect: false,
      },
      {
        id: "C",
        imagePlaceholderText: "/images/multiple-choice/agent4.jpg",
        isCorrect: true,
      },
      {
        id: "D",
        imagePlaceholderText: "/images/multiple-choice/fisherman4.jpg",
        isCorrect: false,
      },
    ],
  },
  {
    id: "5",
    questionText: "Anong hanapbuhay ang makikita sa kagubatan?",
    choices: [
      {
        id: "A",
        imagePlaceholderText: "/images/multiple-choice/pangangahoy5.jpg",
        isCorrect: true,
      },
      {
        id: "B",
        imagePlaceholderText: "/images/multiple-choice/cooking5.jpg",
        isCorrect: false,
      },
      {
        id: "C",
        imagePlaceholderText: "/images/multiple-choice/painting5.jpg",
        isCorrect: false,
      },
      {
        id: "D",
        imagePlaceholderText: "/images/multiple-choice/paglalako5.jpg",
        isCorrect: false,
      },
    ],
  },
  {
    id: "6",
    questionText: "Alin sa mga ito ang pamumuhay sa kabundukan?",
    choices: [
      {
        id: "A",
        imagePlaceholderText: "/images/multiple-choice/farmer4.jpg",
        isCorrect: false,
      },
      {
        id: "B",
        imagePlaceholderText: "/images/multiple-choice/fisherman4.jpg",
        isCorrect: false,
      },
      {
        id: "C",
        imagePlaceholderText: "/images/multiple-choice/pagkakahoy6.jpg",
        isCorrect: true,
      },
      {
        id: "D",
        imagePlaceholderText: "/images/multiple-choice/paglalako5.jpg",
        isCorrect: false,
      },
    ],
  },
  {
    id: "7",
    questionText: "Ano ang pangunahing hanapbuhay sa palayan?",
    choices: [
      {
        id: "A",
        imagePlaceholderText: "/images/multiple-choice/fisherman4.jpg",
        isCorrect: false,
      },
      {
        id: "B",
        imagePlaceholderText: "/images/multiple-choice/farmer4.jpg",
        isCorrect: true,
      },
      {
        id: "C",
        imagePlaceholderText: "/images/multiple-choice/pagkakahoy6.jpg",
        isCorrect: false,
      },
      {
        id: "D",
        imagePlaceholderText: "/images/multiple-choice/paglalako5.jpg",
        isCorrect: false,
      },
    ],
  },
  {
    id: "8",
    questionText: "Anong hanapbuhay ang karaniwang makikita sa tabing-dagat?",
    choices: [
      {
        id: "A",
        imagePlaceholderText: "/images/multiple-choice/fisherman4.jpg",
        isCorrect: true,
      },
      {
        id: "B",
        imagePlaceholderText: "/images/multiple-choice/farmer4.jpg",
        isCorrect: false,
      },
      {
        id: "C",
        imagePlaceholderText: "/images/multiple-choice/pagkakahoy6.jpg",
        isCorrect: false,
      },
      {
        id: "D",
        imagePlaceholderText: "/images/multiple-choice/paglalako5.jpg",
        isCorrect: false,
      },
    ],
  },
  {
    id: "9",
    questionText: "Anong hayop ang karaniwang kasama sa bukid?",
    choices: [
      {
        id: "A",
        imagePlaceholderText: "/images/multiple-choice/carabao9.jpg",
        isCorrect: true,
      },
      {
        id: "B",
        imagePlaceholderText: "/images/multiple-choice/cat9.jpg",
        isCorrect: false,
      },
      {
        id: "C",
        imagePlaceholderText: "/images/multiple-choice/dog9.jpg",
        isCorrect: false,
      },
      {
        id: "D",
        imagePlaceholderText: "/images/multiple-choice/bird9.jpg",
        isCorrect: false,
      },
    ],
  },
  {
    id: "10",
    questionText: "Alin sa mga ito ang anyong lupa?",
    choices: [
      {
        id: "A",
        imagePlaceholderText: "/images/multiple-choice/dagat10.jpg",
        isCorrect: false,
      },
      {
        id: "B",
        imagePlaceholderText: "/images/multiple-choice/bundok10.jpg",
        isCorrect: true,
      },
      {
        id: "C",
        imagePlaceholderText: "/images/multiple-choice/ilog10.jpg",
        isCorrect: false,
      },
      {
        id: "D",
        imagePlaceholderText: "/images/multiple-choice/falls10.jpg",
        isCorrect: false,
      },
    ],
  },
];

// Props definition for the game component
interface ImageMultipleChoiceGameProps {
  isPracticeMode: boolean;
  assignedGameData?: AssignedGameDTO; // Data if game is assigned
  onGameComplete: (
    score: number,
    timeTakenSeconds?: number,
    expReward?: number
  ) => void; // Callback
  classroomId?: string;
  assignedGameId?: string;
  gameCompleted?: boolean;
}

const ImageMultipleChoiceGame: React.FC<ImageMultipleChoiceGameProps> = ({
  isPracticeMode,
  assignedGameData,
  onGameComplete,
  classroomId,
  assignedGameId,
  gameCompleted = false,
}) => {
  const { theme } = useTheme();
  const colors = COLORS[theme];
  const navigate = useNavigate();

  // Parse gameData from assignedGameData if available
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (assignedGameData?.game?.gameData) {
      try {
        const parsedGameData: GameData = JSON.parse(
          assignedGameData.game.gameData
        );
        setActiveQuestions(parsedGameData.questions);
      } catch (error) {
        console.error("Error parsing game data:", error);
        // Fallback to practice questions if parsing fails
        setActiveQuestions(questionsData);
      }
    } else {
      // Use practice questions if no assigned game data
      setActiveQuestions(questionsData);
    }
  }, [assignedGameData]);

  const [hasGameStarted, setHasGameStarted] = useState(
    isPracticeMode ? false : true
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showGameCompleteCelebration, setShowGameCompleteCelebration] =
    useState(false);

  const currentQuestion = activeQuestions[currentQuestionIndex];

  const handleStartGame = () => {
    playSound("click");
    setHasGameStarted(true);
  };

  const handleAnswerSelection = (choiceId: string) => {
    // Prevent answer selection if game is completed
    if (showFeedback || gameCompleted) {
      return;
    }

    playSound("click");

    const choice = currentQuestion.choices.find((c) => c.id === choiceId);
    if (choice) {
      setSelectedAnswer(choiceId);
      const correct = choice.isCorrect;
      setIsAnswerCorrect(correct);
      let newScore = score;
      if (correct) {
        playSound("correct");
        newScore = score + 1;
        setScore(newScore);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      } else {
        playSound("incorrect");
      }
      setShowFeedback(true);

      setTimeout(() => {
        setShowFeedback(false);
        setSelectedAnswer(null);
        if (currentQuestionIndex < activeQuestions.length - 1) {
          setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        } else {
          playSound("gameComplete");
          setShowGameCompleteCelebration(true);
          setShowScore(true);
          if (!isPracticeMode && !gameCompleted) {
            onGameComplete(newScore);
          }
        }
      }, 2000);
    }
  };

  const restartGame = () => {
    // Prevent restart if game is completed
    if (gameCompleted) {
      if (classroomId) {
        navigate(`/student/classrooms/${classroomId}`);
      } else {
        navigate("/student/dashboard");
      }
      return;
    }

    playSound("click");
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowScore(false);
    setShowGameCompleteCelebration(false);
    if (isPracticeMode) {
      setHasGameStarted(false);
    } else {
      if (classroomId) {
        navigate(`/student/classrooms/${classroomId}`);
      } else {
        navigate("/student/dashboard");
      }
    }
  };

  const isImagePath = (text: string) => {
    return (
      text.startsWith("/images/multiple-choice/") &&
      (text.endsWith(".jpg") || text.endsWith(".svg") || text.endsWith(".png"))
    );
  };

  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

  useEffect(() => {
    if (!document.getElementById("selina-game-animations")) {
      const styleSheet = document.createElement("style");
      styleSheet.id = "selina-game-animations";
      styleSheet.innerText = animationStyles;
      document.head.appendChild(styleSheet);
    }
  }, []);

  if (!hasGameStarted && isPracticeMode) {
    // Logic for practice mode start screen
    return (
      <>
        <BackgroundMusic musicFile="/audio/multiple-choice.mp3" volume={0.15} />
        <div
          className={`bg-pattern min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-200`}
          style={{ color: colors.primaryText }}>
          <div
            className={`p-10 rounded-3xl shadow-xl text-center max-w-xl w-full transition-colors duration-200`}
            style={{ backgroundColor: colors.cardBackground }}>
            <h1
              className="text-5xl sm:text-6xl font-bold mb-4"
              style={{ color: colors.primaryText }}>
              Welcome to
            </h1>
            <h2
              className="text-4xl sm:text-5xl font-bold mb-8"
              style={{ color: colors.secondaryAccent }}>
              Identify the Correct Image!
            </h2>
            <p
              className="text-xl sm:text-xl mb-3 opacity-80"
              style={{ color: colors.primaryText }}>
              Subukan ang iyong kaalaman sa Araling Panlipunan at Tagalog sa
              masayang paraan!
            </p>
            <p
              className="text-xl sm:text-2xl mb-12 opacity-80"
              style={{ color: colors.primaryText }}>
              Choose the correct picture for each question.
            </p>
            <button
              onClick={handleStartGame}
              className="hover:bg-[#db8e00] text-white font-bold py-4 px-12 rounded-full text-2xl sm:text-3xl transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#DBD053] shadow-lg"
              style={{ backgroundColor: colors.secondaryAccent }}>
              Start
            </button>
          </div>
        </div>
      </>
    );
  }

  if (showScore) {
    // Final score display screen
    return (
      <>
        <BackgroundMusic musicFile="/audio/multiple-choice.mp3" volume={0.15} />
        <div
          className={`bg-pattern min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-200`}
          style={{ color: colors.primaryText }}>
          {showGameCompleteCelebration && <GameCompleteCelebration />}
          <div
            className={`p-10 rounded-3xl shadow-xl text-center max-w-md w-full transition-colors duration-200`}
            style={{ backgroundColor: colors.cardBackground }}>
            <h2
              className="text-5xl font-bold mb-6"
              style={{ color: colors.primaryAccent }}>
              {isPracticeMode ? "Game Finished" : "Results Submitted!"}
            </h2>
            <p className="text-3xl mb-10" style={{ color: colors.primaryText }}>
              Your Score:{" "}
              <span
                className="font-bold text-4xl"
                style={{ color: colors.secondaryAccent }}>
                {score}
              </span>{" "}
              / {activeQuestions.length}
            </p>
            <button
              onClick={restartGame} // This button text will change based on mode
              className="hover:bg-[#5f6b9a] text-white font-bold py-4 px-10 rounded-full text-2xl transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#DBD053] shadow-lg"
              style={{ backgroundColor: colors.interactiveElements }}>
              {isPracticeMode ? "Play Again" : "Back to Classroom"}
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!currentQuestion) {
    // Loading state or if questions array is empty/invalid
    return (
      <>
        <BackgroundMusic musicFile="/audio/multiple-choice.mp3" volume={0.15} />
        <div
          className={`bg-pattern min-h-screen flex items-center justify-center transition-colors duration-200`}
          style={{ color: colors.primaryText }}>
          Loading question...
        </div>
      </>
    );
  }

  // If game is completed, show a message instead of the game
  if (gameCompleted) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <h2 className="text-4xl font-bold mb-6 text-primary-energetic dark:text-primary-energetic-dark">
            Activity Completed
          </h2>
          <p className="text-xl mb-8 text-gray-700 dark:text-gray-300">
            You have already completed this activity.
          </p>
          <Button
            onClick={() => {
              if (classroomId) {
                navigate(`/student/classrooms/${classroomId}`);
              } else {
                navigate("/student/dashboard");
              }
            }}
            className="px-8 py-3 text-lg font-semibold">
            Back to Classroom
          </Button>
        </div>
      </div>
    );
  }

  // Main game UI (unchanged from your original structure)
  return (
    <>
      <BackgroundMusic musicFile="/audio/multiple-choice.mp3" volume={0.15} />
      <div
        className={`bg-pattern min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-200`}
        style={{ color: colors.primaryText }}>
        {showCelebration && <CelebrationAnimation />}
        <div
          className={`p-6 sm:p-10 rounded-3xl shadow-xl w-full max-w-3xl transition-colors duration-200`}
          style={{ backgroundColor: colors.cardBackground }}>
          <div className="mb-8 text-center">
            <p
              className="text-xl sm:text-2xl font-semibold mb-2"
              style={{ color: colors.interactiveElements }}>
              Question {currentQuestionIndex + 1} of {activeQuestions.length}
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold"
              style={{ color: colors.primaryText }}>
              {currentQuestion.questionText}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
            {currentQuestion.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleAnswerSelection(choice.id)}
                disabled={showFeedback}
                className={`relative border-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none group p-6 pt-14 sm:p-8 sm:pt-16
                  ${
                    selectedAnswer === choice.id &&
                    showFeedback &&
                    isAnswerCorrect
                      ? "border-[#DBD053] ring-4 ring-[#DBD053]"
                      : "border-transparent"
                  }
                  ${
                    selectedAnswer === choice.id &&
                    showFeedback &&
                    !isAnswerCorrect
                      ? "border-red-500 ring-4 ring-red-500"
                      : selectedAnswer !== choice.id
                      ? "border-transparent"
                      : ""
                  }
                  ${
                    !selectedAnswer && !showFeedback
                      ? `focus:border-[${colors.interactiveElements}]`
                      : ""
                  }
                  ${showFeedback ? "cursor-not-allowed" : "cursor-pointer"}
                `}
                style={{
                  backgroundColor: colors.cardBackground,
                  borderColor:
                    selectedAnswer === choice.id && showFeedback
                      ? isAnswerCorrect
                        ? colors.primaryAccent
                        : "rgb(239, 68, 68)"
                      : theme === "dark"
                      ? colors.borderColor
                      : "transparent",
                }}>
                <div
                  className="absolute top-3 left-3 text-white text-lg font-bold w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                  style={{ backgroundColor: colors.secondaryAccent }}>
                  {choice.id}
                </div>
                <div
                  className={`w-full h-48 sm:h-60 flex items-center justify-center rounded-xl mb-3 group-hover:${colors.hoverBg}`}>
                  {isImagePath(choice.imagePlaceholderText) ? (
                    <img
                      src={choice.imagePlaceholderText}
                      alt={`Choice ${choice.id}`}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        e.currentTarget.src = "/images/placeholder.jpg";
                        console.error(
                          `Failed to load image: ${choice.imagePlaceholderText}`
                        );
                      }}
                    />
                  ) : (
                    <span
                      className={`text-lg px-2 text-center w-full h-full flex items-center justify-center rounded-xl`}
                      style={{
                        color: colors.primaryText,
                        backgroundColor: colors.neutralBackground,
                      }}>
                      {choice.imagePlaceholderText}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {showFeedback && (
            <div
              className={`mt-6 p-5 rounded-xl text-2xl font-semibold shadow-md text-center transition-colors duration-200
              ${isAnswerCorrect ? "text-[#1A1B41]" : "text-white"}`}
              style={{
                backgroundColor: isAnswerCorrect
                  ? colors.primaryAccent
                  : "rgb(239, 68, 68)",
              }}>
              {isAnswerCorrect
                ? "Magaling! Tamang sagot!"
                : "Oops! Subukan muli sa susunod."}
            </div>
          )}

          <div className="mt-10 text-center">
            <p
              className="text-3xl font-bold"
              style={{ color: colors.secondaryAccent }}>
              Score: {score}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageMultipleChoiceGame;
