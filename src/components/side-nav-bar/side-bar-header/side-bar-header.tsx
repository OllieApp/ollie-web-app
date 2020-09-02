import classNames from 'classnames';
import React from 'react';
import './side-bar-header.scss';

export type SideBarHeaderProps = React.PropsWithChildren<{
    className?: string;
}>;

export function SideBarHeader({ className, children }: SideBarHeaderProps) {
    return <div className={classNames('side-bar-header', className)}>{children}</div>;
}
