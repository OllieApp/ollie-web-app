import React from 'react';
import { Box, Grid, TextField } from '@material-ui/core';
import { useField } from 'formik';
import { StepViewProps } from '../types';
import { StepHeader } from './step-header';

export function NameStep({ step }: StepViewProps) {
    const [firstNameField, firstNameMeta] = useField({ name: 'firstName', title: 'first name' });
    const [lastNameField, lastNameMeta] = useField({ name: 'lastName', title: 'last name' });

    return (
        <Box pt={4} pb={6}>
            <StepHeader step={step + 1} title="What is your name?" />
            <Box mt={3}>
                <Grid container spacing={3}>
                    <Grid item xs>
                        <TextField
                            {...firstNameField}
                            variant="filled"
                            label="Name"
                            error={!!(firstNameMeta.touched && firstNameMeta.error)}
                            helperText={firstNameMeta.touched ? firstNameMeta.error : ''}
                            autoFocus
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs>
                        <TextField
                            {...lastNameField}
                            variant="filled"
                            label="Surname"
                            error={!!(lastNameMeta.touched && lastNameMeta.error)}
                            helperText={lastNameMeta.touched ? lastNameMeta.error : ''}
                            fullWidth
                        />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
