/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React from 'react';
import { makeStyles, createMuiTheme, createSvgIcon } from '@material-ui/core';
import { Shadows } from '@material-ui/core/styles/shadows';

const SelectArrowIcon = createSvgIcon(
    <path d="M20.53,8l-.78-.76a.47.47,0,0,0-.66,0L12,14.21,4.91,7.27a.47.47,0,0,0-.66,0L3.47,8a.47.47,0,0,0,0,.66l8.2,8a.47.47,0,0,0,.66,0l8.2-8a.47.47,0,0,0,0-.66Z" />,
    'ArrowDropDown',
);

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
        bg2: '#eaeaea',
        darker: '#D8D8D8',
        darkest: '#ededed',
    },
    text: {
        primary: '#20352e',
        secondary: '#757575',
    },
};

const shadows: Shadows = [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
    '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
    '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
    '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
    '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
    '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
    '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
    '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
    '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
    '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
    '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
    '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
    '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
    '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
    '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
    '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
    '0px 11px 15px -7px rgba(0,0,0,0.05),0px 24px 38px 3px rgba(0,0,0,0.08),0px 9px 46px 8px rgba(0,0,0,0.06)',
];

export const theme = createMuiTheme({
    palette,
    typography: {
        fontFamily: 'Poppins',
        h1: {
            fontSize: 40,
            letterSpacing: 0,
            lineHeight: 1.2,
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
        h4: {
            fontSize: 22,
            letterSpacing: 0,
            lineHeight: 1.2,
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
    shadows,
    overrides: {
        MuiButton: {
            root: {
                fontWeight: 900,
                fontSize: 16,
                borderRadius: 20,
                padding: '14px 25px',
            },
            outlined: {
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
                backgroundColor: palette.gray.bg2,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
            },
            input: {
                borderRadius: 20,
                padding: '18.5px 12px',
                '&': {
                    borderRadius: 20,
                },
            },
            multiline: {
                padding: '18.5px 12px',
            },
            inputMultiline: {
                padding: '0 !important',
                borderRadius: 0,
                '&': {
                    borderRadius: 0,
                },
                '&:-webkit-autofill': {
                    borderRadius: 0,
                },
            },
        },
        MuiInputLabel: {
            filled: {
                '&$shrink': {
                    transform: 'translate(12px, 6px) scale(0.75)',
                },
            },
        },
        MuiSelect: {
            select: {
                borderRadius: 20,
                paddingTop: 18.5,
                paddingBottom: 18.5,
                paddingRight: '52px !important',
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
});
