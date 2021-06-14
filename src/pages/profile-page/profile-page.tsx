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
  Tooltip,
  CircularProgress,
} from '@material-ui/core';
import { useSnackbar } from 'notistack';
import { ChevronDown, MapPin, Edit, HelpCircle } from 'react-feather';
import { KeyboardTimePicker, KeyboardTimePickerProps } from '@material-ui/pickers';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { useTheme } from '@material-ui/core/styles';
import { observer } from 'mobx-react';
import { mapStyles } from '../../common/theming/map-styles';
import { AvatarUpload } from './components/avatar-upload';
import './profile-page.scss';
import { MedicalAid, WeekDay, PractitionerSchedule } from '../../types';
import { DoctorCategories, MedicalAids } from '../../constants';
import { useRootStore } from '../../common/stores';
import HelpIcon from '@material-ui/icons/Help';
import DeleteIcon from '@material-ui/icons/Delete';
import { UpdatePractitionerRequest } from 'common/requests/update-practitioner.request';
import { Alert } from '@material-ui/lab';
import { DateTime } from 'luxon';

interface FlattenedSchedule {
  dayOfWeek: WeekDay;
  startTime: DateTime;
  endTime: DateTime;
}

const defaultLocation = { lat: -28.4792625, lng: 24.6727135 };
const timezone = 'Africa/Johannesburg';

const validationSchema = yup.object().shape({
  email: yup.string().email().required(),
  title: yup.string().required('title is a required field'),
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
  schedules: yup.array(yup.object<FlattenedSchedule>()),
  phone: yup.string().nullable(),
  line1: yup.string().optional(),
});

function mapSchedules(schedules: PractitionerSchedule[]): FlattenedSchedule[] {
  const fSchedules = new Array<FlattenedSchedule>();
  schedules.forEach((schedule) => {
    schedule.daysOfWeek.forEach((d) => {
      fSchedules.push({
        dayOfWeek: d,
        startTime: mapTimeStringToDate(schedule.startTime),
        endTime: mapTimeStringToDate(schedule.endTime),
      });
    });
  });
  return fSchedules;
}

function mapTimeStringToDate(time: String): DateTime {
  const splitTime = time.split(':');
  const hour = parseInt(splitTime[0]);
  const minute = parseInt(splitTime[1]);

  return DateTime.utc()
    .set({
      hour: hour,
      minute: minute,
    })
    .setZone(timezone);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ProfilePage = observer((props: RouteComponentProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { userStore } = useRootStore();
  const { practitionerInfo } = userStore;

  const form = useFormik({
    initialValues: {
      email: practitionerInfo?.email ?? '',
      title: practitionerInfo?.title ?? '',
      location: practitionerInfo?.address?.location,
      appointmentTimeSlot: practitionerInfo?.appointmentTimeSlot || 30,
      medicalAids: practitionerInfo?.medicalAids || [],
      bio: practitionerInfo?.bio || '',
      avatarUrl: practitionerInfo?.avatarUrl || '',
      phone: practitionerInfo?.phone,
      schedules: mapSchedules(practitionerInfo?.schedules ?? []).sort((a, b) => a.dayOfWeek - b.dayOfWeek),
      line1: practitionerInfo?.address?.line1 ?? '',
      line2: practitionerInfo?.address?.line2 ?? '',
      suburb: practitionerInfo?.address?.suburb ?? '',
      stateProvinceCounty: practitionerInfo?.address?.stateProvinceCounty ?? '',
      city: practitionerInfo?.address?.city ?? '',
      postalCode: practitionerInfo?.address?.postalCode ?? '',
      //TODO: Update later when we support multiple countries
      country: 'South Africa',
    },
    validationSchema,
    onSubmit: async (data) => {
      submitUpdatedData();
    },
  });

  const submitUpdatedData = async () => {
    try {
      const {
        title,
        email,
        phone,
        bio,
        location,
        line1,
        line2,
        suburb,
        city,
        postalCode,
        stateProvinceCounty,
        schedules,
      } = form.values;
      const request: UpdatePractitionerRequest = {};
      request.address = {};

      if (title.trim() !== practitionerInfo?.title) {
        request.title = title.trim();
      }

      if (email.trim() !== practitionerInfo?.email) {
        request.email = email.trim();
      }

      if (phone?.trim() !== practitionerInfo?.phone) {
        request.phone = phone?.trim();
      }

      if (bio.trim() !== practitionerInfo?.bio) {
        request.bio = bio.trim();
      }

      if (
        location?.latitude !== practitionerInfo?.address?.location?.latitude ||
        location?.longitude !== practitionerInfo?.address?.location?.longitude
      ) {
        request.address.location = {
          latitude: location?.latitude ?? 0,
          longitude: location?.longitude ?? 0,
        };
      }

      if (line1.trim() !== practitionerInfo?.address?.line1) {
        request.address.line1 = line1.trim();
      }

      if (line2.trim() !== practitionerInfo?.address?.line2) {
        request.address.line2 = line2.trim();
      }

      if (suburb.trim() !== practitionerInfo?.address?.suburb) {
        request.address.suburb = suburb.trim();
      }

      if (city.trim() !== practitionerInfo?.address?.city) {
        request.address.city = city.trim();
      }

      if (postalCode.trim() !== practitionerInfo?.address?.postalCode) {
        request.address.postalCode = postalCode.trim();
      }

      if (stateProvinceCounty.trim() !== practitionerInfo?.address?.stateProvinceCounty) {
        request.address.stateProvinceCounty = stateProvinceCounty.trim();
      }

      if (!schedules.some((s) => !validateSchedule(s, form.values.appointmentTimeSlot).isValid)) {
        request.schedules = [
          ...schedules.map((s) => ({
            daysOfWeek: [s.dayOfWeek],
            startTime: s.startTime.toUTC().toISO(),
            endTime: s.endTime.toUTC().toISO(),
          })),
        ];
      }

      form.setSubmitting(true);
      await userStore.updatePractitionerProfile(request);
      enqueueSnackbar('Changes successfully saved', { variant: 'success' });
      form.setSubmitting(false);
    } catch (ex) {
      form.setSubmitting(false);
      if (ex.message) enqueueSnackbar(ex.message);
    }
  };

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
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const { isLoaded: isMapLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
  });

  const pinMapOptions: google.maps.MapOptions = {
    styles: mapStyles,
    disableDefaultUI: true,
    fullscreenControl: false,
    zoomControl: true,
    zoom: 17,
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

  const avatarView = form.values.avatarUrl ? (
    <img
      src={practitionerInfo?.avatarUrl ?? undefined}
      style={{ height: '90px', width: '90px', borderRadius: '25px' }}
      alt={practitionerInfo?.title}
    />
  ) : (
    <Avatar variant="rounded" style={{ height: '90px', width: '90px', borderRadius: '25px' }} />
  );

  const doctorInfoView = tabIndex === 0 && (
    <Grid direction="column" spacing={1} container>
      <Accordion elevation={0}>
        <AccordionSummary expandIcon={<ChevronDown />} aria-controls="panel2a-content" id="panel2a-header">
          <Typography component="h5" variant="h5">
            General
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid direction="column" spacing={1} container>
            <Box height="10px" />
            <Grid item container alignContent="flex-start" direction="column" alignItems="flex-start">
              <Box paddingLeft="12px">
                <Typography component="h6" variant="h6">
                  Title{' '}
                  <span>
                    <Tooltip
                      title="The title of the listing as it will be shown on the app"
                      aria-label="title-help"
                      placement="right"
                      arrow
                    >
                      <HelpIcon fontSize="small" style={{ color: 'grey' }} />
                    </Tooltip>
                  </span>
                </Typography>
              </Box>
              <Box height="5px" />
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
              <Box height="10px" />
            </Grid>
            <Grid item container alignContent="flex-start" direction="column" alignItems="flex-start">
              <Box paddingLeft="12px">
                <Typography component="h6" variant="h6">
                  Email{' '}
                  <span>
                    <Tooltip
                      title="The email used for receiving notifications about newly created appointments"
                      aria-label="email-help"
                      placement="right"
                      arrow
                    >
                      <HelpIcon fontSize="small" style={{ color: 'grey' }} />
                    </Tooltip>
                  </span>
                </Typography>
              </Box>
              <Box height="5px" />
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
              <Box height="10px" />
            </Grid>
            <Grid item container alignContent="flex-start" direction="column" alignItems="flex-start">
              <Box paddingLeft="12px">
                <Typography component="h6" variant="h6">
                  Phone{' '}
                  <span>
                    <Tooltip
                      title="The phone number used for patient communication"
                      aria-label="phone-help"
                      placement="right"
                      arrow
                    >
                      <HelpIcon fontSize="small" style={{ color: 'grey' }} />
                    </Tooltip>
                  </span>
                </Typography>
              </Box>
              <Box height="5px" />
              <TextField
                name="phone"
                value={form.values.phone}
                onChange={handleChange}
                onBlur={form.handleBlur}
                variant="filled"
                margin="none"
                fullWidth
                inputMode="tel"
                placeholder="+27123423453"
              />
              <Box height="10px" />
            </Grid>
            <Grid item container alignContent="flex-start" direction="column" alignItems="flex-start">
              <Box paddingLeft="12px">
                <Typography component="h6" variant="h6">
                  Bio{' '}
                  <span>
                    <Tooltip
                      title="The description used to present the practitioner to the potential patients"
                      aria-label="bio-help"
                      placement="right"
                      arrow
                    >
                      <HelpIcon fontSize="small" style={{ color: 'grey' }} />
                    </Tooltip>
                  </span>
                </Typography>
              </Box>
              <Box height="5px" />
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
              <Box height="10px" />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      <Box height="10px" />
      <Accordion elevation={0}>
        <AccordionSummary expandIcon={<ChevronDown />} aria-controls="address-content" id="address-header">
          <Typography component="h5" variant="h5">
            Address
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid direction="column" spacing={1} container>
            <Box height="10px" />
            <Grid item container alignContent="flex-start" direction="column" alignItems="flex-start">
              <Box paddingLeft="12px">
                <Typography component="h6" variant="h6">
                  Line 1{' '}
                  <span>
                    <Tooltip
                      title="The street address where the practitioner is located"
                      aria-label="address-line1-help"
                      placement="right"
                      arrow
                    >
                      <HelpIcon fontSize="small" style={{ color: 'grey' }} />
                    </Tooltip>
                  </span>
                </Typography>
              </Box>
              <Box height="5px" />
              <TextField
                name="line1"
                value={form.values.line1}
                onChange={handleChange}
                onBlur={form.handleBlur}
                variant="filled"
                margin="none"
                id="line1-input"
                fullWidth
                placeholder="e.g. 321 Main Street"
              />
              <Box height="10px" />
            </Grid>
            <Grid item container alignContent="flex-start" direction="column" alignItems="flex-start">
              <Box paddingLeft="12px">
                <Typography component="h6" variant="h6">
                  Line 2{' '}
                  <span>
                    <Tooltip
                      title="The apartment, suite or space number (or any other designation not literally part of the physical address)"
                      aria-label="address-line2-help"
                      placement="right"
                      arrow
                    >
                      <HelpIcon fontSize="small" style={{ color: 'grey' }} />
                    </Tooltip>
                  </span>
                </Typography>
              </Box>
              <Box height="5px" />
              <TextField
                name="line2"
                value={form.values.line2}
                onChange={handleChange}
                onBlur={form.handleBlur}
                variant="filled"
                margin="none"
                id="line2-input"
                fullWidth
                placeholder="e.g. Minessori Health Center 2nd floor"
              />
              <Box height="10px" />
            </Grid>
            <Grid item container alignContent="flex-start" direction="column" alignItems="flex-start">
              <Box paddingLeft="12px">
                <Typography component="h6" variant="h6">
                  Suburb{' '}
                  <span>
                    <Tooltip
                      title="The suburb where the practitioner is located"
                      aria-label="address-suburb-help"
                      placement="right"
                      arrow
                    >
                      <HelpIcon fontSize="small" style={{ color: 'grey' }} />
                    </Tooltip>
                  </span>
                </Typography>
              </Box>
              <Box height="5px" />
              <TextField
                name="suburb"
                value={form.values.suburb}
                onChange={handleChange}
                onBlur={form.handleBlur}
                variant="filled"
                margin="none"
                id="suburb-input"
                fullWidth
                placeholder="e.g. Sea Point"
              />
              <Box height="10px" />
            </Grid>
            <Grid item container alignContent="flex-start" direction="column" alignItems="flex-start">
              <Box paddingLeft="12px">
                <Typography component="h6" variant="h6">
                  City{' '}
                  <span>
                    <Tooltip
                      title="The city where the practitioner is located"
                      aria-label="address-city-help"
                      placement="right"
                      arrow
                    >
                      <HelpIcon fontSize="small" style={{ color: 'grey' }} />
                    </Tooltip>
                  </span>
                </Typography>
              </Box>
              <Box height="5px" />
              <TextField
                name="city"
                value={form.values.city}
                onChange={handleChange}
                onBlur={form.handleBlur}
                variant="filled"
                margin="none"
                id="city-input"
                fullWidth
                placeholder="e.g. Cape Town"
              />
              <Box height="10px" />
            </Grid>
            <Grid item container alignContent="flex-start" direction="column" alignItems="flex-start">
              <Box paddingLeft="12px">
                <Typography component="h6" variant="h6">
                  Postal code{' '}
                  <span>
                    <Tooltip
                      title="The postal code where the practitioner is located"
                      aria-label="address-postal-code-help"
                      placement="right"
                      arrow
                    >
                      <HelpIcon fontSize="small" style={{ color: 'grey' }} />
                    </Tooltip>
                  </span>
                </Typography>
              </Box>
              <Box height="5px" />
              <TextField
                name="postal-code"
                value={form.values.postalCode}
                onChange={handleChange}
                onBlur={form.handleBlur}
                variant="filled"
                margin="none"
                id="postal-code-input"
                fullWidth
                placeholder="e.g. 2645"
              />
              <Box height="10px" />
            </Grid>
            <Grid item container alignContent="flex-start" direction="column" alignItems="flex-start">
              <Box paddingLeft="12px">
                <Typography component="h6" variant="h6">
                  State / Province / County{' '}
                  <span>
                    <Tooltip
                      title="The state, province or county where the city is located"
                      aria-label="address-spc-help"
                      placement="right"
                      arrow
                    >
                      <HelpIcon fontSize="small" style={{ color: 'grey' }} />
                    </Tooltip>
                  </span>
                </Typography>
              </Box>
              <Box height="5px" />
              <TextField
                name="spc"
                value={form.values.stateProvinceCounty}
                onChange={handleChange}
                onBlur={form.handleBlur}
                variant="filled"
                margin="none"
                id="spc-input"
                fullWidth
                placeholder="e.g. Western Cape"
              />
              <Box height="10px" />
            </Grid>
            <Grid item container alignContent="flex-start" direction="column" alignItems="flex-start">
              <Box paddingLeft="12px">
                <Typography component="h6" variant="h6">
                  Country{' '}
                  <span>
                    <Tooltip
                      title="The country where the practitioner is located"
                      aria-label="address-spc-help"
                      placement="right"
                      arrow
                    >
                      <HelpIcon fontSize="small" style={{ color: 'grey' }} />
                    </Tooltip>
                  </span>
                </Typography>
              </Box>
              <Box height="5px" />
              <TextField
                name="spc"
                value={form.values.country}
                disabled
                onChange={handleChange}
                onBlur={form.handleBlur}
                variant="filled"
                margin="none"
                id="spc-input"
                fullWidth
                placeholder="e.g. South Africa"
              />
              <Box height="10px" />
            </Grid>
            <Grid item container alignContent="flex-start" direction="column" alignItems="flex-start">
              <Box paddingLeft="12px">
                <Typography component="h6" variant="h6">
                  Pin location{' '}
                  <span>
                    <Tooltip
                      title="The location of the practitioner on the map"
                      aria-label="address-spc-help"
                      placement="right"
                      arrow
                    >
                      <HelpIcon fontSize="small" style={{ color: 'grey' }} />
                    </Tooltip>
                  </span>
                </Typography>
              </Box>
              <Box height="5px" />
            </Grid>
            <Grid item md={12} xs style={{ position: 'relative' }}>
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
        </AccordionDetails>
      </Accordion>
      <Accordion elevation={0}>
        <AccordionSummary expandIcon={<ChevronDown />} aria-controls="address-content" id="address-header">
          <Typography component="h5" variant="h5">
            Schedule
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid direction="column" spacing={1} container>
            <Alert severity="warning">
              Modifying the schedules in this list will affect all your future appointments (but not appointments
              already confirmed)!
            </Alert>
            <Box height="10px" />
            <Typography component="p" variant="body1">
              Timezone: South Africa Standard Time (GMT+2)
            </Typography>
            <Box height="20px" />
            {form.values.schedules?.map((s, i) => (
              <ScheduleItem
                id={i.toString()}
                schedule={s}
                timeSlotSize={form.values.appointmentTimeSlot}
                onChange={(newSchedule) =>
                  form.setFieldValue(
                    'schedules',
                    form.values.schedules.map((oldSchedule, index) => {
                      if (i === index) {
                        return newSchedule;
                      }
                      return oldSchedule;
                    }),
                  )
                }
                onRemove={() =>
                  form.setFieldValue(
                    'schedules',
                    form.values.schedules.filter((_, index) => index !== i),
                  )
                }
              />
            ))}
            <Box height="20px" />
            <Grid item>
              <Button
                color="primary"
                variant="outlined"
                disableElevation
                onClick={() =>
                  form.setFieldValue('schedules', [
                    ...form.values.schedules,
                    {
                      dayOfWeek: 1,
                      startTime: DateTime.now().setZone(timezone).set({ hour: 9, minute: 0 }),
                      endTime: DateTime.now().setZone(timezone).set({ hour: 17, minute: 0 }),
                    },
                  ])
                }
              >
                Add new schedule
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      <Box height="30px" />
      <Grid item>
        <Button color="primary" variant="contained" disableElevation onClick={() => submitUpdatedData()}>
          {form.isSubmitting && (
            <CircularProgress
              style={{
                color: 'white',
                width: '20px',
                height: '20px',
              }}
            />
          )}{' '}
          Save changes
        </Button>
        <Box width="10px" display="inline-flex" />
        <Button
          color="default"
          variant="text"
          disableElevation
          onClick={() => {
            form.setValues({
              email: practitionerInfo?.email ?? '',
              title: practitionerInfo?.title ?? '',
              location: practitionerInfo?.address?.location,
              appointmentTimeSlot: practitionerInfo?.appointmentTimeSlot || 15,
              medicalAids: practitionerInfo?.medicalAids || [],
              bio: practitionerInfo?.bio || '',
              avatarUrl: practitionerInfo?.avatarUrl || '',
              phone: practitionerInfo?.phone,
              schedules: [],
              line1: practitionerInfo?.address?.line1 ?? '',
              line2: practitionerInfo?.address?.line2 ?? '',
              suburb: practitionerInfo?.address?.suburb ?? '',
              stateProvinceCounty: practitionerInfo?.address?.stateProvinceCounty ?? '',
              city: practitionerInfo?.address?.city ?? '',
              postalCode: practitionerInfo?.address?.postalCode ?? '',
              //TODO: Update later when we support multiple countries
              country: 'South Africa',
            });
          }}
        >
          Discard changes
        </Button>
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
          <p>We are here to help you.</p>
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
      <Grid container>
        <Grid item md={1}></Grid>
        <Grid item lg={9} md={10} xs={12}>
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
                  <Typography variant="h5">{DoctorCategories[practitionerInfo?.category ?? 0]}</Typography>
                </Box>
              </Grid>
              <Grid item lg={3} sm={12} className="account-status-box">
                <Box textAlign="center">{`Your Listing is${practitionerInfo?.isActive ? '' : ' not'}  active`}</Box>
              </Grid>
            </Grid>
            <Box height="30px" />
            <StyledTabs value={tabIndex} onChange={(_, newValue) => setTabIndex(newValue)} textColor="primary">
              <StyledTab label="Listing details" />
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

function validateSchedule(
  schedule: FlattenedSchedule,
  timeSlotSize: number,
): { isValid: boolean; errorMessage?: string } {
  const { startTime, endTime } = schedule;
  if (endTime.diff(startTime, 'minutes').minutes < timeSlotSize) {
    return {
      isValid: false,
      errorMessage: `The end time of this schedule has to be at least ${timeSlotSize} minutes after its start time.`,
    };
  }

  return {
    isValid: true,
  };
}
const ScheduleItem = function (props: {
  id: string;
  schedule: FlattenedSchedule;
  onChange: (newSchedule: FlattenedSchedule) => void;
  onRemove: () => void;
  timeSlotSize: number;
}) {
  const { schedule, onChange, onRemove, id, timeSlotSize } = props;
  const { dayOfWeek, startTime, endTime } = schedule;
  const validationResponse = validateSchedule(schedule, timeSlotSize);

  return (
    <Grid container item spacing={2} direction="column">
      <Grid container item spacing={3} alignItems="center">
        <Grid item xs={3} md={3}>
          <Select
            id="appointment-slot-select"
            name="appointmentTimeSlot"
            disableUnderline
            value={dayOfWeek}
            onChange={(event) => onChange({ ...schedule, dayOfWeek: event.target.value as number })}
            fullWidth
            variant="filled"
          >
            <MenuItem value={1}>Monday</MenuItem>
            <MenuItem value={2}>Tuesday</MenuItem>
            <MenuItem value={3}>Wednesday</MenuItem>
            <MenuItem value={4}>Thursday</MenuItem>
            <MenuItem value={5}>Friday</MenuItem>
            <MenuItem value={6}>Saturday</MenuItem>
            <MenuItem value={7}>Sunday</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={false} md={1}></Grid>
        <Grid item xs={3} md={3}>
          <StyledTimePicker
            margin="dense"
            id={`start-time-picker-${id}`}
            label="Start time"
            value={startTime}
            onChange={(date) => onChange({ ...schedule, startTime: date ?? startTime })}
            KeyboardButtonProps={{
              'aria-label': 'start time',
            }}
            format="HH:mm"
            inputVariant="filled"
            variant="inline"
          />
        </Grid>
        <Grid item xs={false} md={1}></Grid>
        <Grid item xs={3} md={3}>
          <StyledTimePicker
            margin="dense"
            id={`end-time-picker-${id}`}
            label="End time"
            value={endTime}
            onChange={(date) => onChange({ ...schedule, endTime: date ?? endTime })}
            KeyboardButtonProps={{
              'aria-label': 'end time',
            }}
            format="HH:mm"
            inputVariant="filled"
            variant="inline"
            //maxDateMessage
          />
        </Grid>
        <Grid item xs={1} md={1}>
          <IconButton aria-label="delete" onClick={() => onRemove()}>
            <DeleteIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Grid item container alignContent="flex-end">
        {!validationResponse.isValid && <ErrorText variant="body2">{validationResponse.errorMessage}</ErrorText>}
      </Grid>
    </Grid>
  );
};
const StyledTimePicker = withStyles({
  root: {
    borderRadius: 15,
  },
})(KeyboardTimePicker);

const ErrorText = withStyles({
  root: {
    color: 'red',
    textAlign: 'end',
  },
})(Typography);
