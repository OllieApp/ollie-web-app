/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { makeStyles, createMuiTheme } from '@material-ui/core';

export const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#2D6455',
        },
        secondary: {
            main: '#EDED85',
        },
        // @ts-ignore
        gray: {
            '94': 'F0F0F0',
            bg: '#FAFAFA',
            darker: '#D8D8D8',
            darkest: '#ededed',
        },
        text: {
            primary: '#20352e',
            secondary: '#757575',
        },
    },
    typography: {
        fontFamily: 'Poppins',
        h1: {
            fontSize: 40,
            letterSpacing: 0,
            lineHeight: 1.6,
            fontWeight: 900,
        },
        h2: {
            fontSize: 35,
            letterSpacing: 0,
            lineHeight: 1.2,
            fontWeight: 900,
        },
        h3: {
            fontSize: 25,
            letterSpacing: 0,
            lineHeight: 1.2,
            fontWeight: 900,
        },
        overline: {
            fontSize: 20,
            letterSpacing: 0,
            lineHeight: 1.2,
            fontWeight: 900,
        },
        button: {
            textTransform: 'none',
        },
    },
    overrides: {
        MuiButton: {
            root: {
                fontWeight: 900,
                fontSize: 16,
                borderRadius: 15,
                padding: '8px 16px',
            },
            sizeLarge: {
                fontSize: 18,
                borderRadius: 25,
                padding: '18px 25px',
            },
        },
    },
});

export const useStyles = makeStyles({
    root: {
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        border: 0,
        borderRadius: 3,
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        color: 'white',
        height: 48,
        padding: '0 30px',
    },
    accentButton: {
        borderRadius: 15,
        paddingLeft: '25px',
        paddingRight: '25px',
        fontWeight: 900,
        fontSize: 14,
    },
});
