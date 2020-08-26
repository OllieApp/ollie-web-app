import React from 'react';
import './side-bar.scss';

export function SideBar(props: { children: React.ReactNode }) {
    return <div className="side-bar">{props.children}</div>;
}
