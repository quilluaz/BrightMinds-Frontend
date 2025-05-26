import React, { useState } from "react";
import { KeyRound, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import Button from "../common/Button";
import { useClassroom } from "../../context/ClassroomContext";

interface JoinClassroomCardProps {
  onClassroomJoined?: () => void;
  className?: string; // Allow passing additional Tailwind classes
}

const JoinClassroomCard: React.FC<JoinClassroomCardProps> = ({
  onClassroomJoined,
  className = "",
}) => {
  const { joinClassroom } = useClassroom();
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState(false);

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setJoinError("Please enter a classroom code.");
      return;
    }
    setIsJoining(true);
    setJoinError(null);
    setJoinSuccess(false);
    try {
      await joinClassroom(joinCode.trim().toUpperCase());
      setJoinSuccess(true);
      setJoinCode("");
      if (onClassroomJoined) {
        onClassroomJoined();
      }
      setTimeout(() => {
        setJoinSuccess(false);
      }, 3000);
    } catch (err) {
      setJoinError(
        err instanceof Error ? err.message : "An error occurred while joining."
      );
    } finally {
      setIsJoining(false);
    }
  };

  return (
    // Removed card class, border directly for more control via props if needed
    // Added max-w-sm for a smaller default width, can be overridden by parent grid
    <div
      className={`bg-primary-background dark:bg-primary-card-dark p-4 md:p-5 rounded-xl shadow-md ${className}`}>
      <h3 className="text-md md:text-lg font-semibold mb-3 text-primary-text dark:text-primary-text-dark">
        Got a Classroom Code?
      </h3>
      {joinError && (
        <div className="bg-red-100 dark:bg-red-800 dark:bg-opacity-50 text-red-700 dark:text-red-300 p-2.5 rounded-md mb-3 text-xs flex items-start border border-red-300 dark:border-red-600">
          <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{joinError}</span>
        </div>
      )}
      {joinSuccess && (
        <div className="bg-green-100 dark:bg-green-800 dark:bg-opacity-50 text-green-700 dark:text-green-300 p-2.5 rounded-md mb-3 text-xs flex items-start border border-green-300 dark:border-green-600">
          <CheckCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>Joined! Your new classroom is in the list.</span>
        </div>
      )}
      <form onSubmit={handleJoinSubmit} className="space-y-2.5">
        <div>
          <label htmlFor="joinCode" className="sr-only">
            Classroom Code
          </label>
          <div className="relative flex items-center">
            <KeyRound
              size={18}
              className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none"
            />
            <input
              id="joinCode"
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="input-field font-mono pl-10 pr-2 py-2 text-sm w-full !rounded-lg"
              placeholder="ABCXYZ"
              maxLength={8}
              autoComplete="off"
              required
              disabled={isJoining}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="ml-2 !px-3 !py-2 !rounded-lg" // More compact button
              isLoading={isJoining}
              disabled={!joinCode.trim() || isJoining}
              icon={<ArrowRight size={16} />}>
              Join
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default JoinClassroomCard;
