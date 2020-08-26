import classNames from 'classnames';
import React from 'react';
import './side-bar-header.scss';

export interface SideBarHeaderProps {
    className?: string;
    children?: React.ReactNode;
}

export function SideBarHeader(props: SideBarHeaderProps) {
    return <div className={classNames('side-bar-header', props.className)}>{props.children}</div>;
}
