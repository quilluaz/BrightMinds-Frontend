import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Classroom, UpdateClassroomRequestDTO } from '../../types'; // Changed ClassroomDTO to Classroom
import { useClassroom } from '../../context/ClassroomContext'; 
import { Edit3, Trash2, AlertTriangle, Copy, Check } from 'lucide-react';

interface ClassroomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: Classroom; // Changed to Classroom
}

const ClassroomSettingsModal: React.FC<ClassroomSettingsModalProps> = ({ isOpen, onClose, classroom }) => {
  const { updateClassroom, deleteClassroom } = useClassroom(); 
  const [name, setName] = useState(classroom.name);
  const [description, setDescription] = useState(classroom.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(classroom.name);
      setDescription(classroom.description || '');
      setError(null);
      setShowDeleteConfirm(false);
      setCodeCopied(false);
    }
  }, [isOpen, classroom]);

  const handleSaveChanges = async () => {
    if (!name.trim()) {
      setError("Classroom name cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const updateData: UpdateClassroomRequestDTO = { name, description };
      if (updateClassroom && typeof classroom.id === 'string') { 
        await updateClassroom(classroom.id, updateData);
      } else {
        console.warn("updateClassroom function is not available or classroom.id is not a string.");
        alert(`Classroom updated (simulated): ${name} - ${description}`);
      }
      onClose(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update classroom.");
      console.error("Error updating classroom:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClassroom = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (deleteClassroom && typeof classroom.id === 'string') {
        await deleteClassroom(classroom.id);
      } else {
        console.warn("deleteClassroom function is not available or classroom.id is not a string.");
        alert(`Classroom "${classroom.name}" deleted (simulated).`);
      }
      onClose(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete classroom.");
      console.error("Error deleting classroom:", err);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCopyCode = () => {
    if (classroom.code) { // Changed from classroom.uniqueCode
      navigator.clipboard.writeText(classroom.code); // Changed from classroom.uniqueCode
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const modalFooter = (
    <>
      {showDeleteConfirm ? (
        <>
          <Button variant="text" onClick={() => setShowDeleteConfirm(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="energetic" onClick={handleDeleteClassroom} isLoading={isLoading} icon={<Trash2 size={16}/>}>
            Yes, Delete
          </Button>
        </>
      ) : (
        <>
          <Button variant="text" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveChanges} isLoading={isLoading} icon={<Edit3 size={16}/>}>
            Save Changes
          </Button>
        </>
      )}
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={showDeleteConfirm ? "Confirm Deletion" : "Classroom Settings"}
      footer={modalFooter}
      size="md"
    >
      {error && (
        <div className="bg-red-100 dark:bg-red-700/30 text-red-700 dark:text-red-300 p-3 rounded-md mb-4 text-sm flex items-center border border-red-300 dark:border-red-500/50">
          <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showDeleteConfirm ? (
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-lg font-medium text-primary-text dark:text-primary-text-dark">
            Are you sure you want to delete "{classroom.name}"?
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            This action is irreversible and will remove all associated data.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="classroomNameSettings" className="block text-sm font-medium text-primary-text dark:text-primary-text-dark mb-1">
              Classroom Name
            </label>
            <input
              id="classroomNameSettings"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Enter classroom name"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="classroomDescriptionSettings" className="block text-sm font-medium text-primary-text dark:text-primary-text-dark mb-1">
              Description (Optional)
            </label>
            <textarea
              id="classroomDescriptionSettings"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-[100px]"
              placeholder="Briefly describe this classroom"
              disabled={isLoading}
            ></textarea>
          </div>

          {classroom.code && ( // Changed from classroom.uniqueCode
            <div className="pt-2">
              <label className="block text-sm font-medium text-primary-text dark:text-primary-text-dark mb-1">
                Join Code
              </label>
              <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="font-mono text-lg text-primary-text dark:text-primary-text-dark">
                  {classroom.code} {/* Changed from classroom.uniqueCode */}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    icon={codeCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    className="transition-all"
                  >
                    {codeCopied ? 'Copied!' : 'Copy'}
                  </Button>
              </div>
            </div>
          )}

          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="text"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/20 w-full justify-start"
              icon={<Trash2 size={16} />}
              disabled={isLoading}
            >
              Delete Classroom
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ClassroomSettingsModal;