'use strict';
const path = require('path');

module.exports = {
    mode: 'production',
    entry: './public/index.js',
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'index.bundle.js',
    },
    // filter these from the frontend code
    node: {
        fs: 'empty',
    },
    resolve: {
        alias: {
            pureimage: 'fs',
        },
    },
};
