import React from 'react';
import { Box, Typography } from '@material-ui/core';

interface StepHeaderProps {
  step: number;
  title: string;
}

export function StepHeader({ title, step }: StepHeaderProps) {
  return (
    <Box>
      <Typography variant="overline" color="primary">
        Step {step.toString().padStart(2, '0')}
      </Typography>
      <Typography variant="h3">{title}</Typography>
    </Box>
  );
}
