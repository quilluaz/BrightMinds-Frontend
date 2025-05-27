import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useClassroom } from '../../context/ClassroomContext';
import { GameDTO, AssignGameRequestDTO } from '../../types'; // Removed ClassroomDTO as it's not directly used for selection if fixed
import LoadingSpinner from '../common/LoadingSpinner';

interface AssignGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameToAssign: GameDTO;
  fixedClassroomId?: string; // New prop for fixed classroom context
}

const AssignGameModal: React.FC<AssignGameModalProps> = ({
  isOpen,
  onClose,
  gameToAssign,
  fixedClassroomId,
}) => {
  const { teacherClassrooms, fetchTeacherClassrooms, assignGameToClassroom, isLoading: isClassroomContextLoading } = useClassroom();
  // selectedClassroomId will be pre-filled if fixedClassroomId is provided
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>(fixedClassroomId || '');
  const [dueDate, setDueDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // If not a fixed classroom and no classrooms loaded, fetch them
    if (isOpen && !fixedClassroomId && teacherClassrooms.length === 0 && fetchTeacherClassrooms) {
      fetchTeacherClassrooms();
    }
    
    // Reset form on open
    if(isOpen) {
        // If fixedClassroomId is provided, use it. Otherwise, default to first classroom or empty.
        setSelectedClassroomId(fixedClassroomId || (teacherClassrooms.length > 0 ? teacherClassrooms[0].id : ''));
        setDueDate(''); // Reset due date
        const today = new Date();
        const minDate = new Date(today.setDate(today.getDate() + 1)); // Default to tomorrow
        setDueDate(minDate.toISOString().slice(0, 16));


        setError(null);
        setSuccessMessage(null);
    }
  }, [isOpen, fetchTeacherClassrooms, teacherClassrooms, fixedClassroomId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const finalClassroomId = fixedClassroomId || selectedClassroomId;

    if (!finalClassroomId) {
      setError("Please select a classroom.");
      return;
    }
    if (!dueDate) {
      setError("Please set a due date.");
      return;
    }
    if (!gameToAssign || !gameToAssign.id) {
        setError("No game selected to assign.");
        return;
    }
    
    // Validate due date is not in the past
    if (new Date(dueDate) < new Date()) {
        setError("Due date cannot be in the past.");
        return;
    }


    setIsLoading(true);
    try {
      const assignmentData: AssignGameRequestDTO = {
        gameId: gameToAssign.id,
        dueDate: new Date(dueDate).toISOString(),
      };
      // The `isPremade: true` is passed to the context function.
      // The context function `assignGameToClassroom` uses this boolean.
      // It's crucial that the context's API call correctly handles/sends this if required by the backend.
      // Based on the current context, it tries to send `isPremade` as a query param.
      await assignGameToClassroom(finalClassroomId, assignmentData.gameId, assignmentData.dueDate, true);
      setSuccessMessage(`Successfully assigned "${gameToAssign.title}"!`);
      
      setTimeout(() => {
        onClose(); // Close modal
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign game.");
      console.error("Error assigning game:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const modalFooter = (
    <>
      <Button variant="text" onClick={onClose} disabled={isLoading}>
        Cancel
      </Button>
      <Button type="submit" form="assign-game-form" variant="primary" isLoading={isLoading} disabled={isLoading || !selectedClassroomId}>
        Assign Game
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign: ${gameToAssign.title}`} footer={modalFooter} size="md">
      {isClassroomContextLoading && !fixedClassroomId ? <LoadingSpinner /> : ( // Show spinner only if fetching classrooms for selection
        <form id="assign-game-form" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm mb-4 bg-red-100 dark:bg-red-900 dark:bg-opacity-20 p-2 rounded-md">{error}</p>}
          {successMessage && <p className="text-green-600 dark:text-green-400 text-sm mb-4 bg-green-100 dark:bg-green-900 dark:bg-opacity-20 p-2 rounded-md">{successMessage}</p>}

          {/* Classroom selection dropdown, hidden if classroomId is fixed */}
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
          {fixedClassroomId && (
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
              min={new Date().toISOString().slice(0, 16)} // Prevent past dates/times
            />
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AssignGameModal;