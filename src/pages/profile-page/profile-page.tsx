import React, { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import {
    Container,
    Grid,
    Box,
    Button,
    Paper,
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
} from '@material-ui/core';
import { useStyles } from '../../common/theming/theming';
import './profile-page.scss';
import { ArrowDown, ChevronDown } from 'react-feather';
enum DoctorSpeciality {
    GP = 1,
    Physiotherapist,
    Psychologist,
}
export function ProfilePage(props: RouteComponentProps) {
    const classes = useStyles();
    const [tabIndex, setTabIndex] = useState(0);
    const [name, setName] = useState<string>('');
    const [doctorSpeciality, setDoctorSpeciality] = useState<DoctorSpeciality | null>();
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [address, setAddress] = useState('');
    const [appointmentSlot, setAppointmentSlot] = useState(15);

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
                        onChange={(event: { target: { value: string } }) => setName(event.target.value as string)}
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
            <Grid direction="row" container alignContent="center" alignItems="center">
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
            <Grid direction="row" container alignContent="center" alignItems="center">
                <Grid item md={4} xs={12}>
                    <p>Pin location</p>
                </Grid>
                <Grid item md={8} xs={12}>
                    <TextField
                        InputProps={{
                            disableUnderline: true,
                            style: { borderRadius: 15, marginBottom: '10px' },
                        }}
                        inputProps={{
                            style: {
                                padding: '12px 20px',
                            },
                        }}
                        value={name}
                        onChange={(event: { target: { value: string } }) => setName(event.target.value as string)}
                        variant="filled"
                        margin="none"
                        id="repeat_count"
                        fullWidth
                    />
                </Grid>
            </Grid>
        </>
    );
    const settings = tabIndex == 1 && (
        <>
            <Grid direction="row" container alignContent="center" alignItems="center">
                <Grid item md={4} xs={12}>
                    <p>Appointment times</p>
                </Grid>
                <Grid item md={8} xs={12}>
                    <Select
                        id="appointment-times-select"
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
                        value={doctorSpeciality}
                        onChange={(event) => setDoctorSpeciality(event.target.value as DoctorSpeciality)}
                        variant="filled"
                        displayEmpty
                        fullWidth
                    >
                        <MenuItem value={DoctorSpeciality.GP}>General practitioner</MenuItem>
                        <MenuItem value={DoctorSpeciality.Physiotherapist}>Physiotherapist</MenuItem>
                        <MenuItem value={DoctorSpeciality.Psychologist}>Psychologist</MenuItem>
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
                        value={doctorSpeciality}
                        onChange={(event) => setDoctorSpeciality(event.target.value as DoctorSpeciality)}
                        variant="filled"
                        displayEmpty
                        fullWidth
                    >
                        <MenuItem value={DoctorSpeciality.GP}>General practitioner</MenuItem>
                        <MenuItem value={DoctorSpeciality.Physiotherapist}>Physiotherapist</MenuItem>
                        <MenuItem value={DoctorSpeciality.Psychologist}>Psychologist</MenuItem>
                    </Select>
                </Grid>
            </Grid>
            <Grid direction="row" container alignContent="center" alignItems="center">
                <Grid item md={4} xs={12}>
                    <p>Medical aids supported</p>
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
                        <MenuItem value={DoctorSpeciality.GP}>General practitioner</MenuItem>
                        <MenuItem value={DoctorSpeciality.Physiotherapist}>Physiotherapist</MenuItem>
                        <MenuItem value={DoctorSpeciality.Psychologist}>Psychologist</MenuItem>
                    </Select>
                </Grid>
            </Grid>
            <Grid direction="row" container alignContent="center" alignItems="center">
                <Grid item md={4} xs={12}>
                    <p>Office hours</p>
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
                        <MenuItem value={DoctorSpeciality.GP}>General practitioner</MenuItem>
                        <MenuItem value={DoctorSpeciality.Physiotherapist}>Physiotherapist</MenuItem>
                        <MenuItem value={DoctorSpeciality.Psychologist}>Psychologist</MenuItem>
                    </Select>
                </Grid>
            </Grid>
            <Grid direction="row" container alignContent="center" alignItems="center">
                <Grid item md={4} xs={12}>
                    <p>Account options</p>
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
                        <MenuItem value={DoctorSpeciality.GP}>General practitioner</MenuItem>
                        <MenuItem value={DoctorSpeciality.Physiotherapist}>Physiotherapist</MenuItem>
                        <MenuItem value={DoctorSpeciality.Psychologist}>Psychologist</MenuItem>
                    </Select>
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
                <Grid item xs={7}>
                    <Box className="profile-header-container">
                        <Grid container>
                            <Grid item md={2}>
                                <Avatar
                                    variant="rounded"
                                    style={{ height: '90px', width: '90px', borderRadius: '25px' }}
                                />
                            </Grid>
                            <Grid item md={7}>
                                <h1 className="name-heading">Dr A General</h1>
                                <h2 className="speciality-heading">Physiotherapist</h2>
                            </Grid>
                            <Grid item md={3} className="account-status-box">
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
                <Grid item xs={5}>
                    <Box className="data-container"></Box>
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
