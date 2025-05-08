import React, { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useClassroom } from '../../context/ClassroomContext';

interface JoinClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JoinClassroomModal: React.FC<JoinClassroomModalProps> = ({ isOpen, onClose }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { joinClassroom } = useClassroom();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await joinClassroom(code.trim().toUpperCase());
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while joining the classroom');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    setCode('');
    setSuccess(false);
    setError(null);
    onClose();
  };
  
  const modalFooter = (
    <>
      {!success ? (
        <>
          <Button variant="text" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!code.trim()}
          >
            Join Classroom
          </Button>
        </>
      ) : (
        <Button variant="primary" onClick={handleClose}>
          Done
        </Button>
      )}
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={success ? "Successfully Joined!" : "Join a Classroom"}
      footer={modalFooter}
    >
      {!success ? (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="mb-2">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Classroom Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input-field font-mono"
              placeholder="Enter 6-character code"
              maxLength={6}
              autoComplete="off"
              required
            />
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Ask your teacher for the 6-character classroom code.
          </p>
        </form>
      ) : (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-celebrate">
              <CheckCircle size={32} />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-1">You've joined the classroom!</h3>
          <p className="text-gray-600 mb-6">
            You now have access to all learning activities and materials.
          </p>
        </div>
      )}
    </Modal>
  );
};

export default JoinClassroomModal;