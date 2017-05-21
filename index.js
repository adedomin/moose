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

var MooseDB = require('./lib/db.js'),
    Web = require('./lib/web.js'),
    // escape specials for moose searching
    matchOperatorsRegExp = /[|\\{()[^$+*?.-]/g

var moosedb = MooseDB(),
    web = Web()

function searchNameRegexp(name) {
    return new RegExp(name.replace(
        matchOperatorsRegExp,
        '\\$&'
    ))
}

function onErr(res, msg, code) {
    res.status(code || 500)
    res.send({
        status: 'error',
        msg,
    })
}

function onOk(res, msg) {
    res.send({
        status: 'ok',
        msg,
    })
} 

web.on('new-moose', (moose, res) => {

    if (!moose || !moose.name || !moose.image) {
        return onErr(res, 
            'moose must have a name and image field'
        )
    }

    if (moose.name == '' || moose.image == '') {
        return onErr(res,
            'moose cannot be blank or have a blank name'
        )
    }

    moosedb.save(moose, (err, newmoose) => {
        if (err || !newmoose) 
            return onErr(res, err || 'could not save moose')
        onOk(res, `moose saved as ${newmoose.name}`)
    })
})

web.on('get-random', (res) => {
    moosedb.find({})
        .map((moose) => [ moose, Math.random() ] )
        .reduce((curr, next) => {
            return curr[1] > next[1] ? curr : next
        }, [{}, Number.NEGATIVE_INFINITY])
        .exec((err, moose) => {
            if (err || !moose)
                return onErr(res, err || 'unknown random error')
            res.send(moose[0])
        })
})

var latest_moose = moosedb.find({})
    .sort({ created: -1 })
    .limit(1)
    .live()

web.on('get-latest', (res) => {
    res.send(latest_moose.res[0])
})

web.on('get-moose', (name, res) => {
    moosedb.findOne({ name }, (err, moose) => {
        if (err || !moose)
            return onErr(res, 'no such moose', 404)
        res.send(moose)
    })
})

web.on('get-gallery', (name, page, age, res) => {
    var query = {}
    if (name && name != '')
        query = { name: { $regex: searchNameRegexp(name) } }
    moosedb.find(query)
        .sort({ created: age })
        .skip(page * 9).limit(9)
    .exec((err, meese) => { 
        if (err || !meese) 
            return onErr(res, err || 'unknown gallery error')
        res.send(meese)
    })
})

web.on('get-all', (res) => {
    moosedb.find({}, (err, meese) => {
        if (err || !meese)
            return onErr(res, err || 'could not dump moosedb')
        res.send(meese)
    })
})
