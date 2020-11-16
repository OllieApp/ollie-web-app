import { RouteComponentProps } from '@reach/router';
import { CalendarPage } from '../calendar-page/calendar-page';
import { ProfilePage } from '../profile-page/profile-page';
import { AuthPage } from '../auth-page/auth-page';
import { LoginPage } from '../login-page/login-page';
import { SignUpPage } from '../signup-page/signup-page';
import { SignUpSuccessPage } from '../signup-success-page/signup-success-page';

export interface AppRoute {
  component: (props: RouteComponentProps) => JSX.Element;
  sidebar: boolean;
  public: boolean;
  default?: boolean;
}

export const routes: Record<string, AppRoute> = {
  '/calendar': {
    component: CalendarPage,
    default: true,
    public: false,
    sidebar: true,
  },
  '/profile': {
    component: ProfilePage,
    public: false,
    sidebar: true,
  },
  '/auth': {
    component: AuthPage,
    public: true,
    sidebar: false,
  },
  '/login': {
    component: LoginPage,
    public: true,
    sidebar: false,
  },
  '/signup': {
    component: SignUpPage,
    public: true,
    sidebar: false,
  },
  '/signup/success/:name': {
    component: SignUpSuccessPage,
    public: false,
    sidebar: false,
  },
};

export function getCurrentRouteConfig(pathname: string): Partial<AppRoute> {
  const route = Object.entries(routes)
    .reverse()
    .find(([path]) => {
      const reg = new RegExp(path.replace(/:[a-zA-Z-_]+/gi, '[a-zA-Z-_]+'));
      return reg.test(pathname);
    });

  return route ? route[1] : {};
}
