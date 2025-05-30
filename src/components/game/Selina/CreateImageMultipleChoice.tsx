import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Trash2,
  UploadCloud,
  Image as ImageIconLucide,
  AlertCircle,
  CheckCircle,
  CheckSquare,
  XSquare,
} from "lucide-react";
import { gameService } from "../../../services/game";
// Assuming GameDTO might be used by gameService, but the payload is constructed locally.
// import { GameDTO } from "../../../types";
import { useAuth } from "../../../context/AuthContext";
import { API_BASE_URL } from "../../../config";
import Button from "../../common/Button";

// Interfaces for state management, aligned with other create-game components
interface ImageChoiceSlot {
  id: string; // Unique ID for the choice, e.g., "choice-timestamp-A"
  file?: File;
  previewUrl?: string;
  backendUrl: string; // Will store the URL from the backend after upload
  isCorrect: boolean;
}

interface QuestionState {
  id: string; // Unique ID for the question
  questionText: string;
  choices: ImageChoiceSlot[]; // Expecting 2-4 choices
}

interface GameTemplateState {
  activityName: string;
  maxScore: number;
  questions: QuestionState[];
}

// Helper to create an initial ImageChoiceSlot
const createInitialImageChoiceSlot = (
  uniqueIdPart: string
): ImageChoiceSlot => ({
  id: `choice-${Date.now()}-${uniqueIdPart}`,
  backendUrl: "",
  previewUrl: "",
  isCorrect: false,
});

// Helper to create an initial Question
const createInitialQuestion = (): QuestionState => ({
  id: `question-${Date.now()}`,
  questionText: "",
  choices: [
    // Default to 4 choices
    createInitialImageChoiceSlot("A"),
    createInitialImageChoiceSlot("B"),
    createInitialImageChoiceSlot("C"),
    createInitialImageChoiceSlot("D"),
  ],
});

const CreateImageMultipleChoice: React.FC = () => {
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

  const handleQuestionTextChange = (questionIndex: number, text: string) => {
    const newQuestions = [...gameTemplate.questions];
    newQuestions[questionIndex].questionText = text;
    setGameTemplate({ ...gameTemplate, questions: newQuestions });
  };

  const handleImageSelect = (
    questionIndex: number,
    choiceIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    const newQuestions = [...gameTemplate.questions];
    const targetChoiceSlot = newQuestions[questionIndex].choices[choiceIndex];

    if (file) {
      targetChoiceSlot.file = file;
      targetChoiceSlot.previewUrl = URL.createObjectURL(file);
      targetChoiceSlot.backendUrl = ""; // Clear previous backend URL
    } else {
      targetChoiceSlot.file = undefined;
      targetChoiceSlot.previewUrl = "";
      targetChoiceSlot.backendUrl = "";
    }
    setGameTemplate({ ...gameTemplate, questions: newQuestions });
    setError(null); // Clear error on new image selection
  };

  const handleSetCorrectChoice = (
    questionIndex: number,
    correctChoiceIndex: number
  ) => {
    const newQuestions = [...gameTemplate.questions];
    newQuestions[questionIndex].choices.forEach((choice, idx) => {
      choice.isCorrect = idx === correctChoiceIndex;
    });
    setGameTemplate({ ...gameTemplate, questions: newQuestions });
  };

  const addQuestion = () => {
    if (gameTemplate.questions.length >= 10) {
      // Example limit
      setError("You can add a maximum of 10 questions.");
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
      if (!question.questionText.trim()) {
        setError(`Question ${i + 1}: Please enter the question text.`);
        return false;
      }
      if (
        question.choices.some((choice) => !choice.file && !choice.backendUrl)
      ) {
        setError(`Question ${i + 1}: All choices must have an image selected.`);
        return false;
      }
      if (!question.choices.some((choice) => choice.isCorrect)) {
        setError(
          `Question ${i + 1}: Please mark one choice as the correct answer.`
        );
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
        for (let j = 0; j < question.choices.length; j++) {
          const choiceSlot = question.choices[j];
          if (choiceSlot.file && !choiceSlot.backendUrl) {
            // Only upload if file exists and no backendUrl yet
            const formData = new FormData();
            formData.append("file", choiceSlot.file);
            formData.append("gameType", "image-quiz"); // Specific gameType for backend folder organization

            const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
              method: "POST",
              body: formData,
              // Add Authorization header if your API needs it
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(
                errorData.message ||
                  `Failed to upload image for Question ${i + 1}, Choice ${
                    j + 1
                  }. Status: ${response.status}`
              );
            }
            const data = await response.json();
            processedQuestions[i].choices[j].backendUrl = data.imagePath;
            processedQuestions[i].choices[j].file = undefined; // Clear file after successful upload
          } else if (!choiceSlot.file && !choiceSlot.backendUrl) {
            // This case should be caught by validateGame, but good to have a safeguard
            throw new Error(
              `Image for Question ${i + 1}, Choice ${j + 1} is missing.`
            );
          }
        }
      }

      // Prepare final game data structure for the backend
      // This structure must match what BlankImageMultipleChoiceGame.tsx expects for 'gameData'
      const finalGameDataQuestions = processedQuestions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        choices: q.choices.map((choice) => ({
          id: choice.id, // Choice ID, e.g., "choice-timestamp-A"
          imagePlaceholderText: choice.backendUrl, // This is what BlankImageMultipleChoiceGame expects for the image URL
          isCorrect: choice.isCorrect,
        })),
      }));

      const gamePayload = {
        activityName: gameTemplate.activityName,
        maxScore: Number(gameTemplate.maxScore),
        isPremade: false,
        gameMode: "IMAGE_MULTIPLE_CHOICE" as const,
        gameData: JSON.stringify({ questions: finalGameDataQuestions }),
        createdBy: { id: currentUser.id }, // Assuming backend uses this structure
      };

      await gameService.createGame(gamePayload as any); // Cast if GameDTO is too strict for this specific payload
      setSuccess(
        "Image Multiple Choice Game created successfully! Redirecting..."
      );

      setGameTemplate({
        // Reset form
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
      console.error("Error creating Image Multiple Choice game:", err);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-text dark:text-primary-text-dark">
          Create Image Multiple Choice Quiz
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Design a quiz where students select the correct image.
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
                placeholder="e.g., Philippine National Symbols Quiz"
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
                  htmlFor={`q-${question.id}-text`}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Question Text
                </label>
                <textarea
                  id={`q-${question.id}-text`}
                  value={question.questionText}
                  onChange={(e) =>
                    handleQuestionTextChange(questionIndex, e.target.value)
                  }
                  className="input-field min-h-[80px]"
                  placeholder="e.g., Alin sa mga ito ang Pambansang Ibon ng Pilipinas?"
                  required
                  disabled={isLoadingSubmit}
                />
              </div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image Choices (Mark one as correct):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {question.choices.map((choice, choiceIndex) => (
                  <div
                    key={choice.id}
                    className={`flex flex-col p-3 rounded-lg border-2 transition-colors
                    ${
                      choice.isCorrect
                        ? "border-green-500 bg-green-50 dark:bg-green-700/20"
                        : "border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-800"
                    }`}>
                    <div className="w-full aspect-square border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg flex items-center justify-center relative mb-3 bg-gray-50 dark:bg-slate-700">
                      {choice.previewUrl ? (
                        <img
                          src={choice.previewUrl}
                          alt={`Preview Choice ${choiceIndex + 1}`}
                          className="max-h-full max-w-full object-contain rounded-md"
                        />
                      ) : (
                        <ImageIconLucide className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                      )}
                      <input
                        id={`q-${question.id}-choiceimg-${choiceIndex}`}
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) =>
                          handleImageSelect(questionIndex, choiceIndex, e)
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
                          .getElementById(
                            `q-${question.id}-choiceimg-${choiceIndex}`
                          )
                          ?.click()
                      }
                      className="w-full text-xs mb-2"
                      icon={<UploadCloud size={14} />}
                      disabled={isLoadingSubmit}>
                      {choice.previewUrl ? "Change Image" : "Select Image"}
                    </Button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSetCorrectChoice(questionIndex, choiceIndex)
                      }
                      className={`w-full flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md transition-colors
                        ${
                          choice.isCorrect
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-500"
                        }`}
                      disabled={isLoadingSubmit}>
                      {choice.isCorrect ? (
                        <CheckSquare size={14} className="mr-1.5" />
                      ) : (
                        <XSquare size={14} className="mr-1.5 opacity-50" />
                      )}
                      {choice.isCorrect ? "Correct Answer" : "Mark as Correct"}
                    </button>
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
            Create Image Quiz
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateImageMultipleChoice;
