import React, { useState, useCallback, useMemo } from 'react';
import * as yup from 'yup';
import { useFormik } from 'formik';
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
  debounce,
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
import { DoctorCategory, DoctorAvailability, MedicalAid, WeekDay, PractitionerSchedule } from '../../types';
import { DoctorCategories, MedicalAids } from '../../constants';
import { useRootStore } from '../../common/stores';

interface OfficeHours {
  weekdayStart: Date;
  weekdayEnd: Date;
  saturdayStart?: Date;
  saturdayEnd?: Date;
  sundayStart?: Date;
  sundayEnd?: Date;
}

const defaultLocation = { lat: -28.4792625, lng: 24.6727135 };

const availableOfficeHours: OfficeHours = {
  weekdayStart: moment(new Date()).set({ hour: 8, minute: 0 }).toDate(),
  weekdayEnd: moment(new Date()).set({ hour: 17, minute: 0 }).toDate(),
  saturdayStart: moment(new Date()).set({ hour: 8, minute: 0 }).toDate(),
  saturdayEnd: moment(new Date()).set({ hour: 17, minute: 0 }).toDate(),
  sundayStart: moment(new Date()).set({ hour: 8, minute: 0 }).toDate(),
  sundayEnd: moment(new Date()).set({ hour: 17, minute: 0 }).toDate(),
};

const defaultOfficeHours: OfficeHours = {
  weekdayStart: availableOfficeHours.weekdayStart,
  weekdayEnd: availableOfficeHours.weekdayEnd,
};

const validationSchema = yup.object().shape({
  email: yup.string().email().required(),
  title: yup.string().required('title is a required field'),
  category: yup.number().required(),
  appointmentTimeSlot: yup.number(),
  address: yup.string().nullable(),
  bio: yup.string().nullable(),
  avatarUrl: yup.string().nullable(),
  location: yup
    .object({
      latitude: yup.number(),
      longitude: yup.number(),
    })
    .nullable(),
  schedules: yup.array(yup.object<PractitionerSchedule>()),
  phone: yup.string().nullable(),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ProfilePage = observer((props: RouteComponentProps) => {
  const { userStore } = useRootStore();
  const { practitionerInfo } = userStore;

  const form = useFormik({
    initialValues: {
      email: practitionerInfo?.email,
      title: practitionerInfo?.title,
      location: practitionerInfo?.location,
      category: practitionerInfo?.category || DoctorCategory.Unknown,
      appointmentTimeSlot: practitionerInfo?.appointmentTimeSlot || 15,
      medicalAids: practitionerInfo?.medicalAids || [],
      address: practitionerInfo?.address || '',
      bio: practitionerInfo?.bio || '',
      avatarUrl: practitionerInfo?.avatarUrl || '',
      phone: practitionerInfo?.phone || '',
      schedules: [],
    },
    validationSchema,
    onSubmit: async (data) => {
      try {
        form.setSubmitting(true);
        await userStore.updatePractitionerProfile(data);
        form.setSubmitting(false);
      } catch (ex) {
        form.setSubmitting(false);
        // eslint-disable-next-line no-alert
        alert(ex.message);
        // TODO: Report
      }
    },
  });

  const { latitude, longitude } = useMemo(
    () =>
      form.values.location ?? {
        latitude: defaultLocation.lat,
        longitude: defaultLocation.lng,
      },
    [form.values.location],
  );

  const center = useMemo(
    () => ({
      lat: latitude,
      lng: longitude,
    }),
    [latitude, longitude],
  );

  const [tabIndex, setTabIndex] = useState(0);
  const theme = useTheme();
  const [doctorAvailability, setDoctorAvailability] = useState<DoctorAvailability>(DoctorAvailability.Weekdays);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [officeHours, setOfficeHours] = useState<OfficeHours>(defaultOfficeHours);

  const { isLoaded: isMapLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
  });

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

  const toggleAvatarModal = useCallback(() => {
    setIsAvatarModalOpen(!isAvatarModalOpen);
  }, [isAvatarModalOpen]);

  const submit = useMemo(() => debounce(form.submitForm, 2000), [form.submitForm]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<unknown>) => {
      form.handleChange(e);
      submit();
    },
    [form, submit],
  );

  const handleAvatarSave = useCallback(
    async (image: File) => {
      await userStore.uploadAvatar(image);
      setIsAvatarModalOpen(false);
    },
    [userStore],
  );

  const handleCenterChange = useCallback(() => {
    const geo = pinMapRef?.state.map?.getCenter().toJSON();
    if (geo?.lat && geo?.lng && (geo?.lat !== latitude || geo?.lng !== longitude)) {
      form.setFieldValue('location', {
        latitude: geo?.lat,
        longitude: geo?.lng,
      });

      submit();
    }
  }, [form, pinMapRef, submit, latitude, longitude]);

  const handleMedicalAidChange = useCallback(
    (medicalAid: MedicalAid, checked: boolean) => {
      const current = (form.values.medicalAids || []).map(Number);
      const newValue = checked ? [...current, Number(medicalAid)] : current.filter((x) => x !== medicalAid);

      form.setFieldValue('medicalAids', newValue);
      submit();
    },
    [form, submit],
  );

  const handleOfficeHoursChange = useCallback(
    (hours: OfficeHours) => {
      setOfficeHours(hours);

      const schedules = [
        {
          daysOfWeek: [WeekDay.Monday, WeekDay.Tuesday, WeekDay.Wednesday, WeekDay.Thursday, WeekDay.Friday],
          startTime: moment.utc(hours.weekdayStart).format('HH:mm'),
          endTime: moment.utc(hours.weekdayEnd).format('HH:mm'),
        } as PractitionerSchedule,
        !!(hours.saturdayStart && hours.saturdayEnd) &&
          ({
            daysOfWeek: [WeekDay.Saturday],
            startTime: moment.utc(hours.saturdayStart).format('HH:mm'),
            endTime: moment.utc(hours.saturdayEnd).format('HH:mm'),
          } as PractitionerSchedule),
        !!(hours.sundayStart && hours.sundayEnd) &&
          ({
            daysOfWeek: [WeekDay.Sunday],
            startTime: moment.utc(hours.sundayStart).format('HH:mm'),
            endTime: moment.utc(hours.sundayEnd).format('HH:mm'),
          } as PractitionerSchedule),
      ].filter(Boolean);

      form.setFieldValue('schedules', schedules);

      submit();
    },
    [setOfficeHours, form, submit],
  );

  const handleAvailabilityChange = useCallback(
    (availability: DoctorAvailability) => {
      setDoctorAvailability(availability);

      let newOfficeHours: OfficeHours;

      switch (availability) {
        case DoctorAvailability.Weekdays:
          newOfficeHours = ['weekdayStart', 'weekdayEnd'].reduce(
            (memo, key) => ({
              ...memo,
              [key]: availableOfficeHours[key as keyof OfficeHours],
            }),
            {},
          ) as OfficeHours;
          break;

        case DoctorAvailability.WeekdaysAndSat:
          newOfficeHours = ['weekdayStart', 'weekdayEnd', 'saturdayStart', 'saturdayEnd'].reduce(
            (memo, key) => ({
              ...memo,
              [key]: availableOfficeHours[key as keyof OfficeHours],
            }),
            {},
          ) as OfficeHours;
          break;
        default:
          newOfficeHours = { ...availableOfficeHours };
          break;
      }

      handleOfficeHoursChange(newOfficeHours);
    },
    [setDoctorAvailability, handleOfficeHoursChange],
  );

  const avatarView = form.values.avatarUrl ? (
    <img
      src={form.values.avatarUrl}
      style={{ height: '90px', width: '90px', borderRadius: '25px' }}
      alt={practitionerInfo?.title}
    />
  ) : (
    <Avatar variant="rounded" style={{ height: '90px', width: '90px', borderRadius: '25px' }} />
  );

  const doctorInfoView = tabIndex === 0 && (
    <Grid direction="column" spacing={1} container>
      <Grid item container alignContent="center" alignItems="center">
        <Grid item md={4} xs>
          <p>Title</p>
        </Grid>
        <Grid item md={8} xs>
          <TextField
            name="title"
            value={form.values.title}
            onChange={handleChange}
            onBlur={form.handleBlur}
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
            disableUnderline
            name="category"
            value={form.values.category}
            onChange={handleChange}
            onBlur={form.handleBlur}
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
            name="email"
            value={form.values.email}
            onChange={handleChange}
            onBlur={form.handleBlur}
            variant="filled"
            margin="none"
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
            name="phone"
            value={form.values.phone}
            onChange={handleChange}
            onBlur={form.handleBlur}
            variant="filled"
            margin="none"
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
            name="bio"
            value={form.values.bio}
            onChange={handleChange}
            onBlur={form.handleBlur}
            variant="filled"
            margin="none"
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
            name="address"
            value={form.values.address}
            onChange={handleChange}
            onBlur={form.handleBlur}
            variant="filled"
            margin="none"
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
          {isMapLoaded && (
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
            name="appointmentTimeSlot"
            disableUnderline
            value={form.values.appointmentTimeSlot}
            onChange={handleChange}
            onBlur={form.handleBlur}
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
            onChange={(event) => handleAvailabilityChange(event.target.value as DoctorAvailability)}
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
                {((Object.entries(MedicalAids) as unknown) as [MedicalAid, string][]).map(([key, name]) => (
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
                        name="medicalAids"
                        value={Number(key)}
                        checked={form.values.medicalAids?.includes(Number(key))}
                        onChange={(e) => handleMedicalAidChange(key, e.target.checked)}
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
                          handleOfficeHoursChange({
                            ...officeHours,
                            weekdayStart: date?.toDate() ?? availableOfficeHours.weekdayStart,
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
                          handleOfficeHoursChange({
                            ...officeHours,
                            weekdayEnd: date?.toDate() ?? availableOfficeHours.weekdayEnd,
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
                            handleOfficeHoursChange({
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
                            handleOfficeHoursChange({
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
                            handleOfficeHoursChange({
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
                            handleOfficeHoursChange({
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit
            leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion elevation={0}>
        <AccordionSummary expandIcon={<ChevronDown />} aria-controls="panel2a-content" id="panel2a-header">
          <Typography>How do I cancel an appointment?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit
            leo lobortis eget.
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
                  <Typography variant="h5">{practitionerInfo && DoctorCategories[form.values.category]}</Typography>
                </Box>
              </Grid>
              <Grid item lg={3} sm={12} className="account-status-box">
                <Box textAlign="center">
                  {practitionerInfo?.isActive ? 'Account is active' : 'Account is not active'}
                </Box>
              </Grid>
            </Grid>
            <Box height="30px" />
            <StyledTabs value={tabIndex} onChange={(_, newValue) => setTabIndex(newValue)} textColor="primary">
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
                  {isMapLoaded && (
                    <GoogleMap
                      mapContainerClassName="listing-preview-map-container"
                      zoom={10}
                      center={center}
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
              {/* TODO: Get values from practitionerInfo */}
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
          <Box px={4} pt={4} pb={2} width="100%" maxWidth="640px" bgcolor="background.paper" borderRadius={30}>
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
