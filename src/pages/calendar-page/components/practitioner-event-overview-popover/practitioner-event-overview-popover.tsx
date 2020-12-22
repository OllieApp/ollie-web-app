import { Box, Grid, IconButton, Popover, Tooltip, Typography } from '@material-ui/core';
import { Fullscreen } from '@material-ui/icons';
import { PractitionerEvent } from 'common/gql-types/practitioner-event';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { Trash2, X, Edit, MapPin, AlignLeft } from 'react-feather';
import { Point } from '../shared/point';
import './practitioner-event-overview-popover.scss';

interface PractitionerEventOverviewPopoverProps {
  open: boolean;
  onClose: () => void;
  onDeleteClick?: () => void;
  onEditClick?: () => void;
  onExpandClick?: () => void;
  event: PractitionerEvent;
  position: Point;
}

export function PractitionerEventOverviewPopover(props: PractitionerEventOverviewPopoverProps) {
  const { open, onClose, event, onDeleteClick, onEditClick, onExpandClick, position } = props;
  const startTime = moment(event?.start_time ?? '');
  const endTime = moment(event?.end_time ?? '');
  const startAndEndDateSameDay = () =>
    startTime.year() === endTime.year() && startTime.month() === endTime.month() && startTime.day() === endTime.day();
  const longDateFormat = 'dddd, DD MMMM';
  const shortDateFormat = 'ddd, DD MMM';
  const timeFormat = 'HH:mm';

  const dateDisplay = (): string => {
    if (startAndEndDateSameDay()) {
      return `${startTime.format(`${longDateFormat} ${timeFormat}`)} - ${endTime.format(timeFormat)}`;
    }
    return `${startTime.format(`${shortDateFormat} ${timeFormat}`)} - ${endTime.format(
      `${shortDateFormat} ${timeFormat}`,
    )}`;
  };

  const [isOpen, setOpen] = useState(open);
  const [popoverPosition, setPopoverPosition] = useState<Point>(position);

  useEffect(() => {
    setPopoverPosition(position);
  }, [position]);

  useEffect(() => {
    setOpen(open);
  }, [open]);

  return (
    <Popover
      anchorReference="anchorPosition"
      open={isOpen}
      anchorPosition={{
        left: popoverPosition.x,
        top: popoverPosition.y,
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      onClose={() => {
        setOpen(false);
        onClose();
      }}
    >
      <Box className="practitioner-event-overview-card">
        <Grid container alignItems="center" justify="flex-end">
          {onExpandClick && (
            <Tooltip title="View event">
              <IconButton className="button-padding" onClick={onExpandClick}>
                <Fullscreen fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onEditClick && (
            <Tooltip title="Edit event">
              <IconButton className="button-padding">
                <Edit size="20" />
              </IconButton>
            </Tooltip>
          )}
          {onDeleteClick && (
            <Tooltip title="Delete event">
              <IconButton onClick={onDeleteClick} className="button-padding">
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
          <div className="space-limited-text-container">
            <Typography variant="subtitle1" color="primary" display="inline">
              {event?.title}
            </Typography>
          </div>
        </Grid>
        <Grid direction="row" alignItems="center" container>
          <Typography variant="body2">{dateDisplay()}</Typography>
        </Grid>
        <Grid direction="row" alignItems="center" container>
          <Typography variant="subtitle2" display="inline">
            <b> {event?.is_confirmed ? 'Busy' : 'Tentative'}</b>
          </Typography>
        </Grid>
        {event?.location && (
          <>
            <Box height="5px" />
            <Grid direction="row" alignItems="center" container>
              <div className="small-limited-text-container">
                <Typography variant="body2" display="inline">
                  <span>
                    <MapPin size="14" />
                  </span>{' '}
                  {event?.location}
                </Typography>
              </div>
            </Grid>
          </>
        )}
        {event?.description && (
          <>
            <Box height="5px" />
            <Grid direction="row" alignItems="center" container>
              <div className="medium-limited-text-container">
                <Typography variant="body2" display="inline">
                  <span>
                    <AlignLeft size="15" />
                  </span>{' '}
                  {event?.description}
                </Typography>
              </div>
            </Grid>
          </>
        )}
      </Box>
    </Popover>
  );
}
