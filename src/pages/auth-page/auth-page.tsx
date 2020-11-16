import React from 'react';
import { Link } from '@reach/router';
import { Box, makeStyles, Typography, Button, Grid } from '@material-ui/core';
import logo from '../../logo.svg';

const useStyles = makeStyles({
    logo: {
        width: '180px',
        height: 'auto',
    },
});

export function AuthPage() {
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
                            <Link to="/login">
                                <Button variant="text" color="primary" size="large" fullWidth>
                                    log in
                                </Button>
                            </Link>
                        </Grid>
                        <Grid item xs>
                            <Link to="/signup">
                                <Button variant="contained" color="primary" size="large" fullWidth>
                                    sign up
                                </Button>
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
}
