'use strict';
const path = require('path');
const webpack = require('webpack');

// Node.js 17+ broke MD4 style hashes, which breaks Webpack 5
const crypto = require('crypto');
const crypto_orig_createHash = crypto.createHash;
// gotta love monkey patching
crypto.createHash = algorithm => crypto_orig_createHash(algorithm === 'md4' ? 'sha256' : algorithm);

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
