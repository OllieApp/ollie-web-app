import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Box, makeStyles, Typography, Button, Grid } from '@material-ui/core';
import logo from '../../logo.svg';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AuthPage(props: RouteComponentProps) {
    const styles = useStyles();

    return (
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
                    <Grid container spacing={3}>
                        <Grid item xs>
                            <Button variant="text" color="primary" size="large" fullWidth>
                                log in
                            </Button>
                        </Grid>
                        <Grid item xs>
                            <Button variant="contained" color="primary" size="large" fullWidth>
                                sign up
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
}

const useStyles = makeStyles({
    logo: {
        width: '180px',
        height: 'auto',
    },
});
