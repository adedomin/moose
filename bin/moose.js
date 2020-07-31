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
usage: /home/prussian/projects/moose/bin/moose.js [init] [-c config_path]

Commands:
  init [-c path]  create default configuration in home folder or optional path

Options:
  -c, --config  config path
  -h, --help    Show help                                              [boolean]

Examples:
  /home/prussian/projects/moose/bin/moose.  write default config to home folder
  js init                                   as .moose.js or as
                                            $XDG_CONFIG_HOME/moose.js
  /home/prussian/projects/moose/bin/moose.  start server, run in background
  js -c config.js & disown`;

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
    else if (arg === 'init') {
        argv.init = true;
    }
    else if (argtype === '-c') {
        argv.c = arg;
        argtype = '';
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

    return;
}

require(path.join(__dirname, '../index.js'));
