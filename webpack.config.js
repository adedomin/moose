'use strict';
const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: './public/index.js',
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'index.bundle.js',
    },
    // filter these from the frontend code
    resolve: {
        alias: {
            pureimage: false,
            stream: false,
            fs: false,
        },
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
};
