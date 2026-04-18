import http from 'http';
import mongoose from 'mongoose';

import app from './express';
import config from '../config/config';
import initializeSocket from './socket/index';

mongoose.connect(config.mongoUri).catch(err => {
    console.error(`Error connecting to MongoDB: ${err.message}`);
});
mongoose.connection.on('error', () => {
    console.error(`unable to connect to database: ${config.mongoUri}`);
});

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);

initializeSocket(server).then((io) => {
    // Make io accessible to route handlers if needed
    app.set('io', io);
    console.log('Socket.IO initialized');
}).catch(err => {
    console.error('Socket.IO initialization error:', err);
});

server.listen(config.port, (err) => {
    if(err) {
        console.log(err);
    }
    console.log('Server started on port %s.', config.port);
});