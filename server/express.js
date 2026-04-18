import express from 'express';
import bodyParser from 'body-parser';
import cookiePerser from 'cookie-parser';
import compress from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

import Template from './../template';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';
import chatRoutes from './routes/chat.routes';
import devBundle from './devBundle';

// modules for server side rendering
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { SheetsRegistry } from 'react-jss';
import JssProvider from 'react-jss';
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';
import { indigo, pink } from '@mui/material/colors';
import { StaticRouter } from 'react-router-dom';

import MainRouter from './../client/MainRouter';
//end

const CURRENT_WORKING_DIR = process.cwd();
const app = express();
devBundle.compile(app); 
app.use('/dist', express.static(path.join(CURRENT_WORKING_DIR, 'dist')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookiePerser());
app.use(compress());
app.use(helmet());
app.use(cors());

app.use('/', userRoutes);
app.use('/', authRoutes);
app.use('/', postRoutes);
app.use('/', chatRoutes);

app.get(/(.*)/, (req, res) => {
    const sheetsRegistry = new SheetsRegistry();
    const theme = createTheme({
        palette: {
            primary: {
                light: '#757de8',
                main: '#3f51b5',
                dark: '#002984',
                contrastText: '#fff'
            },
            secondary: {
                light: '#ff79b0',
                main: '#ff4081',
                dark: '#c60055',
                contrastText: '#000'
            },
            openTitle: indigo['400'],
            protectedTitle: pink['400'],
        },
    });
    const context = {};
    const markup = ReactDOMServer.renderToString(
        <StaticRouter location={req.url} context={context}>
            <ThemeProvider theme={theme}>
                <MainRouter />
            </ThemeProvider>
        </StaticRouter>
    )
    if (context.url)
        return res.redirect(303, context.url);
    const css = sheetsRegistry.toString();
    res.status(200).send(Template({
        markup: markup,
        css: css
    }));
})

// Catch unauthorised errors
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ 'error': err.name + ": " + err.message })
    } else {
        console.error(err);
        res.status(500).send("Something broke!");
    }
})

export default app;