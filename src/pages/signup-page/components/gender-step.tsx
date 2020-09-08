import React from 'react';
import { Box, Grid, RadioGroup, FormControlLabel, Radio, makeStyles } from '@material-ui/core';
import { StepViewProps } from '../types';
import { StepHeader } from './step-header';
import { Emoji } from '../../../components/emoji/emoji';

const genders = [
    {
        label: 'female',
        symbol: '👩🏽‍⚕️',
    },
    {
        label: 'male',
        symbol: '👨🏻‍⚕️',
    },
    {
        label: 'prefer not to say',
        symbol: '🤐',
    },
];

const useStyles = makeStyles((theme) => ({
    label: {
        fontSize: 12,
        color: theme.palette.primary.main,
        maxWidth: 60,
    },
}));

export function GenderStep({ values, step, onChange, onBlur }: StepViewProps) {
    const styles = useStyles();

    return (
        <Box pt={4} pb={6}>
            <StepHeader step={step + 1} title="What's your gender?" />
            <Box mt={3}>
                <RadioGroup name="gender" value={values.gender} onChange={onChange} onBlur={onBlur}>
                    <Grid container spacing={1}>
                        {genders.map((gender) => (
                            <Grid key={gender.label} item>
                                <Box bgcolor="white" borderRadius={30} p={2} display="flex" alignItems="center">
                                    <Emoji symbol={gender.symbol} size={30} />
                                    <FormControlLabel
                                        control={<Radio color="primary" />}
                                        labelPlacement="start"
                                        label={gender.label}
                                        value={gender.label}
                                        classes={{
                                            label: styles.label,
                                        }}
                                    />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </RadioGroup>
            </Box>
        </Box>
    );
}
