import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
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

const CURRENT_WORKING_DIR = process.cwd();
const app = express();
devBundle.compile(app); 
app.use('/dist', express.static(path.join(CURRENT_WORKING_DIR, 'dist')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(compress());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());

app.use('/', userRoutes);
app.use('/', authRoutes);
app.use('/', postRoutes);
app.use('/', chatRoutes);

app.get(/(.*)/, (req, res) => {
    res.status(200).send(Template({
        markup: '',
        css: ''
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