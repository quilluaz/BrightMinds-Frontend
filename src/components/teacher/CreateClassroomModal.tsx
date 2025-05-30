// src/components/teacher/CreateClassroomModal.tsx
import React, { useState } from "react";
import { CheckCircle, Copy, Bookmark } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useClassroom } from "../../context/ClassroomContext";
import { CreateClassroomRequestDTO, Classroom } from "../../types";
import MessageModal from "../common/MessageModal";

interface CreateClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateClassroomModal: React.FC<CreateClassroomModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Ensure createdClassroom state can hold the structure returned by your context
  const [createdClassroom, setCreatedClassroom] = useState<Classroom | null>(
    null
  );
  const [codeCopied, setCodeCopied] = useState(false);
  const [messageModal, setMessageModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "info" | "warning" | "error";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "error",
  });

  const { createClassroom } = useClassroom();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessageModal({
        isOpen: true,
        title: "Validation Error",
        message: "Classroom name cannot be empty.",
        type: "error",
      });
      return;
    }
    setIsLoading(true);

    try {
      // Corrected call: pass an object
      const classroomInput: CreateClassroomRequestDTO = { name, description };
      const newClassroom = await createClassroom(classroomInput); // newClassroom can be Classroom | null

      if (newClassroom) {
        setCreatedClassroom(newClassroom);
      } else {
        // Handle case where classroom creation might return null due to an error caught in context
        console.error("Classroom creation returned null");
        // Optionally set an error message to display to the user
      }
    } catch (error) {
      console.error("Error creating classroom in modal:", error);
      // You could set an error state and display it
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (createdClassroom && createdClassroom.code) {
      navigator.clipboard.writeText(createdClassroom.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
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
            type="submit" // Changed to type="submit" to trigger form's onSubmit
            onClick={handleSubmit} // Can also be removed if form's onSubmit is solely used
            isLoading={isLoading}
            disabled={!name.trim()}>
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
    <>
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={() => setMessageModal((prev) => ({ ...prev, isOpen: false }))}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
      />
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={createdClassroom ? "Classroom Created!" : "Create New Classroom"}
        footer={modalFooter}>
        {!createdClassroom ? (
          <div>
            <div className="mb-4">
              <label
                htmlFor="classroomNameInput"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Classroom Name
              </label>
              <input
                id="classroomNameInput" // Changed id to avoid conflict if "name" is used elsewhere
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field" // Ensure this class is defined with appropriate styles
                placeholder="e.g., Grade 3 - Tagalog"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="classroomDescriptionInput"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="classroomDescriptionInput" // Changed id
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field min-h-[100px]" // Ensure this class is defined
                placeholder="Briefly describe this classroom..."></textarea>
            </div>
          </div>
        ) : (
          // </form>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle size={32} />
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-1">
              {createdClassroom.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your classroom has been created successfully!
            </p>

            <div className="bg-primary-interactive bg-opacity-10 dark:bg-opacity-20 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Classroom Code:
                  </p>
                  <p className="text-lg font-mono font-semibold text-primary-text dark:text-primary-text-dark">
                    {createdClassroom.code}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  icon={
                    codeCopied ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} />
                    )
                  }>
                  {codeCopied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="text-left bg-amber-50 dark:bg-amber-800 dark:bg-opacity-20 p-4 rounded-lg border border-amber-100 dark:border-amber-700">
              <div className="flex">
                <Bookmark
                  size={20}
                  className="text-amber-500 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Share this code with your students
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Students will need this code to join your classroom. You can
                    always find this code later in your classroom settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default CreateClassroomModal;
