import React from 'react';
import { Box, Select, MenuItem, FormControl, FormHelperText } from '@material-ui/core';
import { useField } from 'formik';
import { StepViewProps } from '../types';
import { StepHeader } from './step-header';

const categories = [
    ['General Practitioner', 0],
    ['Psychologist', 1],
    ['Gynecologist', 2],
    ['Physiotherapist', 3],
    ['Wellness Center', 4],
];

export function CategoryStep({ step }: StepViewProps) {
    const [field, meta] = useField({ name: 'category' });

    return (
        <Box pt={4} pb={6}>
            <StepHeader step={step + 1} title="Choose your category" />

            <Box mt={3}>
                <FormControl error={!!meta.error} fullWidth>
                    <Select {...field} variant="filled" fullWidth>
                        {categories.map(([label, value]) => (
                            <MenuItem key={value} value={value}>
                                {label}
                            </MenuItem>
                        ))}
                    </Select>
                    {meta.touched && meta.error && <FormHelperText>{meta.error}</FormHelperText>}
                </FormControl>
            </Box>
        </Box>
    );
}
