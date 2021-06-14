import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  TextField,
  Typography,
} from '@material-ui/core';
import { DateTime } from 'luxon';
import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'react-feather';
import './cancel-appointment-modal.scss';

interface CancelAppointmentModalProps {
  open: boolean;
  userFullName: string;
  startDate?: Date;
  onClose: () => void;
  onSubmit: (cancellationReason: string) => Promise<void>;
}

export function CancelAppointmentModal(props: CancelAppointmentModalProps) {
  const { onClose, onSubmit, open, startDate, userFullName } = props;
  const [isOpen, setOpen] = useState(open);
  const [cancellationReason, setCancellationReason] = useState<string>('');

  const resetModal = () => {
    setOpen(false);
    setCancellationReason('');
  };

  useEffect(() => {
    setOpen(open);
  }, [open]);

  const displayCharactersLeft = (): string => {
    if (cancellationReason.trim().length > 39) {
      return '';
    }
    if (cancellationReason.trim().length === 39) {
      return '1 character left';
    }
    return `${40 - cancellationReason.trim().length} characters left`;
  };

  return (
    <Dialog
      fullWidth
      open={isOpen}
      maxWidth="sm"
      onClose={() => {
        resetModal();
        onClose();
      }}
      aria-labelledby="form-dialog-title"
      PaperProps={{
        style: { borderRadius: 30 },
      }}
    >
      <Container className="cancel-appointment-dialog-container">
        <DialogTitle id="form-dialog-title">Cancel appointment?</DialogTitle>
        <DialogContent style={{ overflowY: 'hidden' }}>
          {startDate && (
            <Typography variant="body1" component="p">
              You are about to <span className="semi-bold-text">cancel</span> your appointment with {}
              <span className="semi-bold-text">{userFullName}</span> {}
              on <span className="semi-bold-text">
                {DateTime.fromJSDate(startDate).toFormat('cccc, dd LLL')}
              </span> at {}
              <span className="semi-bold-text">{DateTime.fromJSDate(startDate).toFormat('hh:mmA')}</span>.
            </Typography>
          )}
          <Box height="20px" />
          <Typography variant="body1" component="p">
            To cancel this appointment, you will need to provide a valid reason for the cancellation to happen.
          </Typography>
          <Box height="20px" />
          <Link href="https://help.ollie.health/" target="_blank" rel="noopener noreferrer" color="primary">
            What is a valid cancellation reason?{' '}
            <span>
              <ExternalLink size="16px" />
            </span>
          </Link>
          <Box height="20px" />
          <TextField
            id="cancellation-reason-field"
            placeholder="Write the cancellation reason for the patient in this box."
            helperText={displayCharactersLeft()}
            FormHelperTextProps={{ style: { textAlign: 'right' } }}
            multiline
            rows={6}
            variant="filled"
            fullWidth
            value={cancellationReason}
            onChange={(event) => setCancellationReason(event.target.value)}
          />
        </DialogContent>
        <Box height="20px" />
        <DialogActions>
          <Button
            size="large"
            onClick={() => {
              onClose();
              resetModal();
            }}
          >
            No
          </Button>
          <Button
            size="large"
            disableElevation
            variant="contained"
            disabled={cancellationReason.trim().length <= 39}
            onClick={() => {
              onSubmit(cancellationReason);
              resetModal();
            }}
            color="primary"
          >
            Yes, cancel appointment
          </Button>
        </DialogActions>
      </Container>
    </Dialog>
  );
}
