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
const validMooseShadeStr = /^[0-6t\n]*$/;

const log = require('./logger.js');
const dflt = require('./default.js');
const { pngOutput } = require('./moose-render.js');

const config = require(process.env.CONFIG_PATH);
const { join } = require('path');
const fs = require('fs');
const LRU = require('lru-cache');
const lruImageCache = new LRU({
    // size in bytes
    max: dflt(config.web.cache_max_size, 1024 * 1024 * 5),
    length(n) {
        return n.length;
    },
});

const getMooseErrorEnum = {
    GET_RANDOM:  'Unknown moose-storage:getRandom() error.',
    GET_LATEST:  'Unknown moose-storage:getLatest() error; no latest moose?',
    GET_NAMED:   'No such moose.',
    GET_GALLERY: 'Unknwon moose-storage:getGallery() error.',
    SAVE_MOOSE:  'A moose with this name may already exist.',
    GET_RENDER:  'Unknown moose-storage:getImage() error; a moose failed to render to PNG.',
};

// the moose db
let moosedb;

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
    if (!validMooseStr.test(moose.image)) {
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

    if (moose.shaded) {
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
            reject({ msg: validate });
        }

        moosedb.saveMoose(moose, err => {
            if (err) {
                return reject({
                    msg: getMooseErrorEnum.SAVE_MOOSE,
                    err,
                });
            }
            resolve(`moose saved as ${moose.name}`);
        });
    });
}

// USE ONLY WITH INTERNAL TOOLS
function newBulkMoose(meese) {
    return new Promise((resolve, reject) => {
        for (let moose of meese) {
            // where true indicates fix this moose for
            // CaptMoose 2017 format differences.
            const validate = validateMoose(moose, true);
            if (validate !== undefined) {
                return reject({ msg: validate, moose });
            }
        }

        moosedb.bulkSaveMoose(meese, err => {
            if (err) reject(err);
            else     resolve();
        });
    });
}

function getMoose(q) {
    if (q === 'random')      return getRandom();
    else if (q === 'latest') return getLatest();
    else                     return getMooseNamed(q);
}

function getMooseHandler(resolve, reject, msg, err, moose) {
    if (err || !moose) {
        return reject({
            msg,
            err,
        });
    }
    resolve(moose);
}

function getRandom() {
    return new Promise((resolve, reject) => {
        moosedb.getRandomMoose(getMooseHandler.bind(
            null,
            resolve,
            reject,
            getMooseErrorEnum.GET_RANDOM,
        ));
    });
}

function getLatest() {
    return new Promise((resolve, reject) => {
        moosedb.getLatestMoose(getMooseHandler.bind(
            null,
            resolve,
            reject,
            getMooseErrorEnum.GET_LATEST,
        ));
    });
}

function getMooseNamed(name) {
    return new Promise((resolve, reject) => {
        moosedb.getMooseByName(name, getMooseHandler.bind(
            null,
            resolve,
            reject,
            getMooseErrorEnum.GET_NAMED,
        ));
    });
}

function getGallery(name, page, age) {
    return new Promise((resolve, reject) => {
        if (age !== 'oldest' && age !== 'newest') {
            return reject(`age parameter must be "oldest" or "newest"; given: ${age}`);
        }

        moosedb.getGalleryPage(
            name,
            Math.abs(page * galleryPageSize),
            galleryPageSize,
            age,
            getMooseHandler.bind(
                null,
                resolve,
                reject,
                getMooseErrorEnum.GET_GALLERY,
            ),
        );
    });
}

function getImage(q) {
    const img = lruImageCache.get(q);

    if (img) {
        return Promise.resolve(img);
    }
    else {
        return getMooseNamed(q)
            .then(moose => {
                return pngOutput(moose);
            })
            .then(png => {
                lruImageCache.set(q, png);
                return png;
            })
            .catch(err => {
                if (err && err.msg === getMooseErrorEnum.GET_NAMED) {
                    return Promise.reject(err);
                }
                else {
                    return Promise.reject({
                        msg: getMooseErrorEnum.GET_RENDER,
                        err,
                    });
                }
            });
    }
}

async function dumpDatabase(path) {
    const tpath = join(path, '.temp.dump.json');

    try {
        const file = fs.createWriteStream(tpath);
        let first = true;

        file.write('[');
        for await (const meese of moosedb) {
            // strip array [ ] from meese
            let m = JSON.stringify(meese).slice(1).slice(0, -1);
            if (!first) {
                m = `,${m}`;
            }
            else {
                first = !first;
            }
            file.write(m);
        }
        file.end(']');

        fs.rename(tpath, join(path, 'dump.json'), err => {
            if (err) throw err;
        });
    }
    // No point bubbling this error up, it's critical either way
    catch (err) {
        log.error('MOOSE-STORAGE DUMP ERR', { err });
    }
}

module.exports = (db) => {

    moosedb = db;

    if (config.moose.dump) {
        setInterval(() => {
            log.debug('MOOSE-STORAGE running db dump...');
            dumpDatabase(config.moose.db);
        }, config.moose.dumpEvery || 1000 * 60 * 60); // 1 hours

        log.debug('MOOSE-STORAGE DB Dumps enabled - running initial db dump...');
        dumpDatabase(config.moose.db);
    }

    return {
        newMoose,
        newBulkMoose,
        getMoose,
        getGallery,
        getImage,
        getMooseErrorEnum,
    };
};
