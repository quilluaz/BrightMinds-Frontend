import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gameService } from "../../services/game";
import { GameDTO } from "../../types";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import AssignGameModal from "../../components/teacher/AssignGameModal";
import {
  Library,
  Sparkles,
  Zap,
  Brain,
  Puzzle,
  Plus,
  BookCopy,
  Tag,
} from "lucide-react";
import Button from "../../components/common/Button"; // Assuming you have this common button
import MessageModal from "../../components/common/MessageModal";

// Interface for defining the types of games that can be created.
// This is used for the "Create Game" modal and for providing consistent UI elements.
interface CreatableGameType {
  gameMode: GameDTO["gameMode"];
  title: string; // Title for display (e.g., in tabs, create modal)
  description: string; // Description for the create modal
  icon: React.ReactNode;
}

// Defines the game types teachers can create.
const CREATABLE_GAME_TYPES: CreatableGameType[] = [
  {
    gameMode: "MATCHING",
    title: "Matching Game",
    description:
      "Test memory by matching pairs of words and/or images. Covers Anyong Tubig, Anyong Lupa, and Pambansang Sagisag.",
    icon: <Sparkles size={28} className="text-green-500 dark:text-green-400" />,
  },
  {
    gameMode: "IMAGE_MULTIPLE_CHOICE",
    title: "Image Quiz",
    description:
      "Identify the correct image for each question. A fun Araling Panlipunan knowledge test!",
    icon: <Zap size={28} className="text-blue-500 dark:text-blue-400" />,
  },
  {
    gameMode: "SORTING",
    title: "Sorting Game",
    description:
      "Create interactive sorting activities where students categorize items. Perfect for teaching classification and organization skills.",
    icon: <Brain size={28} className="text-purple-500 dark:text-purple-400" />,
  },
  {
    gameMode: "FOUR_PICS_ONE_WORD",
    title: "4 Pics 1 Word",
    description:
      "Guess the common Tagalog word that connects four different pictures. Great for vocabulary!",
    icon: <Puzzle size={28} className="text-yellow-500 dark:text-amber-400" />,
  },
  // Add other game modes that teachers can create here
];

// This defines the structure for games to be displayed in the library list.
// It takes data directly from the backend and adds a resolved icon.
interface DisplayableLibraryGame {
  id: string; // Directly from backendGame.id
  title: string;
  description?: string;
  subject?: string;
  gameMode: GameDTO["gameMode"];
  icon: React.ReactNode;
  isPremade?: boolean; // From backend
  actualGameDataFromBackend: GameDTO; // The full DTO from backend for assignment
}

const TeacherGameLibraryPage: React.FC = () => {
  const [displayableGames, setDisplayableGames] = useState<
    DisplayableLibraryGame[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGameToAssign, setSelectedGameToAssign] =
    useState<GameDTO | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isGameModeModalOpen, setIsGameModeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    GameDTO["gameMode"] | "all" | null
  >("all");
  const [messageModal, setMessageModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "info" | "warning" | "error";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndProcessGames = async () => {
      setIsLoading(true);
      try {
        const allLibraryGamesFromBackend: GameDTO[] =
          await gameService.getLibraryGames();

        const finalGamesList: DisplayableLibraryGame[] =
          allLibraryGamesFromBackend.map((backendGame) => {
            const creatableTypeConfig = CREATABLE_GAME_TYPES.find(
              (ct) => ct.gameMode === backendGame.gameMode
            );
            return {
              id: backendGame.id,
              title: backendGame.title,
              description:
                backendGame.description ||
                creatableTypeConfig?.description ||
                "A learning game.",
              subject: backendGame.subject,
              gameMode: backendGame.gameMode,
              icon: creatableTypeConfig?.icon || (
                <Library size={28} className="text-gray-500" />
              ),
              isPremade: backendGame.isPremade,
              actualGameDataFromBackend: backendGame,
            };
          });

        setDisplayableGames(finalGamesList);
      } catch (error) {
        console.error("Failed to fetch or process game library:", error);
        setDisplayableGames([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndProcessGames();
  }, []);

  const handleOpenAssignModal = (gameDataForAssignment: GameDTO) => {
    // No need to check for undefined here if the button is only enabled for existing games
    setSelectedGameToAssign(gameDataForAssignment);
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setSelectedGameToAssign(null);
    setIsAssignModalOpen(false);
  };

  const handleCreateGame = (gameMode: GameDTO["gameMode"]) => {
    switch (gameMode) {
      case "MATCHING":
        navigate("/teacher/create-game/matching");
        break;
      case "IMAGE_MULTIPLE_CHOICE":
        navigate("/teacher/create-game/image-quiz");
        break;
      case "SORTING":
        navigate("/teacher/create-game/sorting");
        break;
      case "FOUR_PICS_ONE_WORD":
        navigate("/teacher/create-game/4pics1word");
        break;
      default:
        setMessageModal({
          isOpen: true,
          title: "Coming Soon",
          message: `Creation for ${gameMode} is not yet implemented.`,
          type: "info",
        });
    }
  };

  const handleTabClick = (gameMode: GameDTO["gameMode"] | "all") => {
    setActiveTab(gameMode);
  };

  // Filter games based on the active tab; all games from the backend are in displayableGames
  const filteredGames =
    activeTab === "all"
      ? displayableGames
      : displayableGames.filter((game) => game.gameMode === activeTab);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={() => setMessageModal((prev) => ({ ...prev, isOpen: false }))}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
      />
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-10 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-text dark:text-primary-text-dark flex items-center">
                <Library
                  size={32}
                  className="mr-3 text-primary-interactive dark:text-primary-interactive-dark"
                />
                Game Library
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Browse available activities or create your own to assign to your
                classrooms.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsGameModeModalOpen(true)}
              className="btn btn-primary flex items-center gap-2" // Assuming Button component takes className
              icon={<Plus size={20} />}>
              Create Game
            </Button>
          </div>
        </div>

        {isGameModeModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-primary-card-dark rounded-xl p-6 w-full max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-primary-text dark:text-primary-text-dark text-center">
                Select Game Type to Create
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {CREATABLE_GAME_TYPES.map((gameType) => (
                  <button
                    key={gameType.gameMode}
                    onClick={() => {
                      setIsGameModeModalOpen(false);
                      handleCreateGame(gameType.gameMode);
                    }}
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-interactive">
                    <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded-full">
                      {gameType.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-lg text-primary-text dark:text-primary-text-dark">
                        {gameType.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {gameType.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <Button
                variant="text"
                onClick={() => setIsGameModeModalOpen(false)}
                className="w-full mt-6">
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav
            className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto pb-px"
            aria-label="Tabs">
            <button
              key="all"
              onClick={() => handleTabClick("all")}
              className={`
                ${
                  activeTab === "all"
                    ? "border-primary-interactive text-primary-interactive dark:border-primary-interactive-dark dark:text-primary-interactive-dark"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
                }
                whitespace-nowrap py-3 px-1 sm:py-4 sm:px-1 border-b-2 font-medium text-sm transition-colors duration-200
              `}>
              All Games
            </button>
            {CREATABLE_GAME_TYPES.map((gameType) => (
              <button
                key={gameType.gameMode}
                onClick={() => handleTabClick(gameType.gameMode)}
                className={`
                  ${
                    activeTab === gameType.gameMode
                      ? "border-primary-interactive text-primary-interactive dark:border-primary-interactive-dark dark:text-primary-interactive-dark"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
                  }
                  whitespace-nowrap py-3 px-1 sm:py-4 sm:px-1 border-b-2 font-medium text-sm transition-colors duration-200
                `}>
                {gameType.title}{" "}
                {/* Use title from CREATABLE_GAME_TYPES for tab name */}
              </button>
            ))}
          </nav>
        </div>

        {filteredGames.length === 0 && !isLoading ? (
          <div className="text-center py-10 bg-white dark:bg-primary-card-dark rounded-xl shadow border dark:border-gray-700">
            <Library
              size={48}
              className="mx-auto text-gray-400 dark:text-gray-500 mb-4"
            />
            <p className="text-xl text-gray-500 dark:text-gray-400">
              {activeTab === "all"
                ? "No games found in the library."
                : `No ${
                    CREATABLE_GAME_TYPES.find((c) => c.gameMode === activeTab)
                      ?.title || "games"
                  } found.`}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Try creating a new game or check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map(
              (
                game // game is DisplayableLibraryGame
              ) => (
                <div
                  key={game.id}
                  className="card bg-white dark:bg-primary-card-dark p-5 shadow-lg rounded-xl flex flex-col justify-between border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl hover:scale-[1.03]">
                  <div className="flex flex-col items-center text-center flex-grow">
                    <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded-full mb-4">
                      {game.icon}
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-primary-text dark:text-primary-text-dark">
                      {game.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 h-20 line-clamp-4">
                      {game.description}
                    </p>

                    <div className="w-full space-y-1 mb-4">
                      {game.subject && (
                        <span className="inline-flex items-center text-xs font-medium bg-primary-accent/20 dark:bg-primary-accent-dark/30 text-primary-accent dark:text-primary-accent-dark px-2.5 py-1 rounded-full mr-1.5 mb-1 sm:mb-0">
                          <BookCopy size={12} className="mr-1" /> {game.subject}
                        </span>
                      )}
                      {game.gameMode && (
                        <span className="inline-flex items-center text-xs font-medium bg-blue-100 dark:bg-blue-700/50 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full mb-1 sm:mb-0">
                          <Tag size={12} className="mr-1" />{" "}
                          {game.gameMode
                            .replace(/_/g, " ")
                            .toLowerCase()
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      )}
                      {game.isPremade && (
                        <span className="inline-flex items-center text-xs font-medium bg-teal-100 dark:bg-teal-700/50 text-teal-700 dark:text-teal-300 px-2.5 py-1 rounded-full">
                          <CheckCircle size={12} className="mr-1" /> Premade
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="primary" // Or your desired variant
                    onClick={() =>
                      handleOpenAssignModal(game.actualGameDataFromBackend)
                    }
                    className="w-full mt-auto" // Ensure button is at the bottom
                    // Button is always enabled as actualGameDataFromBackend will exist for displayed games
                  >
                    Assign to Classroom
                  </Button>
                </div>
              )
            )}
          </div>
        )}

        {selectedGameToAssign && isAssignModalOpen && (
          <AssignGameModal
            isOpen={isAssignModalOpen}
            onClose={handleCloseAssignModal}
            gameToAssign={selectedGameToAssign}
          />
        )}
      </div>
    </>
  );
};

export default TeacherGameLibraryPage;
