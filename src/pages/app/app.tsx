import React from 'react';
import Box from '@material-ui/core/Box';
import MomentUtils from '@date-io/moment';
import { Router, Redirect, LocationProvider } from '@reach/router';
import { LogOut } from 'react-feather';
import { ThemeProvider } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { SideBar } from '../../components/side-nav-bar/side-bar/side-bar';
import { SideBarContent } from '../../components/side-nav-bar/side-bar-content/side-bar-content';
import { SideBarItem } from '../../components/side-nav-bar/side-bar-item/side-bar-item';
import { SideBarFooter } from '../../components/side-nav-bar/side-bar-footer/side-bar-footer';
import { SideBarHeader } from '../../components/side-nav-bar/side-bar-header/side-bar-header';
import { CalendarPage } from '../calendar-page/calendar-page';
import { ProfilePage } from '../profile-page/profile-page';
// import { SettingsPage } from '../settings-page/settings-page';
import { ReactComponent as Logo } from '../../images/ollie_ears_w_text.svg';
import { theme } from '../../common/theming/theming';
import './app.scss';

function App() {
    return (
        <ThemeProvider theme={{ ...theme }}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
                <LocationProvider>
                    <SideBar>
                        <SideBarHeader>
                            <Logo style={{ width: '90px', height: '150px' }} />
                        </SideBarHeader>
                        <SideBarContent>
                            <SideBarItem icon="calendar" label="Bookings" path="/calendar" />
                            <SideBarItem icon="profile" label="Profile" path="/profile" />
                        </SideBarContent>
                        <SideBarFooter>
                            <div className="log-out-item">
                                <LogOut size="14" className="log-out-icon" color="#2D6455" />
                                <p>Log out</p>
                            </div>
                        </SideBarFooter>
                    </SideBar>
                    <Box className="app-content">
                        <Router>
                            <Redirect from="/" to="/calendar" noThrow />
                            <CalendarPage path="/calendar" default />
                            <ProfilePage path="/profile" />
                        </Router>
                    </Box>
                </LocationProvider>
            </MuiPickersUtilsProvider>
        </ThemeProvider>
    );
}

export default App;
