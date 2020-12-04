#!/usr/bin/env node
/*
 * Copyright (C) 2020  Anthony DeDominic <adedomin@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

const usageText = `\
usage: moose [init] [-c config_path]

Commands:
  init   [-c path]  Create default configuration at path or default.
  import [-c path]  Import moose dump api (/dump) from stdin

Options:
  -c, --config  config path
  -h, --help    Show help                                              [boolean]

Examples:
  moose init                   Write default config to home folder as
                               $XDG_CONFIG_HOME/moose.js
  curl https://moose.ghetty.space/dump | moose import -c config.js
                               Import moose from another moose instance.
  moose -c config.js & disown  Start server; run in background.
`;

const path = require('path');
const fs = require('fs');
const { argv: args, exit } = require('process');

let argv = {};
let argtype = '';

for (let arg of args.slice(2)) {
    if (arg === '-c' || arg === '--config') {
        argtype = '-c';
    }
    else if (/^--config=./.test(arg)) {
        [ , argv.c ] = arg.match(/^--config=(.+)/);
    }
    else if (argtype === '-c') {
        argv.c = arg;
        argtype = '';
    }
    else if (arg === 'init') {
        argv.init = true;
    }
    else if (arg === 'import') {
        argv.import = true;
    }
    else {
        console.error(usageText);
        exit(1);
    }
}

if (argtype !== '') {
    console.error(`No argument given for type: ${argtype}`);
    exit(1);
}

if (argv.c) {
    process.env.CONFIG_PATH = path.resolve(argv.c);
}
else if (process.env.XDG_CONFIG_HOME) {
    process.env.CONFIG_PATH = path.join(
        process.env.XDG_CONFIG_HOME,
        'moose.js',
    );
}
else {
    process.env.CONFIG_PATH = path.join(
        process.env.HOME,
        '.moose.js',
    );
}

if (argv.init) {
    fs.createReadStream(
        path.join(__dirname, '../config/test.js'),
    ).pipe(fs.createWriteStream(
        process.env.CONFIG_PATH,
    ));
    // eslint-disable-next-line
    console.log(`Configuration was written to ${process.env.CONFIG_PATH}
Please make sure to change the defaults.`);
}
else if (argv.import) {
    require(path.join(__dirname, '../lib/import-json.js'));
}
else {
    require(path.join(__dirname, '../index.js'));
}
