/*
 * Copyright (C) 2017 Anthony DeDominic <adedomin@gmail.com>, Underdoge
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

var LinvoDB = require('linvodb3')

var moose = {
    name: {
        type: String,
        index: true,
        unique: true,
    },
    image: {
        type: String,
    },
    shade: {
        type: String,
    },
    created: {
        type: Date,
    },
    hd: {
        type: Boolean,
    },
    shaded: {
        type: Boolean,
    },
}

module.exports = (path) => {
    LinvoDB.dbPath = path 
        || require(process.env.CONFIG_PATH).moose.db
    var moosedb = new LinvoDB('moose', moose, {})
    moosedb.latest = moosedb.find({})
        .sort({ created: -1 })
        .limit(1)
        .live()
    moosedb.random = cb => {
        var ids = []
        moosedb.indexes.name.tree.executeOnEveryNode(
            node => ids.push(node.key)
        )
        var name =  ids[Math.floor(Math.random() * ids.length)]
        moosedb.findOne({ name }, (err, moose) => {
            if (err) return cb(err, moose)
            cb(null, moose)
        })
    }
    return moosedb
}
