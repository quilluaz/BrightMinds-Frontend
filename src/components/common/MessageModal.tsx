import React from "react";
import { X } from "lucide-react";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "info" | "warning" | "error";
  onAfterClose?: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  onAfterClose,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    if (onAfterClose) {
      onAfterClose();
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-500 text-green-700";
      case "warning":
        return "bg-yellow-50 border-yellow-500 text-yellow-700";
      case "error":
        return "bg-red-50 border-red-500 text-red-700";
      default:
        return "bg-blue-50 border-blue-500 text-blue-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={handleClose}></div>
      <div
        className={`relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 ${getTypeStyles()}`}>
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <p className="text-center">{message}</p>
        </div>
        <div className="p-4 border-t flex justify-center">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-primary-energetic text-white rounded hover:bg-primary-energetic-dark transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
