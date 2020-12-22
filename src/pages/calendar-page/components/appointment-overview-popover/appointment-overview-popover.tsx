import Appointment from 'common/gql-types/appointment';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Popover, Box, Grid, IconButton, Typography, Divider, Tooltip } from '@material-ui/core';
import { Video, Trash2, X, CheckCircle, User, XCircle, Copy } from 'react-feather';
import './appointment-overview-popover.scss';
import { Point } from '../shared/point';

interface AppointmentOverviewPopoverProps {
  open: boolean;
  onClose: () => void;
  onCancelClick: () => void;
  appointment: Appointment;
  position: Point;
}
const longDateCardFormat = 'dddd, DD MMMM HH:mm';
const shortDateCardFormat = 'ddd, DD MMM HH:mm';

export default function AppointmentOverviewPopover(props: AppointmentOverviewPopoverProps) {
  const { open, onClose, appointment, onCancelClick, position: popoverPosition } = props;
  const startTime = new Date(appointment?.start_time ?? '');
  const endTime = new Date(appointment?.end_time ?? '');
  const startAndEndDateSameDay = () =>
    startTime.getFullYear() === endTime.getFullYear() &&
    startTime.getMonth() === endTime.getMonth() &&
    startTime.getDay() === endTime.getDay();
  const startLongDateCard = moment(startTime).format(longDateCardFormat);
  const startShortDateCard = moment(startTime).format(shortDateCardFormat);
  const endShortDateCard = moment(endTime).format(shortDateCardFormat);

  const [position, setPosition] = useState<Point>(popoverPosition);
  const [isOpen, setOpen] = useState(open);

  useEffect(() => {
    setPosition(popoverPosition);
  }, [popoverPosition]);

  useEffect(() => {
    setOpen(open);
  }, [open]);

  return (
    <Popover
      anchorReference="anchorPosition"
      open={isOpen}
      anchorPosition={{
        left: position.x,
        top: position.y,
      }}
      onClose={() => {
        setOpen(false);
        onClose();
      }}
    >
      <Box className="appointment-overview-card">
        <Grid container alignItems="center" justify="flex-end">
          {appointment?.is_virtual && appointment?.status_id === 2 && endTime >= new Date() && (
            <Tooltip title="Open video appointment link">
              <IconButton
                href={appointment.doctor_video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="button-padding"
              >
                <Video size="20" />
              </IconButton>
            </Tooltip>
          )}

          {endTime >= new Date() && (
            <Tooltip title="Cancel appointment">
              <IconButton onClick={onCancelClick} className="button-padding">
                <Trash2 size="20" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Close">
            <IconButton
              className="button-padding"
              onClick={() => {
                setOpen(false);
                onClose();
              }}
            >
              <X />
            </IconButton>
          </Tooltip>
        </Grid>
        <Grid direction="row" alignItems="center" container>
          <Typography variant="subtitle1" color="primary" display="inline">
            Appointment
          </Typography>
          <Box width="5px" display="flex" />
          {appointment?.status_id === 2 && <CheckCircle color="#74AB6F" size="14" strokeWidth="3" display="flex" />}
          {appointment?.status_id === 3 && <XCircle color="#FF6C6C" size="14" strokeWidth="3" display="flex" />}
        </Grid>
        <Grid direction="row" alignItems="center" container>
          <Typography variant="body2">
            {startAndEndDateSameDay()
              ? `${startLongDateCard} - ${moment(endTime).format('HH:mm')}`
              : `${startShortDateCard} - ${endShortDateCard}`}
          </Typography>
        </Grid>
        <Grid direction="row" alignItems="center" container>
          {appointment?.is_virtual ? <Video size="14" /> : <User size="14" />}
          <Box width="5px" display="flex" />
          <Typography variant="body2">{appointment?.is_virtual ? 'Video' : 'In person'}</Typography>
        </Grid>
        {appointment?.user && (
          <>
            <Divider className="divider-margin" />
            <Grid direction="column" container>
              <div className="space-limited-text-container">
                <Typography variant="body2">
                  {`${appointment?.user.first_name} ${appointment?.user.last_name}`}
                </Typography>
              </div>
              <Grid container direction="row">
                <div className="space-limited-text-container">
                  <Typography variant="body2">{appointment?.user.email}</Typography>
                </div>
                <Tooltip title="Copy">
                  <IconButton
                    className="copy-button"
                    onClick={() => navigator.clipboard.writeText(appointment?.user.email)}
                  >
                    <Copy size={14} />
                  </IconButton>
                </Tooltip>
              </Grid>
              {appointment?.user?.phone && (
                <Grid container direction="row">
                  <div className="space-limited-text-container">
                    <Typography variant="body2">{appointment?.user?.phone}</Typography>
                  </div>
                  <Tooltip title="Copy">
                    <IconButton
                      className="copy-button"
                      onClick={() => navigator.clipboard.writeText(appointment?.user?.phone)}
                    >
                      <Copy size={14} />
                    </IconButton>
                  </Tooltip>
                </Grid>
              )}
            </Grid>
          </>
        )}
      </Box>
    </Popover>
  );
}
