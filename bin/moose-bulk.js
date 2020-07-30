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
'use strict';

var path = require('path'),
    fs = require('fs'),
    meese = null,
    { argv } = require('yargs')
        .usage('usage: $0 [-d db dir] moose.json')
        .describe('d', 'path to create a moosedb')
        .alias('d', 'db')
        .help('h')
        .alias('h', 'help');

meese = JSON.parse(fs.readFileSync(argv._[0] || '/dev/stdin').toString());

let exit_code = 0;
const { MooseDB, rowToMoose } = require(
    path.join(__dirname, '../lib/db.js'),
);
let moosedb = new MooseDB(
    path.join(argv.d || process.cwd(), 'moose.db'),
);

moosedb.open(err => {
    if (err) throw err;
    if (meese instanceof Array) {
        meese = meese.map(rowToMoose);
        moosedb.bulkSaveMoose(meese, (err, failed) => {
            if (err) {
                console.error(err.toString());
                exit_code = 1;
            }
            if (failed.length > 0) {
                failed.forEach(moose => {
                    console.error(`Insert failed: ${moose.name} - ${moose.err.toString()}`);
                });
                exit_code = 1;
            }
            process.exit(exit_code);
        });
    }
    else {
        meese = rowToMoose(meese);
        moosedb.saveMoose(meese, (err => {
            if (err) {
                console.error(`Error: failed to save moose: ${err.toString()}`);
                exit_code = 1;
            }
            process.exit(exit_code);
        }));
    }
});
