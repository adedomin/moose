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

let { join } = require('path');
let log = require('./lib/logger.js');
let config = require(process.env.CONFIG_PATH);

let { MooseDB } = require('./lib/db.js');
let db = new MooseDB(join(config.moose.db, 'moose.db'));

db.open(err => {
    if (err) throw err;
    let moosedb = require('./lib/moose-storage.js')(log, db);
    require('./lib/web.js')(moosedb, log);
    require('./lib/irc.js')(moosedb, log);
});
