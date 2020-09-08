export interface FormState {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    category: string;
    gender: string;
}

export interface StepViewProps {
    values: Partial<FormState>;
    errors: Partial<FormState>;
    step: number;
    onChange: (event: React.ChangeEvent<unknown>) => void;
    onBlur: (event: React.FocusEvent<unknown>) => void;
}

export interface StepConfig {
    key: string;
    fields: string[];
    component: (props: StepViewProps) => React.ReactElement;
}
