import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@material-ui/core';
import { DateTime } from 'luxon';
import React, { useState, useEffect } from 'react';
import './delete-event-modal.scss';

interface DeleteEventModalProps {
  open: boolean;
  eventTitle: string;
  startDate?: Date;
  endDate?: Date;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}

export function DeleteEventModal(props: DeleteEventModalProps) {
  const { onClose, onSubmit, open, startDate, endDate, eventTitle } = props;
  const [isOpen, setOpen] = useState(open);

  const resetModal = () => {
    setOpen(false);
  };

  useEffect(() => {
    setOpen(open);
  }, [open]);

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
      <Box padding="20px 0px">
        <Container>
          <DialogTitle id="form-dialog-title">Delete event?</DialogTitle>
          <DialogContent style={{ overflowY: 'hidden' }}>
            <Typography variant="body1" component="p">
              You are about to <span className="semi-bold-text">delete</span> your{' '}
              <span className="semi-bold-text">{eventTitle}</span> event starting on{' '}
              <span className="semi-bold-text">
                {startDate && DateTime.fromJSDate(startDate).toFormat('cccc, dd LLL')}
              </span>{' '}
              at{' '}
              <span className="semi-bold-text">{startDate && DateTime.fromJSDate(startDate).toFormat('hh:mma')}</span>{' '}
              and ending on{' '}
              <span className="semi-bold-text">{endDate && DateTime.fromJSDate(endDate).toFormat('cccc, dd LLL')}</span>{' '}
              at <span className="semi-bold-text">{endDate && DateTime.fromJSDate(endDate).toFormat('hh:mma')}</span>.
            </Typography>
            <Box height="20px" />
            <Typography variant="body1" component="p">
              Your event is marked as <span className="semi-bold-text">busy</span>, so please be aware that deleting
              this event <span className="semi-bold-text">may open timeslots</span> in your calendar.
            </Typography>
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
              onClick={() => {
                onSubmit();
                resetModal();
              }}
              color="primary"
            >
              Yes, delete event
            </Button>
          </DialogActions>
        </Container>
      </Box>{' '}
    </Dialog>
  );
}
