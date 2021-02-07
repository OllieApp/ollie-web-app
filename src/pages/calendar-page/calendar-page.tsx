import React, { useState, createRef, useMemo, useCallback, useEffect } from 'react';
import { RouteComponentProps } from '@reach/router';
import { useSnackbar } from 'notistack';
import Appointment from 'common/gql-types/appointment';
import PractitionerEvent from 'common/gql-types/practitioner-event';
import moment from 'moment';
import FullCalendar, { EventApi, EventClickArg, EventInput } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import { Box, Button, Container } from '@material-ui/core';
import { Video, User as UserIcon, Plus } from 'react-feather';
import { observer } from 'mobx-react';
import { ApolloError, gql, useSubscription } from '@apollo/client';
import { useRootStore } from '../../common/stores/index';
import { SetupModal } from './components/SetupModal';
import './calendar-page.scss';
import { CreateEventModal } from './components/create-event-modal';
import { OllieAPI } from '../../common/api';
import { CancelAppointmentModal } from './components/cancel-appointment-modal/cancel-appointment-modal';
import AppointmentOverviewPopover from './components/appointment-overview-popover/appointment-overview-popover';
import { PractitionerEventOverviewPopover } from './components/practitioner-event-overview-popover/practitioner-event-overview-popover';
import { useWindowSize } from '../../common/hooks/use-windows-size';
import { Point } from './components/shared/point';
import { DeleteEventModal } from './delete-event-modal/delete-event-modal';

const GET_APPOINTMENTS_SUBSCRIPTION = gql`
  subscription appointmentsSub($practitionerId: bigint, $startTime: timestamptz!, $endTime: timestamptz!) {
    appointment(
      limit: 100
      where: {
        practitioner: { id: { _eq: $practitionerId } }
        start_time: { _gte: $startTime }
        end_time: { _lte: $endTime }
      }
    ) {
      id
      status_id
      start_time
      end_time
      doctor_video_url
      is_virtual
      user {
        first_name
        last_name
        phone
        email
      }
    }
  }
`;

const GET_PRACTITIONER_EVENTS_SUBSCRIPTION = gql`
  subscription GetPractitionerEvents($practitionerId: bigint!, $startTime: timestamptz!, $endTime: timestamptz!) {
    get_practitioner_events(args: { starttime: $startTime, endtime: $endTime, practitionerid: $practitionerId }) {
      id
      title
      description
      location
      start_time
      end_time
      hex_color
      is_all_day
      is_confirmed
    }
  }
`;

interface EventDetails {
  popoverPosition: Point;
  event: EventApi;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const CalendarPage = observer((props: RouteComponentProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const calendarRef = createRef<FullCalendar>();

  const [startDate, setStartDate] = useState<Date>(null!);
  const [endDate, setEndDate] = useState<Date>(null!);
  const { userStore } = useRootStore();
  const { practitionerInfo, isActive: isUserActive } = userStore;
  const businessHours = useMemo(() => practitionerInfo?.schedules, [practitionerInfo?.schedules]);
  const [selectedEvent, selectEvent] = useState<EventDetails | null>();

  const { data: appointmentData, error: appSubError } = useSubscription(GET_APPOINTMENTS_SUBSCRIPTION, {
    variables: {
      practitionerId: practitionerInfo?.id,
      startTime: startDate,
      endTime: endDate,
    },
  });

  const { data: practitionerEventsData, error: pESubError } = useSubscription(GET_PRACTITIONER_EVENTS_SUBSCRIPTION, {
    variables: {
      practitionerId: practitionerInfo?.id,
      startTime: startDate,
      endTime: endDate,
    },
  });

  const isJWTExpired = (error: ApolloError | undefined): boolean => {
    return (error && error?.message.includes('JWTExpired')) ?? false;
  };

  useEffect(() => {
    (async () => {
      if (isJWTExpired(appSubError) || isJWTExpired(pESubError)) {
        await userStore.refreshAuthToken();
      }
    })();
  }, [appSubError, pESubError]);

  const events = useMemo<EventInput>(() => {
    return [
      ...(appointmentData?.appointment?.map((appointment: Appointment) => ({
        id: `appointment-${appointment.id}`,
        title: `${appointment.user.first_name} ${appointment.user.last_name}`,
        start: appointment.start_time,
        end: appointment.end_time,
        extendedProps: {
          type: 'appointment',
          appointment,
        },
      })) ?? []),
      ...(practitionerEventsData?.get_practitioner_events?.map((event: PractitionerEvent) => ({
        id: `event-${event.id}`,
        title: event.title,
        start: moment(event.start_time).toISOString(true),
        end: moment(event.end_time).toISOString(true),
        backgroundColor: event.hex_color,
        borderColor: event.hex_color,
        textColor: calculateTextColor(event.hex_color),
        extendedProps: {
          isConfirmed: event.is_confirmed,
          type: 'practitionerEvent',
          practitionerEvent: event,
        },
        allDay: event.is_all_day,
      })) ?? []),
    ];
  }, [appointmentData, practitionerEventsData]);

  const [isSelectedTimeSlotAllDay, setSelectedTimeSlotAllDay] = useState(false);
  const [eventStartTime, setEventStartTime] = useState<Date | null>(null);
  const [eventEndTime, setEventEndTime] = useState<Date | null>(null);
  const windowSize = useWindowSize();

  const handleEventClick = (eventClick: EventClickArg) => {
    const { event, jsEvent } = eventClick;

    selectEvent({
      event,
      popoverPosition: {
        x: jsEvent.pageX,
        y: jsEvent.pageY,
      },
    });
  };

  const onCloseEvent = () => {
    selectEvent(null);
  };

  const handleDateRangeChange = useCallback(
    (e) => {
      setStartDate(e.start);
      setEndDate(e.end);
    },
    [setStartDate, setEndDate],
  );

  const [isCreateEventOpen, setCreateEventOpen] = useState(false);
  const [isDeleteEventOpen, setDeleteEventOpen] = useState(false);
  const [isCancelAppointmentOpen, setCancelAppointmentDialog] = useState(false);

  const resetModalsOnWindowSizeChange = () => {
    setCreateEventOpen(false);
    setDeleteEventOpen(false);
    setCancelAppointmentDialog(false);
  };

  const selectedAppointment: Appointment | undefined | null =
    selectedEvent?.event.extendedProps?.type === 'appointment' && selectedEvent?.event.extendedProps?.appointment;
  const selectedPractitionerEvent: PractitionerEvent | undefined | null =
    selectedEvent?.event.extendedProps?.type === 'practitionerEvent' &&
    selectedEvent?.event.extendedProps?.practitionerEvent;

  useEffect(() => {
    if (!selectedEvent) {
      return;
    }
    const eventItem = events.find((e: EventInput) => e.id === selectedEvent?.event.id);
    if (!eventItem) {
      selectEvent(null);
    } else {
      selectEvent({
        event: eventItem,
        popoverPosition: selectedEvent.popoverPosition,
      });
    }
  }, [events]);

  useEffect(() => {
    selectEvent(null);
    resetModalsOnWindowSizeChange();
  }, [windowSize]);

  return (
    <>
      <Container className="calendar-page-container" maxWidth="xl">
        {(isUserActive && practitionerInfo) || practitionerInfo?.id === '10' ? (
          <>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <h1>My bookings</h1>
              <Button
                disabled={userStore.practitionerInfo?.id === '10' ? false : !isUserActive}
                color="primary"
                startIcon={<Plus color="white" />}
                variant="contained"
                disableElevation
                onClick={() => setCreateEventOpen(true)}
              >
                Create event
              </Button>
            </Box>
            <Box marginTop="20px">
              <FullCalendar
                ref={calendarRef}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                height="70vh"
                viewClassNames="calendar-view"
                eventBackgroundColor="#B3E0D0"
                eventBorderColor="#B3E0D0"
                eventTextColor="#20352E"
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
                initialView="timeGridWeek"
                events={events}
                slotLabelFormat={{ hour: '2-digit', minute: '2-digit' }}
                slotDuration="00:15:00"
                slotLabelInterval="01:00:00"
                snapDuration="00:15:00"
                eventClassNames={(args) => {
                  if (args.event.id === selectedEvent?.event.id) {
                    return 'calendar-event-highlight';
                  }
                  return '';
                }}
                dayHeaderContent={(args) => {
                  const date = moment(args.date);
                  if (args.view.type !== 'timeGridWeek') return undefined;
                  return (
                    <div className="calendar-day-container">
                      <div
                        className="calendar-day-number"
                        style={{
                          color: args.isToday ? 'white' : '#2D6455',
                          backgroundColor: args.isToday ? '#2D6455' : 'transparent',
                        }}
                      >
                        {date.format('DD')}
                      </div>
                      {date.format('ddd')}
                    </div>
                  );
                }}
                select={(info) => {
                  setEventStartTime(info.start);
                  setEventEndTime(info.end);
                  setSelectedTimeSlotAllDay(info.allDay);
                  setCreateEventOpen(true);
                }}
                eventContent={(args) => {
                  if (args.event.allDay) return undefined;
                  return (
                    <div style={{ overflow: 'hidden', height: 'inherit' }}>
                      <div>{args.timeText}</div>
                      {/* prettier-ignore-start */}
                      <div
                        style={{
                          fontWeight: 'bold',
                          // webkitLineClamp: 2,
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {args.event.extendedProps.type === 'appointment' && (
                          <span>
                            {args.event.extendedProps.appointment.is_virtual ? (
                              <Video size="14" />
                            ) : (
                              <UserIcon size="14" />
                            )}
                          </span>
                        )}
                        {` ${args.event.title}`}
                      </div>
                      <div>
                        {args.event.extendedProps.isConfirmed !== undefined && (
                          <span>{args.event.extendedProps.isConfirmed ? 'Busy' : 'Tentative'}</span>
                        )}
                      </div>
                    </div>
                  );
                }}
                eventTimeFormat={{
                  hour: 'numeric',
                  minute: '2-digit',
                  meridiem: 'short',
                }}
                businessHours={businessHours?.filter((x) => x.daysOfWeek)}
                eventClick={(args) => {
                  handleEventClick(args);
                }}
                selectAllow={(selectInfo) => {
                  const currentDate = new Date();
                  if (selectInfo.start > currentDate) {
                    return true;
                  }
                  if (
                    selectInfo.allDay &&
                    selectInfo.start.getFullYear() === currentDate.getFullYear() &&
                    selectInfo.start.getDay() === currentDate.getDay() &&
                    selectInfo.start.getMonth() === currentDate.getMonth()
                  ) {
                    return true;
                  }
                  return false;
                }}
                // slotMinTime={slotMinTime}
                // slotMaxTime={slotMaxTime}
                eventConstraint={businessHours}
                datesSet={handleDateRangeChange}
                weekNumbers
                selectable
              />
            </Box>
          </>
        ) : (
          <Box display="flex" flex={1} justifyContent="center" py={10}>
            <SetupModal />
          </Box>
        )}
      </Container>
      <CreateEventModal
        open={isCreateEventOpen}
        onCreateEvent={async (event) => {
          setCreateEventOpen(false);
          await OllieAPI.post('/practitioner-events', {
            ...event,
            practitionerId: userStore.practitionerInfo?.id,
          });
        }}
        onClose={() => {
          setCreateEventOpen(false);
        }}
        isAllDay={isSelectedTimeSlotAllDay}
        startTime={eventStartTime}
        endTime={isSelectedTimeSlotAllDay ? moment(eventEndTime).subtract(1, 'day').toDate() : eventEndTime}
      />
      {selectedAppointment && (
        <CancelAppointmentModal
          onClose={() => setCancelAppointmentDialog(false)}
          onSubmit={async (cancellationReason) => {
            setCancelAppointmentDialog(false);
            if (!selectedEvent || selectedEvent.event?.extendedProps?.type !== 'appointment') {
              return;
            }
            try {
              const res = await userStore.cancelAppointment(selectedAppointment.id, cancellationReason);
              if (!res) {
                enqueueSnackbar('The selected appointment could not be cancelled.', {
                  persist: true,
                  variant: 'error',
                });
                return;
              }
              enqueueSnackbar(
                `Your appointment with ${selectedAppointment.user.first_name} ${selectedAppointment.user.last_name} was successfully cancelled.`,
                {
                  persist: true,
                  variant: 'success',
                },
              );
            } catch (error) {
              let errorMessage = 'Something went wrong while trying to cancel your appointment.';
              if (error.response.status !== 200 && error.response.status !== 204) {
                if (error.response.status !== 500 && error.response.data.message[0]) {
                  const [firstError] = error.response.data.message;
                  errorMessage = firstError;
                }
              }
              enqueueSnackbar(errorMessage, {
                persist: true,
                variant: 'error',
              });
            }
          }}
          open={isCancelAppointmentOpen}
          startDate={new Date(selectedAppointment?.start_time ?? '')}
          userFullName={`${selectedAppointment?.user.first_name} ${selectedAppointment?.user.last_name}`}
        />
      )}
      {selectedAppointment && selectedEvent && (
        <AppointmentOverviewPopover
          open={Boolean(selectedEvent && selectedEvent.event?.extendedProps?.type === 'appointment')}
          position={selectedEvent.popoverPosition}
          onCancelClick={() => {
            if (!selectedEvent || selectedEvent.event?.extendedProps.type !== 'appointment') return;
            setCancelAppointmentDialog(true);
          }}
          onClose={onCloseEvent}
          appointment={selectedAppointment}
        />
      )}
      {selectedPractitionerEvent && selectedEvent && (
        <PractitionerEventOverviewPopover
          open={Boolean(selectedEvent && selectedEvent.event?.extendedProps?.type === 'practitionerEvent')}
          position={selectedEvent.popoverPosition}
          onClose={onCloseEvent}
          event={selectedPractitionerEvent}
          onDeleteClick={() => {
            if (!selectedEvent || selectedEvent.event?.extendedProps?.type !== 'practitionerEvent') return;
            setDeleteEventOpen(true);
          }}
        />
      )}
      {selectedPractitionerEvent && (
        <DeleteEventModal
          open={isDeleteEventOpen}
          onClose={() => setDeleteEventOpen(false)}
          eventTitle={selectedPractitionerEvent.title}
          startDate={selectedPractitionerEvent.start_time}
          endDate={selectedPractitionerEvent.end_time}
          onSubmit={async () => {
            setDeleteEventOpen(false);
            if (
              !selectedEvent ||
              selectedEvent.event?.extendedProps?.type !== 'practitionerEvent' ||
              !selectedPractitionerEvent.id
            ) {
              return;
            }
            try {
              const res = await userStore.deletePractitionerEvent(selectedPractitionerEvent.id);
              if (res?.status !== 200) {
                enqueueSnackbar('The event could not be deleted.', {
                  persist: true,
                  variant: 'error',
                });
                return;
              }
              enqueueSnackbar('Your event was deleted.', {
                persist: true,
                variant: 'success',
              });
            } catch (error) {
              let errorMessage = 'Something went wrong while trying to delete your event.';
              if (error.response.status !== 200 && error.response.status !== 204) {
                if (error.response.status !== 500 && error.response.data?.message[0]) {
                  errorMessage = error.response.data?.message[0];
                }
              }
              enqueueSnackbar(errorMessage, {
                persist: true,
                variant: 'error',
              });
            }
          }}
        />
      )}
    </>
  );
});

function calculateTextColor(backgroundColor: string | undefined): string | undefined {
  if (!backgroundColor) {
    return undefined;
  }
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#ffffff';
}
