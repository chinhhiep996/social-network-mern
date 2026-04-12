import mongoose from 'mongoose';

import app from './express';
import config from '../config/config';

mongoose.connect(config.mongoUri).catch(err => {
    console.error(`Error connecting to MongoDB: ${err.message}`);
});
mongoose.connection.on('error', () => {
    console.error(`unable to connect to database: ${config.mongoUri}`);
});

app.listen(config.port, (err) => {
    if(err) {
        console.log(err);
    }
    console.log('Server started on port %s.', config.port);
});