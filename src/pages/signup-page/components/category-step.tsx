import React from 'react';
import { Box, Select, MenuItem } from '@material-ui/core';
import { StepViewProps } from '../types';
import { StepHeader } from './step-header';

export function CategoryStep({ values, errors, step, onChange, onBlur }: StepViewProps) {
    return (
        <Box pt={4} pb={6}>
            <StepHeader step={step + 1} title="Choose your category" />

            <Box mt={3}>
                <Select
                    name="category"
                    variant="filled"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={values.category}
                    error={!!errors.category}
                    fullWidth
                >
                    <MenuItem value="General practitioner">General practitioner</MenuItem>
                    <MenuItem value="General practitioner 2">General practitioner 2</MenuItem>
                    <MenuItem value="General practitioner 3">General practitioner 3</MenuItem>
                </Select>
            </Box>
        </Box>
    );
}
