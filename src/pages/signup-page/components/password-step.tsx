import React from 'react';
import { Box, TextField } from '@material-ui/core';
import { StepViewProps } from '../types';
import { StepHeader } from './step-header';

export function PasswordStep({ values, errors, step, onChange, onBlur }: StepViewProps) {
    return (
        <Box pt={4} pb={6}>
            <StepHeader step={step + 1} title="Set a password" />
            <Box mt={3}>
                <TextField
                    name="password"
                    variant="filled"
                    type="password"
                    placeholder="Password"
                    value={values.password}
                    error={!!errors.password}
                    onChange={onChange}
                    onBlur={onBlur}
                    fullWidth
                />
            </Box>
        </Box>
    );
}
