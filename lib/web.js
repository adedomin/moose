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
    app = express(),
    bodyParser = require('body-parser'),
    config = require(process.env.CONFIG_PATH),
    EventEmitter = require('events').EventEmitter,
    util = require('util')

function Web() {

    if (!(this instanceof Web))
        return new Web()

    app.use(bodyParser.json())
    
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
        this.emit('get-all', res)
    })

    app.put('/new', (req, res) => {
        this.emit('new-moose', req.body, res)
    })

    app.listen(
        config.web.port || 7512, 
        config.web.interface
    )
}

util.inherits(Web, EventEmitter)
module.exports = Web
