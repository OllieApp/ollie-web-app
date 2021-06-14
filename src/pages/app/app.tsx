import React, { useMemo } from 'react';
import { ApolloProvider } from '@apollo/client';
import Box from '@material-ui/core/Box';
import LuxonUtils from '@date-io/luxon';
import { Router, Redirect, LocationProvider, useLocation, useNavigate } from '@reach/router';
import { LogOut, X } from 'react-feather';
import { ThemeProvider, Button, IconButton } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { observer } from 'mobx-react';
import { SnackbarProvider } from 'notistack';
import { AuthLoadingPage } from 'pages/auth-loading-page/auth-loading-page';
import { SideBar } from '../../components/side-nav-bar/side-bar/side-bar';
import { SideBarContent } from '../../components/side-nav-bar/side-bar-content/side-bar-content';
import { SideBarItem } from '../../components/side-nav-bar/side-bar-item/side-bar-item';
import { SideBarFooter } from '../../components/side-nav-bar/side-bar-footer/side-bar-footer';
import { SideBarHeader } from '../../components/side-nav-bar/side-bar-header/side-bar-header';
import { ReactComponent as Logo } from '../../images/ollie_ears_w_text.svg';
import { theme } from '../../common/theming/theming';
import { useRootStore } from '../../common/stores';
import { routes, getCurrentRouteConfig } from './routes';
import { useApolloClient } from '../../common/apollo';
import './app.scss';

const routeConfigs = Object.entries(routes);
const publicRoutes = routeConfigs.filter(([, config]) => config.public);
const privateRoutes = routeConfigs.filter(([, config]) => !config.public);

const Shell = observer(() => {
  const { userStore } = useRootStore();
  const { isBootstraped, authStatus, authToken, isCommingFromGAuth } = userStore;
  const navigate = useNavigate();
  const location = useLocation();
  const currentRouteConfig = useMemo(() => getCurrentRouteConfig(location.pathname), [location.pathname]);
  const apolloClient = useApolloClient(authToken);

  const handleLogout = () => userStore.signOut().then(() => navigate('/auth'));

  return isBootstraped ? (
    <>
      {currentRouteConfig.sidebar && (
        <SideBar>
          <SideBarHeader>
            <Logo style={{ width: '90px', height: '150px' }} />
          </SideBarHeader>
          <SideBarContent>
            <SideBarItem icon="calendar" label="Bookings" path="/calendar" />
            <SideBarItem icon="profile" label="Profile" path="/profile" />
          </SideBarContent>
          <SideBarFooter>
            <Box display="flex" justifyContent="center">
              <Button className="log-out-item" size="small" onClick={handleLogout}>
                <Box mr={1} display="inline-flex">
                  <LogOut size="14" className="log-out-icon" color="#2D6455" />
                </Box>
                <span>Log out</span>
              </Button>
            </Box>
          </SideBarFooter>
        </SideBar>
      )}

      <Box bgcolor="gray.bg" marginLeft={currentRouteConfig.sidebar ? '150px' : 0}>
        <Router>
          {isCommingFromGAuth && <Redirect from="*" to="/signup" noThrow />}
          {authStatus === 'out' && <Redirect from="*" to="/auth" noThrow />}
          {authStatus === 'in' && <Redirect from="/" to="/calendar" noThrow />}
          {authStatus === 'in' && <Redirect from="/auth" to="/calendar" noThrow />}
          {authStatus === 'in' && <Redirect from="/signup" to="/calendar" noThrow />}

          {publicRoutes.map(([path, { component: Page }]) => (
            <Page key={path} path={path} />
          ))}
        </Router>

        {apolloClient && (
          <ApolloProvider client={apolloClient}>
            <Router>
              {isCommingFromGAuth && <Redirect from="*" to="/signup" noThrow />}
              {authStatus === 'out' && <Redirect from="*" to="/auth" noThrow />}
              {authStatus === 'in' && <Redirect from="/" to="/calendar" noThrow />}
              {authStatus === 'in' && <Redirect from="/auth" to="/calendar" noThrow />}
              {authStatus === 'in' && <Redirect from="/signup" to="/calendar" noThrow />}

              {privateRoutes.map(([path, { component: Page }]) => (
                <Page key={path} path={path} />
              ))}
            </Router>
          </ApolloProvider>
        )}
      </Box>
    </>
  ) : (
    <AuthLoadingPage />
  );
});

const Providers = ({ children }: React.PropsWithChildren<{}>) => {
  const notistackRef = React.createRef<SnackbarProvider>();
  return (
    <LocationProvider>
      <ThemeProvider theme={{ ...theme }}>
        <SnackbarProvider
          ref={notistackRef}
          action={(key) => (
            <IconButton onClick={() => notistackRef.current?.closeSnackbar(key)}>
              <X color="#ffffff" />
            </IconButton>
          )}
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <MuiPickersUtilsProvider utils={LuxonUtils}>{children}</MuiPickersUtilsProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </LocationProvider>
  );
};

function App() {
  return (
    <Providers>
      <Shell />
    </Providers>
  );
}

export default App;
