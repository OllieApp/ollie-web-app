import React from 'react';
import { Box, TextField } from '@material-ui/core';
import { StepViewProps } from '../types';
import { StepHeader } from './step-header';

export function EmailStep({ values, errors, step, onChange, onBlur }: StepViewProps) {
    return (
        <Box pt={4} pb={6}>
            <StepHeader step={step + 1} title="What's your email address?" />
            <Box mt={3}>
                <TextField
                    name="email"
                    variant="filled"
                    type="email"
                    placeholder="name@example.com"
                    value={values.email}
                    error={!!errors.email}
                    onChange={onChange}
                    onBlur={onBlur}
                    fullWidth
                />
            </Box>
        </Box>
    );
}
