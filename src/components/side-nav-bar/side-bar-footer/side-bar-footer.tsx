import classNames from 'classnames';
import React from 'react';
import './side-bar-footer.scss';

export type SideBarFooterProps = React.PropsWithChildren<{
    className?: string;
}>;

export function SideBarFooter({ className, children }: SideBarFooterProps) {
    return <div className={classNames('side-bar-footer', className)}>{children}</div>;
}
