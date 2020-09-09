export interface StepViewProps {
    step: number;
}

export interface StepConfig {
    key: string;
    fields: string[];
    component: (props: StepViewProps) => React.ReactElement;
}
