import mongoose from 'mongoose';

import app from './express';
import config from '../config/config';

mongoose.set('useFindAndModify', false);
mongoose.connect(config.mongoUri, { useNewUrlParser: true });
mongoose.connection.on('error', () => {
    throw new Error(`unable to connect to database: ${mongoUri}`)
});

app.listen(config.port, (err) => {
    if(err) {
        console.log(err);
    }
    console.log('Server started on port %s.', config.port);
});