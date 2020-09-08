import React, { useState, useEffect, createRef } from 'react';
import { RouteComponentProps } from '@reach/router';
import Container from '@material-ui/core/Container';
import FullCalendar, { EventClickArg } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import './calendar-page.scss';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    FormControlLabel,
    Switch,
    FormLabel,
    Menu,
    MenuItem,
    FormControl,
    Select,
    RadioGroup,
    Radio,
    InputAdornment,
    ButtonGroup,
} from '@material-ui/core';
import { Plus } from 'react-feather';
import { KeyboardTimePicker, KeyboardDatePicker } from '@material-ui/pickers';
import moment from 'moment';
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick
import rrulePlugin from '@fullcalendar/rrule';
import { RRule, Frequency } from 'rrule';
import { CirclePicker } from 'react-color';

interface DoctorCalendarEvent {
    type: 'consultation' | 'video';
    eventType: 'lunch_break' | 'appointment' | 'custom';
    isAllDay?: boolean;
    startDate: Date;
    endDate: Date;
    patientName: string;
}
interface RecurrenceEnd {
    type: 'never' | 'on_date' | 'after_ocurrence_count';
    endDate?: Date;
    occurrenceCount?: number;
    weeklyRecurrence: Array<'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU'>;
}
interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end?: string;
    groupId?: string;
    color?: string;
    allDay?: boolean;
    editable?: boolean;
    rrule?: string;
    backgroundColor?: string;
    borderColor?: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CalendarPage(props: RouteComponentProps) {
    const calendarRef = createRef<FullCalendar>();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleClick = (event: EventClickArg) => {
        const startDate = moment(event.event.start);
        startDate.subtract({ minutes: 30 });

        if (calendarRef.current) {
            calendarRef.current.getApi().scrollToTime({
                hour: startDate.hour(),
                minute: startDate.minute(),
                day: startDate.day(),
                month: startDate.month(),
                year: startDate.year(),
            });
        }

        setAnchorEl(event.el as HTMLButtonElement);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    // const id = open ? 'simple-popover' : undefined;

    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [isCreateEventOpen, setCreateEventOpen] = useState(false);
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isAllDay, setAllDayEvent] = useState<boolean>(false);
    const [isRecurringEvent, setIsRecurringEvent] = useState<boolean>(false);
    const [recurrentCount, setRecurrentCount] = useState<number | null>(0);
    const [recurrenceFreq, setRecurrenceFreq] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
    const [recurrenceEnd, setRecurrenceEnd] = useState<RecurrenceEnd>({ type: 'never', weeklyRecurrence: [] });
    const [events, setEvents] = useState<Array<CalendarEvent>>([
        { id: '231233', title: 'Siwela Smith', start: '2020-08-16T16:00:00+02:00', end: '2020-08-16T17:00:00+02:00' },
        { id: '231233', title: 'Conference', start: '2020-08-16', end: '2020-08-18' },
        { id: '231233', title: 'Arial Mikumba', start: '2020-08-17T10:30:00+02:00', end: '2020-08-17T12:30:00+02:00' },
        { id: '231233', title: 'Bob Martini', start: '2020-08-18T08:00:00+02:00', end: '2020-08-18T09:00:00+02:00' },
    ]);
    const [eventColor, setEventColor] = useState<string | null>('');

    const businessHours = [
        {
            daysOfWeek: [1, 2, 3], // Monday, Tuesday, Wednesday
            startTime: '08:00', // 8am
            endTime: '18:00', // 6pm
        },
        {
            daysOfWeek: [4, 5], // Thursday, Friday
            startTime: '10:00', // 10am
            endTime: '16:00', // 4pm
        },
    ];

    useEffect(() => {
        if (isAllDay) {
            setStartDate(moment(startDate).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate());
            setEndDate(
                moment(endDate ?? new Date())
                    .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                    .toDate(),
            );
        }
    }, [isAllDay]);

    useEffect(() => {
        if (recurrentCount === null) {
            return;
        }
        if (recurrentCount < 0) {
            setRecurrentCount(0);
        }
        if (!Number.isInteger(recurrentCount)) {
            setRecurrentCount(Math.trunc(recurrentCount));
        }
    }, [recurrentCount]);

    useEffect(() => {
        if (recurrenceEnd.occurrenceCount == null) {
            return;
        }
        if (recurrenceEnd.occurrenceCount < 0) {
            setRecurrenceEnd({ ...recurrenceEnd, occurrenceCount: 0 });
        }
        if (!Number.isInteger(recurrenceEnd.occurrenceCount)) {
            setRecurrenceEnd({ ...recurrenceEnd, occurrenceCount: Math.trunc(recurrenceEnd.occurrenceCount) });
        }
    }, [recurrenceEnd.occurrenceCount]);

    useEffect(() => {
        if (endDate !== null && endDate <= startDate) {
            setEndDate(moment(startDate).add(5, 'minutes').toDate());
        }
    }, [endDate]);

    useEffect(() => {
        if (startDate < new Date()) {
            setStartDate(new Date());
        }
    }, [open]);

    function addDayToWeeklyRecurrence(weekDay: 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU') {
        if (recurrenceEnd.weeklyRecurrence.findIndex((e) => e === weekDay) === -1) {
            setRecurrenceEnd({
                ...recurrenceEnd,
                weeklyRecurrence: [...recurrenceEnd.weeklyRecurrence, weekDay],
            });
            return;
        }
        setRecurrenceEnd({
            ...recurrenceEnd,
            weeklyRecurrence: [...recurrenceEnd.weeklyRecurrence?.filter((e) => e !== weekDay)],
        });
    }

    function mapRecurrenceFreqToFrequency(freq: 'daily' | 'weekly' | 'monthly' | 'yearly'): Frequency {
        switch (freq) {
            case 'daily':
                return Frequency.DAILY;
            case 'monthly':
                return Frequency.MONTHLY;
            case 'weekly':
                return Frequency.WEEKLY;
            case 'yearly':
                return Frequency.YEARLY;
            default:
                return Frequency.DAILY;
        }
    }

    const addEventToCalendar = () => {
        try {
            setEvents([
                ...events,
                {
                    id: '231233',
                    title,
                    start: startDate.toISOString(),
                    end: endDate?.toISOString(),
                    allDay: isAllDay,
                    color: '#EDED85',
                    rrule: isRecurringEvent
                        ? new RRule({
                              freq: mapRecurrenceFreqToFrequency(recurrenceFreq),
                              interval: recurrentCount ?? undefined,
                              dtstart: startDate,
                              count: recurrenceEnd.occurrenceCount,
                              until: recurrenceEnd.endDate ?? new Date(2999, 12, 31),
                              byweekday: [
                                  ...recurrenceEnd.weeklyRecurrence.map((i) => {
                                      switch (i) {
                                          case 'MO':
                                              return 0;
                                          case 'TU':
                                              return 1;
                                          case 'WE':
                                              return 2;
                                          case 'TH':
                                              return 3;
                                          case 'FR':
                                              return 4;
                                          case 'SA':
                                              return 5;
                                          case 'SU':
                                              return 6;
                                      }
                                  }),
                              ],
                          }).toString()
                        : undefined,
                    backgroundColor: eventColor ?? undefined,
                    borderColor: eventColor ?? undefined,
                },
            ]);
        } catch (error) {
            // TODO: Report
        }
    };

    const recurrenceView = isRecurringEvent && (
        <Grid xs={6} item>
            <Box height="20px" />
            <Grid direction="column" spacing={2} container item xs>
                <Grid alignItems="center" item container xs>
                    <p style={{ minWidth: 120 }}>Repeat every</p>
                    <Box width="10px" />
                    <TextField
                        inputProps={{
                            style: {
                                width: '60px',
                            },
                        }}
                        inputMode="numeric"
                        value={recurrentCount}
                        onChange={(event) => setRecurrentCount(Number(event.target.value))}
                        variant="filled"
                        autoFocus
                        margin="none"
                        id="repeat_count"
                        type="number"
                    />
                    <Box width="10px" />
                    <FormControl>
                        <Select
                            value={recurrenceFreq}
                            onChange={(event) =>
                                setRecurrenceFreq(event.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')
                            }
                            displayEmpty
                            variant="filled"
                        >
                            <MenuItem value="daily">{recurrentCount && recurrentCount > 1 ? 'days' : 'day'}</MenuItem>
                            <MenuItem value="weekly">
                                {recurrentCount && recurrentCount > 1 ? 'weeks' : 'week'}
                            </MenuItem>
                            <MenuItem value="monthly">
                                {recurrentCount && recurrentCount > 1 ? 'months' : 'month'}
                            </MenuItem>
                            <MenuItem value="yearly">
                                {recurrentCount && recurrentCount > 1 ? 'years' : 'year'}
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                {recurrenceFreq === 'weekly' && (
                    <Grid item xs>
                        <p>Repeat on</p>
                        <ButtonGroup>
                            <Button
                                variant={
                                    recurrenceEnd.weeklyRecurrence.findIndex((e) => e === 'MO') === -1
                                        ? 'outlined'
                                        : 'contained'
                                }
                                disableElevation
                                color="primary"
                                onClick={() => addDayToWeeklyRecurrence('MO')}
                            >
                                M
                            </Button>
                            <Button
                                variant={
                                    recurrenceEnd.weeklyRecurrence.findIndex((e) => e === 'TU') === -1
                                        ? 'outlined'
                                        : 'contained'
                                }
                                disableElevation
                                color="primary"
                                onClick={() => addDayToWeeklyRecurrence('TU')}
                            >
                                T
                            </Button>
                            <Button
                                variant={
                                    recurrenceEnd.weeklyRecurrence.findIndex((e) => e === 'WE') === -1
                                        ? 'outlined'
                                        : 'contained'
                                }
                                disableElevation
                                color="primary"
                                onClick={() => addDayToWeeklyRecurrence('WE')}
                            >
                                W
                            </Button>
                            <Button
                                variant={
                                    recurrenceEnd.weeklyRecurrence.findIndex((e) => e === 'TH') === -1
                                        ? 'outlined'
                                        : 'contained'
                                }
                                disableElevation
                                color="primary"
                                onClick={() => addDayToWeeklyRecurrence('TH')}
                            >
                                T
                            </Button>
                            <Button
                                variant={
                                    recurrenceEnd.weeklyRecurrence.findIndex((e) => e === 'FR') === -1
                                        ? 'outlined'
                                        : 'contained'
                                }
                                disableElevation
                                color="primary"
                                onClick={() => addDayToWeeklyRecurrence('FR')}
                            >
                                F
                            </Button>
                            <Button
                                variant={
                                    recurrenceEnd.weeklyRecurrence.findIndex((e) => e === 'SA') === -1
                                        ? 'outlined'
                                        : 'contained'
                                }
                                disableElevation
                                color="primary"
                                onClick={() => addDayToWeeklyRecurrence('SA')}
                            >
                                S
                            </Button>
                            <Button
                                variant={
                                    recurrenceEnd.weeklyRecurrence.findIndex((e) => e === 'SU') === -1
                                        ? 'outlined'
                                        : 'contained'
                                }
                                disableElevation
                                color="primary"
                                onClick={() => addDayToWeeklyRecurrence('SU')}
                            >
                                S
                            </Button>
                        </ButtonGroup>
                    </Grid>
                )}
                <Grid item xs>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Ends</FormLabel>
                        <RadioGroup
                            aria-label="gender"
                            name="gender1"
                            value={recurrenceEnd.type}
                            onChange={(event) =>
                                setRecurrenceEnd({
                                    ...recurrenceEnd,
                                    type: (event.target as HTMLInputElement).value.toString() as
                                        | 'never'
                                        | 'on_date'
                                        | 'after_ocurrence_count',
                                })
                            }
                        >
                            <Grid container direction="column" spacing={1}>
                                <Grid item xs>
                                    <FormControlLabel
                                        value="never"
                                        control={<Radio />}
                                        style={{ minWidth: 120 }}
                                        label="Never"
                                    />
                                </Grid>
                                <Grid item xs>
                                    <FormControlLabel
                                        value="on_date"
                                        control={<Radio />}
                                        label="On"
                                        style={{ minWidth: 120 }}
                                    />
                                    <KeyboardDatePicker
                                        disabled={recurrenceEnd.type !== 'on_date'}
                                        className="rounded-input"
                                        disableToolbar
                                        inputVariant="filled"
                                        variant="inline"
                                        format="DD/MM/yyyy"
                                        id="end-recurrence-date-picker"
                                        value={recurrenceEnd.endDate}
                                        onChange={(date) =>
                                            setRecurrenceEnd({
                                                ...recurrenceEnd,
                                                endDate: date?.toDate() ?? new Date(),
                                            })
                                        }
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                        minDate={Date()}
                                    />
                                </Grid>
                                <Grid alignContent="center" item xs container>
                                    <FormControlLabel
                                        value="after_ocurrence_count"
                                        control={<Radio />}
                                        label="After"
                                        style={{ minWidth: 120 }}
                                    />
                                    <TextField
                                        disabled={recurrenceEnd.type !== 'after_ocurrence_count'}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    {recurrenceEnd.occurrenceCount &&
                                                    recurrenceEnd.occurrenceCount === 1
                                                        ? 'occurrence'
                                                        : 'occurrences'}
                                                </InputAdornment>
                                            ),
                                        }}
                                        inputProps={{
                                            style: {
                                                width: '60px',
                                            },
                                        }}
                                        inputMode="numeric"
                                        value={recurrenceEnd.occurrenceCount}
                                        onChange={(event) =>
                                            setRecurrenceEnd({
                                                ...recurrenceEnd,
                                                occurrenceCount: Number(event.target.value),
                                            })
                                        }
                                        variant="filled"
                                        autoFocus
                                        margin="none"
                                        id="repeat_count"
                                        type="number"
                                    />
                                </Grid>
                            </Grid>
                        </RadioGroup>
                    </FormControl>
                </Grid>
            </Grid>
        </Grid>
    );
    const createEventModal = (
        <Dialog
            fullWidth
            open={isCreateEventOpen}
            maxWidth="md"
            onClose={() => setCreateEventOpen(false)}
            aria-labelledby="form-dialog-title"
            PaperProps={{
                style: { borderRadius: 30 },
            }}
        >
            <Container className="create-event-dialog-container">
                <DialogTitle id="form-dialog-title">Create calendar event</DialogTitle>
                <DialogContent style={{ overflowY: 'hidden' }}>
                    <TextField
                        InputProps={{
                            disableUnderline: true,
                            style: { borderRadius: 15 },
                        }}
                        variant="filled"
                        autoFocus
                        margin="dense"
                        id="event_title"
                        label="Event title"
                        type="text"
                        fullWidth
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                    />
                    <Box height="20px" />
                    <TextField
                        id="description-field"
                        label="Notes"
                        multiline
                        rows={4}
                        InputProps={{
                            disableUnderline: true,
                            style: { borderRadius: 15 },
                        }}
                        variant="filled"
                        margin="dense"
                        fullWidth
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                    />
                    <Box height="20px" />
                    <FormLabel component="legend">Event properties</FormLabel>
                    <Grid>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isAllDay}
                                    onChange={(event) => setAllDayEvent(event.target.checked)}
                                    name="all day event"
                                    color="primary"
                                />
                            }
                            label="All day"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isRecurringEvent}
                                    onChange={(event) => setIsRecurringEvent(event.target.checked)}
                                    name="repeat event input"
                                    color="primary"
                                />
                            }
                            label="Repeat"
                        />
                    </Grid>
                    <Grid direction="row" container>
                        <Grid xs={6} item>
                            <Grid xs item>
                                <Box height="10px" />
                                <Grid container>
                                    <KeyboardDatePicker
                                        className="rounded-input"
                                        disableToolbar
                                        InputProps={{
                                            disableUnderline: true,
                                            style: { borderRadius: 15, width: '180px' },
                                        }}
                                        inputVariant="filled"
                                        variant="inline"
                                        format="DD/MM/yyyy"
                                        margin="dense"
                                        id="start-date-picker"
                                        label="Start date"
                                        value={startDate}
                                        onChange={(date) => setStartDate(date?.toDate() ?? new Date())}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                        minDate={Date()}
                                    />
                                    {!isAllDay && (
                                        <>
                                            <Box width="20px" />
                                            <KeyboardTimePicker
                                                className="rounded-input"
                                                margin="dense"
                                                InputProps={{
                                                    disableUnderline: true,
                                                    style: { borderRadius: 15, width: '160px' },
                                                }}
                                                inputVariant="filled"
                                                variant="inline"
                                                id="start-time-picker"
                                                label="Start time"
                                                value={startDate}
                                                onChange={(date) => setStartDate(date?.toDate() ?? new Date())}
                                                KeyboardButtonProps={{
                                                    'aria-label': 'change time',
                                                }}
                                            />
                                        </>
                                    )}
                                </Grid>
                            </Grid>
                            <Grid xs item>
                                <Box height="10px" />
                                <Grid container>
                                    <KeyboardDatePicker
                                        className="rounded-input"
                                        disableToolbar
                                        InputProps={{
                                            disableUnderline: true,
                                            style: { borderRadius: 15, width: '180px' },
                                        }}
                                        inputVariant="filled"
                                        variant="inline"
                                        format="DD/MM/yyyy"
                                        margin="dense"
                                        id="end-date-picker"
                                        label="End date"
                                        value={endDate}
                                        onChange={(date) => setEndDate(date?.toDate() ?? null)}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                        minDate={startDate}
                                    />
                                    {!isAllDay && (
                                        <>
                                            <Box width="20px" />
                                            <KeyboardTimePicker
                                                className="rounded-input"
                                                margin="dense"
                                                InputProps={{
                                                    disableUnderline: true,
                                                    style: { borderRadius: 15, width: '160px' },
                                                }}
                                                inputVariant="filled"
                                                variant="inline"
                                                id="end-time-picker"
                                                label="End time"
                                                value={endDate}
                                                onChange={(date) => setEndDate(date?.toDate() ?? null)}
                                                KeyboardButtonProps={{
                                                    'aria-label': 'change time',
                                                }}
                                            />
                                        </>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                        {recurrenceView}
                    </Grid>
                    <Box height="20px" />
                    <FormLabel component="legend">Custom event color</FormLabel>
                    <Box height="10px" />
                    <CirclePicker
                        onChange={(handler) => setEventColor(handler.hex)}
                        colors={[
                            '#f9a19a',
                            '#f38eb1',
                            '#d686e4',
                            '#b198de',
                            '#9ca6dc',
                            '#7dd5fd',
                            '#69eeff',
                            '#a4d7a6',
                            '#c4e1a4',
                            '#fff49d',
                            '#ffe083',
                            '#ffcb7f',
                        ]}
                    />
                </DialogContent>
                <DialogActions>
                    <Button size="large" onClick={() => setCreateEventOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        size="large"
                        disableElevation
                        onClick={() => {
                            addEventToCalendar();
                            setCreateEventOpen(false);
                        }}
                        color="primary"
                    >
                        Create
                    </Button>
                </DialogActions>
            </Container>
        </Dialog>
    );
    const slotMaxTime = businessHours
        .map((x) => x.endTime)
        .reduce((a, b) => {
            let aDateString = a;
            let bDateString = b;
            const padTime = (value: number) => value.toString().padStart(2, '0');
            try {
                // check here for date
                if (aDateString.length > 6) {
                    const date = new Date(aDateString);
                    aDateString = `${padTime(date.getHours())}:${padTime(date.getMinutes())}`;
                }
                if (bDateString.length > 6) {
                    const date = new Date(bDateString);
                    bDateString = `${padTime(date.getHours())}:${padTime(date.getMinutes())}`;
                }
            } catch (error) {
                // TODO: Report
            }

            const compareRes = aDateString.localeCompare(bDateString, 'en');
            switch (compareRes) {
                case 1:
                    return aDateString;
                case -1:
                    return bDateString;
                default:
                    return aDateString;
            }
        });
    const slotMinTime = businessHours
        .map((x) => x.startTime)
        .reduce((a, b) => {
            let aDateString = a;
            let bDateString = b;
            const padTime = (value: number) => value.toString().padStart(2, '0');
            try {
                // check here for date
                if (a.length > 6) {
                    const date = new Date(a);
                    aDateString = `${padTime(date.getHours())}:${padTime(date.getMinutes())}`;
                }
                if (b.length > 6) {
                    const date = new Date(b);
                    bDateString = `${padTime(date.getHours())}:${padTime(date.getMinutes())}`;
                }
            } catch (error) {
                // TODO: Report
            }
            const compareRes = aDateString.localeCompare(bDateString, 'en');
            switch (compareRes) {
                case 1:
                    return aDateString;
                case -1:
                    return bDateString;
                default:
                    return aDateString;
            }
        });

    return (
        <>
            <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem onClick={handleClose}>Edit</MenuItem>
                <MenuItem onClick={handleClose}>Delete</MenuItem>
            </Menu>
            <Container className="calendar-page-container" maxWidth="xl">
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <h1>My bookings</h1>
                    <Button
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
                            setStartDate(info.start);
                            setEndDate(info.end);
                            setAllDayEvent(info.allDay);
                            setCreateEventOpen(true);
                        }}
                        eventContent={(args) => {
                            // const startDate = args.event.start;
                            // const endDate = args.event.end;
                            // const padTime = (value: number | undefined) => (value ?? '').toString().padStart(2, '0');
                            if (args.event.allDay) return undefined;
                            return undefined;
                        }}
                        eventTimeFormat={{
                            hour: 'numeric',
                            minute: '2-digit',
                            meridiem: 'short',
                        }}
                        businessHours={businessHours.filter((x) => x.daysOfWeek)}
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
                        slotMinTime={slotMinTime}
                        slotMaxTime={slotMaxTime}
                        eventConstraint={businessHours}
                        weekNumbers
                        selectable
                    />
                </Box>
            </Container>
            {createEventModal}
        </>
    );
}
