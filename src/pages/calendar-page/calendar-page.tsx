import React, { useState, createRef, useMemo, useCallback } from 'react';
import { RouteComponentProps } from '@reach/router';
import FullCalendar, { EventClickArg } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Box, Container, Menu, MenuItem } from '@material-ui/core';
import { Video, User as UserIcon } from 'react-feather';
import moment from 'moment';
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick
import rrulePlugin from '@fullcalendar/rrule';
// import { RRule, Frequency } from 'rrule';
import { observer } from 'mobx-react';
import { gql, useSubscription } from '@apollo/client';
import { useRootStore } from '../../common/stores/index';
// import { CreateEventModal } from './components/CreateEventModal';
import { SetupModal } from './components/SetupModal';
import './calendar-page.scss';

interface Appointment {
    id: number;
    status_id: number;
    start_time: string;
    doctor_video_url: string;
    is_virtual: boolean;
    user: {
        id: number;
        first_name: string;
        last_name: string;
    };
}

const GET_APPOINTMENTS_SUBSCRIPTION = gql`
    subscription appointmentsSub($practitionerId: bigint, $startTime: timestamptz!, $endTime: timestamptz!) {
        appointment(
            limit: 100
            where: {
                practitioner: { id: { _eq: $practitionerId } }
                status_id: { _eq: 2 }
                start_time: { _gte: $startTime }
                end_time: { _gte: $endTime }
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
            }
        }
    }
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const CalendarPage = observer((props: RouteComponentProps) => {
    const calendarRef = createRef<FullCalendar>();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    // const open = Boolean(anchorEl);
    // const id = open ? 'simple-popover' : undefined;

    const [calendarStartDate, setCalendarStartDate] = useState<Date>(null!);
    const [calendarEndDate, setCalendarEndDate] = useState<Date>(null!);
    const { userStore } = useRootStore();
    const { practitionerInfo, isActive: isUserActive } = userStore;
    const businessHours = useMemo(() => practitionerInfo?.schedules, [practitionerInfo?.schedules]);

    const { data } = useSubscription(GET_APPOINTMENTS_SUBSCRIPTION, {
        variables: {
            practitionerId: practitionerInfo?.id,
            startTime: calendarStartDate,
            endTime: calendarEndDate,
        },
    });

    const events = useMemo(
        () =>
            data
                ? data.appointment.map((appointment: Appointment) => ({
                      id: appointment.id,
                      title: `${appointment.user.first_name} ${appointment.user.last_name}`,
                      start: appointment.start_time,
                      end: moment(appointment.start_time).add(1, 'hour').toDate().toISOString(),
                  }))
                : [],
        [data],
    );

    const handleClick = (event: EventClickArg) => {
        const start = moment(event.event.start);
        start.subtract({ minutes: 30 });

        if (calendarRef.current) {
            calendarRef.current.getApi().scrollToTime({
                hour: start.hour(),
                minute: start.minute(),
                day: start.day(),
                month: start.month(),
                year: start.year(),
            });
        }

        const { el } = event;
        el.dataset.id = event.event.id;

        setAnchorEl(el as HTMLButtonElement);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleCancel = async () => {
        // eslint-disable-next-line no-alert, no-restricted-globals
        if (confirm('Are you sure?')) {
            const id = anchorEl?.dataset.id;
            if (!id) return;

            await userStore.cancelAppointment(id);

            handleClose();
        }
    };

    const handleDateRangeChange = useCallback(
        (e) => {
            setCalendarStartDate(e.start);
            setCalendarEndDate(e.end);
        },
        [setCalendarStartDate, setCalendarEndDate],
    );

    return (
        <>
            <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                {/* <MenuItem onClick={handleClose}>Edit</MenuItem> */}
                <MenuItem onClick={handleCancel}>Cancel</MenuItem>
            </Menu>
            <Container className="calendar-page-container" maxWidth="xl">
                {isUserActive && practitionerInfo ? (
                    <>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <h1>My bookings</h1>
                            {/* <Button
                        disabled={!isUserActive}
                        color="primary"
                        startIcon={<Plus color="white" />}
                        variant="contained"
                        disableElevation
                        onClick={() => setCreateEventOpen(true)}
                    >
                        Create event
                    </Button> */}
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
                                // select={(info) => {
                                //     setStartDate(info.start);
                                //     setEndDate(info.end);
                                //     setAllDayEvent(info.allDay);
                                //     setCreateEventOpen(true);
                                // }}
                                eventContent={(args) => {
                                    // const startDate = args.event.start;
                                    // const endDate = args.event.end;
                                    // const padTime = (value: number | undefined) => (value ?? '').toString().padStart(2, '0');
                                    if (args.event.allDay) return undefined;
                                    return (
                                        <div style={{ overflow: 'hidden', height: 'inherit' }}>
                                            <div>{args.timeText}</div>
                                            <div>
                                                <span>
                                                    {args.event.extendedProps.eventType === 'consultation' ? (
                                                        <UserIcon size="14" />
                                                    ) : (
                                                        <Video size="14" />
                                                    )}
                                                </span>
                                                {` ${args.event.title}`}
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
                                    handleClick(args);
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
            {/* <CreateEventModal open={open} /> */}
        </>
    );
});
