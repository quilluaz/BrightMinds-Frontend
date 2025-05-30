// src/components/game/Jeric/CreateMatchingGame.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Trash2,
  UploadCloud,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { gameService } from "../../../services/game"; // Ensure this service is correctly set up if used, or direct fetch is fine
import { API_BASE_URL } from "../../../config"; // Using API_BASE_URL from config
import { MatchingPair } from "../../../types";
import Button from "../../common/Button";

interface UIPair {
  uiId: string;
  textInput1: string;
  textInput2: string;
  imageUrl: string;
  imageFile?: File;
  imagePreviewUrl?: string;
}

interface GameTemplate {
  activityName: string;
  maxScore: number;
  pairs: UIPair[];
}

const CreateMatchingGame: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [gameTemplate, setGameTemplate] = useState<GameTemplate>({
    activityName: "",
    maxScore: 100,
    pairs: [
      {
        uiId: `pair${Date.now()}`,
        textInput1: "",
        textInput2: "",
        imageUrl: "",
        imagePreviewUrl: "",
      },
    ],
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);

  const handleGameTemplateChange = (
    field: keyof Omit<GameTemplate, "pairs">,
    value: string | number
  ) => {
    setGameTemplate({ ...gameTemplate, [field]: value });
  };

  const handlePairChange = (
    pairIndex: number,
    field: keyof Omit<
      UIPair,
      "uiId" | "imageFile" | "imagePreviewUrl" | "imageUrl"
    >,
    value: string
  ) => {
    const newPairs = [...gameTemplate.pairs];
    newPairs[pairIndex] = {
      ...newPairs[pairIndex],
      [field]: value,
    };
    setGameTemplate({ ...gameTemplate, pairs: newPairs });
  };

  const handleImageSelect = (
    pairIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      setGameTemplate((prevTemplate) => ({
        ...prevTemplate,
        pairs: prevTemplate.pairs.map((p, idx) =>
          idx === pairIndex
            ? { ...p, imageFile: undefined, imagePreviewUrl: "", imageUrl: "" }
            : p
        ),
      }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setGameTemplate((prevTemplate) => ({
      ...prevTemplate,
      pairs: prevTemplate.pairs.map((p, idx) =>
        idx === pairIndex
          ? { ...p, imageFile: file, imagePreviewUrl: previewUrl, imageUrl: "" }
          : p
      ),
    }));
    setError(null);
  };

  const addPair = () => {
    if (gameTemplate.pairs.length >= 10) {
      setError("You can add a maximum of 10 pairs per game.");
      return;
    }
    setGameTemplate({
      ...gameTemplate,
      pairs: [
        ...gameTemplate.pairs,
        {
          uiId: `pair${Date.now()}`,
          textInput1: "",
          textInput2: "",
          imageUrl: "",
          imagePreviewUrl: "",
        },
      ],
    });
  };

  const removePair = (index: number) => {
    if (gameTemplate.pairs.length <= 1) {
      setError("You must have at least one pair.");
      return;
    }
    const newPairs = gameTemplate.pairs.filter((_, i) => i !== index);
    setGameTemplate({ ...gameTemplate, pairs: newPairs });
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
    if (gameTemplate.pairs.length === 0) {
      setError("Please add at least one matching pair.");
      return false;
    }
    for (let i = 0; i < gameTemplate.pairs.length; i++) {
      const pair = gameTemplate.pairs[i];
      if (!pair.textInput1.trim()) {
        setError(`Pair ${i + 1}: Word 1 (Text Card) is required.`);
        return false;
      }
      if (!pair.textInput2.trim()) {
        setError(`Pair ${i + 1}: Word 2 (Image Card Label) is required.`);
        return false;
      }
      if (!pair.imageFile && !pair.imageUrl) {
        setError(`Pair ${i + 1}: An image is required. Please select one.`);
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

      const pairsWithUploadedImageUrls = [...gameTemplate.pairs];

      for (let i = 0; i < pairsWithUploadedImageUrls.length; i++) {
        const pair = pairsWithUploadedImageUrls[i];
        if (pair.imageFile && !pair.imageUrl) {
          const formData = new FormData();
          formData.append("file", pair.imageFile);
          formData.append("gameType", "matching-game");

          // ### THE FIX IS HERE ###
          // Changed from `${API_BASE_URL}/upload/image` to `${API_BASE_URL}/api/upload/image`
          const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
            method: "POST",
            body: formData,
            // Consider adding Authorization headers if your /api/upload/image endpoint requires it
            // For example, if you use a global axios instance 'api' from 'src/services/api.ts' that handles auth:
            // headers: {
            //   'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Example if token is in localStorage
            //   'Accept': 'application/json',
            // },
          });

          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({
                message: `Image upload failed for pair ${i + 1} (Status: ${
                  response.status
                })`,
              }));
            throw new Error(
              errorData.message || `Failed to upload image for pair ${i + 1}.`
            );
          }

          const data = await response.json();
          pairsWithUploadedImageUrls[i].imageUrl = data.imagePath;
          pairsWithUploadedImageUrls[i].imageFile = undefined;
        } else if (!pair.imageFile && !pair.imageUrl) {
          throw new Error(
            `Pair ${i + 1} is missing an image. Please select one.`
          );
        }
      }

      setGameTemplate((prev) => ({
        ...prev,
        pairs: pairsWithUploadedImageUrls,
      }));

      const gameLogicPairs: MatchingPair[] = pairsWithUploadedImageUrls.map(
        (uiPair, index) => {
          if (!uiPair.imageUrl) {
            throw new Error(
              `Critical error: Image URL missing for pair ${
                index + 1
              } after upload attempt.`
            );
          }
          return {
            id: index + 1, // Backend might re-assign IDs or use its own sequence
            word: uiPair.textInput1,
            english: uiPair.textInput2, // This corresponds to 'content' for the image card or its label
            imageUrl: uiPair.imageUrl,
          };
        }
      );

      const gameDataPayload = {
        activityName: gameTemplate.activityName,
        maxScore: Number(gameTemplate.maxScore),
        isPremade: false, // User-created games are not premade
        gameMode: "MATCHING" as const,
        gameData: JSON.stringify({
          // Backend expects 'levels' with 'pairs' inside
          levels: [
            {
              // Assuming one level for simplicity, adjust if multi-level matching games are supported
              level: 1,
              title: gameTemplate.activityName || "Matching Challenge", // Or a default title
              pairs: gameLogicPairs,
            },
          ],
        }),
        createdBy: { id: currentUser.id }, // Or however your backend identifies the creator
      };

      // Use gameService.createGame which should internally use the auth-configured 'api' instance
      await gameService.createGame(gameDataPayload); // Casting to 'any' might be needed if type definitions mismatch slightly
      setSuccess("Matching Game created successfully! Redirecting...");

      // Reset form state
      setGameTemplate({
        activityName: "",
        maxScore: 100,
        pairs: [
          {
            uiId: `pair${Date.now()}`,
            textInput1: "",
            textInput2: "",
            imageUrl: "",
            imagePreviewUrl: "",
          },
        ],
      });
      setTimeout(() => navigate("/teacher/games/library"), 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create game or upload images. Please try again."
      );
      console.error("Error during game creation/image upload:", err);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-text dark:text-primary-text-dark">
          Create New Matching Game
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Design a fun word and picture matching activity for your students.
        </p>
      </header>

      {error && (
        <div
          className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative dark:bg-red-700/20 dark:border-red-600/30 dark:text-red-300 flex items-start"
          role="alert">
          <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {success && (
        <div
          className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative dark:bg-green-700/20 dark:border-green-600/30 dark:text-green-300 flex items-start"
          role="alert">
          <CheckCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <span className="block sm:inline">{success}</span>
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
                placeholder="e.g., Mga Hayop sa Bukid (Farm Animals)"
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
              Matching Pairs ({gameTemplate.pairs.length})
            </h2>
            <Button
              type="button"
              variant="outline"
              onClick={addPair}
              icon={<PlusCircle size={18} />}
              disabled={isLoadingSubmit}>
              Add Pair
            </Button>
          </div>

          {gameTemplate.pairs.map((pair, pairIndex) => (
            <div key={pair.uiId} className="card p-6 relative group">
              <div className="absolute top-3 right-3">
                <Button
                  type="button"
                  variant="text"
                  size="sm"
                  onClick={() => removePair(pairIndex)}
                  disabled={gameTemplate.pairs.length <= 1 || isLoadingSubmit}
                  className="text-red-500 hover:bg-red-100 dark:hover:bg-red-700/20 !p-2"
                  aria-label="Remove pair">
                  <Trash2 size={18} />
                </Button>
              </div>

              <h3 className="text-lg font-medium mb-4 text-primary-text dark:text-primary-text-dark">
                Pair {pairIndex + 1}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label
                      htmlFor={`pair-${pair.uiId}-text1`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Word 1 (Text for one card)
                    </label>
                    <input
                      id={`pair-${pair.uiId}-text1`}
                      type="text"
                      value={pair.textInput1}
                      onChange={(e) =>
                        handlePairChange(
                          pairIndex,
                          "textInput1",
                          e.target.value
                        )
                      }
                      className="input-field"
                      placeholder="e.g., Aso"
                      required
                      disabled={isLoadingSubmit}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This text will appear on one card.
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor={`pair-${pair.uiId}-text2`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Word 2 (Label for Image Card)
                    </label>
                    <input
                      id={`pair-${pair.uiId}-text2`}
                      type="text"
                      value={pair.textInput2}
                      onChange={(e) =>
                        handlePairChange(
                          pairIndex,
                          "textInput2",
                          e.target.value
                        )
                      }
                      className="input-field"
                      placeholder="e.g., Dog"
                      required
                      disabled={isLoadingSubmit}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This text will appear with the image on the other card.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image for this Pair
                  </label>
                  <div className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg h-48 relative">
                    {pair.imagePreviewUrl ? (
                      <img
                        src={pair.imagePreviewUrl}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain rounded-md"
                      />
                    ) : (
                      <div className="space-y-1 text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, GIF up to 2MB
                        </p>
                      </div>
                    )}
                    <input
                      id={`pair-${pair.uiId}-image`}
                      type="file"
                      accept="image/png, image/jpeg, image/gif"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => handleImageSelect(pairIndex, e)}
                      disabled={isLoadingSubmit}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document
                        .getElementById(`pair-${pair.uiId}-image`)
                        ?.click()
                    }
                    className="w-full mt-2"
                    icon={<UploadCloud size={16} />}
                    disabled={isLoadingSubmit}>
                    {pair.imagePreviewUrl ? "Change Image" : "Select Image"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-end items-center gap-4">
          {gameTemplate.pairs.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 order-first sm:order-none mr-auto">
              Total Pairs: {gameTemplate.pairs.length}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={addPair}
            icon={<PlusCircle size={18} />}
            disabled={isLoadingSubmit}>
            Add Another Pair
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoadingSubmit}
            disabled={isLoadingSubmit}>
            Create Matching Game
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateMatchingGame;
