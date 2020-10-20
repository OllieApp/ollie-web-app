import React from 'react';
import {
    Box,
    Grid,
    RadioGroup,
    FormControlLabel,
    Radio,
    makeStyles,
    FormControl,
    FormHelperText,
} from '@material-ui/core';
import { useField } from 'formik';
import { StepViewProps } from '../types';
import { StepHeader } from './step-header';
import { Emoji } from '../../../components/emoji/emoji';

const genders = [
    {
        label: 'female',
        symbol: '👩🏽‍⚕️',
        value: 2,
    },
    {
        label: 'male',
        symbol: '👨🏻‍⚕️',
        value: 1,
    },
    {
        label: 'prefer not to say',
        symbol: '🤐',
        value: 0,
    },
];

const useStyles = makeStyles((theme) => ({
    label: {
        fontSize: 12,
        color: theme.palette.primary.main,
        maxWidth: 60,
    },
}));

export function GenderStep({ step }: StepViewProps) {
    const [field, meta] = useField({ name: 'gender' });
    const styles = useStyles();

    return (
        <Box pt={4} pb={6}>
            <StepHeader step={step + 1} title="What's your gender?" />
            <Box mt={3}>
                <FormControl error={!!meta.error} fullWidth>
                    <RadioGroup {...field}>
                        <Grid container spacing={1}>
                            {genders.map((gender) => (
                                <Grid key={gender.value} item>
                                    <Box bgcolor="white" borderRadius={30} p={2} display="flex" alignItems="center">
                                        <Emoji symbol={gender.symbol} size={30} />
                                        <FormControlLabel
                                            control={<Radio color="primary" />}
                                            labelPlacement="start"
                                            label={gender.label}
                                            value={gender.value}
                                            checked={Number(field.value) === Number(gender.value)}
                                            classes={{
                                                label: styles.label,
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </RadioGroup>
                    {meta.touched && meta.error && <FormHelperText>{meta.error}</FormHelperText>}
                </FormControl>
            </Box>
        </Box>
    );
}
