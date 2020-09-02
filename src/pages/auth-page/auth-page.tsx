import React from 'react';
import Container from '@material-ui/core/Container';
import { Grid, Box } from 'react-feather';
import './auth-page.scss';

export function AuthPage() {
    return (
        <Container maxWidth="xl" className="">
            <Grid style={{ minHeight: '100vh', width: '100%' }}>
                <Box className="view-cotaniner" />
            </Grid>
        </Container>
    );
}
