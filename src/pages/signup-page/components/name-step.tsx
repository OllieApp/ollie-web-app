import React from 'react';
import { Box, Grid, TextField } from '@material-ui/core';
import { StepViewProps } from '../types';
import { StepHeader } from './step-header';

export function NameStep({ values, errors, step, onChange, onBlur }: StepViewProps) {
    return (
        <Box pt={4} pb={6}>
            <StepHeader step={step + 1} title="What is your name?" />
            <Box mt={3}>
                <Grid container spacing={3}>
                    <Grid item>
                        <TextField
                            name="firstName"
                            variant="filled"
                            placeholder="Name"
                            value={values.firstName}
                            error={!!errors.firstName}
                            onChange={onChange}
                            onBlur={onBlur}
                            fullWidth
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            name="lastName"
                            variant="filled"
                            placeholder="Surname"
                            value={values.lastName}
                            error={!!errors.lastName}
                            onChange={onChange}
                            onBlur={onBlur}
                            fullWidth
                        />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
