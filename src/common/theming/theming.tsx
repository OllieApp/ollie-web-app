/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React from 'react';
import { makeStyles, createMuiTheme, createSvgIcon } from '@material-ui/core';
import { Shadows } from '@material-ui/core/styles/shadows';

const SelectArrowIcon = createSvgIcon(
    <path d="M20.53,8l-.78-.76a.47.47,0,0,0-.66,0L12,14.21,4.91,7.27a.47.47,0,0,0-.66,0L3.47,8a.47.47,0,0,0,0,.66l8.2,8a.47.47,0,0,0,.66,0l8.2-8a.47.47,0,0,0,0-.66Z" />,
    'ArrowDropDown',
);

const defaultTheme = createMuiTheme();

const palette = {
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
};

const shadows = [...defaultTheme.shadows] as Shadows;

shadows[1] = '0px 2px 8px -2px rgba(0,0,0,0.08)';

export const theme = createMuiTheme({
    palette,
    shadows,
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
            textTransform: 'none',
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
                borderRadius: 20,
                padding: '14px 25px',
            },
            text: {
                padding: '14px 25px',
            },
            sizeLarge: {
                fontSize: 18,
                borderRadius: 25,
                padding: '18px 25px',
            },
        },
        MuiInputBase: {
            root: {
                color: palette.primary.main,
            },
        },
        MuiFilledInput: {
            root: {
                borderRadius: 20,
                backgroundColor: 'white',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                boxShadow: shadows[1],
            },
            input: {
                padding: '18.5px 27px 18.5px',
                borderRadius: 20,
                '&:focus': {
                    borderRadius: 20,
                },
            },
        },
        MuiSelect: {
            select: {
                borderRadius: 20,
                '&:focus': {
                    borderRadius: 20,
                },
            },
            iconFilled: {
                top: 'calc(50% - 11px)',
                right: 18,
            },
        },
        MuiPaper: {
            rounded: {
                borderRadius: 15,
            },
        },
    },
    props: {
        MuiFilledInput: {
            disableUnderline: true,
        },
        MuiSelect: {
            IconComponent: SelectArrowIcon,
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
