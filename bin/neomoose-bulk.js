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
    meese = null,
    argv = require('yargs')
        .usage('usage: $0 [-d db dir] moose.json')
        .describe('d', 'path to create a moosedb')
        .alias('d', 'db')
        .help('h')
        .alias('h', 'help')
        .argv

if (argv._[0]) {
    meese = require(argv._[0])
}
else {
    meese = JSON.parse(fs.readFileSync('/dev/stdin').toString())
}

var moosedb = require(
    path.join(__dirname, '../lib/db.js')
)(argv.d || process.cwd())

if (meese instanceof Array) {
    meese.forEach((moose) => {
        moosedb.insert(moose)
    })
}
else {
    moosedb.insert(meese)
}
