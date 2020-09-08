import React, { useState, useCallback, useMemo } from 'react';
import * as yup from 'yup';
import { Box, Button } from '@material-ui/core';
import { RouteComponentProps } from '@reach/router';
import { useFormik } from 'formik';
import { CategoryStep } from './components/category-step';
import { NameStep } from './components/name-step';
import { GenderStep } from './components/gender-step';
import { StepConfig, FormState } from './types';
import { EmailStep } from './components/email-step';
import { PasswordStep } from './components/password-step';

const steps = [
    {
        key: 'category',
        component: CategoryStep,
        fields: ['category'],
    },
    {
        key: 'name',
        component: NameStep,
        fields: ['firstName', 'lastName'],
    },
    {
        key: 'gender',
        component: GenderStep,
        fields: ['gender'],
    },
    {
        key: 'email',
        component: EmailStep,
        fields: ['email'],
    },
    {
        key: 'password',
        component: PasswordStep,
        fields: ['password'],
    },
] as StepConfig[];

const initialValues: FormState = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    category: 'General Practitioner',
    gender: '',
};

const validationSchema = yup.object().shape<FormState>({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().min(8).required(),
    category: yup.string().required(),
    gender: yup.string().oneOf(['male', 'female', 'secrecy']).required(),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SignUpPage(props: RouteComponentProps) {
    const [currentStep, setCurrentStep] = useState<number>(0);
    const form = useFormik<FormState>({
        initialValues,
        validationSchema,
        onSubmit: (user) => {
            // eslint-disable-next-line no-alert
            alert(JSON.stringify(user, null, 2));
        },
    });

    const currentStepConfig = steps[currentStep];
    const StepView = currentStepConfig.component;

    const handlePrevClick = useCallback(() => setCurrentStep(currentStep - 1), [currentStep]);
    const handleNextClick = useCallback(() => setCurrentStep(currentStep + 1), [currentStep]);

    const isLastStep = useMemo(() => currentStep === 4, [currentStep]);
    const hasPrevStep = useMemo(() => currentStep > 0, [currentStep]);
    const currentValues = useMemo(
        () =>
            currentStepConfig.fields.reduce(
                (memo, key) => ({
                    ...memo,
                    [key]: form.values[key as keyof FormState],
                }),
                {},
            ),
        [currentStepConfig.fields, form.values],
    );
    const currentErrors = useMemo(
        () =>
            currentStepConfig.fields.reduce(
                (memo, key) => ({
                    ...memo,
                    [key]: form.errors[key as keyof FormState],
                }),
                {},
            ),
        [currentStepConfig.fields, form.errors],
    );

    return (
        <form onSubmit={form.handleSubmit} noValidate>
            <Box
                width={1}
                height="100vh"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bgcolor="primary.main"
            >
                <Box width="480px" bgcolor="gray.bg" borderRadius={40} p={5}>
                    <StepView
                        step={currentStep}
                        values={currentValues}
                        errors={currentErrors}
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                    />

                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                        {hasPrevStep && (
                            <Box ml="auto" width={160}>
                                <Button variant="text" color="primary" onClick={handlePrevClick} fullWidth>
                                    back
                                </Button>
                            </Box>
                        )}
                        <Box ml={3} width={160}>
                            <Button
                                variant="contained"
                                color="primary"
                                type={isLastStep ? 'submit' : 'button'}
                                disabled={isLastStep && !form.isValid}
                                onClick={isLastStep ? undefined : handleNextClick}
                                fullWidth
                            >
                                next
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </form>
    );
}
