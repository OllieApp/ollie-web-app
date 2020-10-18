import React, { useState, useCallback } from 'react';
import { RouteComponentProps } from '@reach/router';
import {
    Container,
    Grid,
    Box,
    Button,
    IconButton,
    Avatar,
    Tab,
    Tabs,
    Modal,
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
import { ChevronDown, MapPin, X, Share, Heart, Star, BookOpen, DollarSign, Calendar, Edit } from 'react-feather';
import { KeyboardTimePicker } from '@material-ui/pickers';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { useTheme } from '@material-ui/core/styles';
import moment from 'moment';
import { observer } from 'mobx-react';
import { mapStyles } from '../../common/theming/map-styles';
import { AvatarUpload } from './components/avatar-upload';
import bonitas from '../../images/bonitas.jpg';
import discovery from '../../images/discovery.png';
import medshield from '../../images/medshield.png';
import momentum from '../../images/momentum.png';
import './profile-page.scss';
import { DoctorCategory, DoctorAvailability, MedicalAid, Location } from '../../types';
import { DoctorCategories, MedicalAids } from '../../constants';
import { useRootStore } from '../../common/stores';

const defaultLocation = { lat: -28.4792625, lng: 24.6727135 };

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ProfilePage = observer((props: RouteComponentProps) => {
    const { userStore } = useRootStore();
    const { practitionerInfo, user } = userStore;
    const [tabIndex, setTabIndex] = useState(0);
    const [firstName, setFirstName] = useState<string>(user?.firstName || '');
    const [lastName, setLastName] = useState<string>(user?.lastName || '');
    const [doctorCategory, setDoctorCategory] = useState<DoctorCategory>(
        practitionerInfo?.category || DoctorCategory.Unknown,
    );
    const [doctorAvailability, setDoctorAvailability] = useState<DoctorAvailability>(DoctorAvailability.Weekdays);
    const [email, setEmail] = useState(practitionerInfo?.email || '');
    const [phone, setPhone] = useState(practitionerInfo?.phone || '');
    const [bio, setBio] = useState(practitionerInfo?.bio || '');
    const [address, setAddress] = useState(practitionerInfo?.address || '');
    const [appointmentSlot, setAppointmentSlot] = useState(practitionerInfo?.appointmentTimeSlot || 15);
    const [location, setLocation] = useState<Location | null>(practitionerInfo?.location || null);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const { isLoaded } = useLoadScript({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string });
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
    const onPinMapLoad = useCallback((map) => {
        setPinMapRef(map);
    }, []);
    const [medicalAids, setMedicalAids] = useState<MedicalAid[]>([]);
    const [officeHours, setOfficeHours] = useState<OfficeHours>(defaultOfficeHours);

    const center = practitionerInfo?.location
        ? {
              lat: practitionerInfo?.location.latitude,
              lng: practitionerInfo?.location.longitude,
          }
        : defaultLocation;

    const previewCenter = location
        ? {
              lat: location.latitude,
              lng: location.longitude,
          }
        : defaultLocation;

    const theme = useTheme();

    const toggleAvatarModal = useCallback(() => {
        setIsAvatarModalOpen(!isAvatarModalOpen);
    }, [isAvatarModalOpen]);

    const handleAvatarSave = useCallback(async (image: File) => {
        await userStore.uploadAvatar(image);
        setIsAvatarModalOpen(false);
    }, []);

    const handleCenterChange = () => {
        const geo = pinMapRef?.state.map?.getCenter().toJSON();
        if (geo?.lat && geo.lng) {
            setLocation({
                latitude: geo?.lat,
                longitude: geo?.lng,
            });
        }
    };

    const handleMedicalAidChange = (medicalAid: MedicalAid, checked: boolean) => {
        if (checked) {
            setMedicalAids([...medicalAids, medicalAid]);
            return;
        }
        setMedicalAids(medicalAids.filter((x) => x !== medicalAid));
    };

    const avatarView = practitionerInfo?.avatarUrl ? (
        <img
            src={practitionerInfo.avatarUrl}
            style={{ height: '90px', width: '90px', borderRadius: '25px' }}
            alt={practitionerInfo.title}
        />
    ) : (
        <Avatar variant="rounded" style={{ height: '90px', width: '90px', borderRadius: '25px' }} />
    );

    const doctorInfoView = tabIndex === 0 && (
        <Grid direction="column" spacing={1} container>
            <Grid item container alignContent="center" alignItems="center">
                <Grid item md={4} xs>
                    <p>First Name</p>
                </Grid>
                <Grid item md={8} xs>
                    <TextField
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value as string)}
                        variant="filled"
                        margin="none"
                        id="name-input"
                        fullWidth
                    />
                </Grid>
            </Grid>
            <Grid item container alignContent="center" alignItems="center">
                <Grid item md={4} xs>
                    <p>Last Name</p>
                </Grid>
                <Grid item md={8} xs>
                    <TextField
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value as string)}
                        variant="filled"
                        margin="none"
                        id="name-input"
                        fullWidth
                    />
                </Grid>
            </Grid>
            <Grid item container alignContent="center" alignItems="center">
                <Grid item md={4} xs>
                    <p>Category</p>
                </Grid>
                <Grid item md={8} xs>
                    <Select
                        id="category-select"
                        disableUnderline
                        value={doctorCategory}
                        onChange={(event) => setDoctorCategory(event.target.value as DoctorCategory)}
                        variant="filled"
                        displayEmpty
                        fullWidth
                    >
                        {Object.entries(DoctorCategories).map(([value, label]) => (
                            <MenuItem key={value} value={value}>
                                {label}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
            </Grid>
            <Grid item container alignContent="center" alignItems="center">
                <Grid item md={4} xs>
                    <p>Email</p>
                </Grid>
                <Grid item md={8} xs>
                    <TextField
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
            <Grid item container alignContent="center" alignItems="center">
                <Grid item md={4} xs>
                    <p>Phone</p>
                </Grid>
                <Grid item md={8} xs>
                    <TextField
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
            <Grid item container>
                <Grid item md={4} xs>
                    <p>Bio</p>
                </Grid>
                <Grid item md={8} xs>
                    <TextField
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
            <Grid item container>
                <Grid item md={4} xs>
                    <p>Address</p>
                </Grid>
                <Grid item md={8} xs>
                    <TextField
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
            <Grid item container>
                <Grid item md={4} xs>
                    <p>Pin location</p>
                </Grid>
                <Grid item md={8} xs style={{ position: 'relative' }}>
                    {isLoaded && (
                        <GoogleMap
                            mapContainerClassName="map-container"
                            zoom={10}
                            center={center}
                            options={(pinMapOptions as unknown) as google.maps.MapOptions}
                            onLoad={onPinMapLoad}
                            onCenterChanged={handleCenterChange}
                            ref={(ref) => setPinMapRef(ref)}
                        />
                    )}
                    <div className="marker-container">
                        <MapPin color="#2D6455" size="40px" />
                        <div style={{ height: 40, width: 40 }} />
                    </div>
                </Grid>
            </Grid>
        </Grid>
    );

    const settings = tabIndex === 1 && (
        <Grid direction="column" spacing={1} container>
            <Grid item container alignContent="center" alignItems="center">
                <Grid item md={4} xs>
                    <p>Appointment time slot</p>
                </Grid>
                <Grid item md={8} xs>
                    <Select
                        id="appointment-slot-select"
                        disableUnderline
                        value={appointmentSlot}
                        onChange={(event) => setAppointmentSlot(Number(event.target.value))}
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
            <Grid item container alignContent="center" alignItems="center">
                <Grid item md={4} xs>
                    <p>Availability</p>
                </Grid>
                <Grid item md={8} xs>
                    <Select
                        id="category-select"
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
            <Grid item container alignContent="center" alignItems="center">
                <Grid item md={4} xs>
                    <p>Consultation pricing</p>
                </Grid>
                <Grid item md={8} xs>
                    <Select
                        id="category-select"
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
            <Grid item container>
                <Grid item md={4} xs>
                    <p>Medical aids supported</p>
                </Grid>
                <Grid item md={8} xs>
                    <Accordion
                        elevation={0}
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.09)',
                            marginBottom: '10px',
                            borderRadius: 20,
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ChevronDown />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                            style={{ paddingTop: 4, paddingBottom: 4 }}
                        >
                            <Typography color="primary" style={{ fontWeight: 'bold' }}>
                                Medical aids
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormGroup style={{ width: '100%' }}>
                                {Object.entries(MedicalAids).map(([key, name]) => (
                                    <FormControlLabel
                                        key={key}
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
                                                checked={medicalAids.includes(Number(key) as MedicalAid)}
                                                onChange={(event, checked) =>
                                                    handleMedicalAidChange(Number(key) as MedicalAid, checked)
                                                }
                                                name={name}
                                            />
                                        }
                                        label={name}
                                        labelPlacement="start"
                                    />
                                ))}
                            </FormGroup>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
            </Grid>
            <Grid item container>
                <Grid item md={4} xs>
                    <p>Office hours</p>
                </Grid>
                <Grid item md={8} xs>
                    <Accordion
                        elevation={0}
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.09)', marginBottom: '10px', borderRadius: 20 }}
                    >
                        <AccordionSummary
                            expandIcon={<ChevronDown />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                            style={{ paddingTop: 4, paddingBottom: 4 }}
                        >
                            <Typography color="primary" style={{ fontWeight: 'bold' }}>
                                Hours
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container direction="column" spacing={2}>
                                <Grid container item xs direction="column" spacing={1}>
                                    <Grid item xs>
                                        <Typography color="primary">Monday - Friday</Typography>
                                    </Grid>
                                    <Grid item container xs spacing={1} alignItems="center" justify="space-between">
                                        <Grid item xs>
                                            <KeyboardTimePicker
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
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body1" color="primary" display="inline">
                                                to
                                            </Typography>
                                        </Grid>
                                        <Grid item xs>
                                            <KeyboardTimePicker
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
                                </Grid>
                                {(doctorAvailability === DoctorAvailability.WeekdaysAndSat ||
                                    doctorAvailability === DoctorAvailability.AllDays) && (
                                    <Grid item container xs direction="column" spacing={1}>
                                        <Grid item xs>
                                            <Typography color="primary">Saturday</Typography>
                                        </Grid>
                                        <Grid item container xs spacing={1} alignItems="center" justify="space-between">
                                            <Grid item xs>
                                                <KeyboardTimePicker
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
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="body1" color="primary" display="inline">
                                                    to
                                                </Typography>
                                            </Grid>
                                            <Grid item xs>
                                                <KeyboardTimePicker
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
                                    </Grid>
                                )}
                                {doctorAvailability === DoctorAvailability.AllDays && (
                                    <Grid item container xs direction="column" spacing={1}>
                                        <Grid item xs>
                                            <Typography color="primary">Sunday</Typography>
                                        </Grid>
                                        <Grid item container xs spacing={1} alignItems="center" justify="space-between">
                                            <Grid item xs>
                                                <KeyboardTimePicker
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
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="body1" color="primary" display="inline">
                                                    to
                                                </Typography>
                                            </Grid>
                                            <Grid item xs>
                                                <KeyboardTimePicker
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
                                    </Grid>
                                )}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
            </Grid>
            <Grid item container alignContent="center" alignItems="center">
                <Grid item md={4} xs>
                    <p>Account options</p>
                </Grid>
                <Grid item md={8} xs style={{ display: 'flex' }}>
                    <Button
                        color="default"
                        variant="contained"
                        disableElevation
                        onClick={() => {
                            // open live chat
                        }}
                        fullWidth
                    >
                        Cancel subscription
                    </Button>
                    <Box width="20px" />
                    <Button
                        color="default"
                        variant="contained"
                        disableElevation
                        onClick={() => {
                            // open live chat
                        }}
                        fullWidth
                    >
                        Delete account
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );

    const faq = tabIndex === 2 && (
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
                        color="primary"
                        variant="contained"
                        disableElevation
                        onClick={() => {
                            // open live chat
                        }}
                    >
                        Open live chat
                    </Button>
                </Box>
            </Box>
            <Grid container spacing={4}>
                <Grid item xs lg={7} xl={8}>
                    <Box className="profile-header-container">
                        <Grid container>
                            <Grid item lg={9} sm={12} style={{ display: 'flex', alignItems: 'center' }}>
                                <Box width="90px" height="90px" position="relative">
                                    {avatarView}
                                    <AvatarOverlay
                                        width="100%"
                                        height="100%"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        position="absolute"
                                        top={0}
                                        left={0}
                                    >
                                        <AvatarEditIconButton onClick={toggleAvatarModal}>
                                            <Edit color={theme.palette.primary.main} size={18} />
                                        </AvatarEditIconButton>
                                    </AvatarOverlay>
                                </Box>
                                <Box marginLeft="20px" display="flex" flexDirection="column">
                                    <Typography variant="h4" style={{ fontWeight: 'bold' }} color="primary">
                                        {practitionerInfo?.title}
                                    </Typography>
                                    <Typography variant="h5">
                                        {practitionerInfo && DoctorCategories[practitionerInfo?.category]}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item lg={3} sm={12} className="account-status-box">
                                <p style={{ textAlign: 'center' }}>
                                    {user?.isActive ? 'Account is active' : 'Account is not active'}
                                </p>
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
                <Grid item xl={4} lg={5} xs>
                    <Box className="data-container" justifyContent="center">
                        <h2>Listing preview</h2>
                        <Box height="30px" />
                        <Box className="listing-preview-container">
                            <Box height="40%" width="100%" position="relative">
                                <Box className="icons-container">
                                    <div className="icon-button-container">
                                        <X size={24} />
                                    </div>
                                    <Box flexGrow="1" />
                                    <div className="icon-button-container">
                                        <Share size={24} />
                                    </div>
                                    <Box width="10px" />
                                    <div className="icon-button-container">
                                        <Heart size={24} />
                                    </div>
                                </Box>
                                <Box className="avatar-rating-container">
                                    <Box position="relative" height="105px">
                                        {avatarView}
                                        <div className="rating-container">
                                            <Star size="15px" />
                                            <span>4.8</span>
                                        </div>
                                    </Box>
                                </Box>

                                <Box width="100%" height="80%" position="relative" marginBottom="60px">
                                    {isLoaded && (
                                        <GoogleMap
                                            mapContainerClassName="listing-preview-map-container"
                                            zoom={10}
                                            center={previewCenter}
                                            options={(previewMapOptions as unknown) as google.maps.MapOptions}
                                        />
                                    )}
                                    <div className="marker-container">
                                        <MapPin color="#2D6455" size="20px" />
                                        <div style={{ height: 20, width: 20 }} />
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
                                    {practitionerInfo?.title}
                                </Typography>
                                <p>{practitionerInfo && DoctorCategories[practitionerInfo?.category]}</p>
                            </Box>
                            {practitionerInfo?.bio && (
                                <Box position="relative" height="20%" marginTop="16px" margin="16px 18px 0px 18px">
                                    <Box className="icon-header-container">
                                        <BookOpen size="20px" />
                                    </Box>
                                    <Box className="bio-info-container">
                                        <Typography variant="body1" align="center">
                                            {practitionerInfo?.bio}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
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
                                        <Box height="10px" />
                                        <Box display="flex" flexDirection="row">
                                            <img className="medical-aid-img" src={discovery} alt="" />
                                            <img className="medical-aid-img" src={momentum} alt="" />
                                            <img className="medical-aid-img" src={bonitas} alt="" />
                                            <img className="medical-aid-img" src={medshield} alt="" />
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
                                        <Box height="10px" />
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
            <Modal open={isAvatarModalOpen} onClose={toggleAvatarModal}>
                <Box width="100%" height="100%" display="flex" alignItems="center" justifyContent="center">
                    <Box
                        px={4}
                        pt={4}
                        pb={2}
                        width="100%"
                        maxWidth="640px"
                        bgcolor="background.paper"
                        borderRadius={30}
                    >
                        <AvatarUpload onSave={handleAvatarSave} onCancel={toggleAvatarModal} />
                    </Box>
                </Box>
            </Modal>
        </Container>
    );
});

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

const AvatarEditIconButton = withStyles((theme: Theme) => ({
    root: {
        boxShadow: 'none',
        backgroundColor: theme.palette.background.paper,
        '&:hover': {
            backgroundColor: theme.palette.grey[100],
            boxShadow: 'none',
        },
        '&:active': {
            boxShadow: 'none',
        },
        '&:focus': {
            boxShadow: 'none',
        },
    },
}))(IconButton);

const AvatarOverlay = withStyles({
    root: {
        opacity: 0,
        transition: 'opacity .2s ease-in-out',
        '&:hover': {
            opacity: 1,
        },
    },
})(Box);
