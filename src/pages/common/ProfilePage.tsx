import React, { useState, useEffect, ChangeEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import {
  User as UserIcon,
  Mail,
  Check,
  Edit3,
  UploadCloud,
} from "lucide-react";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Predefined DiceBear avatar options for students
const AVATAR_OPTIONS = [
  { seed: "robot1", label: "Robot 1" },
  { seed: "robot2", label: "Robot 2" },
  { seed: "robot3", label: "Robot 3" },
  { seed: "cat1", label: "Cat 1" },
  { seed: "cat2", label: "Cat 2" },
  { seed: "dog1", label: "Dog 1" },
  { seed: "dog2", label: "Dog 2" },
  { seed: "fox1", label: "Fox 1" },
];

const DEFAULT_TEACHER_AVATAR = "/images/avatars/default-user.svg";

const getSeedFromDiceBearUrl = (url: string | undefined): string | null => {
  if (url && url.includes("dicebear.com") && url.includes("seed=")) {
    const match = url.match(/seed=([^&]+)/);
    return match && match[1] ? match[1] : null;
  }
  return null;
};

const ProfilePage: React.FC = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const isTeacher = currentUser?.role === "TEACHER";

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Avatar specific states
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // For teacher's new physical file upload
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null); // URL for <img src>, can be blob or server path
  const [selectedDiceBearSeed, setSelectedDiceBearSeed] = useState<
    string | null
  >(null); // For student's DiceBear choice

  // UI control states
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to initialize form and avatar states from currentUser
  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
      setEmail(currentUser.email || "");

      if (isTeacher) {
        // Teacher: uses custom uploaded avatar or a default
        if (currentUser.profilePhoto) {
          // If the profilePhoto starts with http, use it directly, otherwise prepend API_BASE_URL
          const fullProfilePhotoPath = currentUser.profilePhoto.startsWith(
            "http"
          )
            ? currentUser.profilePhoto
            : `${API_BASE_URL}${currentUser.profilePhoto}`;
          setAvatarPreviewUrl(fullProfilePhotoPath);
        } else {
          setAvatarPreviewUrl(DEFAULT_TEACHER_AVATAR);
        }
        setSelectedDiceBearSeed(null); // Teachers don't use DiceBear selection UI
      } else {
        // Student: uses DiceBear avatars
        const seedFromUrl = getSeedFromDiceBearUrl(currentUser.avatarUrl);
        const initialStudentSeed =
          seedFromUrl && AVATAR_OPTIONS.some((opt) => opt.seed === seedFromUrl)
            ? seedFromUrl
            : currentUser.firstName?.toLowerCase().replace(/\s+/g, "") ||
              currentUser.email?.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") ||
              AVATAR_OPTIONS[0]?.seed ||
              "defaultstudent";

        setSelectedDiceBearSeed(initialStudentSeed);
        setAvatarPreviewUrl(
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
            initialStudentSeed
          )}`
        );
      }
    }
  }, [currentUser, isTeacher]);

  // Effect to update teacher's avatar preview when a new file is selected/staged
  useEffect(() => {
    if (isTeacher && avatarFile) {
      const objectUrl = URL.createObjectURL(avatarFile);
      setAvatarPreviewUrl(objectUrl);
      // Cleanup object URL when component unmounts or avatarFile changes
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [avatarFile, isTeacher]);

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isTeacher) return;
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // Max 2MB
        setError("File is too large. Maximum size is 2MB.");
        setAvatarFile(null);
        setAvatarPreviewUrl(
          currentUser?.profilePhoto || DEFAULT_TEACHER_AVATAR
        ); // Revert preview
        return;
      }
      setAvatarFile(file); // File is staged, useEffect above will create blob URL for preview
      setError(null);
    } else {
      // File selection cancelled
      setAvatarFile(null);
      // Revert preview to currently saved avatar or default if selection is cancelled
      setAvatarPreviewUrl(currentUser?.profilePhoto || DEFAULT_TEACHER_AVATAR);
    }
  };

  const handleDiceBearAvatarSelectForStudent = (seed: string) => {
    if (isTeacher) return;
    setSelectedDiceBearSeed(seed);
    setAvatarPreviewUrl(
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`
    );
  };

  const handleSaveChanges = async () => {
    setError(null);
    setSaveSuccess(false);
    if (!currentUser || !setCurrentUser) return;

    setIsLoading(true);

    try {
      if (isTeacher) {
        if (!firstName.trim() || !lastName.trim()) {
          setError("First and Last names cannot be empty.");
          setIsLoading(false);
          return;
        }
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
          setError("Please enter a valid email address.");
          setIsLoading(false);
          return;
        }

        let finalProfilePhotoPath = currentUser.profilePhoto;

        if (avatarFile) {
          // New file selected by teacher for upload
          const formData = new FormData();
          formData.append("file", avatarFile);
          formData.append("gameType", "teacher-profiles");

          const uploadResponse = await api.post("/upload/image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          finalProfilePhotoPath = uploadResponse.data.imagePath;
        }

        const teacherUpdatePayload = {
          firstName,
          lastName,
          email,
          profilePhoto: finalProfilePhotoPath,
        };

        const response = await api.put(
          `/teachers/${currentUser.id}/profile`,
          teacherUpdatePayload
        );
        const updatedUserFromBackend = response.data;

        setCurrentUser({
          ...currentUser,
          firstName: updatedUserFromBackend.firstName,
          lastName: updatedUserFromBackend.lastName,
          name: `${updatedUserFromBackend.firstName} ${updatedUserFromBackend.lastName}`.trim(),
          email: updatedUserFromBackend.email,
          profilePhoto: updatedUserFromBackend.profilePhoto,
        });

        setAvatarFile(null); // Clear staged file after successful save
        setIsEditing(false);
      } else {
        // Student: Save DiceBear avatar choice to backend
        if (selectedDiceBearSeed) {
          const studentNewAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
            selectedDiceBearSeed
          )}`;
          const studentUpdatePayload = {
            avatarImage: studentNewAvatarUrl,
          };

          const response = await api.put(
            `/students/${currentUser.id}/profile`,
            studentUpdatePayload
          );
          const updatedUserFromBackend = response.data;

          setCurrentUser({
            ...currentUser,
            avatarUrl: updatedUserFromBackend.avatarImage,
          });
        }
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Profile update failed:", err);
      setError(
        `Profile update failed: ${
          err.response?.data?.message || err.message || "Please try again."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Teacher only
    if (currentUser && isTeacher) {
      setFirstName(currentUser.firstName);
      setLastName(currentUser.lastName);
      setEmail(currentUser.email);
      setAvatarFile(null);
      setAvatarPreviewUrl(currentUser.profilePhoto || DEFAULT_TEACHER_AVATAR);
    }
    setIsEditing(false);
    setError(null);
  };

  // Determine the avatar URL to display (used by the <img> tag)
  let currentDisplayAvatarUrl: string;
  if (!currentUser) {
    currentDisplayAvatarUrl = DEFAULT_TEACHER_AVATAR; // General fallback
  } else if (isTeacher) {
    // For a teacher, if avatarFile is staged for upload, avatarPreviewUrl will be its blob URL
    // Otherwise, use the profilePhoto from the backend
    if (avatarPreviewUrl) {
      currentDisplayAvatarUrl = avatarPreviewUrl;
    } else if (currentUser.profilePhoto) {
      // If the profilePhoto starts with http, use it directly, otherwise prepend API_BASE_URL
      currentDisplayAvatarUrl = currentUser.profilePhoto.startsWith("http")
        ? currentUser.profilePhoto
        : `${API_BASE_URL}${currentUser.profilePhoto}`;
    } else {
      currentDisplayAvatarUrl = DEFAULT_TEACHER_AVATAR;
    }
  } else {
    // Student: always use the DiceBear URL
    currentDisplayAvatarUrl = avatarPreviewUrl || DEFAULT_TEACHER_AVATAR;
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Loading Profile...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary-text dark:text-primary-text-dark">
          My Profile
        </h1>
        {isTeacher && !isEditing && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            icon={<Edit3 size={16} />}
            disabled={isLoading}>
            Edit Profile
          </Button>
        )}
      </div>

      {error && (
        <div
          className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg dark:bg-red-700/20 dark:border-red-600/30 dark:text-red-300"
          role="alert">
          {error}
        </div>
      )}
      {saveSuccess && (
        <div
          className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg dark:bg-green-700/20 dark:border-green-600/30 dark:text-green-300 flex items-center"
          role="alert">
          <Check size={20} className="mr-2" /> Profile updated successfully!
        </div>
      )}

      <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
        {/* --- AVATAR & INFO SECTION --- */}
        <div className="mb-8 flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
          {/* Avatar Display & Upload (for Teacher) */}
          <div className="flex-shrink-0 flex flex-col items-center md:items-start w-full md:w-auto">
            <div className="w-32 h-32 sm:w-36 sm:h-36 mb-3 rounded-full overflow-hidden border-4 border-primary-interactive/20 dark:border-primary-interactive-dark/30 bg-gray-100 dark:bg-slate-700">
              <img
                src={currentDisplayAvatarUrl}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            {isTeacher && isEditing && (
              <div className="w-full text-center md:text-left">
                <input
                  type="file"
                  id="avatarUpload"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleImageFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById("avatarUpload")?.click()
                  }
                  icon={<UploadCloud size={14} />}
                  fullWidth={true}
                  disabled={isLoading}>
                  Upload New Avatar
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Max 2MB.
                </p>
              </div>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left mt-2">
              Profile Picture
            </p>
          </div>

          {/* User Info Fields */}
          <div className="flex-grow">
            <div className="mb-4">
              <label
                htmlFor="firstNameInput"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              {isTeacher && isEditing ? (
                <input
                  id="firstNameInput"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input-field w-full"
                  disabled={isLoading}
                />
              ) : (
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-gray-50 dark:bg-slate-700 text-primary-text dark:text-primary-text-dark">
                  <UserIcon
                    size={18}
                    className="text-gray-500 dark:text-gray-400 mr-2.5"
                  />
                  <span>{currentUser.firstName}</span>
                </div>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="lastNameInput"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              {isTeacher && isEditing ? (
                <input
                  id="lastNameInput"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input-field w-full"
                  disabled={isLoading}
                />
              ) : (
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-gray-50 dark:bg-slate-700 text-primary-text dark:text-primary-text-dark">
                  <UserIcon
                    size={18}
                    className="text-gray-500 dark:text-gray-400 mr-2.5 opacity-0"
                  />{" "}
                  {/* Hidden icon for alignment */}
                  <span>{currentUser.lastName}</span>
                </div>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="emailInput"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              {isTeacher && isEditing ? (
                <input
                  id="emailInput"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full"
                  disabled={isLoading}
                />
              ) : (
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-gray-50 dark:bg-slate-700 text-primary-text dark:text-primary-text-dark">
                  <Mail
                    size={18}
                    className="text-gray-500 dark:text-gray-400 mr-2.5"
                  />
                  <span>{currentUser.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DiceBear Avatar Selection for STUDENTS ONLY */}
        {!isTeacher && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4 text-primary-text dark:text-primary-text-dark">
              Choose Your Avatar
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar.seed}
                  className={`p-2 rounded-lg border-2 transition-all text-center ${
                    selectedDiceBearSeed === avatar.seed
                      ? "border-primary-interactive dark:border-primary-interactive-dark bg-primary-interactive/10 dark:bg-primary-interactive-dark/20 ring-2 ring-primary-interactive dark:ring-primary-interactive-dark"
                      : "border-gray-200 dark:border-gray-600 hover:border-primary-interactive dark:hover:border-primary-interactive-dark bg-white dark:bg-slate-700"
                  }`}
                  onClick={() =>
                    handleDiceBearAvatarSelectForStudent(avatar.seed)
                  }
                  disabled={isLoading}>
                  <div className="flex flex-col items-center">
                    <img
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                        avatar.seed
                      )}`}
                      alt={avatar.label}
                      className="w-16 h-16 mb-2 rounded"
                    />
                    <span className="text-xs sm:text-sm text-primary-text dark:text-primary-text-dark">
                      {avatar.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end items-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          {isTeacher && isEditing ? (
            <>
              <Button
                variant="text"
                onClick={handleCancelEdit}
                className="mr-3"
                disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveChanges}
                isLoading={isLoading}
                disabled={isLoading}>
                Save Changes
              </Button>
            </>
          ) : !isTeacher ? ( // Student save button
            <Button
              variant="primary"
              onClick={handleSaveChanges}
              disabled={
                isLoading ||
                !selectedDiceBearSeed ||
                currentUser.avatarUrl ===
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                    selectedDiceBearSeed
                  )}`
              }
              isLoading={isLoading}>
              Save Avatar Choice
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-right">
          All profile changes are saved to the server.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
