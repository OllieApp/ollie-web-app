/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { Link } from '@reach/router';
import { Box, Button, Typography, Paper, Grid } from '@material-ui/core';
import { useRootStore } from '../../../common/stores';

export function SetupModal() {
  const {
    userStore: { practitionerInfo },
  } = useRootStore();

  if (!practitionerInfo) return null;

  return (
    <Paper elevation={24}>
      <Box width="480px" bgcolor="white" borderRadius={40} p={5}>
        <Box display="flex" flexDirection="column">
          <Box pt={5} mb={2}>
            <Typography variant="h2">Hey {practitionerInfo.title}</Typography>
          </Box>
          <Typography variant="h4">
            We'll need to grab some details so that we can list your profile & increase your appointments!
          </Typography>
          <Box width="100%" mt={6}>
            <Grid container spacing={3} justify="flex-end">
              <Grid item>
                <Box display="flex" justifyContent="flex-end">
                  <Link to="#">
                    <Button variant="text" color="primary">
                      later
                    </Button>
                  </Link>
                </Box>
              </Grid>
              <Grid item>
                <Link to="#">
                  <Button type="submit" variant="contained" color="primary" fullWidth>
                    set up in 2min
                  </Button>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
