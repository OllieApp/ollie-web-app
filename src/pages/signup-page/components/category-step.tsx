import React from 'react';
import { Box, Select, MenuItem } from '@material-ui/core';
import { StepViewProps } from '../types';
import { StepHeader } from './step-header';

const categories = ['General Practitioner', 'Psychologist', 'Physiotherapist', 'Gynecologist', 'Dentist'];

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
                    {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                            {category}
                        </MenuItem>
                    ))}
                </Select>
            </Box>
        </Box>
    );
}
