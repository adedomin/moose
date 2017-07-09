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

// change this in ./public/use/gallery-use.js as well !!!
var galleryPageSize = 12, 
    // escape specials for moose searching
    matchOperatorsRegExp = /[|\\{()[^$+*?.-]/g,
    validMooseStr = /^[0-9a-ft\n]*$/,
    validMooseShadeStr = /^[0-6t\n]*$/,
    log

var config = require(process.env.CONFIG_PATH),
    join = require('path').join,
    fs = require('fs')

function searchNameRegexp(name) {
    return new RegExp(name.replace(
        matchOperatorsRegExp,
        '\\$&'
    ), 'i')
}

function onErr(res, msg, err, code) {
    // this is an unknown error, so we should log it.
    if (err) {
        log.error(msg, { err: err.toString() }) 
        msg = err.toString()
    }
    else {
        log.info(msg)
    }
    
    res.status(code || 500)
    res.send({
        status: 'error',
        msg,
    })
}

function onOk(res, msg) {
    log.info(msg)
    res.send({
        status: 'ok',
        msg,
    })
} 


module.exports = (web, moosedb, logger) => {
    log = logger

    web.on('new-moose', (moose, res) => {
        // helpful for debugging random client issues
        log.debug('~moose~', { moose })
        
        if (!moose || !moose.name || typeof moose.name != 'string'
            || !moose.image || typeof moose.image != 'string'
        ) {
            return onErr(
                res, 
                'moose cannot be blank and must be a string', 
                null, 422
            )
        }

        if (moose._id) delete moose._id
        if (!moose.created)
            moose.created = new Date()
        else if (isNaN(new Date(moose.created)))
            moose.created = new Date()

        moose.name = moose.name.trim()

        if (moose.name.length > 50 || moose.name.length < 1) {
            return onErr(
                res, 
                'moose name cannot be over 50 characters in length or be empty', 
                null, 422
            )
        }

        // image validation tests
        if (!validMooseStr.test(moose.image)) {
            return onErr(res, 'moose can only contain [a-ft0-9\\n]', null, 422)
        }

        var test_moose = moose.image.split('\n')
        if (!moose.hd) {
            // check there are 15 rows
            if (test_moose.length != 15) 
                return onErr(res, 'moose should at least be 15 rows', null, 422)

            // check that moose lines are 26 chars long
            if (!(test_moose.reduce((curr, line) => {
                return line.length == 26 && curr
            }, true))) {
                return onErr(res, 'moose should have rows of 26 characters', null, 422)
            }
        }
        // hd moose
        else {
            // check there are 22 rows
            if (test_moose.length != 22) 
                return onErr(res, 'moose should at least be 22 rows', null, 422)

            // check that moose lines are 36 chars long
            if (!(test_moose.reduce((curr, line) => {
                return line.length == 36 && curr
            }, true))) {
                return onErr(res, 'moose should have rows of 36 characters', null, 422)
            }
        }

        if (moose.shaded) {
            // shades must be the same length and shades must be a string
            if (typeof moose.shade != 'string' ||
                moose.image.length != moose.shade.length)

                return onErr(res, 'moose shader line must match the size of the image line', null, 422)

            // test for valid moost shade string
            if (!validMooseShadeStr.test(moose.shade)) {
                return onErr(res, 'moose shading can only contain [0-6t\\n]', null, 422)
            }

            // ensure transparent shades and cells map to each other
            // this is because irc client may break if they don't
            for (var index=0; index<moose.image.length; index++) {
                if (moose.image[index] == 't' &&
                    moose.shade[index] != 't'
                ) {
                    return onErr(res, 'transparent cells can only have a shade value of transparent', null, 422)
                }
                else if (moose.image[index] != 't' &&
                         moose.shade[index] == 't'
                ) {
                    return onErr(res, 'transparent shades can only apply to transparent cells', null, 422)
                }
            }
        }

        moosedb.save(moose, (err, newmoose) => {
            if (err || !newmoose) 
                return onErr(res, 'could not save moose', err)
            onOk(res, `moose saved as ${newmoose.name}`)
        })
    })

    web.on('get-random', (res) => {
        moosedb.random((err, moose) => {
            if (err || !moose)
                return onErr(res, 'unknown random error', err)
            res.send(moose[0])
        })
    })

    web.on('get-latest', (res) => {
        res.send(moosedb.latest.res[0])
    })

    web.on('get-moose', (name, res) => {
        moosedb.findOne({ name }, (err, moose) => {
            if (err || !moose)
                return onErr(res, 'no such moose', null, 404)
            res.send(moose)
        })
    })

    web.on('get-gallery', (name, page, age, res) => {
        var query = {}
        if (name && name != '')
            query = { name: { $regex: searchNameRegexp(name) } }
        moosedb.find(query)
            .sort({ created: age })
            .skip(page * galleryPageSize).limit(galleryPageSize)
            .exec((err, meese) => { 
                if (err || !meese) 
                    return onErr(res, 'unknown gallery error', err)
                res.send(meese)
            })
    })

    if (config.moose.dump) {
        setInterval(() => {
            log.debug('running db dump...')
            moosedb.find({}, (err, meese) => {
                if (err) log.error('moose dump error', { err: err.toString() })
                fs.createWriteStream(join(config.moose.db, 'dump.json'))
                    .write(JSON.stringify(meese)) 
            })
        }, config.moose.dumpEvery || 1000 * 60 * 60) // 1 hours

        log.debug('DB Dumps enabled - running initial db dump...')
        moosedb.find({}, (err, meese) => {
            if (err) log.error('moose dump error', { err: err.toString() })
            fs.createWriteStream(join(config.moose.db, 'dump.json'))
                .write(JSON.stringify(meese))
        })
    }
}
