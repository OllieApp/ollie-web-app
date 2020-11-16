import { Calendar, Settings, User } from 'react-feather';
import React, { useEffect, useState } from 'react';
import './side-bar-item.scss';
import classNames from 'classnames';
import { Link, useLocation } from '@reach/router';

export interface SidebarItem {
  label: string;
  icon: 'calendar' | 'settings' | 'profile';
  className?: string;
  path: string;
}

export function SideBarItem(props: SidebarItem) {
  const { icon, label, className, path } = props;
  const location = useLocation();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(location.pathname === path);
  }, [location.pathname, path]);
  return (
    <Link to={path}>
      <div className={classNames('side-bar-item', active && 'active', className)}>
        <div className="side-bar-icon-container">{getItemIcon(icon, active)}</div>
        <div className="side-bar-text">
          <span>{label}</span>
        </div>
      </div>
    </Link>
  );
}

function getItemIcon(icon: 'calendar' | 'settings' | 'profile', active: boolean) {
  switch (icon) {
    case 'calendar':
      return (
        <Calendar color={active ? '#ffffff' : '#2D6455'} className={classNames('side-bar-icon', active && 'active')} />
      );
    case 'settings':
      return (
        <Settings color={active ? '#ffffff' : '#2D6455'} className={classNames('side-bar-icon', active && 'active')} />
      );
    case 'profile':
      return (
        <User color={active ? '#ffffff' : '#2D6455'} className={classNames('side-bar-icon', active && 'active')} />
      );
    default:
      return undefined;
  }
}
