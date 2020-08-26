import classNames from 'classnames';
import React from 'react';
import "./side-bar-content.scss"

export interface SideBarContentProps {
    className?: string;
    children?: React.ReactNode;
}

export function SideBarContent(props: SideBarContentProps) {
    return <div className={classNames('side-bar-content', props.className)}>{props.children}</div>;
}
