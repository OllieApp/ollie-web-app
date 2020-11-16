import React from 'react';
import * as yup from 'yup';
import { Link } from '@reach/router';
import { Box, makeStyles, Typography, Button, Grid, TextField, CircularProgress } from '@material-ui/core';
import { useFormik } from 'formik';
import { observer } from 'mobx-react';
import logo from '../../logo.svg';
import { useRootStore } from '../../common/stores';

const useStyles = makeStyles({
  logo: {
    width: '92px',
    height: 'auto',
  },
});

const validationSchema = yup.object().shape<{ email: string; password: string }>({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

export const LoginPage = observer(() => {
  const { userStore } = useRootStore();

  const styles = useStyles();
  const form = useFormik({
    validationSchema,
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ email, password }) => {
      try {
        await userStore.loginWithEmail({ email, password });
      } catch (ex) {
        // eslint-disable-next-line no-alert
        alert(ex.message);
        // TODO: Report
      }
    },
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <Box width={1} height="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="primary.main">
        <Box width="480px" bgcolor="gray.bg" borderRadius={40} p={5}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Box py={3}>
              <img src={logo} alt="Ollie" className={styles.logo} />
            </Box>
            <Box textAlign="center" mb={6}>
              <Typography variant="h2">Welcome back to Ollie</Typography>
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
                  onBlur={form.handleBlur}
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
                  onBlur={form.handleBlur}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Box width="100%" mt={6}>
              <Grid container spacing={3}>
                <Grid item xs>
                  <Link to="/">
                    <Button variant="text" color="primary" fullWidth>
                      cancel
                    </Button>
                  </Link>
                </Grid>
                <Grid item xs>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={userStore.isLoadingAuth}
                    fullWidth
                  >
                    {userStore.isLoadingAuth && (
                      <Box mr={1} display="inline-flex">
                        <CircularProgress size="1em" />
                      </Box>
                    )}
                    <Box is="span">log in</Box>
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </Box>
    </form>
  );
});
