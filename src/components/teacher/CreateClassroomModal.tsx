import React, { useState } from 'react';
import { CheckCircle, Copy, Bookmark } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useClassroom } from '../../context/ClassroomContext';

interface CreateClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateClassroomModal: React.FC<CreateClassroomModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdClassroom, setCreatedClassroom] = useState<{name: string, code: string} | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  
  const { createClassroom } = useClassroom();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const classroom = await createClassroom(name, description);
      setCreatedClassroom({
        name: classroom.name,
        code: classroom.code
      });
    } catch (error) {
      console.error('Error creating classroom:', error);
      // You could set an error state and display it
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyCode = () => {
    if (createdClassroom) {
      navigator.clipboard.writeText(createdClassroom.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };
  
  const handleClose = () => {
    setName('');
    setDescription('');
    setCreatedClassroom(null);
    setCodeCopied(false);
    onClose();
  };
  
  const modalFooter = (
    <>
      {!createdClassroom ? (
        <>
          <Button variant="text" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!name.trim()}
          >
            Create Classroom
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
      title={createdClassroom ? "Classroom Created!" : "Create New Classroom"}
      footer={modalFooter}
    >
      {!createdClassroom ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Classroom Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="e.g., Tagalog Class 3-A"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-[100px]"
              placeholder="Briefly describe this classroom..."
            ></textarea>
          </div>
        </form>
      ) : (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-celebrate">
              <CheckCircle size={32} />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-1">{createdClassroom.name}</h3>
          <p className="text-gray-600 mb-6">Your classroom has been created successfully!</p>
          
          <div className="bg-primary-interactive bg-opacity-10 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Classroom Code:</p>
                <p className="text-lg font-mono font-semibold">{createdClassroom.code}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                icon={codeCopied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
              >
                {codeCopied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
          
          <div className="text-left bg-amber-50 p-4 rounded-lg border border-amber-100">
            <div className="flex">
              <Bookmark size={20} className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">Share this code with your students</p>
                <p className="text-xs text-amber-700 mt-1">
                  Students will need this code to join your classroom. You can always find this code later in your classroom settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CreateClassroomModal;