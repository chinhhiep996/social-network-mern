import React from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { indigo, pink } from '@mui/material/colors';
import { hot } from 'react-hot-loader';
import { BrowserRouter } from 'react-router-dom';

import MainRouter from '../MainRouter';

const theme = createTheme({
    palette: {
        primary: {
            light: '#757de8',
            main: '#3f51b5',
            dark: '#002984',
            contrastText: '#fff',
        },
        secondary: {
            light: '#ff79b0',
            main: '#ff4081',
            dark: '#c60055',
            contrastText: '#000',
        },
        openTitle: indigo['400'],
        protectedTitle: pink['400'],
        type: 'light'
    }
});

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <MainRouter />
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default hot(module)(App);