import React from 'react';
import { Box, Select, MenuItem, FormControl, FormHelperText } from '@material-ui/core';
import { useField } from 'formik';
import { StepViewProps } from '../types';
import { StepHeader } from './step-header';

const categories = ['General Practitioner', 'Psychologist', 'Physiotherapist', 'Gynecologist', 'Dentist'];

export function CategoryStep({ step }: StepViewProps) {
    const [field, meta] = useField({ name: 'category' });

    return (
        <Box pt={4} pb={6}>
            <StepHeader step={step + 1} title="Choose your category" />

            <Box mt={3}>
                <FormControl error={!!meta.error} fullWidth>
                    <Select {...field} variant="filled" fullWidth>
                        {categories.map((category) => (
                            <MenuItem key={category} value={category}>
                                {category}
                            </MenuItem>
                        ))}
                    </Select>
                    {meta.touched && meta.error && <FormHelperText>{meta.error}</FormHelperText>}
                </FormControl>
            </Box>
        </Box>
    );
}
