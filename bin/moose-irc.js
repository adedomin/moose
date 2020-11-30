#!/usr/bin/env node
// Copyright (C) 2020  Anthony DeDominic <adedomin@gmail.com>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

'use strict';

const usageText = `\
usage: moose-irc [-s MOOSE_WEBSERVER] -c moose_config.js [IRC-SERVER]

Options:
  -s, --server  which moose web server to use to get moose.
                DEFAULT: http://localhost:7512
  -c, --config  a valid moose config that exports a config.irc object.
                DEFAULT: $XDG_CONFIG_HOME/moose.js
  -h, --help    This message.

Examples:
  moose-irc -c config.js Rizon  Run moose-irc using the config: config.irc.servers["Rizon"]

IRC-SERVER refers to a specific key in the config.irc object, allowing you
to configure for multiple servers; if you don't specify an IRC-SERVER, moose-irc
will assume the moose config is in the legacy state that only allows one irc
server definitition.

To run multiple instances of moose-irc, see:
contrib/etc/systemd/system/moose-irc@.service
`;

const path = require('path');
const { argv: args, exit, env } = require('process');

const argv = {
    config: path.resolve(path.join(
        env.XDG_CONFIG_HOME ? env.XDG_CONFIG_HOME : `${env.HOME}/.config`,
        'moose.js',
    )),
    server: undefined,
    irc: undefined,
};

let argtype = '';

for (let arg of args.slice(2)) {
    if (argtype === '-c') {
        argv.config = arg;
        argtype = '';
    }
    else if (argtype === '-s') {
        argv.server = arg;
        argtype = '';
    }
    else if (arg === '-c' || arg === '--config') {
        argtype = '-c';
    }
    else if (/^--config=./.test(arg)) {
        [ , argv.config ] = arg.match(/^--config=(.+)/);
    }
    else if (arg === '-s' || arg === '--server') {
        argtype = '-s';
    }
    else if (/^--server=./.test(arg)) {
        [ , argv.server ] = arg.match(/^--config=(.+)/);
    }
    if (arg === '-h' || arg === '--help') {
        console.error(usageText);
        exit(1);
    }
    else {
        argv.irc = arg;
    }
}

if (argtype !== '') {
    console.error(`No argument given for type: ${argtype}`);
    exit(1);
}

env.CONFIG_PATH = path.resolve(argv.config);

require(path.join(__dirname, '../lib/irc.js'))(argv);
