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

// change this in ./public/use/gallery-use.js as well !!!
/* eslint no-control-regex: "off" */
var galleryPageSize = 12,
    invalidMooseName = /[\x00-\x1f]/,
    validMooseStr = /^[0-9a-ft\n]*$/,
    validMooseShadeStr = /^[0-6t\n]*$/;

var log;

var config = require(process.env.CONFIG_PATH),
    { join } = require('path'),
    fs = require('fs');

// the moose db
let moosedb;

function newMoose(moose, cb) {

    // helpful for debugging random client issues
    log.debug('~moose~', { moose });

    if (!moose || !moose.name || typeof moose.name != 'string'
        || !moose.image || typeof moose.image != 'string'
    ) {
        return cb('moose cannot be blank and must be a string');
    }

    if (moose.id) delete moose.id;
    if (!moose.created)
        moose.created = new Date();
    else if (isNaN(new Date(moose.created)))
        moose.created = new Date();

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

    var test_moose = moose.image.split('\n');
    if (!moose.hd) {
        // check there are 15 rows
        if (test_moose.length != 15)
            return cb('moose should at least be 15 rows');

        // check that moose lines are 26 chars long
        if (!(test_moose.reduce((curr, line) => {
            return line.length == 26 && curr;
        }, true))) {
            return cb('moose should have rows of 26 characters');
        }
    }
    // hd moose
    else {
        // check there are 22 rows
        if (test_moose.length != 22)
            return cb('moose should at least be 22 rows');

        // check that moose lines are 36 chars long
        if (!(test_moose.reduce((curr, line) => {
            return line.length == 36 && curr;
        }, true))) {
            return cb('moose should have rows of 36 characters');
        }
    }

    if (moose.shaded) {
        // shades must be the same length and shades must be a string
        if (typeof moose.shade != 'string' ||
            moose.image.length != moose.shade.length)

            return cb('moose shader line must match the size of the image line');

        // test for valid moost shade string
        if (!validMooseShadeStr.test(moose.shade)) {
            return cb('moose shading can only contain [0-6t\\n]');
        }

        // ensure transparent shades and cells map to each other
        // this is because irc client may break if they don't
        for (var index=0; index<moose.image.length; index++) {
            if (moose.image[index] == 't' &&
                moose.shade[index] != 't'
            ) {
                return cb('transparent cells can only have a shade value of transparent');
            }
            else if (moose.image[index] != 't' &&
                moose.shade[index] == 't'
            ) {
                return cb('transparent shades can only apply to transparent cells');
            }
            else if (moose.shade[index] == '\n' && 
                moose.image[index] != '\n'
            ) {
                return cb('shades must have equal width rows');
            }
        }
    }

    moosedb.saveMoose(moose, err => {
        if (err)
            return cb('could not save moose', err);
        cb(null, `moose saved as ${moose.name}`);
    });
}

function getRandom(cb) {
    moosedb.getRandomMoose((err, moose) => {
        if (err || !moose)
            return cb('unknown random error', err);
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

function getMoose(name, cb) {
    moosedb.getMooseByName(name, (err, moose) => {
        if (err || !moose) {
            return cb('no such moose');
        }
        cb(null, moose);
    });
}

function getGallery(name, page, age, cb) {
    if (age === -1) age = 'newest';
    else            age = 'oldest';
    if (name) {
        moosedb.findMooseByQuery(
            name,
            Math.abs(page * galleryPageSize),
            galleryPageSize,
            age,
            (err, meese) => {
                if (err || !meese) {
                    return cb('unknown query error', err);
                }
                cb(null, meese);
            }
        );
    }
    else {
        moosedb.getGalleryPage(
            Math.abs(page * galleryPageSize),
            galleryPageSize,
            age,
            (err, meese) => {
                if (err || !meese) {
                    return cb('unknown gallery error', err);
                }
                cb(null, meese);
            }
        );
    }
}

module.exports = (logger, db) => {

    moosedb = db;
    log = logger;

    if (config.moose.dump) {
        setInterval(() => {
            log.debug('running db dump...');
            moosedb.dumpMoose((err, meese) => {
                if (err) log.error('moose dump error', { err: err.toString() });
                fs.createWriteStream(join(config.moose.db, 'dump.json'))
                    .write(JSON.stringify(meese));
            });
        }, config.moose.dumpEvery || 1000 * 60 * 60); // 1 hours

        log.debug('DB Dumps enabled - running initial db dump...');
        moosedb.dumpMoose((err, meese) => {
            if (err) log.error('moose dump error', { err: err.toString() });
            fs.createWriteStream(join(config.moose.db, 'dump.json'))
                .write(JSON.stringify(meese));
        });
    }

    return {
        newMoose,
        getMoose,
        getLatest,
        getRandom,
        getGallery,
    };
};
