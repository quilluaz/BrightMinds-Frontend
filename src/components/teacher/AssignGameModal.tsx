import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useClassroom } from '../../context/ClassroomContext';
import { GameDTO } from '../../types'; // AssignGameRequestDTO is not directly used if params are passed individually
import LoadingSpinner from '../common/LoadingSpinner';
import { Infinity, ListChecks } from 'lucide-react';

interface AssignGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameToAssign: GameDTO;
  fixedClassroomId?: string;
}

// Helper function for styling the attempt type buttons (moved outside or ensure it's accessible)
const getAttemptButtonStyle = (buttonType: 'unlimited' | 'limited', currentAttemptType: 'unlimited' | 'limited') => {
  const isActive = currentAttemptType === buttonType;
  return `
    flex-1 py-2 px-3 text-sm font-medium transition-colors duration-150 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-primary-interactive focus:ring-offset-1 dark:focus:ring-offset-primary-card-dark
    flex items-center justify-center space-x-2
    ${isActive
      ? 'bg-primary-interactive text-white dark:bg-primary-interactive-dark dark:text-primary-text'
      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
    }
    ${buttonType === 'unlimited' ? 'rounded-l-md' : ''}
    ${buttonType === 'limited' ? 'rounded-r-md' : ''}
  `;
};

const AssignGameModal: React.FC<AssignGameModalProps> = ({
  isOpen,
  onClose,
  gameToAssign,
  fixedClassroomId,
}) => {
  const { teacherClassrooms, fetchTeacherClassrooms, assignGameToClassroom, isLoading: isClassroomContextLoading } = useClassroom();
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>(fixedClassroomId || '');
  const [dueDate, setDueDate] = useState<string>('');
  const [attemptType, setAttemptType] = useState<'unlimited' | 'limited'>('unlimited');
  const [customAttempts, setCustomAttempts] = useState<number>(1);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !fixedClassroomId && teacherClassrooms.length === 0 && fetchTeacherClassrooms) {
      fetchTeacherClassrooms();
    }
    
    if(isOpen) {
        setSelectedClassroomId(fixedClassroomId || (teacherClassrooms.length > 0 ? teacherClassrooms[0].id : ''));
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const year = tomorrow.getFullYear();
        const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
        const day = tomorrow.getDate().toString().padStart(2, '0');
        const hours = tomorrow.getHours().toString().padStart(2, '0');
        const minutes = tomorrow.getMinutes().toString().padStart(2, '0');
        setDueDate(`${year}-${month}-${day}T${hours}:${minutes}`);

        setAttemptType('unlimited');
        setCustomAttempts(1);
        setError(null);
        setSuccessMessage(null);
    }
  }, [isOpen, fetchTeacherClassrooms, teacherClassrooms, fixedClassroomId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // --- DEBUGGING: Log the gameToAssign object ---
    console.log("AssignGameModal: gameToAssign upon submit:", JSON.stringify(gameToAssign, null, 2));
    // --- END DEBUGGING ---

    const finalClassroomId = fixedClassroomId || selectedClassroomId;

    if (!finalClassroomId) {
      setError("Please select a classroom.");
      return;
    }
    if (!dueDate) {
      setError("Please set a due date.");
      return;
    }
    if (new Date(dueDate) < new Date()) {
        setError("Due date cannot be in the past.");
        return;
    }
    
    // MODIFIED CHECK: Ensure gameToAssign and its id are valid
    if (!gameToAssign || typeof gameToAssign.id !== 'string' || gameToAssign.id.trim() === '') {
        setError("No valid game selected to assign or game ID is missing/invalid.");
        console.error("Invalid gameToAssign object or gameToAssign.id:", gameToAssign);
        return;
    }
    // Further check if gameToAssign.id is a parsable number string
    // This check is crucial and should ideally prevent the error in the context
    if (isNaN(parseInt(gameToAssign.id, 10))) {
        setError(`Game ID "${gameToAssign.id}" is not a valid number format for assignment.`);
        console.error(`Game ID "${gameToAssign.id}" from modal is not a valid number format.`);
        return;
    }

    let attemptsValue: number | undefined = undefined;
    if (attemptType === 'limited') {
      if (customAttempts < 1 || !Number.isInteger(customAttempts)) {
        setError("Limited attempts must be a whole number greater than 0.");
        return;
      }
      attemptsValue = customAttempts;
    }

    setIsLoading(true);
    try {
      await assignGameToClassroom(
        finalClassroomId,
        gameToAssign, 
        new Date(dueDate).toISOString(),
        attemptsValue
      );
      setSuccessMessage(`Successfully assigned "${gameToAssign.title}"!`);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign game (unknown error).");
      console.error("Error during assignGameToClassroom call in Modal:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const modalFooter = (
    <>
      <Button variant="text" onClick={onClose} disabled={isLoading}>
        Cancel
      </Button>      
      <Button 
        type="submit" 
        form="assign-game-form" 
        variant="primary" 
        isLoading={isLoading} 
        disabled={isLoading || (!fixedClassroomId && !selectedClassroomId)}
      >
        Assign Game
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign: ${gameToAssign.title}`} footer={modalFooter} size="md">
      {isClassroomContextLoading && !fixedClassroomId ? <LoadingSpinner /> : (
        <form id="assign-game-form" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm mb-4 bg-red-100 dark:bg-red-900 dark:bg-opacity-20 p-2 rounded-md">{error}</p>}
          {successMessage && <p className="text-green-600 dark:text-green-400 text-sm mb-4 bg-green-100 dark:bg-green-900 dark:bg-opacity-20 p-2 rounded-md">{successMessage}</p>}

          {!fixedClassroomId && (
            <div className="mb-4">
              <label htmlFor="classroom-select" className="block text-sm font-medium text-primary-text dark:text-primary-text-dark mb-1">
                Select Classroom
              </label>
              {teacherClassrooms.length > 0 ? (
                <select
                  id="classroom-select"
                  value={selectedClassroomId}
                  onChange={(e) => setSelectedClassroomId(e.target.value)}
                  className="input-field w-full bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600"
                  disabled={isLoading}
                  required
                >
                  <option value="" disabled>-- Select a classroom --</option>
                  {teacherClassrooms.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </option>
                  ))}
                </select>
              ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">You have no classrooms. Create one first!</p>
              )}
            </div>
          )}
          {fixedClassroomId && teacherClassrooms.find(c => c.id === fixedClassroomId) && (
             <div className="mb-4">
                <label className="block text-sm font-medium text-primary-text dark:text-primary-text-dark mb-1">
                    Assigning to
                </label>
                <p className="input-field w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                    {teacherClassrooms.find(c => c.id === fixedClassroomId)?.name || 'Selected Classroom'}
                </p>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="due-date" className="block text-sm font-medium text-primary-text dark:text-primary-text-dark mb-1">
              Due Date & Time
            </label>
            <input
              id="due-date"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-field w-full bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600"
              disabled={isLoading}
              min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-text dark:text-primary-text-dark mb-1">
              Max Attempts
            </label>
            <div className="flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setAttemptType('unlimited')}
                className={getAttemptButtonStyle('unlimited', attemptType)}
                disabled={isLoading}
              >
                <Infinity size={16} />
                <span>Unlimited</span>
              </button>
              <button
                type="button"
                onClick={() => setAttemptType('limited')}
                className={getAttemptButtonStyle('limited', attemptType)}
                disabled={isLoading}
              >
                <ListChecks size={16} />
                <span>Limited</span>
              </button>
            </div>

            {attemptType === 'limited' && (
              <div className="mt-2">
                <input
                  type="number"
                  value={customAttempts}
                  onChange={(e) => setCustomAttempts(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="input-field w-full bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600"
                  min="1"
                  step="1"
                  placeholder="e.g., 3"
                  disabled={isLoading}
                  required={attemptType === 'limited'}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter the maximum number of times a student can play this game.
                </p>
              </div>
            )}
             {attemptType === 'unlimited' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Students can play this game as many times as they like.
                </p>
             )}
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AssignGameModal;