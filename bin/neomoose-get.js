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
    .usage('usage: $0 [-d db dir] [-a all moose] moose-name')
    .describe('d', 'path where moose.db resides')
    .alias('d', 'db')
    .boolean('a')
    .describe('a', 'all moose')
    .alias('a', 'all')
    .help('h')
    .alias('h', 'help')
    .argv

if (!fs.statSync(path.join(argv.d || process.cwd(), 'moose.db'))) {
    console.error('please provide the directory which contains a moose.db using the -d flag')
    process.exit(1)
}

if (!argv._[0] || argv.a) {
    require(path.join(__dirname, '../lib/db.js'))(argv.d || process.cwd())
        .find({}, (err, moose) => {
            if (err || !moose) {
                console.error(err)
                process.exit(1)
            }
            console.log(JSON.stringify(moose))
        })
}
else {
    require(path.join(__dirname, '../lib/db.js'))(argv.d || process.cwd())
        .findOne({ name: argv._[0] }, (err, moose) => {
            if (err || !moose) {
                console.error('no such moose')
                process.exit(1)
            }
            console.log(JSON.stringify(moose))
        })
}
