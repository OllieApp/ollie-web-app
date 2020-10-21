import React, { useMemo, useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import Box from '@material-ui/core/Box';
import MomentUtils from '@date-io/moment';
import { Router, Redirect, LocationProvider, useLocation, useNavigate } from '@reach/router';
import { LogOut } from 'react-feather';
import { ThemeProvider, Button } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { observer } from 'mobx-react';
import { SideBar } from '../../components/side-nav-bar/side-bar/side-bar';
import { SideBarContent } from '../../components/side-nav-bar/side-bar-content/side-bar-content';
import { SideBarItem } from '../../components/side-nav-bar/side-bar-item/side-bar-item';
import { SideBarFooter } from '../../components/side-nav-bar/side-bar-footer/side-bar-footer';
import { SideBarHeader } from '../../components/side-nav-bar/side-bar-header/side-bar-header';
// import { SettingsPage } from '../settings-page/settings-page';
import { ReactComponent as Logo } from '../../images/ollie_ears_w_text.svg';
import { theme } from '../../common/theming/theming';
import { useRootStore } from '../../common/stores';
import { routes, getCurrentRouteConfig } from './routes';
import { AuthState, useApolloClient } from '../../common/apollo';
import './app.scss';

const Shell = observer(({ authState }: { authState: AuthState }) => {
    const { userStore } = useRootStore();
    const { status } = authState;
    const navigate = useNavigate();
    const location = useLocation();
    const currentRouteConfig = useMemo(() => getCurrentRouteConfig(location.pathname), [location.pathname]);

    useEffect(() => {
        if (!userStore.isAuthenticated && !currentRouteConfig.public) navigate('/auth');
        else if (!userStore.practitionerInfo && !userStore.isLoadingUserInfo) userStore.fetchUserInfo();
    }, [userStore.isAuthenticated, currentRouteConfig, navigate]);

    const handleLogout = () => userStore.logout();

    return (
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
                    <Redirect from="/" to="/calendar" noThrow />
                    {Object.entries(routes)
                        .filter(
                            ([, config]) =>
                                config.public ||
                                (status === 'in' && userStore.isAuthenticated && userStore.practitionerInfo),
                        )
                        .map(([path, { component: Page }]) => (
                            <Page key={path} path={path} />
                        ))}
                </Router>
            </Box>
        </>
    );
});

function App() {
    const [apolloClient, authState] = useApolloClient();

    return (
        <ApolloProvider client={apolloClient}>
            <ThemeProvider theme={{ ...theme }}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    <LocationProvider>
                        <Shell authState={authState} />
                    </LocationProvider>
                </MuiPickersUtilsProvider>
            </ThemeProvider>
        </ApolloProvider>
    );
}

export default App;
