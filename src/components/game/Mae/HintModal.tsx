import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Theme } from '@mui/material';
import { useTheme } from '../../../context/ThemeContext';

interface HintModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  attempts: number;
}

const HintModal: React.FC<HintModalProps> = ({ open, onClose, onAccept, attempts }) => {
  const { theme } = useTheme();

  const handleAccept = () => {
    onAccept();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: theme === 'dark' ? '#2A2B51' : '#FFFFFF',
          color: theme === 'dark' ? '#E8F9FF' : '#1A1B41',
          borderRadius: '1rem',
          padding: '1rem',
        },
      }}
    >
      <DialogTitle
        sx={{
          color: theme === 'dark' ? '#DBD053' : '#FFA500',
          fontSize: '1.5rem',
          fontWeight: 'bold',
        }}
      >
        Need a Hint?
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2, color: theme === 'dark' ? '#E8F9FF' : '#1A1B41' }}>
          You've made {attempts} attempts. Would you like me to reveal a random letter from the answer?
        </Typography>
        <Typography sx={{ mb: 2, color: theme === 'dark' ? '#9BA8E5' : '#7A89C2' }}>
          Note: Using hints will deduct 0.2 points from your score.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ padding: '1rem' }}>
        <Button
          onClick={onClose}
          sx={{
            color: theme === 'dark' ? '#9BA8E5' : '#7A89C2',
            '&:hover': {
              backgroundColor: theme === 'dark' ? '#3A3B61' : '#E8F9FF',
            },
          }}
        >
          No, thanks
        </Button>
        <Button
          onClick={handleAccept}
          variant="contained"
          sx={{
            backgroundColor: theme === 'dark' ? '#DBD053' : '#FFA500',
            color: theme === 'dark' ? '#1A1B41' : '#FFFFFF',
            '&:hover': {
              backgroundColor: theme === 'dark' ? '#c4b94a' : '#db8e00',
            },
          }}
        >
          Yes, show hint
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HintModal;