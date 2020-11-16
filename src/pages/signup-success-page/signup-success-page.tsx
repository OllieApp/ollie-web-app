import React from 'react';
import { Link, RouteComponentProps, useParams } from '@reach/router';
import { Box, makeStyles, Typography, Button, Grid } from '@material-ui/core';
import logo from '../../logo.svg';
import { Emoji } from '../../components/emoji/emoji';

const useStyles = makeStyles({
  logo: {
    width: '92px',
    height: 'auto',
  },
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SignUpSuccessPage(props: RouteComponentProps) {
  const { name } = useParams();
  const styles = useStyles();

  return (
    <Box width={1} height="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="primary.main">
      <Box width="480px" bgcolor="gray.bg" borderRadius={40} p={5}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box py={3}>
            <img src={logo} alt="Ollie" className={styles.logo} />
          </Box>
          <Box textAlign="center" mb={6}>
            <Typography variant="h2">
              Welcome to the Ollie family Dr {name}! <Emoji symbol="🎉" />
            </Typography>
            <Box mt={2}>
              <Typography variant="h3" style={{ fontWeight: 400 }}>
                Continue to the platform to complete your profile setup.
              </Typography>
            </Box>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs>
              <Link to="/">
                <Button variant="text" color="primary" size="large" fullWidth>
                  later
                </Button>
              </Link>
            </Grid>
            <Grid item xs>
              <Link to="/login">
                <Button variant="contained" color="primary" size="large" fullWidth>
                  let's go
                </Button>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
