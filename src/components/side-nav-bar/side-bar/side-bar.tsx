import React from 'react';
import './side-bar.scss';

export function SideBar({ children }: { children: React.ReactNode }) {
    return <div className="side-bar">{children}</div>;
}
