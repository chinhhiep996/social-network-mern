import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

import config from './../config/config';
import webpackConfig from './../webpack.config.client';

const compile = (app) => {
    // Disabled: using pre-built static bundle instead
}


export default {
    compile
}