import React, { useState, useCallback, useMemo } from 'react';
import * as yup from 'yup';
import { observer } from 'mobx-react';
import { Box, Button, CircularProgress, makeStyles } from '@material-ui/core';
import { RouteComponentProps } from '@reach/router';
import { FormikProvider, Form, useFormik } from 'formik';
import { CategoryStep } from './components/category-step';
import { NameStep } from './components/name-step';
import { GenderStep } from './components/gender-step';
import { StepConfig } from './types';
import { EmailStep } from './components/email-step';
import { PasswordStep } from './components/password-step';
import { useRootStore } from '../../common/stores';
import { AuthUser } from '../../types';

const initialValues: AuthUser = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  category: 1,
  gender: null!,
};

const emailRule = yup.string().email();
const passwordRule = yup
  .string()
  .matches(
    /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
    'Password must contain at least 8 characters, one uppercase, one number, and one special case character',
  );

const useStyles = makeStyles({
  progressBar: {
    transition: 'width .2s ease-in-out',
  },
});

export const SignUpPage = observer(({ navigate }: RouteComponentProps) => {
  const { userStore } = useRootStore();
  const { firebaseUser } = userStore;
  const styles = useStyles();
  const [currentStep, setCurrentStep] = useState<number>(0);

  const validationSchema = useMemo(
    () =>
      yup.object().shape<AuthUser>({
        firstName: yup.string().required('first name is a required field'),
        lastName: yup.string().required('last name is a required field'),
        email: userStore.authMethod === 'email' ? emailRule.required() : emailRule,
        password: userStore.authMethod === 'email' ? passwordRule.required() : passwordRule,
        category: yup.number().required(),
        gender: yup.number().required(),
      }),
    [userStore.authMethod],
  );

  const currentUserName = useMemo(() => firebaseUser?.displayName, [firebaseUser]);
  const currentFirstName = useMemo(() => currentUserName?.split(' ')[0], [currentUserName]);
  const currentLastName = useMemo(() => {
    if (!currentUserName) return null;
    const [, ...rest] = currentUserName.split(' ');
    return rest.join(' ');
  }, [currentUserName]);

  const form = useFormik<AuthUser>({
    initialValues: {
      ...initialValues,
      firstName: currentFirstName || '',
      lastName: currentLastName || '',
    },
    validationSchema,
    onSubmit: async (userData) => {
      console.log(userData);

      try {
        if (userStore.authMethod === 'email') {
          await userStore.signUpWithEmail(userData);
        } else {
          await userStore.signUp(userData);
        }

        if (navigate) navigate(`/signup/success/${userData.lastName}`, {});
      } catch (ex) {
        await userStore.logout();
        if (navigate) navigate('/signup', {});
        // eslint-disable-next-line no-alert
        alert(ex.message);
        // TODO: Report
      }
    },
  });

  const steps = useMemo(
    () =>
      [
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
        ...(userStore.authMethod === 'email'
          ? [
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
            ]
          : []),
      ] as StepConfig[],
    [userStore.authMethod],
  );

  const currentStepConfig = useMemo(() => steps[currentStep], [currentStep, steps]);
  const completedPercent = useMemo(() => (100 / steps.length) * (currentStep + 1), [currentStep, steps.length]);
  const hasPrevStep = useMemo(() => currentStep > 0, [currentStep]);
  const isLastStep = useMemo(() => currentStep === steps.length - 1, [currentStep]);
  const StepView = useMemo(() => currentStepConfig.component, [currentStepConfig]);

  const isCurrentStepValid = useMemo(
    () => currentStepConfig.fields.every((field) => !form.errors[field as keyof AuthUser]),
    [currentStepConfig, form.errors],
  );

  const validateCurrentStepFields = useCallback(
    () =>
      currentStepConfig.fields.forEach(async (field) => {
        await form.validateField(field as keyof AuthUser);
        form.setFieldTouched(field);
      }),
    [currentStepConfig, form],
  );

  const handlePrevClick = useCallback(() => setCurrentStep(currentStep - 1), [currentStep]);

  const handleNextClick = useCallback(async () => {
    if (!isCurrentStepValid) {
      return validateCurrentStepFields();
    }

    if (isLastStep) {
      console.log(form);
      form.handleSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  }, [form, currentStep, isCurrentStepValid, isLastStep, validateCurrentStepFields]);

  return (
    <FormikProvider value={form}>
      <Form onSubmit={form.handleSubmit} noValidate>
        <Box width={1} height="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="primary.main">
          <Box width="480px" bgcolor="gray.bg" borderRadius={40} p={5} overflow="hidden" position="relative">
            <Box
              className={styles.progressBar}
              height="15px"
              position="absolute"
              left={0}
              top={0}
              bgcolor="secondary.main"
              width={`${completedPercent}%`}
            />

            <StepView step={currentStep} />

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
                  type="button"
                  onClick={handleNextClick}
                  disabled={form.isSubmitting}
                  fullWidth
                >
                  {form.isSubmitting && (
                    <Box mr={1} display="inline-flex">
                      <CircularProgress size="1em" />
                    </Box>
                  )}
                  <Box is="span">next</Box>
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Form>
    </FormikProvider>
  );
});
