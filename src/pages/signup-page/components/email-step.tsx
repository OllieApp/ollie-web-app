import React from 'react';
import { Box, TextField } from '@material-ui/core';
import { useField } from 'formik';
import { StepViewProps } from '../types';
import { StepHeader } from './step-header';

export function EmailStep({ step }: StepViewProps) {
    const [field, meta] = useField({ name: 'email' });

    return (
        <Box pt={4} pb={6}>
            <StepHeader step={step + 1} title="What's your email address?" />
            <Box mt={3}>
                <TextField
                    {...field}
                    variant="filled"
                    type="email"
                    placeholder="name@example.com"
                    error={!!(meta.touched && meta.error)}
                    helperText={meta.touched ? meta.error : ''}
                    autoFocus
                    fullWidth
                />
            </Box>
        </Box>
    );
}
