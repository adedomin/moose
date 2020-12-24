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
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

// change this in ./public/use/gallery-use.js as well !!!
/* eslint no-control-regex: "off" */
const galleryPageSize = 12;
const invalidMooseName = /[\x00-\x1f]/;
const validMooseStr = /^[0-9a-ft\n]*$/;
const validMooseExtendedStr = /^[0-9a-bt\n]*$/;
const validMooseShadeStr = /^[0-6t\n]*$/;

const log = require('./logger.js');
const MooseDB = require('./db.js');
const { pngOutput } = require('./moose-render.js');

const config = require(process.env.CONFIG_PATH);
const { join } = require('path');
const moosedb = new MooseDB(join(config.moose.db, 'moose.db'));

const fs = require('fs');
const LRU = require('lru-cache');
const lruImageCache = new LRU({
    // size in bytes
    max: config?.web?.cache_max_size ?? (1024 * 1024 * 5),
    length(n) {
        return n.length;
    },
});

class MooseStorageError extends Error {
    static get messageEnum() {
        return {
            NO_SUCH_MOOSE: 'No such moose:',
        };
    }
    constructor(message) {
        super(message);
    }
}

function validateMoose(moose, fixup2017Moose) {
    if (!moose || !moose.name || typeof moose.name !== 'string'
        || !moose.image || typeof moose.image !== 'string'
    ) {
        return 'Moose type constraint failed.';
    }

    if (!moose.created) {
        moose.created = new Date();
    }
    else if (isNaN(new Date(moose.created))) {
        moose.created = new Date();
    }
    else {
        moose.created = new Date(moose.created);
    }

    const oldName = moose.name;
    moose.name = moose.name.trim();

    if (moose.name === 'random' || moose.name === 'latest') {
        if (!fixup2017Moose) {
            return 'Moose.name cannot be the reserved words "latest" or "random".';
        }
        else {
            moose.name = `${moose.created.toISOString()} ${moose.name}`;
            log.warn(`MOOSE-STORAGE Fixup2017Moose - RENAMED ${oldName} to ${moose.name}`);
        }
    }

    if (invalidMooseName.test(moose.name)) {
        if (!fixup2017Moose) {
            return 'Moose.name cannot contain control characters [\\x00-\\x1f].';
        }
        else {
            moose.name = JSON.stringify(moose.name);
            log.warn(`MOOSE-STORAGE Fixup2017Moose - RENAMED ${oldName} to ${moose.name}`);
        }
    }

    if (moose.name.length > 50 || moose.name.length < 1) {
        if (!fixup2017Moose) {
            return 'Moose.name cannot be over 50 characters in length or be empty.';
        }
        else {
            moose.name = `${moose.created.toISOString()} ${moose.name}`.slice(0, 50);
            log.warn(`MOOSE-STORAGE Fixup2017Moose - RENAMED ${oldName} to ${moose.name}`);
        }
    }

    // image validation tests
    if (moose.extended && !validMooseExtendedStr.test(moose.image)) {
        return 'Moose.image can only contain [a-bt0-9\\n].';
    }
    else if (!validMooseStr.test(moose.image)) {
        return 'Moose.image can only contain [a-ft0-9\\n].';
    }

    const test_moose = moose.image.split('\n');
    if (!moose.hd) {
        // check there are 15 rows
        if (test_moose.length !== 15) {
            return 'Moose.image should at least be 15 rows (Moose.hd = false).';
        }

        // check that moose lines are 26 chars long
        if (!(test_moose.reduce((curr, line) => {
            return line.length === 26 && curr;
        }, true))) {
            if (!fixup2017Moose) {
                return 'Moose.image should have rows of 26 characters (Moose.hd = false)';
            }
            else {
                moose.image = test_moose.map(line => {
                    if (line.length !== 26) {
                        line = line.padEnd(26, 't').slice(0,26);
                    }
                    return line;
                }).join('\n');
                log.warn(`MOOSE-STORAGE Fixup2017Moose - PADDED OUT ${moose.name} moose.image`);
            }
        }
    }
    // hd moose
    else {
        // check there are 22 rows
        if (test_moose.length !== 22) {
            return 'Moose.image should at least be 22 rows (Moose.hd = true).';
        }

        // check that moose lines are 36 chars long
        if (!(test_moose.reduce((curr, line) => {
            return line.length === 36 && curr;
        }, true))) {
            return 'Moose.image should have rows of 36 characters (Moose.hd = true).';
        }
    }

    if (moose.shaded && moose.extended) {
        return 'Moose cannot be "shaded" and "extended."';
    }

    if (moose.shaded || moose.extended) {
        // shades must be the same length and shades must be a string
        if (typeof moose.shade !== 'string' ||
            moose.image.length !== moose.shade.length
        ) {
            return 'Moose.shade.length != Moose.image.length';
        }

        // test for valid moost shade string
        if (!validMooseShadeStr.test(moose.shade)) {
            return 'Moose.shade can only contain [0-6t\\n].';
        }

        // ensure transparent shades and cells map to each other
        // this is because irc client may break if they don't
        for (let index=0; index<moose.image.length; index++) {
            if (moose.image[index] === 't' &&
                moose.shade[index] !== 't'
            ) {
                return 'Moose.image[cell] = "t" should match Moose.shade[cell]';
            }
            else if (moose.image[index] !== 't' &&
                     moose.shade[index] === 't'
            ) {
                return 'Moose.shade[cell] = "t" should match Moose.image[cell]';
            }
            else if (moose.shade[index] === '\n' &&
                     moose.image[index] !== '\n'
            ) {
                return 'Moose.shade row lengths do not match Moose.image.';
            }
        }
    }
}

function newMoose(moose) {
    return new Promise((resolve, reject) => {
        // helpful for debugging random client issues
        log.debug('MOOSE-STORAGE ~moose~', { moose });

        const validate = validateMoose(moose, false);
        if (validate !== undefined) {
            reject(new MooseStorageError(validate));
        }
        else {
            moosedb.saveMoose(moose);
            resolve('Moose saved.');
        }
    });
}

// USE ONLY WITH INTERNAL TOOLS
/**
 * Load multiple moose at once in a transaction.
 * @param {Array<Moose>} meese
 * @return {Promise<void>}
 * @throws {MooseStorageError}
 */
function newBulkMoose(meese) {
    return new Promise((resolve, reject) => {
        for (let moose of meese) {
            // where true indicates fix this moose for
            // CaptMoose 2017 format differences.
            const validate = validateMoose(moose, true);
            if (validate !== undefined) {
                return reject(new MooseStorageError(`${validate} - Name: ${moose.name}`));
            }
        }

        return resolve(moosedb.bulkSaveMoose(meese));
    });
}

/**
 * Get a single moose.
 * @param {(string|'random'|'latest')} q - name of moose.
 * @return {Promise<Moose>}
 * @throws {MooseStorageError}
 */
function getMoose(q) {
    return new Promise((resolve, reject) => {
        let moose;
        if (q === 'random')      moose = moosedb.getRandomMoose();
        else if (q === 'latest') moose = moosedb.getLatestMoose();
        else                     moose = moosedb.getMooseByName(q);

        if (moose === undefined) {
            reject(new MooseStorageError(`${MooseStorageError.messageEnum.NO_SUCH_MOOSE} ${q}`));
        }
        else {
            resolve(moose);
        }
    });
}

/**
 * Get a page of moose.
 * @param {(string|'random'|'latest')} query - Search query.
 * @param {number} page - page number.
 * @param {('oldest'|'newest')} age - Sort search by newer or older Moose.
 * @return {Promise<Array<Moose>>}
 * @throws {MooseStorageError}
 */
function getGallery(query, page, age) {
    return new Promise((resolve, reject) => {
        if (age !== 'oldest' && age !== 'newest') {
            reject(new MooseStorageError(`age parameter must be "oldest" or "newest"; given: ${age}`));
        }
        else {
            resolve(moosedb.getGalleryPage(
                query,
                Math.abs(page * galleryPageSize),
                galleryPageSize,
                age,
            ));
        }
    });
}

/**
 * Get an image of the moose named in name.
 * @param {string} name - moose to render.
 * @return {Promise<Blob>} a PNG of the moose.
 */
function getImage(name) {
    const img = lruImageCache.get(name);

    if (img) {
        return Promise.resolve(img);
    }
    else {
        return getMoose(name)
            .then(moose => {
                return pngOutput(moose);
            })
            .then(png => {
                lruImageCache.set(name, png);
                return png;
            });
    }
}

/**
 * Serialize the Moose database to a json array.
 * @param {string} path - The path to the dump location.
 */
function dumpDatabase(path) {
    const tpath = join(path, '.temp.dump.json');

    try {
        let error = false;
        const file = fs.createWriteStream(tpath);
        const stream = moosedb.reader().pipe(file);

        stream.on('error', err => {
            log.error('MOOSE-STORAGE DUMP ERR', { err });
            error = true;
        });
        stream.on('close', () => {
            if (error) return;
            fs.rename(tpath, join(path, 'dump.json'), err => {
                if (err) log.error('MOOSE-STORAGE DUMP ERR', { err });
            });
        });
    }
    // No point bubbling this error up, it's critical either way
    catch (err) {
        log.error('MOOSE-STORAGE DUMP ERR', { err });
    }
}


if (config?.moose?.dump) {
    setInterval(() => {
        log.debug('MOOSE-STORAGE running db dump...');
        dumpDatabase(config.moose.db);
    }, config?.moose?.dumpEvery || 1000 * 60 * 60); // 1 hours

    log.debug('MOOSE-STORAGE DB Dumps enabled - running initial db dump...');
    dumpDatabase(config.moose.db);
}

module.exports = {
    newMoose,
    newBulkMoose,
    getMoose,
    getGallery,
    getImage,
    MooseStorageError,
};
