import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Box, CircularProgress } from '@material-ui/core';
import { observer } from 'mobx-react';

export const AuthLoadingPage = observer(({ navigate }: RouteComponentProps) => {
  return (
    <Box width={1} height="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="primary.main">
      <Box width="480px" p={5}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box mr={1} display="inline-flex" color="white">
            <CircularProgress size="3em" color="inherit" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
});
