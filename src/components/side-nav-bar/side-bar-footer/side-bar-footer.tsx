import classNames from 'classnames';
import React from 'react';
import './side-bar-footer.scss';

export interface SideBarFooterProps {
    className?: string;
    children?: React.ReactNode;
}

export function SideBarFooter(props: SideBarFooterProps) {
    return <div className={classNames('side-bar-footer', props.className)}>{props.children}</div>;
}
