import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useClassroom } from '../../context/ClassroomContext';
import { GameDTO, ClassroomDTO, AssignGameRequestDTO } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

interface AssignGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameToAssign: GameDTO;
  // classroomId prop if opening from a specific classroom view (optional here, can be passed if needed)
  // currentClassroomId?: string;
}

const AssignGameModal: React.FC<AssignGameModalProps> = ({
  isOpen,
  onClose,
  gameToAssign,
  // currentClassroomId
}) => {
  const { teacherClassrooms, fetchTeacherClassrooms, assignGameToClassroom, isLoading: isClassroomContextLoading } = useClassroom();
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && teacherClassrooms.length === 0 && fetchTeacherClassrooms) {
      fetchTeacherClassrooms();
    }
    // If a classroom context is already set (e.g. if modal launched from specific classroom page)
    // you could pre-select it:
    // if (currentClassroomId) setSelectedClassroomId(currentClassroomId);

    // Reset form on open
    if(isOpen) {
        setSelectedClassroomId(teacherClassrooms.length > 0 ? teacherClassrooms[0].id : '');
        setDueDate('');
        setError(null);
        setSuccessMessage(null);
    }
  }, [isOpen, fetchTeacherClassrooms, teacherClassrooms /*, currentClassroomId */]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!selectedClassroomId) {
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

    setIsLoading(true);
    try {
      const assignmentData: AssignGameRequestDTO = {
        gameId: gameToAssign.id, // gameToAssign.id is the activityId from Game entity
        dueDate: new Date(dueDate).toISOString(), // Ensure format matches backend expectation
      };
      // The 'isPremade: true' is handled by the context's assignGameToClassroom based on the backend logic or passed explicitly if context supports it
      await assignGameToClassroom(selectedClassroomId, assignmentData.gameId, assignmentData.dueDate, true); // Assuming assignGameToClassroom handles isPremade
      setSuccessMessage(`Successfully assigned "${gameToAssign.title}"!`);
      // Optionally clear form or close modal after a delay
      setTimeout(() => {
        onClose();
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
      <Button type="submit" form="assign-game-form" variant="primary" isLoading={isLoading} disabled={isLoading}>
        Assign Game
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign: ${gameToAssign.title}`} footer={modalFooter} size="md">
      {isClassroomContextLoading ? <LoadingSpinner /> : (
        <form id="assign-game-form" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {successMessage && <p className="text-green-500 text-sm mb-4">{successMessage}</p>}

          <div className="mb-4">
            <label htmlFor="classroom-select" className="block text-sm font-medium text-primary-text dark:text-primary-text-dark mb-1">
              Select Classroom
            </label>
            {teacherClassrooms.length > 0 ? (
              <select
                id="classroom-select"
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
                className="input-field w-full"
                disabled={isLoading /* || !!currentClassroomId */}
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

          <div className="mb-4">
            <label htmlFor="due-date" className="block text-sm font-medium text-primary-text dark:text-primary-text-dark mb-1">
              Due Date
            </label>
            <input
              id="due-date"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-field w-full"
              disabled={isLoading}
              min={new Date().toISOString().slice(0, 16)} // Prevent past dates
            />
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AssignGameModal;