import classNames from 'classnames';
import React from 'react';
import './side-bar-content.scss';

export type SideBarContentProps = React.PropsWithChildren<{
    className?: string;
}>;

export function SideBarContent({ className, children }: SideBarContentProps) {
    return <div className={classNames('side-bar-content', className)}>{children}</div>;
}
