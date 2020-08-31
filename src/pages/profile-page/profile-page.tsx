import React, { useState, useCallback } from 'react';
import { RouteComponentProps } from '@reach/router';
import {
    Container,
    Grid,
    Box,
    Button,
    Avatar,
    Tab,
    Tabs,
    withStyles,
    Theme,
    createStyles,
    TextField,
    Select,
    MenuItem,
    AccordionSummary,
    Accordion,
    Typography,
    AccordionDetails,
    FormGroup,
    FormControlLabel,
    Checkbox,
} from '@material-ui/core';
import { useStyles } from '../../common/theming/theming';
import './profile-page.scss';
import { ChevronDown, MapPin, X, Share, Heart, Star, BookOpen, DollarSign, Calendar } from 'react-feather';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { mapStyles } from '../../common/theming/map-styles';
import bonitas from '../../images/bonitas.jpg';
import discovery from '../../images/discovery.png';
import medshield from '../../images/medshield.png';
import momentum from '../../images/momentum.png';
import { KeyboardTimePicker } from '@material-ui/pickers';
import moment from 'moment';

enum DoctorSpeciality {
    Unknown,
    GP = 1,
    Physiotherapist,
    Psychologist,
}
enum DoctorAvailability {
    Weekdays,
    WeekdaysAndSat,
    AllDays,
}
enum MedicalAid {
    Discovery,
    Momentum,
    Medshield,
    Bonitas,
    Fedhealth,
}

interface OfficeHours {
    weekdayStart: Date;
    weekdayEnd: Date;
    saturdayStart?: Date;
    saturdayEnd?: Date;
    sundayStart?: Date;
    sundayEnd?: Date;
}
const defaultOfficeHours: OfficeHours = {
    weekdayStart: moment(new Date()).set({ hour: 8, minute: 0 }).toDate(),
    weekdayEnd: moment(new Date()).set({ hour: 17, minute: 0 }).toDate(),
};
export function ProfilePage(props: RouteComponentProps) {
    const classes = useStyles();
    const [tabIndex, setTabIndex] = useState(0);
    const [name, setName] = useState<string>('');
    const [doctorSpeciality, setDoctorSpeciality] = useState<DoctorSpeciality>(DoctorSpeciality.Unknown);
    const [doctorAvailability, setDoctorAvailability] = useState<DoctorAvailability>(DoctorAvailability.Weekdays);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [address, setAddress] = useState('');
    const [appointmentSlot, setAppointmentSlot] = useState(15);
    const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY });
    const pinMapOptions: google.maps.MapOptions = {
        styles: mapStyles,
        disableDefaultUI: true,
        fullscreenControl: true,
        zoomControl: true,
    };
    const previewMapOptions: google.maps.MapOptions = {
        styles: mapStyles,
        disableDefaultUI: true,
        draggable: false,
    };
    const [consultationPricing, setConsultationPricing] = useState(0);
    const [pinMapRef, setPinMapRef] = useState<GoogleMap | null>();
    const [previewMapRef, setPreviewMapRef] = useState<GoogleMap | null>();
    const onPinMapLoad = useCallback((map) => {
        setPinMapRef(map);
    }, []);
    const onPreviewMapLoad = useCallback((map) => {
        setPreviewMapRef(map);
    }, []);
    const [medicalAids, setMedicalAids] = useState<MedicalAid[]>([]);
    const [officeHours, setOfficeHours] = useState<OfficeHours>(defaultOfficeHours);
    const doctorInfoView = tabIndex == 0 && (
        <>
            <Grid direction="row" container alignContent="center" alignItems="center">
                <Grid item md={4} xs={12}>
                    <p>Name</p>
                </Grid>
                <Grid item md={8} xs={12}>
                    <TextField
                        InputProps={{
                            disableUnderline: true,
                            style: { borderRadius: 30, marginBottom: '10px' },
                        }}
                        inputProps={{
                            style: {
                                padding: '12px 20px',
                                borderRadius: 30,
                            },
                        }}
                        value={name}
                        onChange={(event) => setName(event.target.value as string)}
                        variant="filled"
                        margin="none"
                        id="name-input"
                        fullWidth
                    />
                </Grid>
            </Grid>
            <Grid direction="row" container alignContent="center" alignItems="center">
                <Grid item md={4} xs={12}>
                    <p>Category</p>
                </Grid>
                <Grid item md={8} xs={12}>
                    <Select
                        id="category-select"
                        style={{
                            borderRadius: 30,
                            marginBottom: '10px',
                        }}
                        inputProps={{
                            style: {
                                padding: '12px 20px',
                                borderRadius: 30,
                            },
                        }}
                        SelectDisplayProps={{
                            style: {
                                paddingTop: '12px',
                                paddingLeft: '18px',
                                borderRadius: 30,
                            },
                        }}
                        disableUnderline
                        value={doctorSpeciality}
                        onChange={(event) => setDoctorSpeciality(event.target.value as DoctorSpeciality)}
                        variant="filled"
                        displayEmpty
                        fullWidth
                    >
                        <MenuItem value={DoctorSpeciality.Unknown}>Select a speciality</MenuItem>
                        <MenuItem value={DoctorSpeciality.GP}>General practitioner</MenuItem>
                        <MenuItem value={DoctorSpeciality.Physiotherapist}>Physiotherapist</MenuItem>
                        <MenuItem value={DoctorSpeciality.Psychologist}>Psychologist</MenuItem>
                    </Select>
                </Grid>
            </Grid>
            <Grid direction="row" container alignContent="center" alignItems="center">
                <Grid item md={4} xs={12}>
                    <p>Email</p>
                </Grid>
                <Grid item md={8} xs={12}>
                    <TextField
                        InputProps={{
                            disableUnderline: true,
                            style: { borderRadius: 30, marginBottom: '10px' },
                        }}
                        inputProps={{
                            style: {
                                padding: '12px 20px',
                                borderRadius: 30,
                            },
                        }}
                        value={email}
                        onChange={(event: { target: { value: string } }) => setEmail(event.target.value as string)}
                        variant="filled"
                        margin="none"
                        id="email-input"
                        fullWidth
                        type="email"
                        inputMode="email"
                    />
                </Grid>
            </Grid>
            <Grid direction="row" container alignContent="center" alignItems="center">
                <Grid item md={4} xs={12}>
                    <p>Phone</p>
                </Grid>
                <Grid item md={8} xs={12}>
                    <TextField
                        InputProps={{
                            disableUnderline: true,
                            style: { borderRadius: 30, marginBottom: '10px' },
                        }}
                        inputProps={{
                            style: {
                                padding: '12px 20px',
                                borderRadius: 30,
                            },
                        }}
                        value={phone}
                        onChange={(event: { target: { value: string } }) => setPhone(event.target.value as string)}
                        variant="filled"
                        margin="none"
                        id="phone-input"
                        fullWidth
                        inputMode="tel"
                    />
                </Grid>
            </Grid>
            <Grid direction="row" container>
                <Grid item md={4} xs={12}>
                    <p>Bio</p>
                </Grid>
                <Grid item md={8} xs={12}>
                    <TextField
                        InputProps={{
                            disableUnderline: true,
                            style: { borderRadius: 30, marginBottom: '10px', padding: '12px 10px' },
                        }}
                        inputProps={{
                            style: {
                                padding: '12px 10px',
                                borderRadius: 30,
                            },
                        }}
                        value={bio}
                        onChange={(event: { target: { value: string } }) => setBio(event.target.value as string)}
                        variant="filled"
                        margin="none"
                        id="bio-input"
                        fullWidth
                        multiline
                        rows={3}
                    />
                </Grid>
            </Grid>
            <Grid direction="row" container>
                <Grid item md={4} xs={12}>
                    <p>Address</p>
                </Grid>
                <Grid item md={8} xs={12}>
                    <TextField
                        InputProps={{
                            disableUnderline: true,
                            style: { borderRadius: 30, marginBottom: '10px', padding: '12px 10px' },
                        }}
                        inputProps={{
                            style: {
                                padding: '12px 10px',
                                borderRadius: 30,
                            },
                        }}
                        value={address}
                        onChange={(event: { target: { value: string } }) => setAddress(event.target.value as string)}
                        variant="filled"
                        margin="none"
                        id="address-input"
                        fullWidth
                        inputMode="text"
                        multiline
                        rows={2}
                    />
                </Grid>
            </Grid>
            <Grid direction="row" container>
                <Grid item md={4} xs={12}>
                    <p>Pin location</p>
                </Grid>
                <Grid item md={8} xs={12} style={{ position: 'relative' }}>
                    {isLoaded && (
                        <GoogleMap
                            mapContainerClassName={'map-container'}
                            zoom={10}
                            center={{ lat: -28.4792625, lng: 24.6727135 }}
                            options={(pinMapOptions as unknown) as google.maps.MapOptions}
                            onLoad={onPinMapLoad}
                            onCenterChanged={() => {
                                console.log(pinMapRef?.state.map?.getCenter().toJSON());
                            }}
                            ref={(ref) => setPinMapRef(ref)}
                        />
                    )}
                    <div className="marker-container">
                        <MapPin color="#2D6455" size="40px" />
                        <div style={{ height: 40, width: 40 }}></div>
                    </div>
                </Grid>
            </Grid>
        </>
    );
    const settings = tabIndex == 1 && (
        <>
            <Grid direction="row" container alignContent="center" alignItems="center">
                <Grid item md={4} xs={12}>
                    <p>Appointment time slot</p>
                </Grid>
                <Grid item md={8} xs={12}>
                    <Select
                        id="appointment-slot-select"
                        style={{
                            borderRadius: 30,
                            marginBottom: '10px',
                        }}
                        inputProps={{
                            style: {
                                padding: '12px 20px',
                                borderRadius: 30,
                            },
                        }}
                        SelectDisplayProps={{
                            style: {
                                paddingTop: '12px',
                                paddingLeft: '18px',
                                borderRadius: 30,
                            },
                        }}
                        disableUnderline
                        value={appointmentSlot}
                        onChange={(event) => setAppointmentSlot(Number.parseInt(event.target.value as string))}
                        variant="filled"
                        displayEmpty
                        fullWidth
                    >
                        <MenuItem value={15}>15 minutes</MenuItem>
                        <MenuItem value={20}>20 minutes</MenuItem>
                        <MenuItem value={30}>30 minutes</MenuItem>
                        <MenuItem value={45}>45 minutes</MenuItem>
                        <MenuItem value={60}>1 hour</MenuItem>
                    </Select>
                </Grid>
            </Grid>
            <Grid direction="row" container alignContent="center" alignItems="center">
                <Grid item md={4} xs={12}>
                    <p>Availability</p>
                </Grid>
                <Grid item md={8} xs={12}>
                    <Select
                        id="category-select"
                        style={{
                            borderRadius: 30,
                            marginBottom: '10px',
                        }}
                        inputProps={{
                            style: {
                                padding: '12px 20px',
                                borderRadius: 30,
                            },
                        }}
                        SelectDisplayProps={{
                            style: {
                                paddingTop: '12px',
                                paddingLeft: '18px',
                                borderRadius: 30,
                            },
                        }}
                        disableUnderline
                        value={doctorAvailability}
                        onChange={(event) => setDoctorAvailability(event.target.value as DoctorAvailability)}
                        variant="filled"
                        displayEmpty
                        fullWidth
                    >
                        <MenuItem value={DoctorAvailability.Weekdays}>Weekdays</MenuItem>
                        <MenuItem value={DoctorAvailability.WeekdaysAndSat}>Weekdays &amp; Saturday</MenuItem>
                        <MenuItem value={DoctorAvailability.AllDays}>Weekdays &amp; Weekend</MenuItem>
                    </Select>
                </Grid>
            </Grid>
            <Grid direction="row" container alignContent="center" alignItems="center">
                <Grid item md={4} xs={12}>
                    <p>Consultation pricing</p>
                </Grid>
                <Grid item md={8} xs={12}>
                    <Select
                        id="category-select"
                        style={{
                            borderRadius: 30,
                            marginBottom: '10px',
                        }}
                        inputProps={{
                            style: {
                                padding: '12px 20px',
                                borderRadius: 30,
                            },
                        }}
                        SelectDisplayProps={{
                            style: {
                                paddingTop: '12px',
                                paddingLeft: '18px',
                                borderRadius: 30,
                            },
                        }}
                        disableUnderline
                        value={consultationPricing}
                        onChange={(event) => setConsultationPricing(event.target.value as number)}
                        variant="filled"
                        displayEmpty
                        fullWidth
                    >
                        <MenuItem value={0}>R0 - R99</MenuItem>
                        <MenuItem value={100}>R100 - R199</MenuItem>
                        <MenuItem value={200}>R200 - R299</MenuItem>
                        <MenuItem value={300}>R300 - R399</MenuItem>
                        <MenuItem value={400}>R400 - R499</MenuItem>
                        <MenuItem value={500}>R500 - R599</MenuItem>
                        <MenuItem value={600}>R600 - R699</MenuItem>
                        <MenuItem value={700}>R700 - R799</MenuItem>
                        <MenuItem value={800}>R800 - R899</MenuItem>
                        <MenuItem value={900}>R900 - R999</MenuItem>
                    </Select>
                </Grid>
            </Grid>
            <Grid direction="row" container>
                <Grid item md={4} xs={12}>
                    <p>Medical aids supported</p>
                </Grid>
                <Grid item md={8} xs={12}>
                    <Accordion
                        elevation={0}
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.09)', marginBottom: '10px', borderRadius: 30 }}
                    >
                        <AccordionSummary
                            expandIcon={<ChevronDown />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography color="primary" style={{ fontWeight: 'bold' }}>
                                Medical aids
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormGroup style={{ width: '100%' }}>
                                <FormControlLabel
                                    style={{
                                        display: 'flex',
                                        width: '100%',
                                        justifyContent: 'space-between',
                                        marginLeft: 0,
                                        color: '#2D6455',
                                    }}
                                    control={
                                        <Checkbox
                                            color="primary"
                                            checked={medicalAids.findIndex((x) => x == MedicalAid.Discovery) != -1}
                                            onChange={(event, checked) => {
                                                if (checked) {
                                                    setMedicalAids([...medicalAids, MedicalAid.Discovery]);
                                                    return;
                                                }
                                                setMedicalAids(medicalAids.filter((x) => x != MedicalAid.Discovery));
                                            }}
                                            name={MedicalAid[MedicalAid.Discovery]}
                                        />
                                    }
                                    label={MedicalAid[MedicalAid.Discovery]}
                                    labelPlacement="start"
                                />
                                <FormControlLabel
                                    style={{
                                        display: 'flex',
                                        width: '100%',
                                        justifyContent: 'space-between',
                                        marginLeft: 0,
                                        color: '#2D6455',
                                    }}
                                    control={
                                        <Checkbox
                                            color="primary"
                                            checked={medicalAids.findIndex((x) => x == MedicalAid.Momentum) != -1}
                                            onChange={(event, checked) => {
                                                if (checked) {
                                                    setMedicalAids([...medicalAids, MedicalAid.Momentum]);
                                                    return;
                                                }
                                                setMedicalAids(medicalAids.filter((x) => x != MedicalAid.Momentum));
                                            }}
                                            name={MedicalAid[MedicalAid.Momentum]}
                                        />
                                    }
                                    label={MedicalAid[MedicalAid.Momentum]}
                                    labelPlacement="start"
                                />
                                <FormControlLabel
                                    style={{
                                        display: 'flex',
                                        width: '100%',
                                        justifyContent: 'space-between',
                                        marginLeft: 0,
                                        color: '#2D6455',
                                    }}
                                    control={
                                        <Checkbox
                                            color="primary"
                                            checked={medicalAids.findIndex((x) => x == MedicalAid.Fedhealth) != -1}
                                            onChange={(event, checked) => {
                                                if (checked) {
                                                    setMedicalAids([...medicalAids, MedicalAid.Fedhealth]);
                                                    return;
                                                }
                                                setMedicalAids(medicalAids.filter((x) => x != MedicalAid.Fedhealth));
                                            }}
                                            name={MedicalAid[MedicalAid.Fedhealth]}
                                        />
                                    }
                                    label={MedicalAid[MedicalAid.Fedhealth]}
                                    labelPlacement="start"
                                />
                                <FormControlLabel
                                    style={{
                                        display: 'flex',
                                        width: '100%',
                                        justifyContent: 'space-between',
                                        marginLeft: 0,
                                        color: '#2D6455',
                                    }}
                                    control={
                                        <Checkbox
                                            color="primary"
                                            checked={medicalAids.findIndex((x) => x == MedicalAid.Bonitas) != -1}
                                            onChange={(event, checked) => {
                                                if (checked) {
                                                    setMedicalAids([...medicalAids, MedicalAid.Bonitas]);
                                                    return;
                                                }
                                                setMedicalAids(medicalAids.filter((x) => x != MedicalAid.Bonitas));
                                            }}
                                            name={MedicalAid[MedicalAid.Bonitas]}
                                        />
                                    }
                                    label={MedicalAid[MedicalAid.Bonitas]}
                                    labelPlacement="start"
                                />
                                <FormControlLabel
                                    style={{
                                        display: 'flex',
                                        width: '100%',
                                        justifyContent: 'space-between',
                                        marginLeft: 0,
                                        color: '#2D6455',
                                    }}
                                    control={
                                        <Checkbox
                                            color="primary"
                                            checked={medicalAids.findIndex((x) => x == MedicalAid.Medshield) != -1}
                                            onChange={(event, checked) => {
                                                if (checked) {
                                                    setMedicalAids([...medicalAids, MedicalAid.Medshield]);
                                                    return;
                                                }
                                                setMedicalAids(medicalAids.filter((x) => x != MedicalAid.Medshield));
                                            }}
                                            name={MedicalAid[MedicalAid.Medshield]}
                                        />
                                    }
                                    label={MedicalAid[MedicalAid.Medshield]}
                                    labelPlacement="start"
                                />
                            </FormGroup>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
            </Grid>
            <Grid direction="row" container>
                <Grid item md={4} xs={12}>
                    <p>Office hours</p>
                </Grid>
                <Grid item md={8} xs={12}>
                    <Accordion
                        elevation={0}
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.09)', marginBottom: '10px', borderRadius: 30 }}
                    >
                        <AccordionSummary
                            expandIcon={<ChevronDown />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography color="primary" style={{ fontWeight: 'bold' }}>
                                Hours
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container>
                                <Grid container xs={12} alignItems="center" style={{ marginBottom: 14 }}>
                                    <Grid item xs={12}>
                                        <Typography color="primary">Monday - Friday</Typography>
                                    </Grid>
                                    <Grid
                                        item
                                        xs={12}
                                        direction="row"
                                        style={{ display: 'flex' }}
                                        alignItems="center"
                                        justify="space-between"
                                    >
                                        <KeyboardTimePicker
                                            margin="dense"
                                            InputProps={{
                                                disableUnderline: true,
                                                style: { borderRadius: 15, width: '160px' },
                                            }}
                                            inputProps={{
                                                style: {
                                                    paddingTop: '12px',
                                                },
                                            }}
                                            InputAdornmentProps={{
                                                style: {
                                                    padding: 0,
                                                },
                                            }}
                                            inputVariant="filled"
                                            variant="inline"
                                            id="weekday-start-time-picker"
                                            value={officeHours.weekdayStart}
                                            onChange={(date) =>
                                                setOfficeHours({
                                                    ...officeHours,
                                                    weekdayStart: date?.toDate() ?? defaultOfficeHours.weekdayStart,
                                                })
                                            }
                                        />
                                        <Typography variant="body1" color="primary" display="inline">
                                            to
                                        </Typography>
                                        <KeyboardTimePicker
                                            margin="dense"
                                            InputProps={{
                                                disableUnderline: true,
                                                style: { borderRadius: 15, width: '160px' },
                                            }}
                                            inputProps={{
                                                style: {
                                                    paddingTop: '12px',
                                                    paddingBottom: '12px',
                                                },
                                            }}
                                            InputAdornmentProps={{
                                                style: {
                                                    padding: 0,
                                                },
                                            }}
                                            inputVariant="filled"
                                            variant="inline"
                                            id="weekday-end-time-picker"
                                            value={officeHours.weekdayEnd}
                                            onChange={(date) =>
                                                setOfficeHours({
                                                    ...officeHours,
                                                    weekdayEnd: date?.toDate() ?? defaultOfficeHours.weekdayEnd,
                                                })
                                            }
                                        />
                                    </Grid>
                                </Grid>
                                {(doctorAvailability == DoctorAvailability.WeekdaysAndSat ||
                                    doctorAvailability == DoctorAvailability.AllDays) && (
                                    <Grid container xs={12} alignItems="center" style={{ marginBottom: 14 }}>
                                        <Grid item xs={12}>
                                            <Typography color="primary">Saturday</Typography>
                                        </Grid>
                                        <Grid
                                            item
                                            xs={12}
                                            direction="row"
                                            style={{ display: 'flex' }}
                                            alignItems="center"
                                            justify="space-between"
                                        >
                                            <KeyboardTimePicker
                                                margin="dense"
                                                InputProps={{
                                                    disableUnderline: true,
                                                    style: { borderRadius: 15, width: '160px' },
                                                }}
                                                inputProps={{
                                                    style: {
                                                        paddingTop: '12px',
                                                    },
                                                }}
                                                InputAdornmentProps={{
                                                    style: {
                                                        padding: 0,
                                                    },
                                                }}
                                                inputVariant="filled"
                                                variant="inline"
                                                id="saturday-start-time-picker"
                                                value={officeHours.saturdayStart ?? officeHours.weekdayStart}
                                                onChange={(date) =>
                                                    setOfficeHours({
                                                        ...officeHours,
                                                        saturdayStart: date?.toDate(),
                                                    })
                                                }
                                            />
                                            <Typography variant="body1" color="primary" display="inline">
                                                to
                                            </Typography>
                                            <KeyboardTimePicker
                                                margin="dense"
                                                InputProps={{
                                                    disableUnderline: true,
                                                    style: { borderRadius: 15, width: '160px' },
                                                }}
                                                inputProps={{
                                                    style: {
                                                        paddingTop: '12px',
                                                        paddingBottom: '12px',
                                                    },
                                                }}
                                                InputAdornmentProps={{
                                                    style: {
                                                        padding: 0,
                                                    },
                                                }}
                                                inputVariant="filled"
                                                variant="inline"
                                                id="saturday-end-time-picker"
                                                value={officeHours.saturdayEnd ?? officeHours.weekdayEnd}
                                                onChange={(date) =>
                                                    setOfficeHours({
                                                        ...officeHours,
                                                        saturdayEnd: date?.toDate(),
                                                    })
                                                }
                                            />
                                        </Grid>
                                    </Grid>
                                )}
                                {doctorAvailability == DoctorAvailability.AllDays && (
                                    <Grid container xs={12} alignItems="center" style={{ marginBottom: 14 }}>
                                        <Grid item xs={12}>
                                            <Typography color="primary">Sunday</Typography>
                                        </Grid>
                                        <Grid
                                            item
                                            xs={12}
                                            direction="row"
                                            style={{ display: 'flex' }}
                                            alignItems="center"
                                            justify="space-between"
                                        >
                                            <KeyboardTimePicker
                                                margin="dense"
                                                InputProps={{
                                                    disableUnderline: true,
                                                    style: { borderRadius: 15, width: '160px' },
                                                }}
                                                inputProps={{
                                                    style: {
                                                        paddingTop: '12px',
                                                    },
                                                }}
                                                InputAdornmentProps={{
                                                    style: {
                                                        padding: 0,
                                                    },
                                                }}
                                                inputVariant="filled"
                                                variant="inline"
                                                id="sunday-start-time-picker"
                                                value={officeHours.sundayStart ?? officeHours.weekdayStart}
                                                onChange={(date) =>
                                                    setOfficeHours({
                                                        ...officeHours,
                                                        sundayStart: date?.toDate(),
                                                    })
                                                }
                                            />
                                            <Typography variant="body1" color="primary" display="inline">
                                                to
                                            </Typography>
                                            <KeyboardTimePicker
                                                margin="dense"
                                                InputProps={{
                                                    disableUnderline: true,
                                                    style: { borderRadius: 15, width: '160px' },
                                                }}
                                                inputProps={{
                                                    style: {
                                                        paddingTop: '12px',
                                                        paddingBottom: '12px',
                                                    },
                                                }}
                                                InputAdornmentProps={{
                                                    style: {
                                                        padding: 0,
                                                    },
                                                }}
                                                inputVariant="filled"
                                                variant="inline"
                                                id="weekday-end-time-picker"
                                                value={officeHours.sundayEnd ?? officeHours.weekdayEnd}
                                                onChange={(date) =>
                                                    setOfficeHours({
                                                        ...officeHours,
                                                        sundayEnd: date?.toDate(),
                                                    })
                                                }
                                            />
                                        </Grid>
                                    </Grid>
                                )}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
            </Grid>
            <Grid direction="row" container alignContent="center" alignItems="center">
                <Grid item md={4} xs={12}>
                    <p>Account options</p>
                </Grid>
                <Grid item md={8} xs={12} style={{ display: 'flex' }}>
                    <Button
                        className={classes.accentButton}
                        color="default"
                        variant="contained"
                        disableElevation
                        onClick={() => {
                            // open live chat
                        }}
                        fullWidth
                    >
                        <p>Cancel subscription</p>
                    </Button>
                    <Box width="20px" />
                    <Button
                        className={classes.accentButton}
                        color="default"
                        variant="contained"
                        disableElevation
                        onClick={() => {
                            // open live chat
                        }}
                        fullWidth
                    >
                        <p>Delete account</p>
                    </Button>
                </Grid>
            </Grid>
        </>
    );

    const faq = tabIndex == 2 && (
        <>
            <Accordion elevation={0}>
                <AccordionSummary expandIcon={<ChevronDown />} aria-controls="panel1a-content" id="panel1a-header">
                    <Typography>How do I make my profile stand out?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit
                        amet blandit leo lobortis eget.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion elevation={0}>
                <AccordionSummary expandIcon={<ChevronDown />} aria-controls="panel2a-content" id="panel2a-header">
                    <Typography>How do I cancel an appointment?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit
                        amet blandit leo lobortis eget.
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </>
    );
    return (
        <Container className="profile-page-container" maxWidth="xl">
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <h1>My profile</h1>
                <Box display="flex" alignItems="center">
                    <p>We are eager to help you.</p>
                    <Box width="20px" />
                    <Button
                        className={classes.accentButton}
                        color="primary"
                        variant="contained"
                        disableElevation
                        onClick={() => {
                            // open live chat
                        }}
                    >
                        <p>Open live chat</p>
                    </Button>
                </Box>
            </Box>
            <Grid container spacing={4}>
                <Grid item xs={12} lg={7} xl={8}>
                    <Box className="profile-header-container">
                        <Grid container>
                            <Grid item lg={9} sm={12} direction="row" style={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                    variant="rounded"
                                    style={{ height: '90px', width: '90px', borderRadius: '25px' }}
                                />
                                <Box marginLeft="20px" display="flex" flexDirection="column">
                                    <Typography variant="h4" style={{ fontWeight: 'bold' }} color="primary">
                                        Dr A General
                                    </Typography>
                                    <Typography variant="h5">Physiotherapist</Typography>
                                </Box>
                            </Grid>
                            <Grid item lg={3} sm={12} className="account-status-box">
                                <p style={{ textAlign: 'center' }}>Account is active</p>
                            </Grid>
                        </Grid>
                        <Box height="30px" />
                        <StyledTabs
                            value={tabIndex}
                            onChange={(_, newValue) => setTabIndex(newValue)}
                            textColor="primary"
                        >
                            <StyledTab label="My profile" />
                            <StyledTab label="Settings" />
                            <StyledTab label="FAQs" />
                        </StyledTabs>
                    </Box>
                    <Box className="profile-content-container">
                        {doctorInfoView}
                        {settings}
                        {faq}
                    </Box>
                </Grid>
                <Grid item xl={4} lg={5} xs={12}>
                    <Box className="data-container" justifyContent="center">
                        <h2>Listing preview</h2>
                        <Box height="30px" />
                        <Box className="listing-preview-container">
                            <Box height="40%" width="100%" position="relative">
                                <Box className="icons-container">
                                    <div className="icon-button-container">
                                        <X size={24} />
                                    </div>
                                    <Box flexGrow="1"></Box>
                                    <div className="icon-button-container">
                                        <Share size={24} />
                                    </div>
                                    <Box width="10px"></Box>
                                    <div className="icon-button-container">
                                        <Heart size={24} />
                                    </div>
                                </Box>
                                <Box className="avatar-rating-container">
                                    <Box position="relative" height="105px">
                                        <Avatar
                                            variant="rounded"
                                            style={{ height: '90px', width: '90px', borderRadius: '25px' }}
                                        />
                                        <div className="rating-container">
                                            <Star size="15px" />
                                            <span>4.8</span>
                                        </div>
                                    </Box>
                                </Box>

                                <Box width="100%" height="80%" position="relative" marginBottom="60px">
                                    {isLoaded && (
                                        <GoogleMap
                                            mapContainerClassName={'listing-preview-map-container'}
                                            zoom={10}
                                            center={{ lat: -28.4792625, lng: 24.6727135 }}
                                            options={(previewMapOptions as unknown) as google.maps.MapOptions}
                                            onLoad={onPreviewMapLoad}
                                            onCenterChanged={() => {
                                                console.log(previewMapRef?.state.map?.getCenter().toJSON());
                                            }}
                                            ref={(ref) => setPreviewMapRef(ref)}
                                        />
                                    )}
                                    <div className="marker-container">
                                        <MapPin color="#2D6455" size="20px" />
                                        <div style={{ height: 20, width: 20 }}></div>
                                    </div>
                                </Box>
                            </Box>
                            <Box justifyContent="center" textAlign="center">
                                <Typography
                                    display="inline"
                                    variant="h6"
                                    style={{ fontWeight: 'bold' }}
                                    className="listing-doctor-title"
                                    color="primary"
                                >
                                    Dr A General
                                </Typography>
                                <p>Physiotherapist</p>
                            </Box>
                            <Box position="relative" height="20%" marginTop="16px" margin="16px 18px 0px 18px">
                                <Box className="icon-header-container">
                                    <BookOpen size="20px" />
                                </Box>
                                <Box className="bio-info-container">
                                    <Typography variant="body1" align="center">
                                        I've been practising for over 12 years. Extensive experience in sports medicine
                                        and athlete recovery.
                                    </Typography>
                                </Box>
                            </Box>
                            <Box flexDirection="row" display="flex" margin="0px 18px" height="25%">
                                <Box position="relative" width="50%" marginTop="10px" display="flex">
                                    <Box className="icon-header-container">
                                        <DollarSign size="20px" />
                                    </Box>
                                    <Box className="practice-info-container">
                                        <Typography variant="body1" align="center">
                                            R400 - R499
                                        </Typography>
                                        <Typography variant="body1" align="center">
                                            per consultation
                                        </Typography>
                                        <Box height="10px"></Box>
                                        <Box display="flex" flexDirection="row">
                                            <img className="medical-aid-img" src={discovery} />
                                            <img className="medical-aid-img" src={momentum} />
                                            <img className="medical-aid-img" src={bonitas} />
                                            <img className="medical-aid-img" src={medshield} />
                                            <span className="medical-aid-img"> +2</span>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box width="10px" />
                                <Box position="relative" width="50%" marginTop="10px" display="flex">
                                    <Box className="icon-header-container">
                                        <Calendar size="20px" />
                                    </Box>
                                    <Box className="practice-info-container">
                                        <Typography variant="body1" align="center">
                                            Mon - Fri
                                        </Typography>
                                        <Typography variant="body1" align="center">
                                            08:00 - 17:00
                                        </Typography>
                                        <Box height="10px"></Box>
                                        <Typography variant="body1" align="center">
                                            Sat
                                        </Typography>
                                        <Typography variant="body1" align="center">
                                            09:00 - 13:00
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}

interface StyledTabsProps {
    value: number;
    onChange: (event: React.ChangeEvent<{}>, newValue: number) => void;
    textColor?: 'secondary' | 'primary' | 'inherit';
}

const StyledTabs = withStyles({
    indicator: {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        height: '5px',

        '& > span': {
            width: '100%',
            backgroundColor: '#2D6455',
            borderRadius: '15px 15px 0px 0px',
        },
    },
})((props: StyledTabsProps) => <Tabs {...props} TabIndicatorProps={{ children: <span /> }} />);

interface StyledTabProps {
    label: string;
}

const StyledTab = withStyles((theme: Theme) =>
    createStyles({
        root: {
            fontSize: theme.typography.pxToRem(15),
            marginRight: theme.spacing(1),
            minWidth: 72,
            fontWeight: 'bold',
            '&:focus': {
                opacity: 49,
            },
        },
    }),
)((props: StyledTabProps) => <Tab disableRipple {...props} />);
