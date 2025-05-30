import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Trash2,
  UploadCloud,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { gameService } from "../../../services/game";
import { GameDTO } from "../../../types"; // Assuming GameDTO is relevant, or define specific types
import { useAuth } from "../../../context/AuthContext";
import { API_BASE_URL } from "../../../config";
import Button from "../../common/Button"; // Your common Button component

// Define interfaces for the state
interface ImageSlot {
  uiId: string; // For unique key in React iteration
  file?: File;
  previewUrl?: string;
  backendUrl: string; // Will be populated on final submit
}

interface QuestionState {
  id: string; // Unique ID for the question
  answer: string;
  images: ImageSlot[]; // Array of 4 ImageSlots
}

interface GameTemplateState {
  activityName: string;
  maxScore: number;
  questions: QuestionState[];
}

// Helper to create an initial ImageSlot
const createInitialImageSlot = (suffix: string): ImageSlot => ({
  uiId: `imgslot-${Date.now()}-${suffix}`,
  backendUrl: "",
  previewUrl: "",
});

// Helper to create an initial Question
const createInitialQuestion = (): QuestionState => ({
  id: `question-${Date.now()}`,
  answer: "",
  images: [
    createInitialImageSlot("0"),
    createInitialImageSlot("1"),
    createInitialImageSlot("2"),
    createInitialImageSlot("3"),
  ],
});

const Create4Pics1Word: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [gameTemplate, setGameTemplate] = useState<GameTemplateState>({
    activityName: "",
    maxScore: 100,
    questions: [createInitialQuestion()],
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);

  const handleGameTemplateChange = (
    field: keyof Omit<GameTemplateState, "questions">,
    value: string | number
  ) => {
    setGameTemplate({ ...gameTemplate, [field]: value });
  };

  const handleQuestionAnswerChange = (
    questionIndex: number,
    answer: string
  ) => {
    const newQuestions = [...gameTemplate.questions];
    newQuestions[questionIndex].answer = answer.toUpperCase(); // Often 4 Pics 1 Word uses uppercase
    setGameTemplate({ ...gameTemplate, questions: newQuestions });
  };

  const handleImageSelect = (
    questionIndex: number,
    imageIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    const newQuestions = [...gameTemplate.questions];
    const targetImageSlot = newQuestions[questionIndex].images[imageIndex];

    if (file) {
      targetImageSlot.file = file;
      targetImageSlot.previewUrl = URL.createObjectURL(file);
      targetImageSlot.backendUrl = ""; // Clear any previous backend URL
    } else {
      // No file selected, clear existing
      targetImageSlot.file = undefined;
      targetImageSlot.previewUrl = "";
      targetImageSlot.backendUrl = "";
    }
    setGameTemplate({ ...gameTemplate, questions: newQuestions });
    setError(null);
  };

  const addQuestion = () => {
    if (gameTemplate.questions.length >= 5) {
      // Example limit
      setError("You can add a maximum of 5 questions.");
      return;
    }
    setGameTemplate({
      ...gameTemplate,
      questions: [...gameTemplate.questions, createInitialQuestion()],
    });
  };

  const removeQuestion = (index: number) => {
    if (gameTemplate.questions.length <= 1) {
      setError("You must have at least one question.");
      return;
    }
    const newQuestions = gameTemplate.questions.filter((_, i) => i !== index);
    setGameTemplate({ ...gameTemplate, questions: newQuestions });
  };

  const validateGame = (): boolean => {
    setError(null);
    if (!gameTemplate.activityName.trim()) {
      setError("Please enter a game name.");
      return false;
    }
    if (Number(gameTemplate.maxScore) <= 0) {
      setError("Max Score must be a positive value.");
      return false;
    }
    if (gameTemplate.questions.length === 0) {
      setError("Please add at least one question.");
      return false;
    }
    for (let i = 0; i < gameTemplate.questions.length; i++) {
      const question = gameTemplate.questions[i];
      if (!question.answer.trim()) {
        setError(`Question ${i + 1}: Please enter the answer.`);
        return false;
      }
      if (
        question.images.some((imgSlot) => !imgSlot.file && !imgSlot.backendUrl)
      ) {
        setError(`Question ${i + 1}: All 4 images must be selected.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateGame()) return;
    setIsLoadingSubmit(true);

    try {
      if (!currentUser || currentUser.role !== "TEACHER") {
        setError("You must be logged in as a teacher to create games.");
        setIsLoadingSubmit(false);
        return;
      }

      const processedQuestions = [...gameTemplate.questions];

      for (let i = 0; i < processedQuestions.length; i++) {
        const question = processedQuestions[i];
        for (let j = 0; j < question.images.length; j++) {
          const imgSlot = question.images[j];
          if (imgSlot.file && !imgSlot.backendUrl) {
            const formData = new FormData();
            formData.append("file", imgSlot.file);
            formData.append("gameType", "4pics1word"); // As per your original code

            const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
              method: "POST",
              body: formData,
              // credentials: 'include', // If your backend needs cookies/session for upload
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(
                errorData.message ||
                  `Failed to upload image ${j + 1} for question ${
                    i + 1
                  }. Status: ${response.status}`
              );
            }
            const data = await response.json();
            processedQuestions[i].images[j].backendUrl = data.imagePath;
            processedQuestions[i].images[j].file = undefined; // Clear file after upload
          } else if (!imgSlot.file && !imgSlot.backendUrl) {
            throw new Error(`Image ${j + 1} for question ${i + 1} is missing.`);
          }
        }
      }

      // Prepare final game data structure for the backend
      const finalGameDataQuestions = processedQuestions.map((q) => ({
        id: q.id, // Or let backend generate if it prefers
        answer: q.answer,
        // Your backend might expect `clue`, `englishTranslation`, `funFact` if Blank4Pics1Word uses them.
        // Add them here if needed, or adjust the Blank4Pics1Word gameData structure.
        // For now, sticking to what Create4Pics1Word currently manages for its gameData:
        images: q.images.map((imgSlot) => imgSlot.backendUrl),
        clue: "Clue for " + q.answer, // Placeholder, add input fields for these if needed
        englishTranslation: "Translation for " + q.answer, // Placeholder
        funFact: "Fun fact about " + q.answer, // Placeholder
      }));

      const gamePayload = {
        activityName: gameTemplate.activityName,
        maxScore: Number(gameTemplate.maxScore),
        isPremade: false,
        gameMode: "FOUR_PICS_ONE_WORD" as const,
        gameData: JSON.stringify({ questions: finalGameDataQuestions }), // Backend expects 'questions' array
        createdBy: { id: currentUser.id },
      };

      await gameService.createGame(gamePayload as any); // Cast if GameDTO from types is stricter
      setSuccess("4 Pics 1 Word Game created successfully! Redirecting...");

      setGameTemplate({
        activityName: "",
        maxScore: 100,
        questions: [createInitialQuestion()],
      });
      setTimeout(() => navigate("/teacher/games/library"), 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create game. Please try again."
      );
      console.error("Error creating 4 pics 1 word game:", err);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {" "}
      {/* Increased max-width for this layout */}
      <header className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-text dark:text-primary-text-dark">
          Create 4 Pics 1 Word Game
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Challenge students to guess the word connecting four images.
        </p>
      </header>
      {error && (
        <div
          className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative dark:bg-red-700/20 dark:border-red-600/30 dark:text-red-300 flex items-start"
          role="alert">
          <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div
          className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative dark:bg-green-700/20 dark:border-green-600/30 dark:text-green-300 flex items-start"
          role="alert">
          <CheckCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="card p-6 md:p-8">
          <h2 className="text-2xl font-semibold mb-6 text-primary-text dark:text-primary-text-dark border-b pb-3 border-gray-200 dark:border-gray-700">
            Game Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <label
                htmlFor="activityName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Game Name / Title
              </label>
              <input
                id="activityName"
                type="text"
                value={gameTemplate.activityName}
                onChange={(e) =>
                  handleGameTemplateChange("activityName", e.target.value)
                }
                className="input-field"
                placeholder="e.g., Mga Salitang Filipino"
                required
                disabled={isLoadingSubmit}
              />
            </div>
            <div>
              <label
                htmlFor="maxScore"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Score
              </label>
              <input
                id="maxScore"
                type="number"
                value={gameTemplate.maxScore}
                onChange={(e) =>
                  handleGameTemplateChange(
                    "maxScore",
                    parseInt(e.target.value) || 0
                  )
                }
                className="input-field"
                min="1"
                required
                disabled={isLoadingSubmit}
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-primary-text dark:text-primary-text-dark">
              Questions ({gameTemplate.questions.length})
            </h2>
            <Button
              type="button"
              variant="outline"
              onClick={addQuestion}
              icon={<PlusCircle size={18} />}
              disabled={isLoadingSubmit}>
              Add Question
            </Button>
          </div>

          {gameTemplate.questions.map((question, questionIndex) => (
            <div key={question.id} className="card p-6 relative group">
              <div className="absolute top-3 right-3">
                <Button
                  type="button"
                  variant="text"
                  size="sm"
                  onClick={() => removeQuestion(questionIndex)}
                  disabled={
                    gameTemplate.questions.length <= 1 || isLoadingSubmit
                  }
                  className="text-red-500 hover:bg-red-100 dark:hover:bg-red-700/20 !p-2"
                  aria-label="Remove question">
                  {" "}
                  <Trash2 size={18} />{" "}
                </Button>
              </div>

              <h3 className="text-lg font-medium mb-4 text-primary-text dark:text-primary-text-dark">
                Question {questionIndex + 1}
              </h3>

              <div className="mb-6">
                <label
                  htmlFor={`q-${question.id}-answer`}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Correct Answer (Word)
                </label>
                <input
                  id={`q-${question.id}-answer`}
                  type="text"
                  value={question.answer}
                  onChange={(e) =>
                    handleQuestionAnswerChange(questionIndex, e.target.value)
                  }
                  className="input-field uppercase"
                  placeholder="e.g., PAMILYA"
                  required
                  disabled={isLoadingSubmit}
                />
              </div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload 4 Images for this word:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {question.images.map((imgSlot, imageIndex) => (
                  <div
                    key={imgSlot.uiId}
                    className="flex flex-col items-center">
                    <div className="w-full aspect-square border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg flex items-center justify-center relative mb-2 bg-gray-50 dark:bg-slate-700">
                      {imgSlot.previewUrl ? (
                        <img
                          src={imgSlot.previewUrl}
                          alt={`Preview ${imageIndex + 1}`}
                          className="max-h-full max-w-full object-contain rounded-md"
                        />
                      ) : (
                        <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                      )}
                      <input
                        id={`q-${question.id}-img-${imageIndex}`}
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) =>
                          handleImageSelect(questionIndex, imageIndex, e)
                        }
                        disabled={isLoadingSubmit}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document
                          .getElementById(`q-${question.id}-img-${imageIndex}`)
                          ?.click()
                      }
                      className="w-full text-xs"
                      icon={<UploadCloud size={14} />}
                      disabled={isLoadingSubmit}>
                      {imgSlot.previewUrl ? "Change" : "Select"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-end items-center gap-4">
          {gameTemplate.questions.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 order-first sm:order-none mr-auto">
              Total Questions: {gameTemplate.questions.length}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
            icon={<PlusCircle size={18} />}
            disabled={isLoadingSubmit}>
            Add Question
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoadingSubmit}
            disabled={isLoadingSubmit}>
            Create 4 Pics 1 Word Game
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Create4Pics1Word;
