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

const { join } = require('path');
const config = require(process.env.CONFIG_PATH);

const { MooseDB } = require('./lib/db.js');
const db = new MooseDB(join(config.moose.db, 'moose.db'));

db.open(err => {
    if (err) throw err;
    const moosedb = require('./lib/moose-storage.js')(db);
    require('./lib/web.js')(moosedb);
    require('./lib/irc.js')(moosedb);
});
