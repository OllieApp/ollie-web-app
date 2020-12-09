import React, { useCallback, useMemo } from 'react';
import * as yup from 'yup';
import { Link, RouteComponentProps } from '@reach/router';
import { Box, makeStyles, Typography, Button, Grid, TextField, CircularProgress, ButtonProps } from '@material-ui/core';
import { useFormik } from 'formik';
import { observer } from 'mobx-react';
import { withStyles } from '@material-ui/styles';
import { useSnackbar } from 'notistack';
import logo from '../../logo.svg';
import googleLogo from '../../images/google-logo.svg';
import { useRootStore } from '../../common/stores';
import { theme } from '../../common/theming/theming';

interface GoogleButtonProps extends ButtonProps {
  loading?: boolean;
}

const useStyles = makeStyles({
  logo: {
    width: '140px',
    height: 'auto',
  },
});

const validationSchema = yup.object().shape<{ email: string; password: string }>({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

export const LoginPage = observer(({ navigate }: RouteComponentProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { userStore } = useRootStore();
  const { isSignInWithEmailAndPasswordLoading, isSignInWithGoogleLoading } = userStore;
  const styles = useStyles();

  const isDisabled = useMemo(() => isSignInWithEmailAndPasswordLoading || isSignInWithGoogleLoading, [
    isSignInWithEmailAndPasswordLoading,
    isSignInWithGoogleLoading,
  ]);

  const form = useFormik({
    validationSchema,
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ email, password }) => {
      try {
        await userStore.signInWithEmailAndPassword({ email, password }).then(() => {
          if (navigate) navigate('/calendar');
        });
      } catch (ex) {
        if (ex.message) enqueueSnackbar(ex.message);
        // TODO: Report
      }
    },
  });

  const handleGoogleAuth = useCallback(
    () =>
      userStore
        .signInWithGoogle()
        .then(({ userExists }) => {
          if (!navigate) throw new Error('Missing "navigate"');

          if (userExists) {
            navigate('/calendar');
          } else {
            navigate('/signup');
          }
        })
        .catch((ex) => {
          if (ex.message) enqueueSnackbar(ex.message);
          // TODO: Report
        }),
    [userStore, navigate],
  );

  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <Box width={1} height="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="primary.main">
        <Box width="480px" bgcolor="gray.bg" borderRadius={40} p={5}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Box py={3}>
              <img src={logo} alt="Ollie" className={styles.logo} />
            </Box>
            <Box textAlign="center" mb={6}>
              <Typography variant="h1">welcome to ollie</Typography>
              <Typography variant="h3">more appointments</Typography>
            </Box>
            <Grid spacing={3} container>
              <Grid item xs>
                <TextField
                  name="email"
                  variant="filled"
                  type="email"
                  placeholder="name@example.com"
                  error={!!(form.touched.email && form.errors.email)}
                  helperText={form.touched.email ? form.errors.email : ''}
                  onChange={form.handleChange}
                  disabled={isDisabled}
                  autoFocus
                  fullWidth
                />
              </Grid>
              <Grid item xs>
                <TextField
                  name="password"
                  variant="filled"
                  type="password"
                  placeholder="Password"
                  error={!!(form.touched.password && form.errors.password)}
                  helperText={form.touched.password ? form.errors.password : ''}
                  onChange={form.handleChange}
                  disabled={isDisabled}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Box width="100%" mt={4}>
              <Button type="submit" variant="contained" size="large" color="primary" disabled={isDisabled} fullWidth>
                {userStore.isSignInWithEmailAndPasswordLoading && (
                  <Box mr={1} display="inline-flex">
                    <CircularProgress size="1em" />
                  </Box>
                )}
                <Box is="span">log in</Box>
              </Button>
            </Box>

            <Box position="relative" textAlign="center" py={3} width="100%">
              <Box width="100%" height="1px" bgcolor="grey.300" position="absolute" left={0} right={0} top="50%" />
              <Box
                position="relative"
                display="inline-block"
                fontWeight="bold"
                color="grey.400"
                bgcolor="gray.bg"
                fontSize={18}
                px={2}
              >
                OR
              </Box>
            </Box>

            <Box width="100%">
              <GoogleButton
                size="large"
                loading={userStore.isSignInWithGoogleLoading}
                disabled={isDisabled}
                onClick={handleGoogleAuth}
              />
            </Box>

            <Box width="100%" textAlign="center" fontWeight="bold" fontSize={14} mt={4}>
              <Link to="/signup" style={{ color: 'inherit' }}>
                You don't have a Ollie account? Create one now.
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </form>
  );
});

const GoogleButton = withStyles({
  root: {
    backgroundColor: 'white',
    color: theme.palette.primary.main,
    '&': {
      boxShadow: 'none !important',
    },
  },
})(({ loading, disabled, ...props }: GoogleButtonProps) => (
  <Button {...props} type="button" variant="contained" disabled={loading || disabled} fullWidth>
    {loading ? (
      <Box mr={1} display="inline-flex">
        <CircularProgress size="1em" />
      </Box>
    ) : (
      <Box mr={1} display="inline-flex">
        <img src={googleLogo} alt="Google" width="auto" height={28} />
      </Box>
    )}
    <Box is="span">connect with Google</Box>
  </Button>
));
