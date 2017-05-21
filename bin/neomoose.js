#!/usr/bin/env node
/*
 * Copyright (C) 2017 Anthony DeDominic <adedomin@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var path = require('path'),
    fs = require('fs'),
    argv = require('yargs')
    .usage('usage: $0 [init] [-c config_path]')
    .command('init [-c path]', 'create default configuration in home folder or optional path')
    .example('$0 init', 'write default config to home folder as .neomoose.js or as $XDG_CONFIG_HOME/neomoose.js')
    .example('$0 -c config.js & disown', 'start server, run in background')
    .describe('c', 'config path')
    .alias('c', 'config')
    .help('h')
    .alias('h', 'help')
    .argv

if (argv.c) {
    process.env.CONFIG_PATH = path.resolve(argv.c)
} 
else if (process.env.XDG_CONFIG_HOME) {
    process.env.CONFIG_PATH = path.join(
        process.env.XDG_CONFIG_HOME,
        'neomoose.js'
    )
}
else {
    process.env.CONFIG_PATH = path.join(
        process.env.HOME,
        '.neomoose.js'
    )
}

if (argv._[0] == 'init') {
    fs.createReadStream(
        path.join(__dirname, '../config/test.js')
    ).pipe(fs.createWriteStream(
        process.env.CONFIG_PATH
    ))

    console.log(`Configuration was written to ${process.env.CONFIG_PATH}
Please make sure to change the defaults.`)

    return
}

require(path.join(__dirname, '../index.js'))
