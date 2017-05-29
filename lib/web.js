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

var express = require('express'),
    path = require('path'),
    app = express(),
    bodyParser = require('body-parser'),
    RateLimiter = require('express-rate-limit'),
    config = require(process.env.CONFIG_PATH),
    EventEmitter = require('events').EventEmitter,
    util = require('util')

function Web() {

    if (!(this instanceof Web))
        return new Web()

    if (config.web.proxied)
        app.enable('trust proxy')

    app.use(bodyParser.json())

    app.use('/new', new RateLimiter({
        windowMs: 60 * 1000, // 1 min
        headers: true,
        max: config.moose.maxNew || 3,
        message: JSON.stringify({
            status: 'error',
            msg: 'stop spamming moose jerk',
        }),
    }))

// I'll revisit this when i go to "production ready" makes gallery search near impossible as well
//    app.use('/gallery', new RateLimiter({
//        windowMs: 30 * 1000, // 30 sec
//        delayAfter: 10, // 10 pages
//        delayMs: 150,
//        max: 0,
//    }))
    
    app.get('/moose/latest', (req, res) => {
        this.emit('get-latest', res) 
    })

    app.get('/moose/random', (req, res) => {
        this.emit('get-random', res) 
    })

    app.get('/moose/:moose', (req, res) => {
        this.emit('get-moose', req.params.moose, res)
    })

    app.get('/gallery/:age?', (req, res) => {
        var name = req.query.q || '',
            page = req.query.p || 0,
            age = req.params.age == 'oldest' ? 1 : -1

        this.emit('get-gallery', name, page, age, res)
    })

    app.get('/dump', (req, res) => {
        res.sendFile(path.resolve(path.join(config.moose_db, 'dump.json')))
    })

    app.put('/new', (req, res) => {
        this.emit('new-moose', req.body, res)
    })

    app.use('/', express.static(path.join(__dirname, '../public'), {
        index: [ 'index.html' ],
    }))

    app.listen(
        config.web.port || 7512, 
        config.web.interface
    )
}

util.inherits(Web, EventEmitter)
module.exports = Web
