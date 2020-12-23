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

const config = require(process.env.CONFIG_PATH);
config.moose.dump = false;

const { newBulkMoose } = require('./moose-storage.js');
const { stdin, exit } = require('process');
const StreamArray = require('stream-json/streamers/StreamArray');
const log = require('./logger.js');

const importStream = stdin.pipe(StreamArray.withParser());

async function main() {
    log.info('IMPORT beginning to import moose.');
    let mooseImports = [];
    for await (const { value } of importStream) {
        mooseImports.push(value);
        if (mooseImports.length > 999) {
            log.info('IMPORT starting a partial bulk import.');
            await newBulkMoose(mooseImports);
            log.info('IMPORT partial bulk import completed.');
            mooseImports = [];
        }
    }
    if (mooseImports.length > 0) {
        log.info('IMPORT starting a partial bulk import.');
        await newBulkMoose(mooseImports);
        log.info('IMPORT partial bulk import completed.');
    }
    log.info('IMPORT all done.');
}
main().catch(err => {
    console.error(err);
    exit(1);
});
