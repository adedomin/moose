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

const config = require(process.env.CONFIG_PATH);
const { join } = require('path');
const fs = require('fs');

// the moose db
let moosedb;

function newMoose(moose, cb) {

    // helpful for debugging random client issues
    log.debug('~moose~', { moose });

    if (!moose || !moose.name || typeof moose.name !== 'string'
        || !moose.image || typeof moose.image !== 'string'
    ) {
        return cb('moose cannot be blank and must be a string');
    }

    if (moose.id) delete moose.id;
    if (!moose.created) moose.created = new Date();
    else if (isNaN(new Date(moose.created))) {
        moose.created = new Date();
    }

    if (moose.name === 'random' || moose.name === 'latest') {
        return cb('moose name cannot be the reserved words "latest" or "random"');
    }

    if (invalidMooseName.test(moose.name)) {
        return cb('moose name cannot contain control characters [\\x00-\\x1f]');
    }
    moose.name = moose.name.trim();

    if (moose.name.length > 50 || moose.name.length < 1) {
        return cb('moose name cannot be over 50 characters in length or be empty');
    }

    // image validation tests
    if (!validMooseStr.test(moose.image)) {
        return cb('moose can only contain [a-ft0-9\\n]');
    }

    let test_moose = moose.image.split('\n');
    if (!moose.hd) {
        // check there are 15 rows
        if (test_moose.length !== 15) {
            return cb('moose should at least be 15 rows');
        }

        // check that moose lines are 26 chars long
        if (!(test_moose.reduce((curr, line) => {
            return line.length === 26 && curr;
        }, true))) {
            return cb('moose should have rows of 26 characters');
        }
    }
    // hd moose
    else {
        // check there are 22 rows
        if (test_moose.length !== 22) {
            return cb('moose should at least be 22 rows');
        }

        // check that moose lines are 36 chars long
        if (!(test_moose.reduce((curr, line) => {
            return line.length === 36 && curr;
        }, true))) {
            return cb('moose should have rows of 36 characters');
        }
    }

    if (moose.shaded) {
        // shades must be the same length and shades must be a string
        if (typeof moose.shade !== 'string' ||
            moose.image.length !== moose.shade.length
        ) {
            return cb('moose shader line must match the size of the image line');
        }

        // test for valid moost shade string
        if (!validMooseShadeStr.test(moose.shade)) {
            return cb('moose shading can only contain [0-6t\\n]');
        }

        // ensure transparent shades and cells map to each other
        // this is because irc client may break if they don't
        for (let index=0; index<moose.image.length; index++) {
            if (moose.image[index] === 't' &&
                moose.shade[index] !== 't'
            ) {
                return cb('transparent cells can only have a shade value of transparent');
            }
            else if (moose.image[index] !== 't' &&
                     moose.shade[index] === 't'
            ) {
                return cb('transparent shades can only apply to transparent cells');
            }
            else if (moose.shade[index] === '\n' &&
                     moose.image[index] !== '\n'
            ) {
                return cb('shades must have equal width rows');
            }
        }
    }

    moosedb.saveMoose(moose, err => {
        if (err) return cb(
            'could not save moose; a moose with this name may already exist',
            err,
        );
        cb(null, `moose saved as ${moose.name}`);
    });
}

function getMoose(q, cb) {
    if (q === 'random')      getRandom(cb);
    else if (q === 'latest') getLatest(cb);
    else                     getMooseNamed(q, cb);
}

function getRandom(cb) {
    moosedb.getRandomMoose((err, moose) => {
        if (err || !moose) return cb('unknown random error', err);
        cb(null, moose);
    });

}

function getLatest(cb) {
    moosedb.getLatestMoose((err, moose) => {
        if (err || !moose) {
            return cb('no latest moose.');
        }
        cb(null, moose);
    });
}

function getMooseNamed(name, cb) {
    moosedb.getMooseByName(name, (err, moose) => {
        if (err || !moose) {
            return cb('no such moose');
        }
        cb(null, moose);
    });
}

function getGallery(name, page, age, cb) {
    if (age !== 'oldest' && age !== 'newest') {
        return cb(`age parameter must be "oldest" or "newest"; given: ${age}`);
    }

    moosedb.getGalleryPage(
        name,
        Math.abs(page * galleryPageSize),
        galleryPageSize,
        age,
        (err, meese) => {
            if (err || !meese) {
                return cb('unknown gallery error', err);
            }
            cb(null, meese);
        },
    );
}

async function dumpDatabase(path) {
    let tpath = join(path, '.temp.dump.json');
    let file = fs.createWriteStream(tpath);
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

    return true;
}

module.exports = (db) => {

    moosedb = db;

    if (config.moose.dump) {
        setInterval(() => {
            log.debug('running db dump...');
            dumpDatabase(config.moose.db)
                .catch(err => {
                    if (err) {
                        log.error(
                            'moose dump error',
                            { err: err.toString() },
                        );
                    }
                });
        }, config.moose.dumpEvery || 1000 * 60 * 60); // 1 hours

        log.debug('DB Dumps enabled - running initial db dump...');
        dumpDatabase(config.moose.db)
            .catch(err => {
                if (err) {
                    log.error(
                        'moose dump error',
                        { err: err.toString() },
                    );
                }
            });
    }

    return {
        newMoose,
        getMoose,
        getGallery,
    };
};
