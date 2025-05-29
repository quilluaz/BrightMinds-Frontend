import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AssignedGameDTO, LeaderboardEntry, UpdateAssignedGameRequestDTO } from '../../types';
import { useClassroom } from '../../context/ClassroomContext';
import LeaderboardTable from '../common/LeaderboardTable';
import LoadingSpinner from '../common/LoadingSpinner';
import { BarChart2, CheckCircle, Clock, Users, Tag, CalendarDays, Info, Edit3, Trash2, Save, X, AlertTriangle, AlertCircle as AlertInfoIcon } from 'lucide-react';

interface GameStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignedGame: AssignedGameDTO | null;
  classroomId: string;
  onAssignmentUpdatedOrDeleted: () => void; // Callback to refresh parent list
}

const GameStatisticsModal: React.FC<GameStatisticsModalProps> = ({ 
  isOpen, onClose, assignedGame, classroomId, onAssignmentUpdatedOrDeleted 
}) => {
  const { getGameLeaderboard, updateAssignedGame, deleteAssignedGame } = useClassroom();
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [averageGameScore, setAverageGameScore] = useState<number | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editableDeadline, setEditableDeadline] = useState('');
  const [editableMaxAttempts, setEditableMaxAttempts] = useState<string>(''); // Store as string for input
  const [attemptType, setAttemptType] = useState<'unlimited' | 'limited'>('unlimited');

  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  useEffect(() => {
    if (isOpen && assignedGame && classroomId) {
      const gameForStats = assignedGame.game;
      if (gameForStats?.id) {
        const fetchStats = async () => {
          setIsLoadingStats(true);
          try {
            const gameLeaderboardData = await getGameLeaderboard(classroomId, gameForStats.id);
            setLeaderboard(gameLeaderboardData);
            if (gameLeaderboardData.length > 0) {
              const totalScore = gameLeaderboardData.reduce((sum, entry) => sum + entry.score, 0);
              setAverageGameScore(Math.round(totalScore / gameLeaderboardData.length));
            } else { setAverageGameScore(null); }
          } catch (error) { console.error("Failed to fetch game statistics:", error); setLeaderboard([]); setAverageGameScore(null);
          } finally { setIsLoadingStats(false); }
        };
        fetchStats();
      } else { setIsLoadingStats(false); setLeaderboard([]); setAverageGameScore(null); }
      
      // Initialize edit form fields
      setEditableDeadline(assignedGame.dueDate ? new Date(new Date(assignedGame.dueDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
      if (assignedGame.maxAttempts != null) {
        setEditableMaxAttempts(assignedGame.maxAttempts.toString());
        setAttemptType('limited');
      } else {
        setEditableMaxAttempts('1'); // Default for limited if switching
        setAttemptType('unlimited');
      }
      setIsEditing(false); // Reset edit mode on open
      setActionError(null);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, assignedGame, classroomId, getGameLeaderboard]);

  const handleSaveChanges = async () => {
    if (!assignedGame) return;
    setActionError(null);
    setIsProcessingAction(true);
    
    const newDeadline = new Date(editableDeadline);
    if (isNaN(newDeadline.getTime()) || newDeadline < new Date()) {
        setActionError("Invalid due date. Please select a future date and time.");
        setIsProcessingAction(false);
        return;
    }

    const updates: UpdateAssignedGameRequestDTO = {
      deadline: newDeadline.toISOString(),
      maxAttempts: attemptType === 'limited' ? parseInt(editableMaxAttempts, 10) : null,
    };

    if (attemptType === 'limited' && (isNaN(updates.maxAttempts!) || updates.maxAttempts! < 1)) {
        setActionError("Limited attempts must be a positive whole number.");
        setIsProcessingAction(false);
        return;
    }

    try {
      await updateAssignedGame(classroomId, assignedGame.id, updates);
      onAssignmentUpdatedOrDeleted(); // Trigger refresh in parent
      setIsEditing(false);
      // onClose(); // Or keep modal open to show updated info, parent refetch will update `assignedGame` prop
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!assignedGame) return;
    setActionError(null);
    setIsProcessingAction(true);
    try {
      await deleteAssignedGame(classroomId, assignedGame.id);
      onAssignmentUpdatedOrDeleted();
      onClose(); // Close modal after delete
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete assignment.");
    } finally {
      setIsProcessingAction(false);
      setShowDeleteConfirm(false);
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setActionError(null);
    // Reset editable fields to original values if needed
    if(assignedGame) {
        setEditableDeadline(assignedGame.dueDate ? new Date(new Date(assignedGame.dueDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
        if (assignedGame.maxAttempts != null) {
            setEditableMaxAttempts(assignedGame.maxAttempts.toString());
            setAttemptType('limited');
        } else {
            setEditableMaxAttempts('1');
            setAttemptType('unlimited');
        }
    }
  };


  if (!isOpen || !assignedGame || !assignedGame.game) return null;
  const gameDetails = assignedGame.game;

  const modalFooterContent = () => {
    if (showDeleteConfirm) {
      return (
        <>
          <Button variant="text" onClick={() => setShowDeleteConfirm(false)} disabled={isProcessingAction}>Cancel</Button>
          <Button variant="energetic" onClick={handleDeleteConfirmed} isLoading={isProcessingAction} icon={<Trash2 size={16}/>}>Confirm Delete</Button>
        </>
      );
    }
    if (isEditing) {
      return (
        <>
          <Button variant="text" onClick={handleCancelEdit} disabled={isProcessingAction}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveChanges} isLoading={isProcessingAction} icon={<Save size={16}/>}>Save Changes</Button>
        </>
      );
    }
    return (
      <>
        <Button variant="outline" onClick={() => setIsEditing(true)} icon={<Edit3 size={16}/>} className="mr-auto">Edit Assignment</Button>
        <Button variant="text" onClick={() => setShowDeleteConfirm(true)} className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30" icon={<Trash2 size={16}/>}>Delete</Button>
        <Button variant="primary" onClick={onClose}>Done</Button>
      </>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? `Editing: ${gameDetails.title}` : `Details for: ${gameDetails.title}`} footer={modalFooterContent()} size="lg">
      {actionError && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center" role="alert">
            <AlertTriangle size={18} className="mr-2"/> {actionError}
          </div>
      )}

      {showDeleteConfirm ? (
        <div className="text-center p-4">
            <AlertTriangle size={40} className="text-red-500 mx-auto mb-4"/>
            <p className="text-lg font-medium">Are you sure you want to delete the assignment <br/>"{gameDetails.title}"?</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This action cannot be undone. All student progress for this specific assignment will be affected.</p>
        </div>
      ) : isEditing ? (
        // --- EDIT FORM ---
        <div className="space-y-4 p-2">
          <div>
            <label htmlFor="edit-deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
            <input
              id="edit-deadline"
              type="datetime-local"
              value={editableDeadline}
              onChange={(e) => setEditableDeadline(e.target.value)}
              className="input-field w-full"
              min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Attempts</label>
            <div className="flex rounded-md shadow-sm">
                <button type="button" onClick={()=> setAttemptType('unlimited')} className={`flex-1 btn ${attemptType === 'unlimited' ? 'btn-primary dark:!bg-primary-interactive-dark dark:!text-white' : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600'} !rounded-r-none`}>Unlimited</button>
                <button type="button" onClick={()=> setAttemptType('limited')} className={`flex-1 btn ${attemptType === 'limited' ? 'btn-primary dark:!bg-primary-interactive-dark dark:!text-white' : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600'} !rounded-l-none`}>Limited</button>
            </div>
            {attemptType === 'limited' && (
                <input
                    type="number"
                    value={editableMaxAttempts}
                    onChange={(e) => setEditableMaxAttempts(e.target.value)}
                    className="input-field w-full mt-2"
                    min="1"
                    placeholder="Enter max attempts (e.g., 3)"
                />
            )}
          </div>
        </div>
      ) : (
        // --- VIEW INFO ---
        <div className="space-y-5 p-1">
          {isLoadingStats ? ( <div className="flex justify-center items-center h-40"><LoadingSpinner /></div> ) : (
            <>
              <div>
                <h4 className="text-lg font-semibold text-primary-text dark:text-primary-text-dark mb-2 border-b dark:border-gray-700 pb-1.5">Assignment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <p className="text-gray-700 dark:text-gray-300"><strong className="font-medium">Mode:</strong> <span className="capitalize">{gameDetails.gameMode?.replace(/_/g, ' ').toLowerCase() || 'N/A'}</span></p>
                  <p className="text-gray-700 dark:text-gray-300"><strong className="font-medium">Subject:</strong> {gameDetails.subject || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300"><strong className="font-medium">Deadline:</strong> {new Date(assignedGame.dueDate).toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'})}</p>
                  <p className="text-gray-700 dark:text-gray-300"><strong className="font-medium">Status:</strong> <span className="capitalize">{assignedGame.status?.toLowerCase() || 'N/A'}</span></p>
                  <p className="text-gray-700 dark:text-gray-300"><strong className="font-medium">Max Score:</strong> {gameDetails.maxScore || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300"><strong className="font-medium">Max Attempts:</strong> {assignedGame.maxAttempts != null ? assignedGame.maxAttempts : 'Unlimited'}</p>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400"><strong className="font-medium">Description:</strong> {gameDetails.description || 'No description.'}</p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-primary-text dark:text-primary-text-dark mb-2 border-b dark:border-gray-700 pb-1.5 mt-3">
                  Game Leaderboard
                </h4>
                {averageGameScore !== null && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Average score for this game by students who attempted: <span className="font-semibold">{averageGameScore}%</span>
                  </p>
                )}
                {leaderboard.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    <LeaderboardTable entries={leaderboard} />
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 dark:bg-slate-800 rounded-md">
                     <BarChart2 size={32} className="mx-auto text-gray-400 dark:text-gray-500 mb-2"/>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No student has attempted this game yet.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
};

export default GameStatisticsModal;